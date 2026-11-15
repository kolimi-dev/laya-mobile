/**
 * Laya (లయ) Mobile — Master Tracker State Orchestrator (ADR-0001 through ADR-0012)
 * Coordinates local storage, remote sync, audio cues, and active rhythm evaluations
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AppState } from 'react-native';
import { CONFIG } from '../config';
import { logger } from '../core/logger';
import { Task, CompletionEvent, UserGroup, PinnedChart, UserDashboard, ChartVisualizerStyle } from '../core/types';
import { getOperationalDate } from '../core/recurrence';
import { StorageService, generateUUID } from '../services/storage';
import { SyncService } from '../services/sync';
import { AuthService, AuthSession, UserProfile } from '../services/auth';
import { NotificationService } from '../services/notifications';
import { useDerivedTrackerState } from './useDerivedTrackerState';

export function useLayaTracker() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null), [profile, setProfile] = useState<UserProfile>({ name: '', phone: '' });
  const [isAuthSkipped, setIsAuthSkipped] = useState(false), [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [groups, setGroups] = useState<UserGroup[]>([]), [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CompletionEvent[]>([]), [pinnedCharts, setPinnedCharts] = useState<PinnedChart[]>([]);
  const [dashboards, setDashboards] = useState<UserDashboard[]>([]), [activeDateOffset, setActiveDateOffset] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(true), [isSyncing, setIsSyncing] = useState(false);
  const [currentDateKey, setCurrentDateKey] = useState(() => new Date().toISOString().split('T')[0]);

  const activeUserId = session?.userId || 'usr_guest';

  useEffect(() => {
    const checkDate = () => {
      const today = new Date().toISOString().split('T')[0];
      setCurrentDateKey((prev) => (prev !== today ? today : prev));
    };
    const timer = setInterval(checkDate, 60000);
    const sub = AppState.addEventListener('change', (st) => { if (st === 'active') checkDate(); });
    return () => { clearInterval(timer); sub.remove(); };
  }, []);

  const targetDate = useMemo(() => {
    const d = new Date();
    if (activeDateOffset !== 0) d.setDate(d.getDate() + activeDateOffset);
    return d;
  }, [activeDateOffset, currentDateKey]);
  const opInfo = useMemo(() => getOperationalDate(targetDate), [targetDate]);

  const loadUserData = useCallback(async (uid: string) => {
    const data = await StorageService.loadInitialData(uid);
    setGroups(data.groups); setTasks(data.tasks); setEvents(data.events); setDashboards(data.dashboards);
    const valid = data.pinnedCharts.filter((c) => data.tasks.some((t) => t.id === c.taskId && !t.deletedAt));
    if (valid.length !== data.pinnedCharts.length) await StorageService.savePinnedCharts(valid, uid);
    setPinnedCharts(valid);
  }, []);

  const triggerSync = useCallback(async () => {
    setIsSyncing(true);
    const res = await SyncService.syncWithBackend(CONFIG.BACKEND_URL, activeUserId);
    setIsOnline(res.isOnline);
    if (res.updatedData?.tasks) setTasks(res.updatedData.tasks);
    setIsSyncing(false);
  }, [activeUserId]);

  useEffect(() => {
    (async () => {
      const stored = await AuthService.getStoredSession();
      if (stored) setSession(stored);
      setProfile(await AuthService.getStoredProfile());
      const uid = stored?.userId || 'usr_guest';
      await loadUserData(uid);
      await logger.init(uid);
      setLoading(false);
    })();
  }, [loadUserData]);

  useEffect(() => {
    if (!loading) {
      loadUserData(activeUserId).then(() => triggerSync());
      const interval = setInterval(triggerSync, CONFIG.SYNC_INTERVAL_MS);
      return () => clearInterval(interval);
    }
  }, [loading, activeUserId, loadUserData, triggerSync]);

  const {
    evaluatedTasks,
    remainingTasks,
    completedOrRestedTasks,
    consistencyScore,
    validPinnedCharts,
  } = useDerivedTrackerState({ tasks, events, pinnedCharts, activeGroupId, opInfo, groups });

  const appendEvent = async (eventData: Omit<CompletionEvent, 'id' | 'userId' | 'occurredAt'>, action: string, meta?: Record<string, unknown>) => {
    const nowIso = new Date().toISOString();
    const occurredAt = activeDateOffset === 0 ? nowIso : new Date(opInfo.year, opInfo.month, opInfo.dayOfMonth, 12, 0, 0).toISOString();
    const newEvent: CompletionEvent = { ...eventData, id: generateUUID('evt'), userId: activeUserId, targetDate: opInfo.dateString, recordedAt: nowIso, occurredAt };
    const updated = await StorageService.appendEvent(newEvent, activeUserId);
    setEvents([...updated]);
    logger.log('action', action, meta);
  };

  const handleToggleComplete = async (taskId: string) => {
    const nextStatus = evaluatedTasks.find((e) => e.task.id === taskId)?.isCompleted ? 'in_progress' : 'completed';
    await appendEvent({ taskId, status: nextStatus, percentage: nextStatus === 'completed' ? 100 : 0 }, 'toggle_complete', { taskId, status: nextStatus });
    const target = tasks.find((t) => t.id === taskId);
    if (target && (target.frequency === 'one_time' || target.flavor === 'one_time')) {
      await handleSetLifecycleStatus(taskId, nextStatus === 'completed' ? 'completed' : 'active');
    }
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
  const handleUpdateQuantified = async (taskId: string, delta: number, criterionId?: string) => {
    const existing = evaluatedTasks.find((e) => e.task.id === taskId);
    if (criterionId) {
      const currentMap = existing?.criterionValues || {};
      const nextVal = Math.max(0, Math.round(((currentMap[criterionId] || 0) + delta) * 100) / 100);
      const nextMap = { ...currentMap, [criterionId]: nextVal };
      await appendEvent({ taskId, status: 'in_progress', criterionValues: nextMap, activeCriterionId: criterionId }, 'update_flexible_criterion', { taskId, criterionId, delta, nextVal });
    } else {
      const nextVal = Math.max(0, Math.round(((existing?.quantifiedValue || 0) + delta) * 100) / 100);
      await appendEvent({ taskId, status: 'in_progress', quantifiedValue: nextVal }, 'update_quantified', { taskId, delta, nextVal });
    }
  };
  const handleSetQuantifiedExact = async (taskId: string, val: number, criterionId?: string) => {
    const nextVal = Math.max(0, Math.round(val * 100) / 100);
    if (criterionId) {
      const existing = evaluatedTasks.find((e) => e.task.id === taskId);
      const nextMap = { ...(existing?.criterionValues || {}), [criterionId]: nextVal };
      await appendEvent({ taskId, status: 'in_progress', criterionValues: nextMap, activeCriterionId: criterionId }, 'set_flexible_criterion', { taskId, criterionId, val: nextVal });
    } else {
      await appendEvent({ taskId, status: 'in_progress', quantifiedValue: nextVal }, 'set_quantified_exact', { taskId, val: nextVal });
    }
  };
  const handleToggleIgnore = async (taskId: string, notes?: string) => {
    const isCurrentlyIgnored = evaluatedTasks.find((e) => e.task.id === taskId)?.isIgnored;
    const nextStatus = isCurrentlyIgnored ? 'in_progress' : 'ignored';
    await appendEvent({ taskId, status: nextStatus, notes }, 'toggle_ignore', { taskId, status: nextStatus, notes });
  };
  const handlePinTaskChart = async (taskId: string, chartType?: ChartVisualizerStyle, dashboardId?: string) => {
    const resolvedType = chartType || (tasks.find((t) => t.id === taskId)?.targetAmount ? 'volume_bars' : 'activity_heatmap');
    const nextList: PinnedChart[] = [...pinnedCharts, { id: generateUUID('chr'), taskId, dashboardId, chartType: resolvedType, sortOrder: pinnedCharts.length }];
    setPinnedCharts(nextList); await StorageService.savePinnedCharts(nextList, activeUserId);
  };
  const handleCreateDashboard = async (dash: UserDashboard) => { await StorageService.saveDashboard(dash, activeUserId); setDashboards((prev) => [...prev, dash]); };
  const handleUpdateDashboard = async (dash: UserDashboard) => { await StorageService.saveDashboard(dash, activeUserId); setDashboards((prev) => prev.map((d) => (d.id === dash.id ? dash : d))); };
  const handleDeleteDashboard = async (id: string) => { await StorageService.deleteDashboard(id, activeUserId); setDashboards((prev) => prev.filter((d) => d.id !== id)); };
  const handleMoveChart = async (chartId: string, direction: 'up' | 'down') => {
    const idx = pinnedCharts.findIndex((c) => c.id === chartId), targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (idx < 0 || targetIdx < 0 || targetIdx >= pinnedCharts.length) return;
    const list = [...pinnedCharts];
    [list[idx], list[targetIdx]] = [list[targetIdx], list[idx]];
    setPinnedCharts(list); await StorageService.savePinnedCharts(list, activeUserId);
  };
  const handleRemoveChart = async (chartId: string) => {
    const list = pinnedCharts.filter((c) => c.id !== chartId);
    setPinnedCharts(list); await StorageService.savePinnedCharts(list, activeUserId);
  };
  const handleSaveNewTask = async (task: Task) => {
    await StorageService.saveTask(task, activeUserId);
    await NotificationService.scheduleTaskReminder(task);
    setTasks(tasks.some((t) => t.id === task.id) ? tasks.map((t) => (t.id === task.id ? task : t)) : [...tasks, task]);
  };
  const handleDeleteTask = async (taskId: string) => {
    await StorageService.softDeleteTask(taskId, activeUserId);
    await NotificationService.cancelTaskReminder(taskId);
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, deletedAt: new Date().toISOString() } : t)));
    const clean = pinnedCharts.filter((c) => c.taskId !== taskId);
    if (clean.length !== pinnedCharts.length) { setPinnedCharts(clean); await StorageService.savePinnedCharts(clean, activeUserId); }
  };
  const handleRestoreTask = async (taskId: string) => {
    await StorageService.restoreTask(taskId, activeUserId);
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, deletedAt: null, archivedAt: null, lifecycleStatus: 'active' } : t)));
  };
  const handlePurgeTask = async (taskId: string) => {
    await StorageService.purgeTaskPermanently(taskId, activeUserId);
    setTasks(tasks.filter((t) => t.id !== taskId));
    const clean = pinnedCharts.filter((c) => c.taskId !== taskId);
    if (clean.length !== pinnedCharts.length) { setPinnedCharts(clean); await StorageService.savePinnedCharts(clean, activeUserId); }
  };
  const handleEmptyTrash = async () => { await StorageService.emptyTrash(activeUserId); setTasks(tasks.filter((t) => !t.deletedAt)); };
  const handleSetLifecycleStatus = async (taskId: string, status: 'active' | 'completed' | 'paused' | 'retired') => {
    await StorageService.updateTaskLifecycle(taskId, status, activeUserId);
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, lifecycleStatus: status, archivedAt: status === 'active' ? null : new Date().toISOString() } : t)));
  };
  const handleCreateGroup = async (name: string, color: string) => {
    const newGroup: UserGroup = { id: generateUUID('grp'), userId: activeUserId, name, color, sortOrder: groups.length + 1 };
    await StorageService.saveGroup(newGroup, activeUserId);
    setGroups((prev) => [...prev, newGroup]);
  };
  const handleUpdateGroup = async (group: UserGroup) => {
    await StorageService.saveGroup(group, activeUserId);
    setGroups((prev) => prev.map((g) => (g.id === group.id ? group : g)));
  };
  const handleDeleteGroup = async (groupId: string) => {
    const fallbackId = groups.find((g) => g.id !== groupId)?.id || 'grp_personal';
    const updatedTasks = tasks.map((t) => (t.groupId === groupId ? { ...t, groupId: fallbackId } : t));
    setTasks(updatedTasks);
    await StorageService.saveAllData(activeUserId, { tasks: updatedTasks });
    await StorageService.deleteGroup(groupId, activeUserId);
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    if (activeGroupId === groupId) setActiveGroupId(null);
  };
  const handleReorderTasks = async (ids: string[]) => {
    const updated = tasks.map((t) => { const idx = ids.indexOf(t.id); return idx >= 0 ? { ...t, sortOrder: (idx + 1) * 10 } : t; });
    setTasks(updated); await StorageService.saveAllData(activeUserId, { tasks: updated });
  };
  const handleReorderGroups = async (ids: string[]) => {
    const updated = groups.map((g) => { const idx = ids.indexOf(g.id); return idx >= 0 ? { ...g, sortOrder: (idx + 1) * 10 } : g; });
    setGroups(updated); await StorageService.saveAllData(activeUserId, { groups: updated });
  };
  const handleUpdateProfile = async (p: UserProfile) => { await AuthService.saveProfile(p); setProfile(p); };
  const handleLogout = async () => { await AuthService.logout(); setSession(null); setIsAuthSkipped(false); };

  return {
    loading, session, setSession, profile, setProfile, handleUpdateProfile,
    isAuthSkipped, setIsAuthSkipped, isOnline, isSyncing, triggerSync, opInfo,
    activeDateOffset, setActiveDateOffset, activeUserId,
    activeGroupId, setActiveGroupId, groups, tasks, events,
    handleCreateGroup, handleUpdateGroup, handleDeleteGroup, handleReorderGroups,
    dashboards, handleCreateDashboard, handleUpdateDashboard, handleDeleteDashboard,
    pinnedCharts, validPinnedCharts, remainingTasks, completedOrRestedTasks, consistencyScore,
    handleToggleComplete, handleToggleMilestone,
    handleSkipMilestone, handleUpdateQuantified, handleSetQuantifiedExact,
    handleToggleIgnore, handlePinTaskChart, handleMoveChart,
    handleRemoveChart, handleSaveNewTask, handleDeleteTask, handleRestoreTask,
    handlePurgeTask, handleEmptyTrash, handleSetLifecycleStatus, handleReorderTasks, handleLogout,
  };
}
