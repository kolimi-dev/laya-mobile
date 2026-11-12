/**
 * Laya (లయ) Mobile — Privacy & Ethics Consent Modal
 * First-Time User Transparency Gate (ADR-0001, ADR-0005)
 */

import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';

interface Props {
  visible: boolean;
  onAgree: () => void;
}

export const ConsentModal: React.FC<Props> = ({ visible, onAgree }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Privacy & Human-First Ethics</Text>

          <Text style={styles.intro}>
            <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Laya (లయ)</Text> is designed around radical transparency, calm discipline, and zero manipulation:
          </Text>

          <View style={styles.principlesList}>
            <View style={styles.principleItem}>
              <Text style={styles.principleIcon}>🔒</Text>
              <Text style={styles.principleText}>
                <Text style={{ fontWeight: '600', color: colors.textPrimary }}>Local-First & Private: </Text>
                Your habits and routines live on your device. We never sell your personal data.
              </Text>
            </View>

            <View style={styles.principleItem}>
              <Text style={styles.principleIcon}>🚫</Text>
              <Text style={styles.principleText}>
                <Text style={{ fontWeight: '600', color: colors.textPrimary }}>Zero Ad Trackers: </Text>
                No tracking pixels, behavioral cookies, or commercial telemetry brokers.
              </Text>
            </View>

            <View style={styles.principleItem}>
              <Text style={styles.principleIcon}>🧘</Text>
              <Text style={styles.principleText}>
                <Text style={{ fontWeight: '600', color: colors.textPrimary }}>Guilt-Free Consistency: </Text>
                Missing a day never resets progress to zero. Intentional rest days are mathematically honored.
              </Text>
            </View>

            <View style={styles.principleItem}>
              <Text style={styles.principleIcon}>📱</Text>
              <Text style={styles.principleText}>
                <Text style={{ fontWeight: '600', color: colors.textPrimary }}>Encrypted Sync: </Text>
                When you connect across devices, your routines sync over encrypted TLS.
              </Text>
            </View>
          </View>

          <Text style={styles.disclaimer}>
            By continuing, you agree to Laya's transparent ethics and data portability principles.
          </Text>

          <TouchableOpacity style={styles.agreeBtn} onPress={onAgree} activeOpacity={0.8}>
            <Text style={styles.agreeBtnText}>I Agree & Continue</Text>
          </TouchableOpacity>
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
      maxWidth: 440,
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.lg,
      borderWidth: 1,
      padding: spacing.xl,
    },
    title: {
      color: colors.textPrimary,
      fontSize: typography.heading,
      fontWeight: '700',
      marginBottom: spacing.sm,
      letterSpacing: -0.3,
    },
    intro: {
      color: colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 20,
      marginBottom: spacing.md,
    },
    principlesList: {
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    principleItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    principleIcon: {
      fontSize: 14,
      marginTop: 1,
    },
    principleText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: typography.caption + 1,
      lineHeight: 18,
    },
    disclaimer: {
      color: colors.textTertiary,
      borderColor: colors.borderSubtle,
      fontSize: typography.caption,
      lineHeight: 16,
      borderTopWidth: 1,
      paddingTop: spacing.sm,
      marginBottom: spacing.md,
    },
    agreeBtn: {
      backgroundColor: colors.textPrimary,
      borderRadius: radiuses.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    agreeBtnText: {
      color: colors.bgDark,
      fontSize: typography.subheading,
      fontWeight: '600',
    },
  });
