/**
 * Laya (లయ) Mobile — Volume Bars Visualizer (ADR-0004, ADR-0012)
 * Clean vertical bars with dashed benchmark and subtle neutral baseline ticks.
 * Fixes the hollow "U" bucket Android rendering bug.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../../theme/tokens';
import { Task, CompletionEvent } from '../../core/types';
import { getOperationalDate } from '../../core/recurrence';
import { evaluateTaskProgress } from '../../core/math';

interface Props {
  task: Task;
  events: CompletionEvent[];
  daysCount?: number;
}

export const VolumeBarsVisualizer: React.FC<Props> = ({ task, events, daysCount = 7 }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const isFlexible = task.flavor === 'flexible_baseline';

  const dayData = useMemo(() => {
    const result: { dateStr: string; label: string; val: number | string; pct: number; isDone: boolean }[] = [];
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const op = getOperationalDate(d);
      const dayEvents = events.filter(
        (e) => (e.taskId === task.id || !e.taskId) && getOperationalDate(new Date(e.occurredAt)).dateString === op.dateString
      );
      const evaluated = evaluateTaskProgress(task, dayEvents);
      const pct = evaluated.isIgnored ? 0 : evaluated.percentage;
      const isDone = evaluated.isCompleted || pct >= 100;
      const val = evaluated.isIgnored ? 0 : isFlexible ? (pct > 0 ? `${pct}%` : '') : (evaluated.quantifiedValue || (isDone ? (task.targetAmount || 1) : 0));
      const label = daysCount <= 7 ? dayNames[op.dayOfWeek] : `${op.dayOfMonth}`;
      result.push({ dateStr: op.dateString, label, val, pct, isDone });
    }
    return result;
  }, [events, task, daysCount, isFlexible]);

  const targetLabel = isFlexible
    ? '100% Baseline'
    : `${task.targetAmount || 1} ${task.unit || ''}`.trim();

  return (
    <View style={styles.container}>
      {/* Benchmark Target Indicator */}
      <View style={styles.benchmarkRow}>
        <View style={styles.benchmarkLine} />
        <Text style={styles.benchmarkText}>Target: {targetLabel}</Text>
      </View>

      {/* 7-Day Volume Bars */}
      <View style={styles.barsRow}>
        {dayData.map((d) => (
          <View key={d.dateStr} style={styles.barCol}>
            <Text style={styles.valLabel}>{d.pct > 0 ? (isFlexible ? d.val : d.val) : ''}</Text>
            <View style={styles.track}>
              {d.pct > 0 || (typeof d.val === 'number' && d.val > 0) ? (
                <View
                  style={[
                    styles.fill,
                    { height: `${Math.min(100, Math.max(10, d.pct))}%` },
                    d.isDone ? styles.fillDone : styles.fillProgress,
                  ]}
                />
              ) : (
                <View style={styles.emptyTick} />
              )}
            </View>
            <Text style={[styles.dayLabel, d.isDone && styles.dayLabelDone]}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: { paddingTop: spacing.xs, gap: spacing.xs },
    benchmarkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing.xs,
      marginBottom: 2,
    },
    benchmarkLine: {
      flex: 1,
      height: 1,
      borderStyle: 'dashed',
      borderWidth: 0.5,
      borderColor: colors.borderSubtle,
    },
    benchmarkText: { color: colors.textTertiary, fontSize: 10, fontWeight: '500' },
    barsRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 95,
      paddingHorizontal: spacing.xs,
    },
    barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 3 },
    valLabel: { color: colors.textSecondary, fontSize: 9, fontWeight: '600', height: 12 },
    track: {
      width: 12,
      height: 60,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    fill: {
      width: '100%',
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
      borderBottomLeftRadius: 1,
      borderBottomRightRadius: 1,
    },
    fillDone: { backgroundColor: colors.done },
    fillProgress: { backgroundColor: colors.primary },
    emptyTick: {
      width: 8,
      height: 2,
      backgroundColor: colors.borderSubtle,
      borderRadius: radiuses.full,
    },
    dayLabel: { color: colors.textTertiary, fontSize: 10, marginTop: 2 },
    dayLabelDone: { color: colors.textPrimary, fontWeight: '600' },
  });
