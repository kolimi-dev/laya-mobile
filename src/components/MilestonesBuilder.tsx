/**
 * Laya (లయ) Mobile — Milestones Builder List (ADR-0005, ADR-0012)
 * Disjunctive OR / Conjunctive AND Rules & Blank Initializer
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { MilestoneItem, MilestoneMode } from '../core/types';
import { generateUUID } from '../services/storage';
import { ColorPalette, darkColors, radiuses, spacing, typography } from '../theme/tokens';

interface Props {
  milestones: MilestoneItem[];
  onChange: (items: MilestoneItem[]) => void;
  milestoneMode: MilestoneMode;
  onModeChange: (mode: MilestoneMode) => void;
}

export const MilestonesBuilder: React.FC<Props> = ({
  milestones,
  onChange,
  milestoneMode,
  onModeChange,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleAdd = () => {
    onChange([
      ...milestones,
      { id: generateUUID('mls'), label: '', points: 1 },
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
      <View style={styles.headerRow}>
        <Text style={styles.label}>Milestone Checkpoints</Text>

        {/* Milestone Logic Mode: All (AND) vs Any (OR) */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, milestoneMode === 'all' && styles.modeBtnActive]}
            onPress={() => onModeChange('all')}
          >
            <Text style={[styles.modeText, milestoneMode === 'all' && styles.modeTextActive]}>
              All (AND)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, milestoneMode === 'any' && styles.modeBtnActive]}
            onPress={() => onModeChange('any')}
          >
            <Text style={[styles.modeText, milestoneMode === 'any' && styles.modeTextActive]}>
              Any (OR)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.hintText}>
        {milestoneMode === 'any'
          ? 'Alternative options: Completing ANY one fulfills the habit.'
          : 'Sequential steps: All non-exempt steps required.'}
      </Text>

      {milestones.length === 0 ? (
        <View style={styles.emptyPlaceholder}>
          <Text style={styles.emptyText}>
            No checkpoints yet. Tap below to add sub-steps or alternatives.
          </Text>
        </View>
      ) : (
        milestones.map((m, idx) => (
          <View key={m.id} style={styles.row}>
            <TextInput
              style={styles.input}
              value={m.label}
              onChangeText={(t) => handleUpdate(m.id, t)}
              placeholder={`Checkpoint ${idx + 1} (e.g. Walk 30m, 20 Squats)`}
              placeholderTextColor={colors.textTertiary}
            />
            <TouchableOpacity onPress={() => handleRemove(m.id)} style={styles.delBtn}>
              <Text style={styles.delText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
        <Text style={styles.addText}>+ Add Milestone Checkpoint</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    label: {
      color: colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '600',
    },
    modeToggle: {
      flexDirection: 'row',
      backgroundColor: colors.bgInput,
      borderRadius: radiuses.full,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 2,
    },
    modeBtn: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: radiuses.full,
    },
    modeBtnActive: {
      backgroundColor: colors.primary,
    },
    modeText: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: '500',
    },
    modeTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    hintText: {
      color: colors.textTertiary,
      fontSize: 11,
      marginBottom: spacing.xs,
    },
    emptyPlaceholder: {
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderStyle: 'dashed',
      borderRadius: radiuses.md,
      padding: spacing.sm,
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    emptyText: {
      color: colors.textTertiary,
      fontSize: 11,
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
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
      marginTop: 2,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.md,
      alignItems: 'center',
    },
    addText: {
      color: colors.primary,
      fontSize: typography.caption,
      fontWeight: '600',
    },
  });
