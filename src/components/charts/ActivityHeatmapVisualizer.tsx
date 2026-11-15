/**
 * Laya (లయ) Mobile — Activity Heatmap Visualizer (ADR-0004, ADR-0012)
 * Consistency grid representing daily habit statuses across selected timeframe.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

const DOW_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const ActivityHeatmapVisualizer: React.FC<Props> = ({ task, events, daysCount = 28 }) => {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors);
  const isDark = theme === 'dark';
  const [selectedCell, setSelectedCell] = useState<{ dateStr: string; detail: string } | null>(null);

  const cells = useMemo(() => {
    const result: {
      dateStr: string;
      label: string;
      detail: string;
      pct: number;
      isDone: boolean;
      isRest: boolean;
    }[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const op = getOperationalDate(d);
      const dayEvents = events.filter(
        (e) => (e.taskId === task.id || !e.taskId) && getOperationalDate(new Date(e.occurredAt)).dateString === op.dateString
      );
      const evaluated = evaluateTaskProgress(task, dayEvents);
      const isRest = evaluated.isIgnored;
      const pct = isRest ? 0 : evaluated.percentage;
      const isDone = !isRest && (evaluated.isCompleted || pct >= 100);

      const latestNote = dayEvents.filter((e) => e.notes).pop()?.notes;
      let detail = 'No activity';
      if (isRest) {
        detail = `☕ Rest Day (${latestNote || 'Guilt-Free'})`;
      } else if (isDone) {
        detail = `✓ 100% Completed${evaluated.quantifiedValue ? ` (${evaluated.quantifiedValue} ${task.unit || ''})` : ''}`;
      } else if (pct > 0) {
        detail = `⚡ ${pct}% in progress${evaluated.quantifiedValue ? ` (${evaluated.quantifiedValue} ${task.unit || ''})` : ''}`;
      }

      result.push({
        dateStr: op.dateString,
        label: `${op.month + 1}/${op.dayOfMonth}`,
        detail,
        pct,
        isDone,
        isRest,
      });
    }
    return result;
  }, [events, task, daysCount]);

  const getColor = (c: { isDone: boolean; isRest: boolean; pct: number }) => {
    if (c.isRest) return colors.ignored;
    if (c.isDone || c.pct >= 100) return colors.done;
    if (c.pct >= 50) return isDark ? '#195430' : '#86EFAC';
    if (c.pct > 0) return isDark ? '#143823' : '#BBF7D0';
    return colors.bgInput;
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {cells.map((c) => (
          <TouchableOpacity
            key={c.dateStr}
            style={[styles.square, { backgroundColor: getColor(c) }, selectedCell?.dateStr === c.dateStr && styles.squareSelected]}
            onPress={() => setSelectedCell(selectedCell?.dateStr === c.dateStr ? null : { dateStr: c.dateStr, detail: `${c.dateStr}: ${c.detail}` })}
            activeOpacity={0.7}
          />
        ))}
      </View>

      {selectedCell && (
        <View style={styles.tooltipPill}>
          <Text style={styles.tooltipText}>{selectedCell.detail}</Text>
        </View>
      )}

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.done }]} />
          <Text style={styles.legendText}>Done</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: isDark ? '#195430' : '#86EFAC' }]} />
          <Text style={styles.legendText}>Progress</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.ignored }]} />
          <Text style={styles.legendText}>Rest</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.bgInput }]} />
          <Text style={styles.legendText}>Unlogged</Text>
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
    squareSelected: { borderWidth: 1.5, borderColor: colors.primary },
    tooltipPill: {
      backgroundColor: colors.bgInput,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radiuses.sm,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      alignSelf: 'flex-start',
    },
    tooltipText: { color: colors.textPrimary, fontSize: 10, fontWeight: '500' },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: 2 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendBox: { width: 10, height: 10, borderRadius: 2 },
    legendText: { color: colors.textTertiary, fontSize: 10 },
  });
