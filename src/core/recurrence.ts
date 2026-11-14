/**
 * Laya (లయ) Mobile — Recurrence & Operational Day Engine (ADR-0007, ADR-0012)
 * Standard local calendar day (00:00:00 to 23:59:59) and Cadence Isolation
 */

import { Task, CompletionEvent, TimeWindow } from './types';

export const GUILT_FREE_BACKFILL_DAYS = 7;

export function getOperationalDayDifference(laterDateStr: string, earlierDateStr: string): number {
  const d1 = new Date(laterDateStr + 'T12:00:00Z');
  const d2 = new Date(earlierDateStr + 'T12:00:00Z');
  return Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
}

export interface OperationalDateInfo {
  date: Date;
  dateString: string; // "YYYY-MM-DD"
  dayOfWeek: number;  // 0=Sun, 1=Mon ... 6=Sat
  dayOfMonth: number; // 1-31
  month: number;      // 0-11
  year: number;
  isNightOwlPeriod?: boolean;
}

/**
 * Calculates operational date based on the user device's local calendar day.
 */
export function getOperationalDate(now: Date = new Date()): OperationalDateInfo {
  const year = now.getFullYear();
  const month = now.getMonth();
  const dayOfMonth = now.getDate();
  const dayOfWeek = now.getDay();

  const pad = (n: number) => String(n).padStart(2, '0');
  const dateString = `${year}-${pad(month + 1)}-${pad(dayOfMonth)}`;

  return {
    date: now,
    dateString,
    dayOfWeek,
    dayOfMonth,
    month,
    year,
    isNightOwlPeriod: false,
  };
}

/**
 * Checks if a task is scheduled on the given operational date
 */
export function isTaskScheduledForDate(
  task: Task,
  opInfo: OperationalDateInfo
): boolean {
  if (task.archivedAt || task.deletedAt) return false;

  // Allow new habits to be backfilled for past 7 days prior to their creation operational day
  if (task.createdAt) {
    const createdOp = getOperationalDate(new Date(task.createdAt));
    if (opInfo.dateString < createdOp.dateString) {
      const diffDays = getOperationalDayDifference(createdOp.dateString, opInfo.dateString);
      if (diffDays > GUILT_FREE_BACKFILL_DAYS) {
        return false;
      }
    }
  }

  // One-time tasks are scheduled only on their target date (or today if unspecified)
  if (task.frequency === 'one_time' || task.flavor === 'one_time') {
    if (task.targetDate) {
      return task.targetDate === opInfo.dateString;
    }
    return true;
  }

  switch (task.frequency) {
    case 'daily':
      return true;
    case 'days_of_week':
      return (task.daysOfWeek || []).includes(opInfo.dayOfWeek);
    case 'weekly':
      return true;
    case 'monthly': {
      const daysInMonth = new Date(opInfo.year, opInfo.month + 1, 0).getDate();
      const targetDay = Math.min(task.dayOfMonth || 1, daysInMonth);
      if (opInfo.dayOfMonth === targetDay) return true;

      // Mid-cycle grace period:
      // If created in this month AFTER targetDay, keep pending for remainder of this month
      if (task.createdAt) {
        const createdOp = getOperationalDate(new Date(task.createdAt));
        if (
          createdOp.year === opInfo.year &&
          createdOp.month === opInfo.month &&
          createdOp.dayOfMonth > targetDay &&
          opInfo.dayOfMonth >= createdOp.dayOfMonth
        ) {
          return true;
        }
      }
      return false;
    }
    case 'yearly': {
      const targetMonth = (task.monthOfYear || 1) - 1;
      const daysInMonth = new Date(opInfo.year, targetMonth + 1, 0).getDate();
      const targetDay = Math.min(task.dayOfMonth || 1, daysInMonth);

      if (opInfo.month === targetMonth && opInfo.dayOfMonth === targetDay) {
        return true;
      }

      // Mid-cycle grace period:
      // If created in current year AFTER the scheduled target, keep pending for remainder of creation year
      if (task.createdAt) {
        const createdOp = getOperationalDate(new Date(task.createdAt));
        const isAfterTargetThisYear =
          createdOp.year === opInfo.year &&
          (createdOp.month > targetMonth ||
            (createdOp.month === targetMonth && createdOp.dayOfMonth > targetDay));
        if (isAfterTargetThisYear && opInfo.dateString >= createdOp.dateString) {
          return true;
        }
      }
      return false;
    }
    case 'custom':
      if (task.intervalDays && task.intervalDays > 1) {
        const createdOp = getOperationalDate(new Date(task.createdAt));
        const diffDays = Math.abs(getOperationalDayDifference(createdOp.dateString, opInfo.dateString));
        return diffDays % task.intervalDays === 0;
      }
      return true;
    case 'anytime':
      return true;
    default:
      return true;
  }
}

/**
 * Isolates completion events to the task's recurrence cadence (ADR-0007).
 * Daily tasks only evaluate today's events; Anytime/One-time tasks evaluate all historical events.
 */
export function filterEventsForTaskCadence(
  task: Task,
  events: CompletionEvent[],
  opInfo: OperationalDateInfo
): CompletionEvent[] {
  // Isolate events belonging strictly to this specific task (ADR-0001, ADR-0016)
  const taskEvents = events.filter((e) => e.taskId === task.id);

  if (task.frequency === 'anytime' || task.frequency === 'one_time' || task.flavor === 'one_time') {
    return taskEvents; // Persists across dates
  }

  return taskEvents.filter((e) => {
    const eventOp = getOperationalDate(new Date(e.occurredAt));
    if (task.frequency === 'daily' || task.frequency === 'days_of_week' || task.frequency === 'custom') {
      return eventOp.dateString === opInfo.dateString;
    }
    if (task.frequency === 'monthly') {
      return (
        eventOp.year === opInfo.year && eventOp.month === opInfo.month
      );
    }
    if (task.frequency === 'yearly') {
      return eventOp.year === opInfo.year;
    }
    return eventOp.dateString === opInfo.dateString;
  });
}

/**
 * Filters completion events by dashboard-selected time window (ADR-0012, Phase C).
 */
export function filterEventsByTimeWindow(
  events: CompletionEvent[],
  timeWindow: TimeWindow
): CompletionEvent[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return events.filter((e) => {
    const eventDate = new Date(e.occurredAt);
    const diffMs = now.getTime() - eventDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    switch (timeWindow) {
      case '7d':
        return diffDays >= 0 && diffDays <= 7;
      case '30d':
        return diffDays >= 0 && diffDays <= 30;
      case 'month':
        return eventDate.getFullYear() === currentYear && eventDate.getMonth() === currentMonth;
      case 'last_month': {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return eventDate.getFullYear() === lastMonthYear && eventDate.getMonth() === lastMonth;
      }
      case 'year':
        return eventDate.getFullYear() === currentYear;
      case '1y':
        return diffDays >= 0 && diffDays <= 365;
      default:
        return true;
    }
  });
}
