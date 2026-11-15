/**
 * Laya (లయ) Mobile — Weekly Dot Trail Component (ADR-0012, Phase 5)
 * Inline 7-Day Rhythm Dot Matrix evaluating latest status via evaluateTaskProgress
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Task, CompletionEvent } from '../core/types';
import { getOperationalDate } from '../core/recurrence';
import { evaluateTaskProgress } from '../core/math';
import { ColorPalette, darkColors, radiuses } from '../theme/tokens';

interface Props {
  taskId: string;
  task?: Task;
  events: CompletionEvent[];
}

interface DayDot {
  dayLabel: string;
  dateStr: string;
  status: 'completed' | 'ignored' | 'in_progress' | 'none';
  isToday: boolean;
}

export const WeeklyDotTrail: React.FC<Props> = ({ taskId, task, events }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const dots = useMemo<DayDot[]>(() => {
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const now = new Date();
    const result: DayDot[] = [];

    const taskEvents = events.filter((e) => e.taskId === taskId);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const op = getOperationalDate(d);

      const dayEvents = taskEvents.filter((e) => {
        const eOp = getOperationalDate(new Date(e.occurredAt));
        return eOp.dateString === op.dateString;
      });

      let status: 'completed' | 'ignored' | 'in_progress' | 'none' = 'none';
      if (dayEvents.length > 0) {
        if (task) {
          const evaluated = evaluateTaskProgress(task, dayEvents);
          if (evaluated.isCompleted || evaluated.percentage >= 100) {
            status = 'completed';
          } else if (evaluated.isIgnored) {
            status = 'ignored';
          } else if (evaluated.percentage > 0 || evaluated.currentStatus === 'in_progress') {
            status = 'in_progress';
          }
        } else {
          const latestEvt = [...dayEvents].sort(
            (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
          )[0];
          if (latestEvt.status === 'completed' || (latestEvt.percentage && latestEvt.percentage >= 100)) {
            status = 'completed';
          } else if (latestEvt.status === 'ignored') {
            status = 'ignored';
          } else {
            status = 'in_progress';
          }
        }
      }

      result.push({
        dayLabel: dayNames[op.dayOfWeek],
        dateStr: op.dateString,
        status,
        isToday: i === 0,
      });
    }

    return result;
  }, [taskId, task, events]);

  const getDotColor = (status: DayDot['status']) => {
    if (status === 'completed') return colors.done;
    if (status === 'ignored') return colors.ignored;
    if (status === 'in_progress') return colors.progress;
    return 'transparent';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.trailLabel}>7-Day Trail:</Text>
      <View style={styles.dotsRow}>
        {dots.map((d, idx) => {
          const dotColor = getDotColor(d.status);
          const hasColor = d.status !== 'none';

          return (
            <View key={`${d.dateStr}-${idx}`} style={styles.dotItem}>
              <View
                style={[
                  styles.dot,
                  hasColor
                    ? { backgroundColor: dotColor, borderColor: dotColor }
                    : styles.dotEmpty,
                  d.isToday && styles.dotToday,
                ]}
              />
              <Text style={[styles.dayLabel, d.isToday && styles.dayLabelToday]}>
                {d.dayLabel}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
    },
    trailLabel: {
      color: colors.textTertiary,
      fontSize: 10,
      fontWeight: '500',
    },
    dotsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dotItem: {
      alignItems: 'center',
      gap: 2,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: radiuses.full,
      borderWidth: 1,
    },
    dotEmpty: {
      borderColor: colors.borderSubtle,
      backgroundColor: 'transparent',
    },
    dotToday: {
      borderWidth: 1.5,
      borderColor: colors.textPrimary,
    },
    dayLabel: {
      color: colors.textTertiary,
      fontSize: 8,
      fontWeight: '600',
    },
    dayLabelToday: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
  });
