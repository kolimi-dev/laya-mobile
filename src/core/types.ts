/**
 * Laya (లయ) Mobile — Domain Types & Interfaces
 */

export type TaskFlavor = 'milestone' | 'percentage' | 'checklist';

export type FrequencyType =
  | 'daily'
  | 'days_of_week'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'anytime';

export type EventStatus = 'completed' | 'in_progress' | 'ignored';

export interface MilestoneItem {
  id: string;
  label: string;
  points: number;
}

export interface Task {
  id: string;
  userId: string;
  groupId: string;
  title: string;
  flavor: TaskFlavor;
  frequency: FrequencyType;
  daysOfWeek?: number[]; // 0=Sun, 1=Mon ... 6=Sat
  dayOfMonth?: number;
  monthOfYear?: number;
  targetAmount?: number;
  unit?: string;
  milestones?: MilestoneItem[];
  sortOrder: number;
  reminderTime?: string; // "09:00"
  voiceReminder?: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface CompletionEvent {
  id: string; // Client UUID (ADR-0003)
  taskId: string;
  userId: string;
  status: EventStatus;
  percentage?: number;
  completedMilestones?: string[]; // IDs
  quantifiedValue?: number;
  notes?: string;
  occurredAt: string; // ISO 8601 UTC
}

export interface UserGroup {
  id: string;
  userId: string;
  name: string;
  color: string;
  sortOrder: number;
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string;   // "07:30"
}

export type ChartType = 'volume_bars' | 'rhythm_matrix' | 'progress_trend';

export interface PinnedChart {
  id: string;
  taskId: string;
  chartType: ChartType;
  sortOrder: number;
}

export interface TelemetryPayload {
  eventId: string;
  eventType: 'session' | 'action' | 'navigation' | 'error' | 'metric';
  eventName: string;
  userId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
  errorStack?: string;
}

export interface EvaluatedTask {
  task: Task;
  currentStatus: EventStatus;
  percentage: number;
  completedMilestones: string[];
  quantifiedValue: number;
  lastEventId?: string;
  isCompleted: boolean;
  isIgnored: boolean;
  isScheduledToday: boolean;
}

