/**
 * Laya (లయ) Mobile — Task Charts Screen (ADR-0004, ADR-0012, Phase 5)
 * Deterministic Group Dashboards (Health, Study, Routine) & Opt-In Charts
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';
import { PinnedChart, Task, CompletionEvent, UserGroup } from '../core/types';
import { ChartBlock } from '../components/ChartBlock';

interface Props {
  pinnedCharts: PinnedChart[];
  tasks: Task[];
  events: CompletionEvent[];
  groups: UserGroup[];
  onPinChart: (taskId: string) => void;
  onMoveChart: (chartId: string, direction: 'up' | 'down') => void;
  onRemoveChart: (chartId: string) => void;
}

export const TaskChartsScreen: React.FC<Props> = ({
  pinnedCharts,
  tasks,
  events,
  groups,
  onPinChart,
  onMoveChart,
  onRemoveChart,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Filter tasks and pinned charts by the selected group dashboard
  const activeTasks = useMemo(() => {
    return tasks.filter((t) => !t.deletedAt && (selectedGroupId ? t.groupId === selectedGroupId : true));
  }, [tasks, selectedGroupId]);

  const visiblePinnedCharts = useMemo(() => {
    return pinnedCharts.filter((c) => activeTasks.some((t) => t.id === c.taskId));
  }, [pinnedCharts, activeTasks]);

  const unpinnedTasks = useMemo(() => {
    return activeTasks.filter((t) => !pinnedCharts.some((c) => c.taskId === t.id));
  }, [activeTasks, pinnedCharts]);

  return (
    <View style={styles.container}>
      {/* Group Dashboard Filter Pills (ADR-0012: Health, Study, Routine) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <TouchableOpacity
          style={[styles.pill, selectedGroupId === null && styles.pillActive]}
          onPress={() => setSelectedGroupId(null)}
        >
          <Text style={[styles.pillText, selectedGroupId === null && styles.pillTextActive]}>
            All Dashboards
          </Text>
        </TouchableOpacity>

        {groups.map((grp) => {
          const isActive = selectedGroupId === grp.id;
          return (
            <TouchableOpacity
              key={grp.id}
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => setSelectedGroupId(grp.id)}
            >
              <View style={[styles.dot, { backgroundColor: grp.color }]} />
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {grp.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Pinned Deterministic Charts */}
      {visiblePinnedCharts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>0 Pinned Charts</Text>
          <Text style={styles.emptySubtext}>
            Deterministic dashboards mapped to your habits. Pin a habit below to visualize progress.
          </Text>
        </View>
      ) : (
        visiblePinnedCharts.map((chart, idx) => {
          const task = tasks.find((t) => t.id === chart.taskId);
          if (!task) return null;
          return (
            <ChartBlock
              key={chart.id}
              chart={chart}
              task={task}
              events={events.filter((e) => e.taskId === task.id)}
              isFirst={idx === 0}
              isLast={idx === visiblePinnedCharts.length - 1}
              onMoveUp={(id) => onMoveChart(id, 'up')}
              onMoveDown={(id) => onMoveChart(id, 'down')}
              onRemove={onRemoveChart}
            />
          );
        })
      )}

      {/* Quick Pin Tray for Unpinned Habits */}
      {unpinnedTasks.length > 0 && (
        <View style={styles.quickPinSection}>
          <Text style={styles.quickPinLabel}>Available Habit Visualizations</Text>
          <View style={styles.quickPinRow}>
            {unpinnedTasks.map((t) => (
              <TouchableOpacity key={t.id} style={styles.quickPinBtn} onPress={() => onPinChart(t.id)}>
                <Text style={styles.quickPinText}>+ Pin {t.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: { paddingBottom: spacing.xxl },
    filterRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
    },
    pillActive: { backgroundColor: colors.bgActive, borderColor: colors.borderStrong },
    pillText: { color: colors.textSecondary, fontSize: typography.caption, fontWeight: '500' },
    pillTextActive: { color: colors.textPrimary, fontWeight: '700' },
    dot: { width: 6, height: 6, borderRadius: radiuses.full },
    emptyCard: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.lg,
      padding: spacing.xl,
      alignItems: 'center',
      gap: 4,
      marginBottom: spacing.md,
    },
    emptyTitle: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '600' },
    emptySubtext: { color: colors.textTertiary, fontSize: typography.body, textAlign: 'center' },
    quickPinSection: { marginTop: spacing.md, gap: spacing.xs },
    quickPinLabel: { color: colors.textTertiary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
    quickPinRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    quickPinBtn: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
    },
    quickPinText: { color: colors.primary, fontSize: 11, fontWeight: '600' },
  });
