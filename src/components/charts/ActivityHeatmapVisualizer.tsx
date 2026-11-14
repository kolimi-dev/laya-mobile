/**
 * Laya (లయ) Mobile — Activity Heatmap Visualizer (ADR-0004, ADR-0012)
 * Consistency grid representing daily habit statuses across selected timeframe.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses } from '../../theme/tokens';
import { Task, CompletionEvent } from '../../core/types';
import { getOperationalDate } from '../../core/recurrence';
import { evaluateTaskProgress } from '../../core/math';

interface Props {
  task: Task;
  events: CompletionEvent[];
  daysCount?: number;
}

export const ActivityHeatmapVisualizer: React.FC<Props> = ({ task, events, daysCount = 28 }) => {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors);
  const isDark = theme === 'dark';

  const cells = useMemo(() => {
    const result: { dateStr: string; status: 'completed' | 'ignored' | 'in_progress' | 'none' }[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const op = getOperationalDate(d);
      const dayEvents = events.filter(
        (e) => (e.taskId === task.id || !e.taskId) && getOperationalDate(new Date(e.occurredAt)).dateString === op.dateString
      );
      const evaluated = evaluateTaskProgress(task, dayEvents);

      if (evaluated.isCompleted) {
        result.push({ dateStr: op.dateString, status: 'completed' });
      } else if (evaluated.isIgnored) {
        result.push({ dateStr: op.dateString, status: 'ignored' });
      } else if (evaluated.percentage > 0 || (evaluated.quantifiedValue && evaluated.quantifiedValue > 0)) {
        result.push({ dateStr: op.dateString, status: 'in_progress' });
      } else {
        result.push({ dateStr: op.dateString, status: 'none' });
      }
    }
    return result;
  }, [events, task, daysCount]);

  const getColor = (status: 'completed' | 'ignored' | 'in_progress' | 'none') => {
    switch (status) {
      case 'completed':
        return colors.done;
      case 'ignored':
        return colors.ignored;
      case 'in_progress':
        return isDark ? '#195430' : '#86EFAC';
      default:
        return colors.bgInput;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {cells.map((c) => (
          <View key={c.dateStr} style={[styles.square, { backgroundColor: getColor(c.status) }]} />
        ))}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.done }]} />
          <Text style={styles.legendText}>Done</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.ignored }]} />
          <Text style={styles.legendText}>Rest</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.bgInput }]} />
          <Text style={styles.legendText}>None</Text>
        </View>
      </View>
    </View>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: { gap: spacing.sm, paddingVertical: spacing.xs },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    square: { width: 18, height: 18, borderRadius: radiuses.sm },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: 2 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendBox: { width: 10, height: 10, borderRadius: 2 },
    legendText: { color: colors.textTertiary, fontSize: 10 },
  });
