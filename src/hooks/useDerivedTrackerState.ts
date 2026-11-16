/**
 * Laya (లయ) Mobile — Derived Tracker State Hook
 * Computes derived task evaluations, consistency scores, and chart views (ADR-0001, ADR-0010)
 */

import { useMemo } from 'react';
import { Task, CompletionEvent, PinnedChart, EvaluatedTask, UserGroup } from '../core/types';
import { calculateConsistencyRating, evaluateTaskProgress } from '../core/math';
import { isTaskScheduledForDate, filterEventsForTaskCadence, getOperationalDate, OperationalDateInfo } from '../core/recurrence';
import { shouldTaskRollForward } from '../core/rollover';
import { getChartRecommendations } from '../services/ai-suggestions';

interface UseDerivedTrackerStateParams {
  tasks: Task[];
  events: CompletionEvent[];
  pinnedCharts: PinnedChart[];
  activeGroupId: string | null;
  opInfo: OperationalDateInfo;
  groups?: UserGroup[];
}

export function useDerivedTrackerState({
  tasks,
  events,
  pinnedCharts,
  activeGroupId,
  opInfo,
  groups = [],
}: UseDerivedTrackerStateParams) {
  const inactiveGroupIds = useMemo(() => {
    return new Set(
      groups
        .filter((g) => (g as any).lifecycleStatus === 'paused' || (g as any).lifecycleStatus === 'completed')
        .map((g) => g.id)
    );
  }, [groups]);

  const allEvaluatedTasks = useMemo<EvaluatedTask[]>(() => {
    return tasks
      .filter((t) => {
        if (inactiveGroupIds.has(t.groupId)) return false;
        const hasDateEvent = events.some((e) => e.taskId === t.id && (e.targetDate === opInfo.dateString || e.occurredAt.startsWith(opInfo.dateString)) && (e.status === 'completed' || e.status === 'ignored'));
        if (hasDateEvent && !t.deletedAt) return true;
        if (isTaskScheduledForDate(t, opInfo)) return true;
        return shouldTaskRollForward(t, opInfo, events);
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((t) => {
        const isScheduled = isTaskScheduledForDate(t, opInfo);
        const evalTask = evaluateTaskProgress(t, filterEventsForTaskCadence(t, events, opInfo));
        if (!isScheduled) evalTask.isRolledForward = true;
        return evalTask;
      });
  }, [tasks, events, opInfo, inactiveGroupIds]);

  const allRemainingTasks = useMemo(
    () => allEvaluatedTasks.filter((t) => !t.isCompleted && !t.isIgnored),
    [allEvaluatedTasks]
  );

  const evaluatedTasks = useMemo<EvaluatedTask[]>(() => {
    return activeGroupId ? allEvaluatedTasks.filter((t) => t.task.groupId === activeGroupId) : allEvaluatedTasks;
  }, [allEvaluatedTasks, activeGroupId]);

  const remainingTasks = useMemo(
    () => (activeGroupId ? allRemainingTasks.filter((t) => t.task.groupId === activeGroupId) : allRemainingTasks),
    [allRemainingTasks, activeGroupId]
  );

  const completedOrRestedTasks = useMemo(
    () => evaluatedTasks.filter((t) => t.isCompleted || t.isIgnored),
    [evaluatedTasks]
  );

  const consistencyScore = useMemo(() => {
    let completed = 0;
    let scheduled = 0;
    let ignored = 0;

    for (const t of evaluatedTasks) {
      const isBackfillPreCreation =
        !!t.task.createdAt &&
        opInfo.dateString < getOperationalDate(new Date(t.task.createdAt)).dateString;

      if (isBackfillPreCreation && !t.isCompleted && t.percentage === 0) {
        continue;
      }

      // Cap single habit contribution at 100 to prevent score inflation (Issue 3.2)
      const habitContribution = Math.min(100, Math.max(0, t.percentage));

      if (isBackfillPreCreation) {
        // Pre-creation: add only logged points to scheduled denominator (Issue 3.3)
        if (t.isIgnored) continue;
        scheduled += habitContribution;
        completed += habitContribution;
      } else {
        scheduled += 100;
        if (t.isIgnored) {
          ignored += 100;
        } else {
          completed += habitContribution;
        }
      }
    }

    return calculateConsistencyRating(completed, scheduled, ignored);
  }, [evaluatedTasks, opInfo]);

  const chartRecommendations = useMemo(
    () => getChartRecommendations(tasks, pinnedCharts),
    [tasks, pinnedCharts]
  );

  const validPinnedCharts = useMemo(
    () => pinnedCharts.filter((c) => tasks.some((t) => t.id === c.taskId && !t.deletedAt)),
    [pinnedCharts, tasks]
  );

  return {
    evaluatedTasks,
    allRemainingTasks,
    remainingTasks,
    completedOrRestedTasks,
    consistencyScore,
    chartRecommendations,
    validPinnedCharts,
  };
}
