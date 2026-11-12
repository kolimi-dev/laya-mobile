/**
 * Laya (లయ) Mobile — Task Quantified Target & Step Jump Fields (ADR-0012)
 */

import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getStyles } from './CreateTaskModal.styles';

interface Props {
  targetAmount: string;
  onTargetChange: (t: string) => void;
  stepAmount: string;
  onStepChange: (s: string) => void;
  unit: string;
  onUnitChange: (u: string) => void;
}

export const TaskQuantifiedFields: React.FC<Props> = ({
  targetAmount,
  onTargetChange,
  stepAmount,
  onStepChange,
  unit,
  onUnitChange,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.rowField}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Target</Text>
        <TextInput
          style={styles.input}
          value={targetAmount}
          onChangeText={onTargetChange}
          keyboardType="decimal-pad"
          placeholder="4"
          placeholderTextColor={colors.textTertiary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Step Jump</Text>
        <TextInput
          style={styles.input}
          value={stepAmount}
          onChangeText={onStepChange}
          keyboardType="decimal-pad"
          placeholder="0.5"
          placeholderTextColor={colors.textTertiary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Unit</Text>
        <TextInput
          style={styles.input}
          value={unit}
          onChangeText={onUnitChange}
          placeholder="L, reps"
          placeholderTextColor={colors.textTertiary}
        />
      </View>
    </View>
  );
};
