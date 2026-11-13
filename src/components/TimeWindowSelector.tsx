/**
 * Laya (లయ) Mobile — Time-Window Selector (ADR-0004, ADR-0012, Phase C)
 * Horizontal switcher for synchronous dashboard-wide time range filtering
 */

import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';
import { TimeWindow } from '../core/types';

export const TIME_WINDOWS: { id: TimeWindow; label: string }[] = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'year', label: 'This Year' },
  { id: '1y', label: '1 Year' },
];

interface Props {
  selected: TimeWindow;
  onChange: (tw: TimeWindow) => void;
}

export const TimeWindowSelector: React.FC<Props> = ({ selected, onChange }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {TIME_WINDOWS.map((tw) => {
        const isActive = selected === tw.id;
        return (
          <TouchableOpacity
            key={tw.id}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onChange(tw.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {tw.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      marginBottom: spacing.xs,
    },
    pill: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: 5,
    },
    pillActive: {
      backgroundColor: colors.bgActive,
      borderColor: colors.borderStrong,
    },
    pillText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '500',
    },
    pillTextActive: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
  });
