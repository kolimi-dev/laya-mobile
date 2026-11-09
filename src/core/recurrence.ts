/**
 * Laya (లయ) Mobile — Recurrence & Operational Day Engine (ADR-0007)
 * Night Owl Offset (03:00 AM cutoff) and Cadence Isolation
 */

import { Task, CompletionEvent } from './types';

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
  if (task.archivedAt) return false;

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
    case 'anytime':
      return true;
    default:
      return true;
  }
}

/**
 * Isolates completion events to the task's recurrence cadence (ADR-0007).
 * Daily tasks only evaluate today's events; Anytime tasks evaluate all historical events.
 */
export function filterEventsForTaskCadence(
  task: Task,
  events: CompletionEvent[],
  opInfo: OperationalDateInfo
): CompletionEvent[] {
  if (task.frequency === 'anytime') {
    return events; // Persists across dates
  }

  return events.filter((e) => {
    const eventOp = getOperationalDate(new Date(e.occurredAt));
    if (task.frequency === 'daily' || task.frequency === 'days_of_week') {
      return eventOp.dateString === opInfo.dateString;
    }
    if (task.frequency === 'monthly') {
      return (
        eventOp.year === opInfo.year && eventOp.month === opInfo.month
      );
    }
    return eventOp.dateString === opInfo.dateString;
  });
}

