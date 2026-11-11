/**
 * Laya (లయ) Mobile — Tracker State & Event Hook
 * Manages Habits, Recurrence, Idempotent Events, Pinned Charts & Background Sync
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, CompletionEvent, UserGroup, PinnedChart, EvaluatedTask } from '../core/types';
import { calculateConsistencyRating, evaluateTaskProgress } from '../core/math';
import { getOperationalDate, isTaskScheduledForDate, filterEventsForTaskCadence } from '../core/recurrence';
import { StorageService, generateUUID } from '../services/storage';
import { SyncService } from '../services/sync';
import { CONFIG } from '../config';
import { logger } from '../core/logger';
import { AuthService, AuthSession } from '../services/auth';
import { getChartRecommendations, createPinnedChartFromRecommendation, ChartRecommendation } from '../services/ai-suggestions';

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
    setIsSyncing(false);
  }, [activeUserId]);

  useEffect(() => {
    async function init() {
      const storedSession = await AuthService.getStoredSession();
      if (storedSession) setSession(storedSession);
      const data = await StorageService.loadInitialData(storedSession?.userId || 'usr_guest');
      setGroups(data.groups);
      setTasks(data.tasks);
      setEvents(data.events);
      setPinnedCharts(data.pinnedCharts);
      await logger.init(storedSession?.userId || 'usr_guest');
      setLoading(false);
    }
    init();
  }, []);

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

  const chartRecommendations = useMemo(
    () => getChartRecommendations(tasks, pinnedCharts),
    [tasks, pinnedCharts]
  );

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

    const updated = await StorageService.appendEvent(newEvent);
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

    const updated = await StorageService.appendEvent(newEvent);
    setEvents([...updated]);
    logger.log('action', 'toggle_milestone', { taskId, milestoneId });
  };

  const handleUpdateQuantified = async (taskId: string, delta: number) => {
    const existing = evaluatedTasks.find((e) => e.task.id === taskId);
    const current = existing?.quantifiedValue || 0;
    const nextVal = Math.max(0, current + delta);

    const newEvent: CompletionEvent = {
      id: generateUUID('evt'),
      taskId,
      userId: activeUserId,
      status: 'in_progress',
      quantifiedValue: nextVal,
      occurredAt: new Date().toISOString(),
    };

    const updated = await StorageService.appendEvent(newEvent);
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

    const updated = await StorageService.appendEvent(newEvent);
    setEvents([...updated]);
    logger.log('action', 'toggle_ignore', { taskId, status: nextStatus });
  };

  const handlePinRecommendation = async (rec: ChartRecommendation) => {
    const newChart = createPinnedChartFromRecommendation(rec, pinnedCharts);
    const nextList = [...pinnedCharts, newChart];
    setPinnedCharts(nextList);
    await StorageService.savePinnedCharts(nextList);
    logger.log('action', 'pin_chart', { taskId: rec.taskId, type: rec.recommendedType });
  };

  const handleMoveChart = async (chartId: string, direction: 'up' | 'down') => {
    const index = pinnedCharts.findIndex((c) => c.id === chartId);
    if (index < 0) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pinnedCharts.length) return;

    const list = [...pinnedCharts];
    [list[index], list[targetIndex]] = [list[targetIndex], list[index]];
    setPinnedCharts(list);
    await StorageService.savePinnedCharts(list);
  };

  const handleRemoveChart = async (chartId: string) => {
    const list = pinnedCharts.filter((c) => c.id !== chartId);
    setPinnedCharts(list);
    await StorageService.savePinnedCharts(list);
  };

  const handleSaveNewTask = async (task: Task) => {
    await StorageService.saveTask(task);
    const exists = tasks.some((t) => t.id === task.id);
    setTasks(exists ? tasks.map((t) => (t.id === task.id ? task : t)) : [...tasks, task]);
    logger.log('action', exists ? 'update_task' : 'create_task', { taskId: task.id, title: task.title });
  };

  const handleDeleteTask = async (taskId: string) => {
    await StorageService.deleteTask(taskId);
    setTasks(tasks.filter((t) => t.id !== taskId));
    logger.log('action', 'delete_task', { taskId });
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
