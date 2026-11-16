/**
 * Laya (లయ) Mobile — Direct Numeric Input Modal (ADR-0012)
 * Tap-to-Type Exact Floating Point / Integer Values
 */

import React, { useState, useEffect } from 'react';
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
  title: string;
  currentValue: number;
  targetAmount?: number;
  unit?: string;
  onClose: () => void;
  onSave: (val: number) => void;
}

export const DirectNumberModal: React.FC<Props> = ({
  visible,
  title,
  currentValue,
  targetAmount,
  unit,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [textVal, setTextVal] = useState(String(currentValue));

  useEffect(() => {
    if (visible) {
      setTextVal(String(currentValue));
    }
  }, [visible, currentValue]);

  const handleSave = () => {
    const sanitized = textVal.replace(',', '.');
    const parsed = parseFloat(sanitized);
    if (!isNaN(parsed) && parsed >= 0) {
      onSave(Math.round(parsed * 100) / 100);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.subtitle}>
            Enter exact progress {targetAmount ? `(Target: ${targetAmount} ${unit || ''})` : ''}
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={textVal}
              onChangeText={setTextVal}
              keyboardType="decimal-pad"
              autoFocus
              selectTextOnFocus
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
            />
            {unit ? <Text style={styles.unitText}>{unit}</Text> : null}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Set Value</Text>
            </TouchableOpacity>
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
      maxWidth: 320,
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
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      paddingHorizontal: spacing.md,
      marginTop: spacing.xs,
    },
    input: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '700',
      paddingVertical: spacing.sm,
    },
    unitText: {
      color: colors.textSecondary,
      fontSize: typography.subheading,
      fontWeight: '600',
      marginLeft: spacing.xs,
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
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: radiuses.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    saveText: {
      color: '#FFFFFF',
      fontSize: typography.body,
      fontWeight: '600',
    },
  });
