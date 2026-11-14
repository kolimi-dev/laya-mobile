/**
 * Laya (లయ) Mobile — Domain Types & Interfaces (ADR-0001 through ADR-0012)
 */

export type TaskFlavor =
  | 'checklist'
  | 'quantified'
  | 'milestone'
  | 'flexible_baseline'
  | 'one_time'
  | 'percentage'; // Legacy compatibility

export type FrequencyType =
  | 'daily'
  | 'days_of_week'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'custom'
  | 'one_time'
  | 'anytime';

export type EventStatus = 'completed' | 'in_progress' | 'ignored';

export type MilestoneMode = 'all' | 'any';

export interface MilestoneItem {
  id: string;
  label: string;
  points: number;
}

export interface BaselineCriterion {
  id: string;
  label: string;
  target: number;
  unit: string;
  stepAmount?: number;
}

export interface Task {
  id: string;
  userId: string;
  groupId: string;
  title: string;
  flavor: TaskFlavor;
  frequency: FrequencyType;
  daysOfWeek?: number[]; // 0=Sun, 1=Mon ... 6=Sat
  dayOfMonth?: number;   // 1-31
  monthOfYear?: number;  // 1-12
  intervalDays?: number; // e.g. 2 for every 2 days
  intervalMonths?: number; // e.g. 3 for every 3 months
  targetAmount?: number;
  stepAmount?: number;   // Configurable jump e.g. 0.5, 250, 5, 0.1
  unit?: string;
  milestones?: MilestoneItem[];
  milestoneMode?: MilestoneMode; // 'all' (AND) | 'any' (OR)
  baselineCriteria?: BaselineCriterion[];
  targetDate?: string;   // For 'one_time' flavor: "YYYY-MM-DD"
  sortOrder: number;
  reminderTime?: string; // "08:00"
  voiceReminder?: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  deletedAt?: string | null; // For 30-day trash (ADR-0011)
  lifecycleStatus?: 'active' | 'completed' | 'paused' | 'retired'; // ADR-0011
}

export interface CompletionEvent {
  id: string; // Client UUID (ADR-0003)
  taskId: string;
  userId: string;
  status: EventStatus;
  percentage?: number;
  completedMilestones?: string[]; // IDs
  skippedMilestones?: string[];   // Guilt-free exempted milestone IDs
  quantifiedValue?: number;
  criterionValues?: Record<string, number>;
  activeCriterionId?: string;
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

export type ChartVisualizerStyle =
  | 'volume_bars'
  | 'continuity_ring'
  | 'activity_heatmap'
  | 'progression_line'
  | 'progress_trend'
  | 'rhythm_matrix';

export type ChartType = ChartVisualizerStyle;

export interface UserDashboard {
  id: string;
  userId: string;
  title: string;
  icon?: string;
  sortOrder: number;
  createdAt: string;
}

export interface PinnedChart {
  id: string;
  taskId: string;
  dashboardId?: string;
  chartType: ChartVisualizerStyle;
  sortOrder: number;
}

export type TimeWindow = '7d' | '30d' | 'month' | 'last_month' | 'year' | '1y';

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
  skippedMilestones: string[];
  quantifiedValue: number;
  criterionValues?: Record<string, number>;
  activeCriterionId?: string;
  lastEventId?: string;
  isCompleted: boolean;
  isIgnored: boolean;
  isScheduledToday: boolean;
}
