/**
 * Laya (లయ) Mobile — Baseline Criteria Builder (ADR-0016, V2.2)
 * Interactive builder for multi-criterion flexible baseline habits (e.g. 2 km OR 20 min OR 10k steps)
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { BaselineCriterion } from '../core/types';
import { generateUUID } from '../services/storage';
import { getStyles } from './BaselineCriteriaBuilder.styles';

interface Props {
  criteria: BaselineCriterion[];
  onChange: (criteria: BaselineCriterion[]) => void;
}

export const BaselineCriteriaBuilder: React.FC<Props> = ({ criteria, onChange }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleAddCriterion = () => {
    const newCrit: BaselineCriterion = {
      id: generateUUID('crit'),
      label: criteria.length === 0 ? 'Distance' : criteria.length === 1 ? 'Duration' : 'Steps',
      target: criteria.length === 0 ? 2 : criteria.length === 1 ? 20 : 10000,
      unit: criteria.length === 0 ? 'km' : criteria.length === 1 ? 'min' : 'steps',
      stepAmount: criteria.length === 0 ? 0.5 : criteria.length === 1 ? 5 : 500,
    };
    onChange([...criteria, newCrit]);
  };

  const handleUpdate = (idx: number, updates: Partial<BaselineCriterion>) => {
    const updated = criteria.map((c, i) => (i === idx ? { ...c, ...updates } : c));
    onChange(updated);
  };

  const handleRemove = (idx: number) => {
    if (criteria.length <= 1) return;
    onChange(criteria.filter((_, i) => i !== idx));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Baseline Criteria (Disjunctive OR)</Text>
        <Text style={styles.subtitle}>Hitting ANY 1 reaches 100%</Text>
      </View>

      {criteria.map((crit, idx) => (
        <View key={crit.id} style={styles.criterionCard}>
          <View style={styles.criterionTop}>
            <Text style={styles.criterionNum}>
              Option {idx + 1} {idx > 0 ? '• OR' : '• Primary'}
            </Text>
            {criteria.length > 1 && (
              <TouchableOpacity
                onPress={() => handleRemove(idx)}
                style={styles.removeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.labelInput}
              value={crit.label}
              onChangeText={(text) => handleUpdate(idx, { label: text })}
              placeholder="e.g. Distance"
              placeholderTextColor={colors.textTertiary}
            />
            <TextInput
              style={styles.targetInput}
              value={String(crit.target)}
              onChangeText={(text) => handleUpdate(idx, { target: parseFloat(text) || 1 })}
              placeholder="Target"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.unitInput}
              value={crit.unit}
              onChangeText={(text) => handleUpdate(idx, { unit: text })}
              placeholder="Unit (km)"
              placeholderTextColor={colors.textTertiary}
            />
            <TextInput
              style={styles.stepInput}
              value={String(crit.stepAmount || 1)}
              onChangeText={(text) => handleUpdate(idx, { stepAmount: parseFloat(text) || 1 })}
              placeholder="±Step"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
            />
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addBtn} onPress={handleAddCriterion} activeOpacity={0.7}>
        <Text style={styles.addBtnText}>+ Add Alternative Criterion (OR)</Text>
      </TouchableOpacity>
    </View>
  );
};
