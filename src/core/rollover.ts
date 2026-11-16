/**
 * Laya (లయ) Mobile — Task Rollover & Carry-Forward Engine (ADR-0019)
 * Carries uncompleted, un-ignored tasks forward across intervals and specific days
 * without drifting the canonical schedule cadence anchors.
 */

import { Task, CompletionEvent } from './types';
import { OperationalDateInfo, getOperationalDate, getOperationalDayDifference } from './recurrence';

/**
 * Determines if an active task should be rolled forward to the current operational day.
 * A task rolls forward if:
 * 1. It is not completed or ignored for its current cycle.
 * 2. It was scheduled on a prior date within its cycle.
 * 3. Its canonical interval remains anchored to its original schedule.
 */
export function shouldTaskRollForward(
  task: Task,
  currentOp: OperationalDateInfo,
  events: CompletionEvent[]
): boolean {
  if (
    task.archivedAt ||
    task.deletedAt ||
    (task.lifecycleStatus && task.lifecycleStatus !== 'active')
  ) {
    return false;
  }

  // Daily and anytime habits do not roll forward
  if (task.frequency === 'daily' || task.frequency === 'anytime') {
    return false;
  }

  const createdOp = getOperationalDate(new Date(task.createdAt || Date.now()));
  // Tasks cannot roll forward before their creation date
  if (currentOp.dateString < createdOp.dateString) {
    return false;
  }

  const lastScheduledDateString = getMostRecentScheduledDate(task, currentOp, createdOp);
  if (!lastScheduledDateString) {
    return false;
  }

  // Check if there is already a completed or ignored event between the last scheduled date and current date
  const isSatisfiedInCurrentCycle = events.some((e) => {
    if (e.taskId !== task.id) return false;
    if (e.status !== 'completed' && e.status !== 'ignored') return false;
    const eventDate = e.targetDate || (e.occurredAt ? e.occurredAt.slice(0, 10) : '');
    return eventDate >= lastScheduledDateString && eventDate <= currentOp.dateString;
  });

  return !isSatisfiedInCurrentCycle;
}

/**
 * Finds the most recent scheduled date strictly prior to currentOp.dateString.
 */
export function getMostRecentScheduledDate(
  task: Task,
  currentOp: OperationalDateInfo,
  createdOp: OperationalDateInfo
): string | null {
  if (task.frequency === 'custom') {
    const interval = task.intervalDays && task.intervalDays > 1 ? task.intervalDays : 1;
    const diffDays = getOperationalDayDifference(currentOp.dateString, createdOp.dateString);
    if (diffDays <= 0) return null;
    const remainder = diffDays % interval;
    const daysAgo = remainder === 0 ? interval : remainder;
    const pastDate = new Date(currentOp.year, currentOp.month, currentOp.dayOfMonth - daysAgo);
    const pastOp = getOperationalDate(pastDate);
    return pastOp.dateString >= createdOp.dateString ? pastOp.dateString : null;
  }

  if (task.frequency === 'days_of_week') {
    const days = task.daysOfWeek || [];
    if (days.length === 0) return null;
    for (let offset = 1; offset <= 7; offset++) {
      const pastDate = new Date(currentOp.year, currentOp.month, currentOp.dayOfMonth - offset);
      const pastOp = getOperationalDate(pastDate);
      if (pastOp.dateString < createdOp.dateString) break;
      if (days.includes(pastOp.dayOfWeek)) {
        return pastOp.dateString;
      }
    }
    return null;
  }

  if (task.frequency === 'one_time' || task.flavor === 'one_time') {
    const target = task.targetDate || createdOp.dateString;
    return target < currentOp.dateString && target >= createdOp.dateString ? target : null;
  }

  if (task.frequency === 'monthly') {
    const targetDay = task.dayOfMonth || 1;
    if (currentOp.dayOfMonth > targetDay) {
      const daysInMonth = new Date(currentOp.year, currentOp.month + 1, 0).getDate();
      const eff = Math.min(targetDay, daysInMonth);
      const pastDate = new Date(currentOp.year, currentOp.month, eff);
      const pastOp = getOperationalDate(pastDate);
      return pastOp.dateString >= createdOp.dateString ? pastOp.dateString : null;
    } else {
      const daysInPrev = new Date(currentOp.year, currentOp.month, 0).getDate();
      const eff = Math.min(targetDay, daysInPrev);
      const pastDate = new Date(currentOp.year, currentOp.month - 1, eff);
      const pastOp = getOperationalDate(pastDate);
      return pastOp.dateString >= createdOp.dateString ? pastOp.dateString : null;
    }
  }

  return null;
}
