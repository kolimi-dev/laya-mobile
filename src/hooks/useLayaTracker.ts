/**
 * Laya (లయ) Mobile — Tracker State & Business Logic Hook
 * Manages Habits, Recurrence, Idempotent Events, Pinned Charts & Background Sync
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

  const triggerSync = useCallback(async () => {
    setIsSyncing(true);
    const res = await SyncService.syncWithBackend(CONFIG.BACKEND_URL, activeUserId);
    setIsOnline(res.isOnline);
    if (res.updatedData?.tasks) setTasks(res.updatedData.tasks);
    setIsSyncing(false);
  }, [activeUserId]);

  useEffect(() => {
    async function init() {
      const storedSession = await AuthService.getStoredSession();
      if (storedSession) setSession(storedSession);
      const uid = storedSession?.userId || 'usr_guest';
      const data = await StorageService.loadInitialData(uid);
      setGroups(data.groups);
      setTasks(data.tasks);
      setEvents(data.events);
      setPinnedCharts(data.pinnedCharts);
      await logger.init(uid);
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!loading) {
      StorageService.loadInitialData(activeUserId).then((data) => {
        setGroups(data.groups);
        setTasks(data.tasks);
        setEvents(data.events);
        setPinnedCharts(data.pinnedCharts);
        triggerSync();
      });
    }
  }, [activeUserId]);

  useEffect(() => {
    if (!loading) {
      triggerSync();
      const interval = setInterval(triggerSync, CONFIG.SYNC_INTERVAL_MS);
      return () => clearInterval(interval);
    }
  }, [loading, triggerSync]);

  const evaluatedTasks = useMemo<EvaluatedTask[]>(() => {
    return tasks
      .filter((task) => (activeGroupId ? task.groupId === activeGroupId : true) && isTaskScheduledForDate(task, opInfo))
      .map((task) => evaluateTaskProgress(task, filterEventsForTaskCadence(task, events, opInfo)));
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

  const handleToggleComplete = async (taskId: string) => {
    const existing = evaluatedTasks.find((e) => e.task.id === taskId);
    const nextStatus = existing?.isCompleted ? 'in_progress' : 'completed';
    const newEvent: CompletionEvent = {
      id: generateUUID('evt'),
      taskId,
      userId: activeUserId,
      status: nextStatus,
      percentage: nextStatus === 'completed' ? 100 : 0,
      occurredAt: new Date().toISOString(),
    };
    const updated = await StorageService.appendEvent(newEvent, activeUserId);
    setEvents([...updated]);
    logger.log('action', 'toggle_complete', { taskId, status: nextStatus });
  };

  const handleToggleMilestone = async (taskId: string, milestoneId: string) => {
    const existing = evaluatedTasks.find((e) => e.task.id === taskId);
    const current = existing?.completedMilestones || [];
    const nextMilestones = current.includes(milestoneId)
      ? current.filter((m) => m !== milestoneId)
      : [...current, milestoneId];
    const newEvent: CompletionEvent = {
      id: generateUUID('evt'),
      taskId,
      userId: activeUserId,
      status: 'in_progress',
      completedMilestones: nextMilestones,
      occurredAt: new Date().toISOString(),
    };
    const updated = await StorageService.appendEvent(newEvent, activeUserId);
    setEvents([...updated]);
    logger.log('action', 'toggle_milestone', { taskId, milestoneId });
  };

  const handleUpdateQuantified = async (taskId: string, delta: number) => {
    const existing = evaluatedTasks.find((e) => e.task.id === taskId);
    const nextVal = Math.max(0, (existing?.quantifiedValue || 0) + delta);
    const newEvent: CompletionEvent = {
      id: generateUUID('evt'),
      taskId,
      userId: activeUserId,
      status: 'in_progress',
      quantifiedValue: nextVal,
      occurredAt: new Date().toISOString(),
    };
    const updated = await StorageService.appendEvent(newEvent, activeUserId);
    setEvents([...updated]);
    logger.log('action', 'update_quantified', { taskId, delta, nextVal });
  };

  const handleToggleIgnore = async (taskId: string) => {
    const existing = evaluatedTasks.find((e) => e.task.id === taskId);
    const nextStatus = existing?.isIgnored ? 'in_progress' : 'ignored';
    const newEvent: CompletionEvent = {
      id: generateUUID('evt'),
      taskId,
      userId: activeUserId,
      status: nextStatus,
      occurredAt: new Date().toISOString(),
    };
    const updated = await StorageService.appendEvent(newEvent, activeUserId);
    setEvents([...updated]);
    logger.log('action', 'toggle_ignore', { taskId, status: nextStatus });
  };

  const handlePinRecommendation = async (rec: ChartRecommendation) => {
    const newChart = createPinnedChartFromRecommendation(rec, pinnedCharts);
    const nextList = [...pinnedCharts, newChart];
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
    const exists = tasks.some((t) => t.id === task.id);
    setTasks(exists ? tasks.map((t) => (t.id === task.id ? task : t)) : [...tasks, task]);
  };

  const handleDeleteTask = async (taskId: string) => {
    await StorageService.deleteTask(taskId, activeUserId);
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setSession(null);
    setIsAuthSkipped(false);
  };

  return {
    loading,
    session,
    setSession,
    isAuthSkipped,
    setIsAuthSkipped,
    isOnline,
    isSyncing,
    triggerSync,
    opInfo,
    activeGroupId,
    setActiveGroupId,
    groups,
    tasks,
    events,
    pinnedCharts,
    remainingTasks,
    completedOrRestedTasks,
    consistencyScore,
    chartRecommendations,
    handleToggleComplete,
    handleToggleMilestone,
    handleUpdateQuantified,
    handleToggleIgnore,
    handlePinRecommendation,
    handleMoveChart,
    handleRemoveChart,
    handleSaveNewTask,
    handleDeleteTask,
    handleLogout,
  };
}
