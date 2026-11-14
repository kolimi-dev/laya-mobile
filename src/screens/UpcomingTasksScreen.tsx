/**
 * Laya (లయ) Mobile — Upcoming Tasks Horizon Screen (ADR-0015, V2.1)
 * Shows non-daily and scheduled cadences due over the next 5 days.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';
import { Task, UserGroup } from '../core/types';
import { getOperationalDate, isTaskScheduledForDate } from '../core/recurrence';

interface Props {
  tasks: Task[];
  groups: UserGroup[];
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const UpcomingTasksScreen: React.FC<Props> = ({ tasks, groups }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const horizonDays = useMemo(() => {
    const result: { dateLabel: string; isTomorrow: boolean; tasks: Task[] }[] = [];
    const now = new Date();

    for (let i = 1; i <= 5; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const op = getOperationalDate(d);
      const dayStr = DAY_NAMES[op.dayOfWeek];
      const monthStr = MONTH_NAMES[op.month];
      const label = i === 1 ? `Tomorrow (${dayStr}, ${monthStr} ${op.dayOfMonth})` : `In ${i} days (${dayStr}, ${monthStr} ${op.dayOfMonth})`;

      // Only include non-daily tasks or tasks specifically scheduled for this day
      const scheduledTasks = tasks.filter((t) => {
        if (t.deletedAt || t.archivedAt || (t.lifecycleStatus && t.lifecycleStatus !== 'active')) return false;
        if (t.frequency === 'daily') return false; // Exclude daily habits from upcoming radar
        return isTaskScheduledForDate(t, op);
      });

      if (scheduledTasks.length > 0) {
        result.push({ dateLabel: label, isTomorrow: i === 1, tasks: scheduledTasks });
      }
    }
    return result;
  }, [tasks]);

  return (
    <View style={styles.container}>
      <View style={styles.horizonHeader}>
        <Text style={styles.horizonTitle}>Upcoming Horizon (Next 5 Days)</Text>
        <Text style={styles.horizonSubtext}>Approaching non-daily rhythms and scheduled milestones. Zero pressure.</Text>
      </View>

      {horizonDays.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🔭</Text>
          <Text style={styles.emptyTitle}>Clear Horizon</Text>
          <Text style={styles.emptySubtext}>
            No non-daily habits or scheduled milestones due in the next 5 days. Focus entirely on today's rhythm!
          </Text>
        </View>
      ) : (
        horizonDays.map((section, idx) => (
          <View key={idx} style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <View style={[styles.dot, section.isTomorrow ? { backgroundColor: colors.warning } : { backgroundColor: colors.primary }]} />
              <Text style={styles.sectionTitle}>{section.dateLabel}</Text>
            </View>

            {section.tasks.map((task) => {
              const grp = groups.find((g) => g.id === task.groupId);
              return (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.taskCardTop}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {grp && (
                      <View style={[styles.groupPill, { borderColor: grp.color }]}>
                        <Text style={[styles.groupPillText, { color: grp.color }]}>{grp.name}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.frequencyTag}>
                    Frequency: {task.frequency?.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              );
            })}
          </View>
        ))
      )}
    </View>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: { paddingBottom: spacing.xxl },
    horizonHeader: { marginBottom: spacing.md, gap: 2 },
    horizonTitle: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700' },
    horizonSubtext: { color: colors.textTertiary, fontSize: typography.caption },
    emptyCard: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.lg,
      padding: spacing.xl,
      alignItems: 'center',
      gap: 6,
      marginTop: spacing.sm,
    },
    emptyIcon: { fontSize: 32 },
    emptyTitle: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '600' },
    emptySubtext: { color: colors.textTertiary, fontSize: typography.caption, textAlign: 'center', lineHeight: 18 },
    sectionWrap: { marginBottom: spacing.lg, gap: spacing.xs },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
    dot: { width: 8, height: 8, borderRadius: radiuses.full },
    sectionTitle: { color: colors.textSecondary, fontSize: typography.subheading, fontWeight: '600' },
    taskCard: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      padding: spacing.md,
      gap: 4,
    },
    taskCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    taskTitle: { color: colors.textPrimary, fontSize: typography.body, fontWeight: '600' },
    groupPill: { borderWidth: 1, borderRadius: radiuses.full, paddingHorizontal: 6, paddingVertical: 1 },
    groupPillText: { fontSize: 9, fontWeight: '600' },
    frequencyTag: { color: colors.textTertiary, fontSize: 10, textTransform: 'capitalize' },
  });
