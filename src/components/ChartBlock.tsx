/**
 * Laya (లయ) Mobile — Dedicated Chart Block Component
 * Per-Task Visualizations (Volume Bars & Rhythm Matrix) with Reordering (ADR-0004, ADR-0007)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';
import { PinnedChart, Task, CompletionEvent } from '../core/types';

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
  events: _events,
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

  const getMatrixBg = (intensity: number) => {
    if (intensity === 0) return colors.bgInput;
    if (intensity === 1) return isDark ? '#133522' : '#DCFCE7';
    if (intensity === 2) return isDark ? '#195430' : '#86EFAC';
    return colors.done;
  };

  return (
    <View style={styles.block}>
      {/* Header & Reorder Controls */}
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.subtitle}>
            {chart.chartType === 'volume_bars' ? 'Daily Volume' : 'Rhythm Matrix'}
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

      {/* Visual Representation */}
      {chart.chartType === 'volume_bars' ? (
        <View style={styles.barsContainer}>
          {days.map((day, idx) => {
            const heightPercent = idx === 6 ? 90 : Math.min(100, (idx + 1) * 15);
            const isDone = heightPercent >= 75;
            return (
              <View key={day} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${heightPercent}%` },
                      isDone ? styles.barDone : styles.barProgress,
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{day}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.matrixContainer}>
          {Array.from({ length: 14 }).map((_, i) => (
            <View
              key={i}
              style={[styles.matrixSquare, { backgroundColor: getMatrixBg(i % 4) }]}
            />
          ))}
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
    ctrlText: {
      color: colors.textSecondary,
      fontSize: 10,
    },
    removeText: {
      color: colors.danger,
      fontSize: 12,
    },
    barsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 100,
      paddingTop: spacing.xs,
    },
    barCol: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    barTrack: {
      width: 14,
      height: 80,
      backgroundColor: colors.bgInput,
      borderRadius: radiuses.sm,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    barFill: {
      width: '100%',
      borderRadius: radiuses.sm,
    },
    barDone: {
      backgroundColor: colors.done,
    },
    barProgress: {
      backgroundColor: colors.progress,
    },
    barLabel: {
      color: colors.textTertiary,
      fontSize: 9,
    },
    matrixContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      paddingVertical: spacing.xs,
    },
    matrixSquare: {
      width: 20,
      height: 20,
      borderRadius: radiuses.sm,
    },
  });
