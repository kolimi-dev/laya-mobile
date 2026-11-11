/**
 * Laya (లయ) Mobile — Milestones Builder List
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MilestoneItem } from '../core/types';
import { colors, radiuses, spacing, typography } from '../theme/tokens';

interface Props {
  milestones: MilestoneItem[];
  onChange: (items: MilestoneItem[]) => void;
}

export const MilestonesBuilder: React.FC<Props> = ({ milestones, onChange }) => {
  const handleAdd = () => {
    onChange([
      ...milestones,
      { id: Date.now().toString(), label: `Step ${milestones.length + 1}`, points: 1 },
    ]);
  };

  const handleRemove = (id: string) => {
    onChange(milestones.filter((m) => m.id !== id));
  };

  const handleUpdate = (id: string, label: string) => {
    onChange(milestones.map((m) => (m.id === id ? { ...m, label } : m)));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Milestone Checkpoints</Text>
      {milestones.map((m) => (
        <View key={m.id} style={styles.row}>
          <TextInput
            style={styles.input}
            value={m.label}
            onChangeText={(t) => handleUpdate(m.id, t)}
            placeholder="Checkpoint description"
            placeholderTextColor={colors.textTertiary}
          />
          <TouchableOpacity onPress={() => handleRemove(m.id)} style={styles.delBtn}>
            <Text style={styles.delText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
        <Text style={styles.addText}>+ Add Checkpoint</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgDark,
    color: colors.textPrimary,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radiuses.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
  },
  delBtn: {
    padding: spacing.sm,
  },
  delText: {
    color: colors.danger,
    fontSize: 14,
  },
  addBtn: {
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
  },
  addText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
});

