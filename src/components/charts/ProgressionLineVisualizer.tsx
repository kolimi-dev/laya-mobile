/**
 * Laya (లయ) Mobile — Progression Line Visualizer (ADR-0004, ADR-0012)
 * Trend curve showing rep/volume/consistency growth over time.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, typography } from '../../theme/tokens';
import { Task, CompletionEvent } from '../../core/types';
import { getOperationalDate } from '../../core/recurrence';
import { evaluateTaskProgress } from '../../core/math';

interface Props {
  task: Task;
  events: CompletionEvent[];
  daysCount?: number;
}

export const ProgressionLineVisualizer: React.FC<Props> = ({ task, events, daysCount = 14 }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const { points, startVal, latestVal, maxVal } = useMemo(() => {
    const raw: number[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const op = getOperationalDate(d);
      const dayEvents = events.filter(
        (e) => (e.taskId === task.id || !e.taskId) && getOperationalDate(new Date(e.occurredAt)).dateString === op.dateString
      );
      const evaluated = evaluateTaskProgress(task, dayEvents);
      raw.push(evaluated.quantifiedValue || (evaluated.isCompleted ? (task.targetAmount || 1) : 0));
    }

    const max = Math.max(...raw, task.targetAmount || 1, 1);
    const start = raw.find((v) => v > 0) || 0;
    const latest = raw[raw.length - 1] || 0;

    const width = 280;
    const height = 65;
    const stepX = width / Math.max(1, raw.length - 1);

    const pts = raw.map((v, idx) => {
      const x = Math.round(idx * stepX);
      const y = Math.round(height - (v / max) * (height - 12) - 6);
      return { x, y, val: v };
    });

    return { points: pts, startVal: start, latestVal: latest, maxVal: max };
  }, [events, task, daysCount]);

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');
  const growth = startVal > 0 ? Math.round(((latestVal - startVal) / startVal) * 100) : 0;
  const unit = task.unit || '';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.statHeading}>Progression Trend</Text>
        <Text style={styles.growthText}>
          {growth >= 0 ? `+${growth}%` : `${growth}%`} growth
        </Text>
      </View>

      <View style={styles.svgWrap}>
        <Svg width="100%" height={70} viewBox="0 0 280 70">
          <Line x1="0" y1="65" x2="280" y2="65" stroke={colors.borderSubtle} strokeWidth="1" />
          <Polyline points={polylineStr} fill="none" stroke={colors.primary} strokeWidth="2.5" />
          {points.map((p, idx) => (
            <Circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={p.val > 0 ? 3.5 : 2}
              fill={p.val >= (task.targetAmount || 1) ? colors.done : colors.primary}
            />
          ))}
        </Svg>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerLabel}>Start: {startVal} {unit}</Text>
        <Text style={styles.footerLabel}>Current: {latestVal} {unit}</Text>
        <Text style={styles.footerLabel}>Peak: {maxVal} {unit}</Text>
      </View>
    </View>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: { gap: spacing.xs, paddingVertical: spacing.xs },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statHeading: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
    growthText: { color: colors.done, fontSize: 11, fontWeight: '700' },
    svgWrap: { width: '100%', height: 70, justifyContent: 'center' },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
    footerLabel: { color: colors.textTertiary, fontSize: 10 },
  });
