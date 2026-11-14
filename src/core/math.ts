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
  let lastEventId: string | undefined;

  for (const event of sorted) {
    lastEventId = event.id;
    currentStatus = event.status;

    if (event.status === 'ignored') {
      percentage = 0;
      continue;
    }

    if (task.flavor === 'milestone') {
      completedMilestones = event.completedMilestones || [];
      skippedMilestones = event.skippedMilestones || [];
      const totalCount = task.milestones?.length || 1;

      if (task.milestoneMode === 'any') {
        // Disjunctive OR: Tapping ANY option completes 100% (ADR-0012)
        if (completedMilestones.length > 0) {
          percentage = 100;
          currentStatus = 'completed';
        } else {
          percentage = 0;
        }
      } else {
        // Conjunctive AND: Subtract skipped milestones from denominator
        const effectiveTotal = Math.max(1, totalCount - skippedMilestones.length);
        percentage = Math.min(100, Math.round((completedMilestones.length / effectiveTotal) * 100));
        if (completedMilestones.length >= effectiveTotal) {
          currentStatus = 'completed';
        }
      }
    } else if (task.flavor === 'percentage') {
      percentage = Math.min(100, Math.max(0, event.percentage ?? 0));
      if (percentage >= 100) {
        currentStatus = 'completed';
      }
    } else if (
      task.flavor === 'quantified' ||
      (task.flavor === 'checklist' && task.targetAmount && task.targetAmount > 0)
    ) {
      quantifiedValue = event.quantifiedValue ?? 0;
      const target = task.targetAmount || 1;
      percentage = Math.min(100, Math.round((quantifiedValue / target) * 100));
      if (quantifiedValue >= target) {
        currentStatus = 'completed';
      }
    } else if (task.flavor === 'one_time' || task.flavor === 'checklist') {
      percentage = event.status === 'completed' ? 100 : 0;
    }
  }

  const isCompleted = currentStatus === 'completed' || percentage >= 100;
  const isIgnored = currentStatus === 'ignored';

  return {
    task,
    currentStatus,
    percentage,
    completedMilestones,
    skippedMilestones,
    quantifiedValue,
    lastEventId,
    isCompleted,
    isIgnored,
    isScheduledToday: true,
  };
}
