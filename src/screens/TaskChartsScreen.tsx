/**
 * Laya (లయ) Mobile — Task Charts Screen
 * Opt-In Habit Visualizations & AI Suggestions (ADR-0004)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radiuses, typography } from '../theme/tokens';
import { PinnedChart, Task, CompletionEvent } from '../core/types';
import { ChartRecommendation } from '../services/ai-suggestions';
import { ChartBlock } from '../components/ChartBlock';
import { AiSuggestionBanner } from '../components/AiSuggestionBanner';

interface Props {
  pinnedCharts: PinnedChart[];
  tasks: Task[];
  events: CompletionEvent[];
  recommendations: ChartRecommendation[];
  onPinRecommendation: (rec: ChartRecommendation) => void;
  onMoveChart: (chartId: string, direction: 'up' | 'down') => void;
  onRemoveChart: (chartId: string) => void;
}

export const TaskChartsScreen: React.FC<Props> = ({
  pinnedCharts,
  tasks,
  events,
  recommendations,
  onPinRecommendation,
  onMoveChart,
  onRemoveChart,
}) => {
  return (
    <View style={styles.container}>
      <AiSuggestionBanner
        recommendations={recommendations}
        onPin={onPinRecommendation}
      />

      {pinnedCharts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>0 Pinned Charts</Text>
          <Text style={styles.emptySubtext}>
            No charts pinned yet. Use the suggestion above or create tasks to visualize.
          </Text>
        </View>
      ) : (
        pinnedCharts.map((chart, idx) => {
          const task = tasks.find((t) => t.id === chart.taskId);
          if (!task) return null;
          return (
            <ChartBlock
              key={chart.id}
              chart={chart}
              task={task}
              events={events.filter((e) => e.taskId === task.id)}
              isFirst={idx === 0}
              isLast={idx === pinnedCharts.length - 1}
              onMoveUp={(id) => onMoveChart(id, 'up')}
              onMoveDown={(id) => onMoveChart(id, 'down')}
              onRemove={onRemoveChart}
            />
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxl,
  },
  emptyCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radiuses.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: 4,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: '600',
  },
  emptySubtext: {
    color: colors.textTertiary,
    fontSize: typography.body,
  },
});

