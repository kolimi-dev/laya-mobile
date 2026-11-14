/**
 * Laya (లయ) Mobile — Mathematical Engine
 * Guilt-Free Consistency Math & Progress Evaluators (ADR-0001, ADR-0004, ADR-0012)
 */

import { Task, CompletionEvent, EvaluatedTask } from './types';

/**
 * Guilt-Free Consistency Rating Formula:
 * Consistency (%) = (Completed Points) / (Total Scheduled Points - Ignored Points) * 100
 * Ignored rest days are completely deducted from the denominator.
 */
export function calculateConsistencyRating(
  completedPoints: number,
  scheduledPoints: number,
  ignoredPoints: number
): number {
  if (scheduledPoints <= 0) {
    return 0;
  }
  const effectiveDenominator = scheduledPoints - ignoredPoints;
  if (effectiveDenominator <= 0) {
    return 100; // Zero guilt on full rest
  }
  const rating = (completedPoints / effectiveDenominator) * 100;
  return Math.min(100, Math.max(0, Math.round(rating)));
}

/**
 * Evaluates the status of a single task given its completion events (ADR-0012)
 * Supports 4 flavors: checklist, quantified, milestone (AND/OR + skipped), one_time
 * Non-destructive: carries forward accumulated state across status-change events
 */
export function evaluateTaskProgress(
  task: Task,
  events: CompletionEvent[]
): EvaluatedTask {
  const taskEvents = events.filter((e) => e.taskId === task.id);
  const sorted = [...taskEvents].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );

  let currentStatus: 'completed' | 'in_progress' | 'ignored' = 'in_progress';
  let percentage = 0;
  let completedMilestones: string[] = [];
  let skippedMilestones: string[] = [];
  let quantifiedValue = 0;
  let criterionValues: Record<string, number> = {};
  let activeCriterionId: string | undefined;
  let lastEventId: string | undefined;

  for (const event of sorted) {
    lastEventId = event.id;
    currentStatus = event.status;

    if (event.status === 'ignored') {
      // Ignored rest day: preserve accumulated counters while status is ignored
      continue;
    }

    if (task.flavor === 'milestone') {
      if (event.completedMilestones !== undefined) {
        completedMilestones = event.completedMilestones;
      }
      if (event.skippedMilestones !== undefined) {
        skippedMilestones = event.skippedMilestones;
      }
      const totalCount = task.milestones?.length || 1;

      if (task.milestoneMode === 'any') {
        if (completedMilestones.length > 0) {
          percentage = 100;
          currentStatus = 'completed';
        } else {
          percentage = 0;
        }
      } else {
        const effectiveTotal = Math.max(1, totalCount - skippedMilestones.length);
        percentage = Math.min(100, Math.round((completedMilestones.length / effectiveTotal) * 100));
        if (completedMilestones.length >= effectiveTotal) {
          currentStatus = 'completed';
        }
      }
    } else if (task.flavor === 'percentage') {
      if (event.percentage !== undefined) {
        percentage = Math.min(100, Math.max(0, event.percentage));
      }
      if (percentage >= 100) {
        currentStatus = 'completed';
      }
    } else if (
      task.flavor === 'quantified' ||
      (task.flavor === 'checklist' && task.targetAmount && task.targetAmount > 0)
    ) {
      if (event.quantifiedValue !== undefined && event.quantifiedValue !== null) {
        quantifiedValue = event.quantifiedValue;
      }
      const target = task.targetAmount || 1;
      percentage = Math.min(100, Math.round((quantifiedValue / target) * 100));
      if (quantifiedValue >= target) {
        currentStatus = 'completed';
      }
    } else if (task.flavor === 'flexible_baseline') {
      const criteria = task.baselineCriteria || [];
      if (event.criterionValues !== undefined) {
        criterionValues = { ...criterionValues, ...event.criterionValues };
      }
      if (event.activeCriterionId !== undefined) {
        activeCriterionId = event.activeCriterionId;
      } else if (!activeCriterionId) {
        activeCriterionId = criteria[0]?.id;
      }
      if (criteria.length > 0 && event.quantifiedValue !== undefined && !criterionValues[criteria[0].id]) {
        criterionValues[criteria[0].id] = event.quantifiedValue;
      }
      let maxPct = 0;
      for (const crit of criteria) {
        const val = criterionValues[crit.id] || 0;
        const target = Math.max(0.001, crit.target);
        const pct = Math.round((val / target) * 100);
        if (pct > maxPct) maxPct = pct;
      }
      percentage = event.status === 'completed' ? Math.max(100, maxPct) : maxPct;
      if (percentage >= 100 || event.status === 'completed') {
        currentStatus = 'completed';
      }
    } else if (task.flavor === 'one_time' || task.flavor === 'checklist') {
      if (event.status === 'completed') {
        percentage = 100;
      } else if (event.percentage !== undefined) {
        percentage = event.percentage;
      }
    }
  }

  const isIgnored = currentStatus === 'ignored';
  const isCompleted = !isIgnored && (currentStatus === 'completed' || percentage >= 100);

  return {
    task,
    currentStatus,
    percentage: isIgnored ? 0 : percentage,
    completedMilestones,
    skippedMilestones,
    quantifiedValue,
    criterionValues,
    activeCriterionId,
    lastEventId,
    isCompleted,
    isIgnored,
    isScheduledToday: true,
  };
}
