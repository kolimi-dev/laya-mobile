/**
 * Laya (లయ) Mobile — Task Frequency & Schedule Fields (ADR-0005, ADR-0012)
 * Clean separation: When do you do it? (Schedule & Frequency)
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { FrequencyType } from '../core/types';
import { DayPicker } from './DayPicker';
import { getStyles } from './CreateTaskModal.styles';

export const FREQUENCIES: { id: FrequencyType; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'days_of_week', label: 'Specific Days' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'custom', label: 'Interval' },
  { id: 'one_time', label: 'Specific Date' },
  { id: 'anytime', label: 'Anytime' },
];

interface Props {
  frequency: FrequencyType;
  onFrequencyChange: (f: FrequencyType) => void;
  daysOfWeek: number[];
  onDaysChange: (d: number[]) => void;
  dayOfMonth: string;
  onDayOfMonthChange: (d: string) => void;
  monthOfYear: string;
  onMonthOfYearChange: (m: string) => void;
  intervalDays: string;
  onIntervalDaysChange: (i: string) => void;
  targetDate: string;
  onTargetDateChange: (t: string) => void;
  reminderTime: string;
  onReminderTimeChange: (t: string) => void;
}

export const TaskFrequencyFields: React.FC<Props> = ({
  frequency,
  onFrequencyChange,
  daysOfWeek,
  onDaysChange,
  dayOfMonth,
  onDayOfMonthChange,
  monthOfYear,
  onMonthOfYearChange,
  intervalDays,
  onIntervalDaysChange,
  targetDate,
  onTargetDateChange,
  reminderTime,
  onReminderTimeChange,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>Schedule & Frequency</Text>
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

      {frequency === 'days_of_week' && (
        <View style={styles.field}>
          <Text style={styles.label}>Active Days of the Week</Text>
          <DayPicker selectedDays={daysOfWeek} onChange={onDaysChange} />
        </View>
      )}

      {frequency === 'monthly' && (
        <View style={styles.field}>
          <Text style={styles.label}>Day of Month (1 - 31)</Text>
          <TextInput
            style={styles.input}
            value={dayOfMonth}
            onChangeText={onDayOfMonthChange}
            keyboardType="numeric"
            placeholder="e.g. 5 (Credit Card, Rent, Savings)"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      )}

      {frequency === 'yearly' && (
        <View style={styles.rowField}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Month (1-12)</Text>
            <TextInput
              style={styles.input}
              value={monthOfYear}
              onChangeText={onMonthOfYearChange}
              keyboardType="numeric"
              placeholder="e.g. 11"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Day (1-31)</Text>
            <TextInput
              style={styles.input}
              value={dayOfMonth}
              onChangeText={onDayOfMonthChange}
              keyboardType="numeric"
              placeholder="e.g. 15"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>
      )}

      {frequency === 'custom' && (
        <View style={styles.field}>
          <Text style={styles.label}>Repeat Every N Days</Text>
          <TextInput
            style={styles.input}
            value={intervalDays}
            onChangeText={onIntervalDaysChange}
            keyboardType="numeric"
            placeholder="e.g. 2 (every other day) or 3"
            placeholderTextColor={colors.textTertiary}
          />
          <Text style={styles.helperText}>Calculated from the date this habit is created.</Text>
        </View>
      )}

      {frequency === 'one_time' && (
        <View style={styles.field}>
          <Text style={styles.label}>Target Due Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={targetDate}
            onChangeText={onTargetDateChange}
            placeholder="2026-11-15"
            placeholderTextColor={colors.textTertiary}
          />
          <Text style={styles.helperText}>Due on a single date. Automatically marks completed when done.</Text>
        </View>
      )}

      {frequency === 'anytime' && (
        <View style={styles.field}>
          <Text style={styles.helperText}>
            No deadline or calendar day. Stays active in your rhythm whenever life allows.
          </Text>
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
