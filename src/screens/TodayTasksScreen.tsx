/**
 * Laya (లయ) Mobile — Today's Tasks Screen (ADR-0004, ADR-0010, ADR-0012)
 * Remaining vs Completed & Rested Buckets
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';
import { EvaluatedTask, UserGroup, Task, CompletionEvent } from '../core/types';
import { TaskCard } from '../components/TaskCard';

interface Props {
  remainingTasks: EvaluatedTask[];
  completedOrRestedTasks: EvaluatedTask[];
  groups: UserGroup[];
  events?: CompletionEvent[];
  onToggleComplete: (taskId: string) => void;
  onToggleMilestone: (taskId: string, milestoneId: string) => void;
  onSkipMilestone?: (taskId: string, milestoneId: string, reason?: string) => void;
  onUpdateQuantified: (taskId: string, delta: number) => void;
  onSetQuantifiedExact?: (taskId: string, value: number) => void;
  onToggleIgnore: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string, title: string) => void;
}

export const TodayTasksScreen: React.FC<Props> = ({
  remainingTasks,
  completedOrRestedTasks,
  groups,
  events = [],
  onToggleComplete,
  onToggleMilestone,
  onSkipMilestone,
  onUpdateQuantified,
  onSetQuantifiedExact,
  onToggleIgnore,
  onEditTask,
  onDeleteTask,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const renderCard = (item: EvaluatedTask) => (
    <TaskCard
      key={item.task.id}
      evaluated={item}
      group={groups.find((g) => g.id === item.task.groupId)}
      events={events}
      onToggleComplete={onToggleComplete}
      onToggleMilestone={onToggleMilestone}
      onSkipMilestone={onSkipMilestone}
      onUpdateQuantified={onUpdateQuantified}
      onSetQuantifiedExact={onSetQuantifiedExact}
      onToggleIgnore={onToggleIgnore}
      onEditTask={onEditTask}
      onDeleteTask={onDeleteTask}
    />
  );

  return (
    <View style={styles.container}>
      {/* Top Bucket: Remaining Today */}
      <View style={styles.bucketHeader}>
        <View style={[styles.bucketDot, { backgroundColor: colors.warning }]} />
        <Text style={styles.bucketTitle}>Remaining Today ({remainingTasks.length})</Text>
      </View>

      {remainingTasks.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            {completedOrRestedTasks.length === 0 ? 'No habits yet' : 'All done for today!'}
          </Text>
          <Text style={styles.emptySubtext}>
            {completedOrRestedTasks.length === 0
              ? 'Tap "+ Add" above to start your daily rhythm, or open the menu ☰ for the guide.'
              : 'Zero pressure. Rest peacefully.'}
          </Text>
        </View>
      ) : (
        remainingTasks.map(renderCard)
      )}

      {/* Bottom Bucket: Completed & Rested Today */}
      {completedOrRestedTasks.length > 0 && (
        <View style={styles.completedSection}>
          <View style={styles.bucketHeader}>
            <View style={[styles.bucketDot, { backgroundColor: colors.done }]} />
            <Text style={styles.bucketTitle}>
              Completed & Rested ({completedOrRestedTasks.length})
            </Text>
          </View>

          {completedOrRestedTasks.map(renderCard)}
        </View>
      )}
    </View>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: {
      paddingBottom: spacing.xxl,
    },
    bucketHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    bucketDot: {
      width: 8,
      height: 8,
      borderRadius: radiuses.full,
    },
    bucketTitle: {
      color: colors.textSecondary,
      fontSize: typography.subheading,
      fontWeight: '600',
    },
    completedSection: {
      marginTop: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
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
