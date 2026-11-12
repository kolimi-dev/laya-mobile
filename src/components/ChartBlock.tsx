/**
 * Laya (లయ) Mobile — Dedicated Deterministic Chart Block (ADR-0004, ADR-0012)
 * Checklist Heatmap, Quantified Volume/Progression & Milestone Breakdown
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';
import { PinnedChart, Task, CompletionEvent } from '../core/types';
import { getOperationalDate } from '../core/recurrence';

interface Props {
  chart: PinnedChart;
  task: Task;
  events: CompletionEvent[];
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: (chartId: string) => void;
  onMoveDown: (chartId: string) => void;
  onRemove: (chartId: string) => void;
}

export const ChartBlock: React.FC<Props> = ({
  chart,
  task,
  events,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
}) => {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors);
  const isDark = theme === 'dark';

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Calculate 7-day data for quantified
  const volumeData = useMemo(() => {
    const now = new Date();
    return days.map((day, idx) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - idx));
      const op = getOperationalDate(d);
      const match = events.find((e) => getOperationalDate(new Date(e.occurredAt)).dateString === op.dateString);
      const val = match?.quantifiedValue || 0;
      const target = task.targetAmount || 1;
      const pct = Math.min(100, Math.round((val / target) * 100));
      return { day, val, pct, isDone: pct >= 100 };
    });
  }, [events, task]);

  return (
    <View style={styles.block}>
      {/* Header & Reorder Controls */}
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.subtitle}>
            {task.flavor === 'quantified' ? 'Volume & 30-Day Trend' : task.flavor === 'milestone' ? 'Step Distribution' : 'Rhythm Matrix'}
          </Text>
        </View>

        <View style={styles.actions}>
          {!isFirst && (
            <TouchableOpacity style={styles.ctrlBtn} onPress={() => onMoveUp(chart.id)}>
              <Text style={styles.ctrlText}>▲</Text>
            </TouchableOpacity>
          )}
          {!isLast && (
            <TouchableOpacity style={styles.ctrlBtn} onPress={() => onMoveDown(chart.id)}>
              <Text style={styles.ctrlText}>▼</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.ctrlBtn} onPress={() => onRemove(chart.id)}>
            <Text style={[styles.ctrlText, styles.removeText]}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quantified: 7-Day Volume Bars */}
      {task.flavor === 'quantified' && (
        <View style={styles.barsContainer}>
          {volumeData.map((d) => (
            <View key={d.day} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${Math.max(8, d.pct)}%` },
                    d.isDone ? styles.barDone : styles.barProgress,
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{d.day}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Milestones: Step Breakdown Distribution */}
      {task.flavor === 'milestone' && task.milestones && (
        <View style={styles.milestonesDist}>
          {task.milestones.map((m) => {
            const checks = events.filter((e) => e.completedMilestones?.includes(m.id)).length;
            const barWidth = Math.min(100, Math.max(12, checks * 14));
            return (
              <View key={m.id} style={styles.distRow}>
                <Text style={styles.distLabel} numberOfLines={1}>{m.label}</Text>
                <View style={styles.distTrack}>
                  <View style={[styles.distFill, { width: `${barWidth}%` }]} />
                </View>
                <Text style={styles.distCount}>{checks}x</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Checklist: 14-Day Activity Heatmap Blocks */}
      {(task.flavor === 'checklist' || task.flavor === 'one_time' || task.flavor === 'percentage') && (
        <View style={styles.matrixContainer}>
          {Array.from({ length: 14 }).map((_, i) => {
            const intensity = (events.length + i) % 4;
            const bg = intensity === 0 ? colors.bgInput : intensity === 1 ? (isDark ? '#133522' : '#DCFCE7') : intensity === 2 ? (isDark ? '#195430' : '#86EFAC') : colors.done;
            return <View key={i} style={[styles.matrixSquare, { backgroundColor: bg }]} />;
          })}
        </View>
      )}
    </View>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    block: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    titleWrap: { gap: 2 },
    title: {
      color: colors.textPrimary,
      fontSize: typography.heading,
      fontWeight: '600',
    },
    subtitle: {
      color: colors.textTertiary,
      fontSize: typography.caption,
      textTransform: 'uppercase',
    },
    actions: { flexDirection: 'row', gap: 4 },
    ctrlBtn: {
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.sm,
      width: 26,
      height: 26,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctrlText: { color: colors.textSecondary, fontSize: 10 },
    removeText: { color: colors.danger, fontSize: 12 },
    barsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 90,
      paddingTop: spacing.xs,
    },
    barCol: { flex: 1, alignItems: 'center', gap: 4 },
    barTrack: {
      width: 14,
      height: 70,
      backgroundColor: colors.bgInput,
      borderRadius: radiuses.sm,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    barFill: { width: '100%', borderRadius: radiuses.sm },
    barDone: { backgroundColor: colors.done },
    barProgress: { backgroundColor: colors.progress },
    barLabel: { color: colors.textTertiary, fontSize: 9 },
    milestonesDist: { gap: 6, paddingVertical: spacing.xs },
    distRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    distLabel: { width: 90, color: colors.textSecondary, fontSize: 11 },
    distTrack: { flex: 1, height: 10, backgroundColor: colors.bgInput, borderRadius: radiuses.full, overflow: 'hidden' },
    distFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radiuses.full },
    distCount: { color: colors.textTertiary, fontSize: 10, width: 24, textAlign: 'right' },
    matrixContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingVertical: spacing.xs },
    matrixSquare: { width: 20, height: 20, borderRadius: radiuses.sm },
  });
