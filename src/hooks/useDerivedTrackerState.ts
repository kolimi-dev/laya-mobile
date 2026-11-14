/**
 * Laya (లయ) Mobile — Derived Tracker State Hook
 * Computes derived task evaluations, consistency scores, and chart views (ADR-0001, ADR-0010)
 */

import { useMemo } from 'react';
import { Task, CompletionEvent, PinnedChart, EvaluatedTask } from '../core/types';
import { calculateConsistencyRating, evaluateTaskProgress } from '../core/math';
import { isTaskScheduledForDate, filterEventsForTaskCadence, getOperationalDate, OperationalDateInfo } from '../core/recurrence';
import { getChartRecommendations } from '../services/ai-suggestions';

interface UseDerivedTrackerStateParams {
  tasks: Task[];
  events: CompletionEvent[];
  pinnedCharts: PinnedChart[];
  activeGroupId: string | null;
  opInfo: OperationalDateInfo;
}

export function useDerivedTrackerState({
  tasks,
  events,
  pinnedCharts,
  activeGroupId,
  opInfo,
}: UseDerivedTrackerStateParams) {
  const evaluatedTasks = useMemo<EvaluatedTask[]>(() => {
    return tasks
      .filter((t) => (activeGroupId ? t.groupId === activeGroupId : true) && isTaskScheduledForDate(t, opInfo))
      .map((t) => evaluateTaskProgress(t, filterEventsForTaskCadence(t, events, opInfo)));
  }, [tasks, events, activeGroupId, opInfo]);

  const remainingTasks = useMemo(
    () => evaluatedTasks.filter((t) => !t.isCompleted && !t.isIgnored),
    [evaluatedTasks]
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

      scheduled += 100;
      if (t.isIgnored) ignored += 100;
      else completed += t.percentage;
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
    remainingTasks,
    completedOrRestedTasks,
    consistencyScore,
    chartRecommendations,
    validPinnedCharts,
  };
}
