/**
 * Laya (లయ) Mobile — Dedicated Deterministic Chart Block (ADR-0004, ADR-0012)
 * Supports Volume Bars, Continuity Ring, Activity Heatmap & Progression Line.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';
import { PinnedChart, Task, CompletionEvent, TimeWindow } from '../core/types';
import { VolumeBarsVisualizer } from './charts/VolumeBarsVisualizer';
import { ContinuityRingVisualizer } from './charts/ContinuityRingVisualizer';
import { ActivityHeatmapVisualizer } from './charts/ActivityHeatmapVisualizer';
import { ProgressionLineVisualizer } from './charts/ProgressionLineVisualizer';

interface Props {
  chart: PinnedChart;
  task: Task;
  events: CompletionEvent[];
  timeWindow?: TimeWindow;
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
  timeWindow = '7d',
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const getDaysCount = (tw: TimeWindow): number => {
    switch (tw) {
      case '7d': return 7;
      case '30d':
      case 'month':
      case 'last_month': return 30;
      case 'year':
      case '1y': return 60;
      default: return 7;
    }
  };

  const daysCount = getDaysCount(timeWindow);
  const visualizerStyle = chart.chartType;

  const getSubtitle = () => {
    switch (visualizerStyle) {
      case 'volume_bars': return 'Volume Bars';
      case 'continuity_ring': return 'Continuity Ring';
      case 'progression_line':
      case 'progress_trend': return 'Progression Line';
      default: return 'Activity Heatmap';
    }
  };

  return (
    <View style={styles.block}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.subtitle}>{getSubtitle()}</Text>
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

      {/* Polymorphic Visualizer Display */}
      {visualizerStyle === 'volume_bars' && (
        <VolumeBarsVisualizer task={task} events={events} daysCount={Math.min(14, daysCount)} />
      )}
      {visualizerStyle === 'continuity_ring' && (
        <ContinuityRingVisualizer task={task} events={events} daysCount={daysCount} />
      )}
      {(visualizerStyle === 'progression_line' || visualizerStyle === 'progress_trend') && (
        <ProgressionLineVisualizer task={task} events={events} daysCount={Math.min(30, daysCount)} />
      )}
      {(visualizerStyle === 'activity_heatmap' || visualizerStyle === 'rhythm_matrix') && (
        <ActivityHeatmapVisualizer task={task} events={events} daysCount={Math.min(28, daysCount)} />
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
      letterSpacing: 0.5,
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
  });
