/**
 * Laya (లయ) Mobile — AI & Heuristic Chart Suggestions (ADR-0004)
 * Opt-in habit visualizations with 1-tap pinning
 */

import { Task, PinnedChart, ChartType } from '../core/types';
import { generateUUID } from './storage';

export interface ChartRecommendation {
  taskId: string;
  taskTitle: string;
  recommendedType: ChartType;
  label: string;
  reason: string;
}

export function getChartRecommendations(
  tasks: Task[],
  pinnedCharts: PinnedChart[]
): ChartRecommendation[] {
  const pinnedTaskIds = new Set(pinnedCharts.map((c) => c.taskId));
  const unpinnedTasks = tasks.filter((t) => !pinnedTaskIds.has(t.id) && !t.archivedAt);

  const recommendations: ChartRecommendation[] = [];

  for (const task of unpinnedTasks) {
    if (task.targetAmount && task.targetAmount > 0) {
      recommendations.push({
        taskId: task.id,
        taskTitle: task.title,
        recommendedType: 'volume_bars',
        label: 'Daily Volume Bars',
        reason: `Ideal for quantified goals with target threshold (${task.targetAmount} ${task.unit || 'units'}).`,
      });
    } else if (task.flavor === 'milestone') {
      recommendations.push({
        taskId: task.id,
        taskTitle: task.title,
        recommendedType: 'rhythm_matrix',
        label: 'Rhythm Heatmap Matrix',
        reason: `Visualizes completion intensity across ${task.milestones?.length || 3} milestone checkpoints.`,
      });
    } else if (task.flavor === 'checklist' && task.frequency === 'daily') {
      recommendations.push({
        taskId: task.id,
        taskTitle: task.title,
        recommendedType: 'rhythm_matrix',
        label: 'Cadence Rhythm Grid',
        reason: 'Clean GitHub-style consistency grid for daily discipline.',
      });
    } else if (task.flavor === 'percentage') {
      recommendations.push({
        taskId: task.id,
        taskTitle: task.title,
        recommendedType: 'progress_trend',
        label: 'Progress Trend Line',
        reason: 'Smooth trajectory curve across continuous completion percentage.',
      });
    }
  }

  return recommendations;
}

export function createPinnedChartFromRecommendation(
  rec: ChartRecommendation,
  currentCharts: PinnedChart[]
): PinnedChart {
  return {
    id: generateUUID('chr'),
    taskId: rec.taskId,
    chartType: rec.recommendedType,
    sortOrder: currentCharts.length + 1,
  };
}

