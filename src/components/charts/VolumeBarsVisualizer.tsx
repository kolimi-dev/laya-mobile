/**
 * Laya (లయ) Mobile — Volume Bars Visualizer (ADR-0004, ADR-0012)
 * Clean vertical bars with dashed benchmark and honest reality no-data rendering.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses } from '../../theme/tokens';
import { Task, CompletionEvent, TimeWindow } from '../../core/types';
import { getOperationalDate } from '../../core/recurrence';
import { evaluateTaskProgress } from '../../core/math';

interface Props {
  task: Task;
  events: CompletionEvent[];
  daysCount?: number;
  timeWindow?: TimeWindow;
}

export const VolumeBarsVisualizer: React.FC<Props> = ({ task, events, daysCount = 7, timeWindow }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const isFlexible = task.flavor === 'flexible_baseline';

  const dayData = useMemo(() => {
    const result: {
      dateStr: string;
      label: string;
      val: number | string;
      pct: number;
      isDone: boolean;
      isRest: boolean;
      isExplicitZero: boolean;
    }[] = [];
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const isLastMonth = timeWindow === 'last_month';
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const daysInTargetMonth = new Date(lastMonthYear, lastMonth + 1, 0).getDate();
    const anchorDate = isLastMonth ? new Date(lastMonthYear, lastMonth, daysInTargetMonth) : now;

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(anchorDate);
      d.setDate(anchorDate.getDate() - i);
      const op = getOperationalDate(d);
      const dayEvents = events.filter(
        (e) => (e.taskId === task.id || !e.taskId) && getOperationalDate(new Date(e.occurredAt)).dateString === op.dateString
      );
      const evaluated = evaluateTaskProgress(task, dayEvents);
      const hasRecord = dayEvents.length > 0;
      const isRest = evaluated.isIgnored;
      const pct = isRest ? 0 : evaluated.percentage;
      const isDone = !isRest && (evaluated.isCompleted || pct >= 100);
      const isExplicitZero = hasRecord && !isRest && pct === 0 && (evaluated.quantifiedValue === 0 || task.flavor === 'checklist');

      let val: string | number = '';
      if (isRest) {
        val = '☕';
      } else if (pct > 0 || (typeof evaluated.quantifiedValue === 'number' && evaluated.quantifiedValue > 0)) {
        val = isFlexible ? `${pct}%` : (evaluated.quantifiedValue || (isDone ? (task.targetAmount || 1) : pct));
      } else if (isExplicitZero) {
        val = '0';
      }

      const label = daysCount <= 7 ? dayNames[op.dayOfWeek] : `${op.dayOfMonth}`;
      result.push({ dateStr: op.dateString, label, val, pct, isDone, isRest, isExplicitZero });
    }
    const maxBonus = Math.max(200, ...result.map((r) => r.pct));
    return { days: result, maxBonus };
  }, [events, task, daysCount, isFlexible, timeWindow]);

  const targetLabel = isFlexible
    ? '100% Baseline'
    : `${task.targetAmount || 1} ${task.unit || ''}`.trim();

  const getBarHeightPct = (pct: number, maxBonus: number): number => {
    if (pct <= 0) return 0;
    if (pct <= 100) {
      return Math.max(8, Math.round((pct / 100) * 60));
    }
    // Surge > 100%: occupies 60% to 100% of track height
    const bonusSurge = Math.min(40, Math.round(((pct - 100) / (maxBonus - 100)) * 40));
    return 60 + bonusSurge;
  };

  return (
    <View style={styles.container}>
      <View style={styles.benchmarkRow}>
        <Text style={styles.benchmarkText}>Target Baseline: {targetLabel}</Text>
      </View>

      <View style={styles.chartArea}>
        {/* Horizontal Benchmark Target Line at 60% track height */}
        <View style={styles.targetDashedLine} pointerEvents="none" />

        <View style={styles.barsRow}>
          {dayData.days.map((d) => {
            const barHeightPct = getBarHeightPct(d.pct, dayData.maxBonus);
            const isSurge = d.pct > 100;

            return (
              <View key={d.dateStr} style={styles.barCol}>
                <Text style={[styles.valLabel, isSurge && styles.valLabelSurge]}>
                  {d.val ? `${d.val}` : ''}
                </Text>
                <View style={styles.track}>
                  {d.isRest ? (
                    <View style={styles.restMark} />
                  ) : d.pct > 0 || (typeof d.val === 'number' && d.val > 0) ? (
                    <View
                      style={[
                        styles.fill,
                        { height: `${barHeightPct}%` },
                        d.isDone ? (isSurge ? styles.fillSurge : styles.fillDone) : styles.fillProgress,
                      ]}
                    />
                  ) : d.isExplicitZero ? (
                    <View style={styles.zeroTick} />
                  ) : (
                    <View style={styles.emptyTick} />
                  )}
                </View>
                <Text style={[styles.dayLabel, d.isDone && styles.dayLabelDone]}>{d.label}</Text>
              </View>
            );
          })}
        </View>
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
      marginBottom: 2,
    },
    benchmarkText: { color: colors.textTertiary, fontSize: 10, fontWeight: '500' },
    chartArea: {
      position: 'relative',
      height: 102,
      justifyContent: 'flex-end',
    },
    targetDashedLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 53, // Exactly aligns with 60% height of 70px track + 18px label spacing
      height: 1,
      borderStyle: 'dashed',
      borderWidth: 0.5,
      borderColor: colors.borderActive,
      zIndex: 1,
    },
    barsRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: '100%',
      paddingHorizontal: spacing.xs,
    },
    barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 3 },
    valLabel: { color: colors.textSecondary, fontSize: 9, fontWeight: '600', height: 12 },
    valLabelSurge: { color: colors.warning, fontWeight: '700' },
    track: {
      width: 12,
      height: 68,
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
    fillSurge: {
      backgroundColor: '#10B981',
      borderTopColor: colors.warning,
      borderTopWidth: 2,
    },
    fillProgress: { backgroundColor: colors.primary },
    restMark: {
      width: 10,
      height: 12,
      backgroundColor: colors.ignored,
      borderRadius: radiuses.sm,
    },
    zeroTick: {
      width: 10,
      height: 3,
      backgroundColor: colors.textTertiary,
      borderRadius: 1,
    },
    emptyTick: {
      width: 8,
      height: 2,
      backgroundColor: colors.borderSubtle,
      borderRadius: radiuses.full,
    },
    dayLabel: { color: colors.textTertiary, fontSize: 10, marginTop: 2 },
    dayLabelDone: { color: colors.textPrimary, fontWeight: '600' },
  });
