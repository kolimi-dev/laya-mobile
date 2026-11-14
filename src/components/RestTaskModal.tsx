/**
 * Laya (లయ) Mobile — Guilt-Free 3-Chip Rest Day Modal (ADR-0012, ADR-0014)
 * Offers one-tap context selection, skip-note escape hatch, and guilt-free recovery.
 */

import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';

const REST_CHIPS = ['🤒 Sick / Recovery', '✈️ Travel', '🧘 Rest Day'];

export interface RestTaskModalProps {
  visible: boolean;
  taskTitle: string;
  isCurrentlyRested?: boolean;
  currentNotes?: string;
  onClose: () => void;
  onConfirmRest: (reason?: string) => void;
  onUnrest?: () => void;
}

export const RestTaskModal: React.FC<RestTaskModalProps> = ({
  visible,
  taskTitle,
  isCurrentlyRested = false,
  currentNotes = '',
  onClose,
  onConfirmRest,
  onUnrest,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [selectedChip, setSelectedChip] = useState<string>(REST_CHIPS[2]);
  const [customNote, setCustomNote] = useState('');

  const handleChipPress = (chip: string) => {
    setSelectedChip(chip);
  };

  const handleSkipAndRest = () => {
    onConfirmRest(selectedChip || 'Rest Day');
    onClose();
  };

  const handleConfirm = () => {
    const finalReason = customNote.trim() || selectedChip || 'Rest Day';
    onConfirmRest(finalReason);
    onClose();
  };

  const handleResume = () => {
    onUnrest?.();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>🌙 Rest Day (Guilt-Free)</Text>
          <Text style={styles.subtext}>
            "{taskTitle}" will be parked for today. Your consistency score will not be penalized.
          </Text>

          {/* Context Chips */}
          <Text style={styles.sectionLabel}>Reason (Optional):</Text>
          <View style={styles.chipsRow}>
            {REST_CHIPS.map((chip) => {
              const isSelected = selectedChip === chip;
              return (
                <TouchableOpacity
                  key={chip}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => handleChipPress(chip)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {chip}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Note Input */}
          <TextInput
            style={styles.input}
            placeholder="Custom reflection or note (optional)..."
            placeholderTextColor={colors.textTertiary}
            value={customNote}
            onChangeText={setCustomNote}
            maxLength={100}
          />

          {/* Action Buttons */}
          <View style={styles.actionsColumn}>
            {isCurrentlyRested && onUnrest && (
              <TouchableOpacity style={styles.resumeBtn} onPress={handleResume} activeOpacity={0.7}>
                <Text style={styles.resumeBtnText}>☀️ Resume Habit (Un-rest)</Text>
              </TouchableOpacity>
            )}

            <View style={styles.buttonsRow}>
              <TouchableOpacity style={styles.skipBtn} onPress={handleSkipAndRest} activeOpacity={0.7}>
                <Text style={styles.skipBtnText}>✕ Skip Note & Rest</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.7}>
                <Text style={styles.confirmBtnText}>✓ Confirm</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'center',
      padding: spacing.md,
    },
    sheet: {
      backgroundColor: colors.bgCard,
      borderRadius: radiuses.lg,
      padding: spacing.lg,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    title: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700' },
    subtext: { color: colors.textSecondary, fontSize: typography.body, lineHeight: 20 },
    sectionLabel: { color: colors.textTertiary, fontSize: typography.caption, fontWeight: '600', marginTop: 4 },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    chip: {
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      minHeight: 36,
      justifyContent: 'center',
    },
    chipSelected: { backgroundColor: colors.bgActive, borderColor: colors.borderStrong },
    chipText: { color: colors.textSecondary, fontSize: typography.caption },
    chipTextSelected: { color: colors.textPrimary, fontWeight: '600' },
    input: {
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.md,
      padding: spacing.sm,
      color: colors.textPrimary,
      fontSize: typography.body,
    },
    actionsColumn: { gap: spacing.xs, marginTop: spacing.xs },
    buttonsRow: { flexDirection: 'row', gap: spacing.sm },
    skipBtn: {
      flex: 1,
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.md,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      minHeight: 44,
      justifyContent: 'center',
    },
    skipBtnText: { color: colors.textSecondary, fontSize: typography.caption, fontWeight: '600' },
    confirmBtn: {
      flex: 1,
      backgroundColor: colors.progress,
      borderRadius: radiuses.md,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      minHeight: 44,
      justifyContent: 'center',
    },
    confirmBtnText: { color: '#FFFFFF', fontSize: typography.caption, fontWeight: '700' },
    resumeBtn: {
      backgroundColor: colors.done,
      borderRadius: radiuses.md,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      minHeight: 44,
      justifyContent: 'center',
    },
    resumeBtnText: { color: '#FFFFFF', fontSize: typography.caption, fontWeight: '700' },
    cancelBtn: { alignItems: 'center', paddingVertical: spacing.xs },
    cancelBtnText: { color: colors.textTertiary, fontSize: typography.caption },
  });
