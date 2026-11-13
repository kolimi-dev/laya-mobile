/**
 * Laya (లయ) Mobile — Continuity Ring Visualizer (ADR-0004, ADR-0012)
 * Radial streak dial and consistency statistics.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../../theme/tokens';
import { Task, CompletionEvent } from '../../core/types';
import { getOperationalDate } from '../../core/recurrence';

interface Props {
  task: Task;
  events: CompletionEvent[];
  daysCount?: number;
}

export const ContinuityRingVisualizer: React.FC<Props> = ({ task, events, daysCount = 30 }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const stats = useMemo(() => {
    const now = new Date();
    let completedDays = 0;
    let ignoredDays = 0;
    let streak = 0;
    let streakBroken = false;

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const op = getOperationalDate(d);
      const ev = events.find((e) => getOperationalDate(new Date(e.occurredAt)).dateString === op.dateString);

      if (ev?.status === 'completed' || (ev?.quantifiedValue && ev.quantifiedValue >= (task.targetAmount || 1))) {
        completedDays++;
        if (!streakBroken) streak++;
      } else if (ev?.status === 'ignored') {
        ignoredDays++;
        // Guilt-free: rest day preserves streak!
      } else {
        if (i > 0) streakBroken = true;
      }
    }

    const denominator = Math.max(1, daysCount - ignoredDays);
    const score = Math.min(100, Math.round((completedDays / denominator) * 100));
    return { score, completedDays, ignoredDays, streak };
  }, [events, task, daysCount]);

  const size = 96;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * stats.score) / 100;

  return (
    <View style={styles.container}>
      <View style={styles.ringWrap}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.bgInput}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={stats.score >= 80 ? colors.done : colors.primary}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </G>
        </Svg>
        <View style={styles.centerTextWrap}>
          <Text style={styles.centerScore}>{stats.score}%</Text>
          <Text style={styles.centerLabel}>Rhythm</Text>
        </View>
      </View>

      <View style={styles.statsCol}>
        <View style={styles.statItem}>
          <Text style={styles.statVal}>🔥 {stats.streak} Days</Text>
          <Text style={styles.statDesc}>Current Active Cadence</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statVal}>✓ {stats.completedDays} / {daysCount} Days</Text>
          <Text style={styles.statDesc}>Completed in Period</Text>
        </View>
        {stats.ignoredDays > 0 && (
          <View style={styles.statItem}>
            <Text style={styles.statVal}>☕ {stats.ignoredDays} Rest Days</Text>
            <Text style={styles.statDesc}>Guilt-Free Exemptions</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xs },
    ringWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
    centerTextWrap: { position: 'absolute', alignItems: 'center' },
    centerScore: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
    centerLabel: { color: colors.textTertiary, fontSize: 9, textTransform: 'uppercase' },
    statsCol: { flex: 1, gap: 8 },
    statItem: { gap: 1 },
    statVal: { color: colors.textPrimary, fontSize: typography.body, fontWeight: '600' },
    statDesc: { color: colors.textTertiary, fontSize: 10 },
  });
