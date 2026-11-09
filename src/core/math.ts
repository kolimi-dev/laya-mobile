/**
 * Laya (లయ) Mobile — Mathematical Engine
 * Guilt-Free Consistency Math & Progress Evaluators (ADR-0001, ADR-0004)
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
  const effectiveDenominator = scheduledPoints - ignoredPoints;
  if (effectiveDenominator <= 0) {
    return 100; // Zero guilt on full rest or zero scheduled
  }
  const rating = (completedPoints / effectiveDenominator) * 100;
  return Math.min(100, Math.max(0, Math.round(rating)));
}

/**
 * Evaluates the status of a single task given its completion events
 */
export function evaluateTaskProgress(
  task: Task,
  events: CompletionEvent[]
): EvaluatedTask {
  // Sort events chronologically to evaluate latest state
  const sorted = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );

  let currentStatus: 'completed' | 'in_progress' | 'ignored' = 'in_progress';
  let percentage = 0;
  let completedMilestones: string[] = [];
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
      const totalCount = task.milestones?.length || 1;
      percentage = Math.round((completedMilestones.length / totalCount) * 100);
      if (completedMilestones.length >= totalCount) {
        currentStatus = 'completed';
      }
    } else if (task.flavor === 'percentage') {
      percentage = Math.min(100, Math.max(0, event.percentage ?? 0));
      if (percentage >= 100) {
        currentStatus = 'completed';
      }
    } else if (task.flavor === 'checklist') {
      if (task.targetAmount && task.targetAmount > 0) {
        // Quantified task
        quantifiedValue = event.quantifiedValue ?? 0;
        percentage = Math.min(100, Math.round((quantifiedValue / task.targetAmount) * 100));
        if (quantifiedValue >= task.targetAmount) {
          currentStatus = 'completed';
        }
      } else {
        // Standard binary checklist
        percentage = event.status === 'completed' ? 100 : 0;
      }
    }
  }

  const isCompleted = currentStatus === 'completed' || percentage >= 100;
  const isIgnored = currentStatus === 'ignored';

  return {
    task,
    currentStatus,
    percentage,
    completedMilestones,
    quantifiedValue,
    lastEventId,
    isCompleted,
    isIgnored,
    isScheduledToday: true,
  };
}

