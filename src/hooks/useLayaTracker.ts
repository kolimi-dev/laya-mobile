/**
 * Laya (లయ) Mobile — Tracker State & Business Logic Hook (ADR-0001 through ADR-0012)
 * Manages Habits, Recurrence, Events, Step Jumps, Lifecycle & 30-Day Trash
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { CONFIG } from '../config';
import { logger } from '../core/logger';
import { Task, CompletionEvent, UserGroup, PinnedChart, EvaluatedTask } from '../core/types';
import { calculateConsistencyRating, evaluateTaskProgress } from '../core/math';
import { getOperationalDate, isTaskScheduledForDate, filterEventsForTaskCadence } from '../core/recurrence';
import { getChartRecommendations, createPinnedChartFromRecommendation, ChartRecommendation } from '../services/ai-suggestions';
import { StorageService, generateUUID } from '../services/storage';
import { SyncService } from '../services/sync';
import { AuthService, AuthSession } from '../services/auth';
import { NotificationService } from '../services/notifications';

export function useLayaTracker() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthSkipped, setIsAuthSkipped] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CompletionEvent[]>([]);
  const [pinnedCharts, setPinnedCharts] = useState<PinnedChart[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const activeUserId = session?.userId || 'usr_guest';
  const opInfo = useMemo(() => getOperationalDate(), []);

  const loadUserData = useCallback(async (uid: string) => {
    const data = await StorageService.loadInitialData(uid);
    setGroups(data.groups);
    setTasks(data.tasks);
    setEvents(data.events);
    setPinnedCharts(data.pinnedCharts);
  }, []);

  const triggerSync = useCallback(async () => {
    setIsSyncing(true);
    const res = await SyncService.syncWithBackend(CONFIG.BACKEND_URL, activeUserId);
    setIsOnline(res.isOnline);
    if (res.updatedData?.tasks) setTasks(res.updatedData.tasks);
    setIsSyncing(false);
  }, [activeUserId]);

  useEffect(() => {
    async function init() {
      const stored = await AuthService.getStoredSession();
      if (stored) setSession(stored);
      const uid = stored?.userId || 'usr_guest';
      await loadUserData(uid);
      await logger.init(uid);
      setLoading(false);
    }
    init();
  }, [loadUserData]);

  useEffect(() => {
    if (!loading) loadUserData(activeUserId).then(() => triggerSync());
  }, [activeUserId, loading, loadUserData, triggerSync]);

  useEffect(() => {
    if (!loading) {
      triggerSync();
      const interval = setInterval(triggerSync, CONFIG.SYNC_INTERVAL_MS);
      return () => clearInterval(interval);
    }
  }, [loading, triggerSync]);

  const evaluatedTasks = useMemo<EvaluatedTask[]>(() => {
    return tasks
      .filter((t) => (activeGroupId ? t.groupId === activeGroupId : true) && isTaskScheduledForDate(t, opInfo))
      .map((t) => evaluateTaskProgress(t, filterEventsForTaskCadence(t, events, opInfo)));
  }, [tasks, events, activeGroupId, opInfo]);

  const remainingTasks = useMemo(() => evaluatedTasks.filter((t) => !t.isCompleted && !t.isIgnored), [evaluatedTasks]);
  const completedOrRestedTasks = useMemo(() => evaluatedTasks.filter((t) => t.isCompleted || t.isIgnored), [evaluatedTasks]);

  const consistencyScore = useMemo(() => {
    let completed = 0, scheduled = 0, ignored = 0;
    for (const t of evaluatedTasks) {
      scheduled += 100;
      if (t.isIgnored) ignored += 100;
      else completed += t.percentage;
    }
    return calculateConsistencyRating(completed, scheduled, ignored);
  }, [evaluatedTasks]);

  const chartRecommendations = useMemo(() => getChartRecommendations(tasks, pinnedCharts), [tasks, pinnedCharts]);

  const appendEvent = async (
    eventData: Omit<CompletionEvent, 'id' | 'userId' | 'occurredAt'>,
    action: string,
    meta?: Record<string, unknown>
  ) => {
    const newEvent: CompletionEvent = {
      ...eventData,
      id: generateUUID('evt'),
      userId: activeUserId,
      occurredAt: new Date().toISOString(),
    };
    const updated = await StorageService.appendEvent(newEvent, activeUserId);
    setEvents([...updated]);
    logger.log('action', action, meta);
  };

  const handleToggleComplete = async (taskId: string) => {
    const existing = evaluatedTasks.find((e) => e.task.id === taskId);
    const nextStatus = existing?.isCompleted ? 'in_progress' : 'completed';
    await appendEvent({ taskId, status: nextStatus, percentage: nextStatus === 'completed' ? 100 : 0 }, 'toggle_complete', { taskId, status: nextStatus });
  };

  const handleToggleMilestone = async (taskId: string, milestoneId: string) => {
    const existing = evaluatedTasks.find((e) => e.task.id === taskId);
    const current = existing?.completedMilestones || [];
    const next = current.includes(milestoneId) ? current.filter((m) => m !== milestoneId) : [...current, milestoneId];
    await appendEvent({ taskId, status: 'in_progress', completedMilestones: next, skippedMilestones: existing?.skippedMilestones || [] }, 'toggle_milestone', { taskId, milestoneId });
  };

  const handleSkipMilestone = async (taskId: string, milestoneId: string, reason?: string) => {
    const existing = evaluatedTasks.find((e) => e.task.id === taskId);
    const current = existing?.skippedMilestones || [];
    const next = reason !== undefined ? (current.includes(milestoneId) ? current : [...current, milestoneId]) : current.filter((m) => m !== milestoneId);
    await appendEvent({ taskId, status: 'in_progress', completedMilestones: existing?.completedMilestones || [], skippedMilestones: next, notes: reason }, 'skip_milestone', { taskId, milestoneId, reason });
  };

  const handleUpdateQuantified = async (taskId: string, delta: number) => {
    const existing = evaluatedTasks.find((e) => e.task.id === taskId);
    const nextVal = Math.max(0, Math.round(((existing?.quantifiedValue || 0) + delta) * 100) / 100);
    await appendEvent({ taskId, status: 'in_progress', quantifiedValue: nextVal }, 'update_quantified', { taskId, delta, nextVal });
  };

  const handleSetQuantifiedExact = async (taskId: string, val: number) => {
    const nextVal = Math.max(0, Math.round(val * 100) / 100);
    await appendEvent({ taskId, status: 'in_progress', quantifiedValue: nextVal }, 'set_quantified_exact', { taskId, val: nextVal });
  };

  const handleToggleIgnore = async (taskId: string) => {
    const existing = evaluatedTasks.find((e) => e.task.id === taskId);
    const nextStatus = existing?.isIgnored ? 'in_progress' : 'ignored';
    await appendEvent({ taskId, status: nextStatus }, 'toggle_ignore', { taskId, status: nextStatus });
  };

  const handlePinRecommendation = async (rec: ChartRecommendation) => {
    const nextList = [...pinnedCharts, createPinnedChartFromRecommendation(rec, pinnedCharts)];
    setPinnedCharts(nextList);
    await StorageService.savePinnedCharts(nextList, activeUserId);
  };

  const handlePinTaskChart = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const chartType = task?.targetAmount ? 'volume_bars' : 'progress_trend';
    const nextList: PinnedChart[] = [...pinnedCharts, { id: generateUUID(), taskId, chartType, sortOrder: pinnedCharts.length }];
    setPinnedCharts(nextList);
    await StorageService.savePinnedCharts(nextList, activeUserId);
  };

  const handleMoveChart = async (chartId: string, direction: 'up' | 'down') => {
    const idx = pinnedCharts.findIndex((c) => c.id === chartId);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (idx < 0 || targetIdx < 0 || targetIdx >= pinnedCharts.length) return;
    const list = [...pinnedCharts];
    [list[idx], list[targetIdx]] = [list[targetIdx], list[idx]];
    setPinnedCharts(list);
    await StorageService.savePinnedCharts(list, activeUserId);
  };

  const handleRemoveChart = async (chartId: string) => {
    const list = pinnedCharts.filter((c) => c.id !== chartId);
    setPinnedCharts(list);
    await StorageService.savePinnedCharts(list, activeUserId);
  };

  const handleSaveNewTask = async (task: Task) => {
    await StorageService.saveTask(task, activeUserId);
    await NotificationService.scheduleTaskReminder(task);
    const exists = tasks.some((t) => t.id === task.id);
    setTasks(exists ? tasks.map((t) => (t.id === task.id ? task : t)) : [...tasks, task]);
  };

  const handleDeleteTask = async (taskId: string) => {
    await StorageService.softDeleteTask(taskId, activeUserId);
    await NotificationService.cancelTaskReminder(taskId);
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, deletedAt: new Date().toISOString() } : t)));
  };

  const handleRestoreTask = async (taskId: string) => {
    await StorageService.restoreTask(taskId, activeUserId);
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, deletedAt: null, archivedAt: null, lifecycleStatus: 'active' } : t)));
  };

  const handlePurgeTask = async (taskId: string) => {
    await StorageService.purgeTaskPermanently(taskId, activeUserId);
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleEmptyTrash = async () => {
    await StorageService.emptyTrash(activeUserId);
    setTasks(tasks.filter((t) => !t.deletedAt));
  };

  const handleSetLifecycleStatus = async (taskId: string, status: 'active' | 'completed' | 'paused' | 'retired') => {
    await StorageService.updateTaskLifecycle(taskId, status, activeUserId);
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, lifecycleStatus: status, archivedAt: status === 'active' ? null : new Date().toISOString() } : t)));
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setSession(null);
    setIsAuthSkipped(false);
  };

  return {
    loading, session, setSession, isAuthSkipped, setIsAuthSkipped,
    isOnline, isSyncing, triggerSync, opInfo,
    activeGroupId, setActiveGroupId, groups, tasks, events,
    pinnedCharts, remainingTasks, completedOrRestedTasks, consistencyScore,
    chartRecommendations, handleToggleComplete, handleToggleMilestone,
    handleSkipMilestone, handleUpdateQuantified, handleSetQuantifiedExact,
    handleToggleIgnore, handlePinRecommendation, handlePinTaskChart, handleMoveChart,
    handleRemoveChart, handleSaveNewTask, handleDeleteTask, handleRestoreTask,
    handlePurgeTask, handleEmptyTrash, handleSetLifecycleStatus, handleLogout,
  };
}
