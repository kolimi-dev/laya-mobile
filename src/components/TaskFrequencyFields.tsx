/**
 * Laya (లయ) Mobile — Task Frequency & Reminder Form Fields (ADR-0005, ADR-0012)
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { FrequencyType } from '../core/types';
import { DayPicker } from './DayPicker';
import { getStyles } from './CreateTaskModal.styles';

const FREQUENCIES: { id: FrequencyType; label: string }[] = [
  { id: 'daily', label: 'Every Day' },
  { id: 'days_of_week', label: 'Custom Days' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'anytime', label: 'Flexible' },
];

interface Props {
  isOneTime: boolean;
  frequency: FrequencyType;
  onFrequencyChange: (f: FrequencyType) => void;
  daysOfWeek: number[];
  onDaysChange: (d: number[]) => void;
  dayOfMonth: string;
  onDayOfMonthChange: (d: string) => void;
  reminderTime: string;
  onReminderTimeChange: (t: string) => void;
}

export const TaskFrequencyFields: React.FC<Props> = ({
  isOneTime,
  frequency,
  onFrequencyChange,
  daysOfWeek,
  onDaysChange,
  dayOfMonth,
  onDayOfMonthChange,
  reminderTime,
  onReminderTimeChange,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <>
      {!isOneTime && (
        <View style={styles.field}>
          <Text style={styles.label}>Repeat Frequency</Text>
          <View style={styles.pillRow}>
            {FREQUENCIES.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.selectPill, frequency === f.id && styles.selectPillActive]}
                onPress={() => onFrequencyChange(f.id)}
              >
                <Text style={[styles.selectText, frequency === f.id && styles.selectTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {!isOneTime && frequency === 'days_of_week' && (
        <View style={styles.field}>
          <DayPicker selectedDays={daysOfWeek} onChange={onDaysChange} />
        </View>
      )}

      {!isOneTime && frequency === 'monthly' && (
        <View style={styles.field}>
          <Text style={styles.label}>Day of Month (1 - 31)</Text>
          <TextInput
            style={styles.input}
            value={dayOfMonth}
            onChangeText={onDayOfMonthChange}
            keyboardType="numeric"
            placeholder="e.g. 6 (Credit Card, Donation)"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>⏰ Scheduled Reminder Time (Optional)</Text>
        <TextInput
          style={styles.input}
          value={reminderTime}
          onChangeText={onReminderTimeChange}
          placeholder="08:00 (24h format HH:mm)"
          placeholderTextColor={colors.textTertiary}
        />
        <Text style={styles.helperText}>Local offline alarm sounds at this time.</Text>
      </View>
    </>
  );
};
