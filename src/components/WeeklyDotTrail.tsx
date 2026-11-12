/**
 * Laya (లయ) Mobile — Weekly Dot Trail Component (ADR-0012, Phase 5)
 * Inline 7-Day Rhythm Dot Matrix at a Glance
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { CompletionEvent } from '../core/types';
import { getOperationalDate } from '../core/recurrence';
import { ColorPalette, darkColors, radiuses, typography } from '../theme/tokens';

interface Props {
  taskId: string;
  events: CompletionEvent[];
}

interface DayDot {
  dayLabel: string;
  dateStr: string;
  status: 'completed' | 'ignored' | 'in_progress' | 'none';
  isToday: boolean;
}

export const WeeklyDotTrail: React.FC<Props> = ({ taskId, events }) => {
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

      // Find events matching this operational date
      const dayEvt = taskEvents.find((e) => {
        const eOp = getOperationalDate(new Date(e.occurredAt));
        return eOp.dateString === op.dateString;
      });

      let status: 'completed' | 'ignored' | 'in_progress' | 'none' = 'none';
      if (dayEvt) {
        if (dayEvt.status === 'completed' || (dayEvt.percentage && dayEvt.percentage >= 100)) {
          status = 'completed';
        } else if (dayEvt.status === 'ignored') {
          status = 'ignored';
        } else {
          status = 'in_progress';
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
  }, [taskId, events]);

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
