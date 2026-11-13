/**
 * Laya (లయ) Mobile — Task Charts & Custom Dashboards Screen (ADR-0004, ADR-0012, Phase C)
 * User-Created Dashboards, Per-Dashboard Time Window, Deterministic Visualizers
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';
import { PinnedChart, Task, CompletionEvent, UserDashboard, UserGroup, TimeWindow, ChartVisualizerStyle } from '../core/types';
import { filterEventsByTimeWindow } from '../core/recurrence';
import { ChartBlock } from '../components/ChartBlock';
import { TimeWindowSelector } from '../components/TimeWindowSelector';
import { CreateDashboardModal } from '../components/CreateDashboardModal';
import { AddChartModal } from '../components/AddChartModal';

interface Props {
  pinnedCharts: PinnedChart[];
  tasks: Task[];
  events: CompletionEvent[];
  dashboards: UserDashboard[];
  groups: UserGroup[];
  onCreateDashboard: (dash: UserDashboard) => void;
  onPinChart: (taskId: string, style?: ChartVisualizerStyle, dashboardId?: string) => void;
  onMoveChart: (chartId: string, direction: 'up' | 'down') => void;
  onRemoveChart: (chartId: string) => void;
}

export const TaskChartsScreen: React.FC<Props> = ({
  pinnedCharts,
  tasks,
  events,
  dashboards,
  onCreateDashboard,
  onPinChart,
  onMoveChart,
  onRemoveChart,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [activeDashId, setActiveDashId] = useState<string>(dashboards[0]?.id || 'dash_default');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('7d');
  const [createDashOpen, setCreateDashOpen] = useState(false);
  const [addChartOpen, setAddChartOpen] = useState(false);

  const activeDashboard = dashboards.find((d) => d.id === activeDashId) || dashboards[0] || {
    id: 'dash_default',
    title: 'Overview',
    icon: '📊',
    sortOrder: 1,
    createdAt: '',
    userId: '',
  };

  const dashboardCharts = useMemo(() => {
    return pinnedCharts.filter((c) => {
      const taskExists = tasks.some((t) => t.id === c.taskId && !t.deletedAt);
      if (!taskExists) return false;
      return !c.dashboardId || c.dashboardId === activeDashId;
    });
  }, [pinnedCharts, tasks, activeDashId]);

  const windowEvents = useMemo(() => {
    return filterEventsByTimeWindow(events, timeWindow);
  }, [events, timeWindow]);

  return (
    <View style={styles.container}>
      {/* User Dashboards Horizontal Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dashRow}>
        {dashboards.map((dash) => {
          const isActive = activeDashId === dash.id;
          return (
            <TouchableOpacity
              key={dash.id}
              style={[styles.dashPill, isActive && styles.dashPillActive]}
              onPress={() => setActiveDashId(dash.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.dashIcon}>{dash.icon || '📊'}</Text>
              <Text style={[styles.dashText, isActive && styles.dashTextActive]}>{dash.title}</Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.newDashBtn} onPress={() => setCreateDashOpen(true)} activeOpacity={0.7}>
          <Text style={styles.newDashText}>+ New</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Top Time-Window Selector */}
      <TimeWindowSelector selected={timeWindow} onChange={setTimeWindow} />

      {/* Dashboard Header Bar */}
      <View style={styles.dashHeaderBar}>
        <View style={styles.dashTitleWrap}>
          <Text style={styles.dashMainTitle}>{activeDashboard.icon} {activeDashboard.title}</Text>
          <Text style={styles.dashCount}>{dashboardCharts.length} Charts</Text>
        </View>

        <TouchableOpacity style={styles.addChartBtn} onPress={() => setAddChartOpen(true)} activeOpacity={0.7}>
          <Text style={styles.addChartText}>+ Add Chart</Text>
        </TouchableOpacity>
      </View>

      {/* Pinned Dashboard Charts */}
      {dashboardCharts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>0 Charts in this Dashboard</Text>
          <Text style={styles.emptySubtext}>Select any recurring habit to visualize volume bars, streak dials, heatmaps, or progression.</Text>
          <TouchableOpacity style={styles.addFirstBtn} onPress={() => setAddChartOpen(true)} activeOpacity={0.8}>
            <Text style={styles.addFirstText}>+ Add Your First Chart</Text>
          </TouchableOpacity>
        </View>
      ) : (
        dashboardCharts.map((chart, idx) => {
          const task = tasks.find((t) => t.id === chart.taskId);
          if (!task) return null;
          return (
            <ChartBlock
              key={chart.id}
              chart={chart}
              task={task}
              events={windowEvents.filter((e) => e.taskId === task.id)}
              timeWindow={timeWindow}
              isFirst={idx === 0}
              isLast={idx === dashboardCharts.length - 1}
              onMoveUp={(id) => onMoveChart(id, 'up')}
              onMoveDown={(id) => onMoveChart(id, 'down')}
              onRemove={onRemoveChart}
            />
          );
        })
      )}

      <CreateDashboardModal
        visible={createDashOpen}
        onClose={() => setCreateDashOpen(false)}
        onSave={(newDash) => {
          onCreateDashboard(newDash);
          setActiveDashId(newDash.id);
        }}
      />

      <AddChartModal
        visible={addChartOpen}
        dashboardTitle={activeDashboard.title}
        tasks={tasks}
        onClose={() => setAddChartOpen(false)}
        onAddChart={(taskId, style) => onPinChart(taskId, style, activeDashId)}
      />
    </View>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: { paddingBottom: spacing.xxl },
    dashRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs },
    dashPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
    },
    dashPillActive: { backgroundColor: colors.bgActive, borderColor: colors.borderStrong },
    dashIcon: { fontSize: 14 },
    dashText: { color: colors.textSecondary, fontSize: typography.caption, fontWeight: '500' },
    dashTextActive: { color: colors.textPrimary, fontWeight: '700' },
    newDashBtn: {
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      justifyContent: 'center',
    },
    newDashText: { color: colors.primary, fontSize: typography.caption, fontWeight: '600' },
    dashHeaderBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      marginBottom: spacing.xs,
    },
    dashTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dashMainTitle: { color: colors.textPrimary, fontSize: typography.subheading, fontWeight: '700' },
    dashCount: { color: colors.textTertiary, fontSize: typography.caption },
    addChartBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radiuses.sm,
    },
    addChartText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
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
    emptyTitle: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '600' },
    emptySubtext: { color: colors.textTertiary, fontSize: typography.caption, textAlign: 'center', lineHeight: 18 },
    addFirstBtn: {
      backgroundColor: colors.primary,
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radiuses.md,
    },
    addFirstText: { color: '#FFFFFF', fontSize: typography.body, fontWeight: '700' },
  });
