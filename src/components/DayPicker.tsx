/**
 * Laya (లయ) Mobile — Interactive Day-of-Week Picker (ADR-0005, ADR-0012)
 * Custom Day Combinations (Mon/Wed/Fri vs Tue/Thu/Sat)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, radiuses, spacing, typography } from '../theme/tokens';

const DAYS = [
  { id: 1, label: 'M', name: 'Mon' },
  { id: 2, label: 'T', name: 'Tue' },
  { id: 3, label: 'W', name: 'Wed' },
  { id: 4, label: 'T', name: 'Thu' },
  { id: 5, label: 'F', name: 'Fri' },
  { id: 6, label: 'S', name: 'Sat' },
  { id: 0, label: 'S', name: 'Sun' },
];

interface Props {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

export const DayPicker: React.FC<Props> = ({ selectedDays, onChange }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const toggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      onChange(selectedDays.filter((d) => d !== dayId));
    } else {
      onChange([...selectedDays, dayId].sort());
    }
  };

  const setPreset = (presetDays: number[]) => {
    onChange(presetDays);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Scheduled Days</Text>

      {/* Day Pills [M] [T] [W] [T] [F] [S] [S] */}
      <View style={styles.daysRow}>
        {DAYS.map((d) => {
          const isSelected = selectedDays.includes(d.id);
          return (
            <TouchableOpacity
              key={`${d.id}-${d.name}`}
              style={[styles.dayPill, isSelected && styles.dayPillActive]}
              onPress={() => toggleDay(d.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Presets for Split Routines */}
      <View style={styles.presetsRow}>
        <TouchableOpacity style={styles.presetBtn} onPress={() => setPreset([1, 3, 5])}>
          <Text style={styles.presetText}>Mon/Wed/Fri</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.presetBtn} onPress={() => setPreset([2, 4, 6])}>
          <Text style={styles.presetText}>Tue/Thu/Sat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.presetBtn} onPress={() => setPreset([1, 2, 3, 4, 5])}>
          <Text style={styles.presetText}>Weekdays</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: {
      gap: spacing.xs,
    },
    label: {
      color: colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '600',
    },
    daysRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 6,
    },
    dayPill: {
      flex: 1,
      height: 38,
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayPillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    dayText: {
      color: colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '600',
    },
    dayTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    presetsRow: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginTop: 4,
    },
    presetBtn: {
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.full,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    presetText: {
      color: colors.textTertiary,
      fontSize: 10,
      fontWeight: '500',
    },
  });
