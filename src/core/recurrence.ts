/**
 * Laya (లయ) Mobile — Recurrence & Operational Day Engine (ADR-0007, ADR-0012)
 * Night Owl Offset (03:00 AM cutoff) and Cadence Isolation
 */

import { Task, CompletionEvent, TimeWindow } from './types';

export const NIGHT_OWL_OFFSET_HOURS = 3; // 03:00 AM

export interface OperationalDateInfo {
  date: Date;
  dateString: string; // "YYYY-MM-DD"
  dayOfWeek: number;  // 0=Sun, 1=Mon ... 6=Sat
  dayOfMonth: number; // 1-31
  month: number;      // 0-11
  year: number;
  isNightOwlPeriod: boolean;
}

/**
 * Calculates the operational date accounting for the 03:00 AM Night Owl offset.
 * Example: 2:30 AM on Tuesday counts as Monday's operational day.
 */
export function getOperationalDate(now: Date = new Date()): OperationalDateInfo {
  const currentHour = now.getHours();
  const isNightOwl = currentHour < NIGHT_OWL_OFFSET_HOURS;

  const adjustedDate = new Date(now);
  if (isNightOwl) {
    adjustedDate.setDate(adjustedDate.getDate() - 1);
  }

  const year = adjustedDate.getFullYear();
  const month = adjustedDate.getMonth();
  const dayOfMonth = adjustedDate.getDate();
  const dayOfWeek = adjustedDate.getDay();

  const pad = (n: number) => String(n).padStart(2, '0');
  const dateString = `${year}-${pad(month + 1)}-${pad(dayOfMonth)}`;

  return {
    date: adjustedDate,
    dateString,
    dayOfWeek,
    dayOfMonth,
    month,
    year,
    isNightOwlPeriod: isNightOwl,
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
    case 'monthly':
      return task.dayOfMonth === opInfo.dayOfMonth;
    case 'yearly':
      return (
        task.dayOfMonth === opInfo.dayOfMonth &&
        task.monthOfYear === opInfo.month + 1
      );
    case 'custom':
      if (task.intervalDays && task.intervalDays > 1) {
        const createdOp = getOperationalDate(new Date(task.createdAt));
        const diffMs = opInfo.date.getTime() - createdOp.date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays % task.intervalDays === 0;
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
  if (task.frequency === 'anytime' || task.frequency === 'one_time' || task.flavor === 'one_time') {
    return events; // Persists across dates
  }

  return events.filter((e) => {
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
