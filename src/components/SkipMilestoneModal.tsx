/**
 * Laya (లయ) Mobile — Skip Milestone Exemption Modal (ADR-0001, ADR-0012)
 * Guilt-Free Step-Level Skip with Reason
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, radiuses, spacing, typography } from '../theme/tokens';

interface Props {
  visible: boolean;
  milestoneLabel: string;
  isSkipped: boolean;
  onClose: () => void;
  onConfirmSkip: (reason?: string) => void;
  onUnskip?: () => void;
}

export const SkipMilestoneModal: React.FC<Props> = ({
  visible,
  milestoneLabel,
  isSkipped,
  onClose,
  onConfirmSkip,
  onUnskip,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [reason, setReason] = useState('');

  const handleSkip = () => {
    onConfirmSkip(reason.trim() || undefined);
    setReason('');
    onClose();
  };

  const handleUnskip = () => {
    onUnskip?.();
    setReason('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {isSkipped ? 'Milestone Exempted' : 'Skip Checkpoint (Guilt-Free)'}
          </Text>
          <Text style={styles.subtitle}>
            "{milestoneLabel}" will be subtracted from today's denominator without penalizing your rhythm.
          </Text>

          {!isSkipped && (
            <TextInput
              style={styles.input}
              value={reason}
              onChangeText={setReason}
              placeholder="Reason (Optional: e.g. Travel, Rest, Injury)"
              placeholderTextColor={colors.textTertiary}
            />
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            {isSkipped ? (
              <TouchableOpacity style={styles.unskipBtn} onPress={handleUnskip}>
                <Text style={styles.unskipText}>Restore Step</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip Step</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.lg,
      borderWidth: 1,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    title: {
      color: colors.textPrimary,
      fontSize: typography.heading,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: typography.caption,
      lineHeight: 18,
    },
    input: {
      backgroundColor: colors.bgInput,
      color: colors.textPrimary,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: typography.body,
      marginTop: spacing.xs,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    cancelBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    cancelText: {
      color: colors.textSecondary,
      fontSize: typography.body,
    },
    skipBtn: {
      backgroundColor: colors.warning,
      borderRadius: radiuses.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    skipText: {
      color: '#FFFFFF',
      fontSize: typography.body,
      fontWeight: '600',
    },
    unskipBtn: {
      backgroundColor: colors.primary,
      borderRadius: radiuses.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    unskipText: {
      color: '#FFFFFF',
      fontSize: typography.body,
      fontWeight: '600',
    },
  });
