/**
 * Laya (లయ) Mobile — "What's New" Spotlight Modal (Phase D)
 * Celebratory feature walkthrough shown once after updating to a new version
 */

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';

interface Props {
  visible: boolean;
  version: string;
  onDismiss: () => void;
}

const HIGHLIGHTS = [
  { icon: '📈', title: 'Honest Reality Scaling', desc: '100% target baseline with bonus surge visibility (>100%) on volume bars.' },
  { icon: '🔄', title: 'Retroactive Continuity', desc: 'Accurate ring ratios for backfilled activity with time-horizon badges.' },
  { icon: '🔍', title: 'Instant Chart Discovery', desc: 'Category-filtered chart modal with live search & 1-tap catalog pin.' },
  { icon: '⚡', title: 'Routine & Group Reordering', desc: 'Arrange daily routines and life dimensions in your natural order.' },
];

export const WhatsNewModal: React.FC<Props> = ({ visible, version, onDismiss }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <Text style={styles.sparkle}>✨</Text>
            <View style={styles.versionPill}>
              <Text style={styles.versionText}>v{version} Update</Text>
            </View>
          </View>

          <Text style={styles.title}>What's New in Laya (లయ)</Text>
          <Text style={styles.subtitle}>Fresh upgrades tailored for your natural cadence</Text>

          <ScrollView style={styles.featureList} showsVerticalScrollIndicator={false}>
            {HIGHLIGHTS.map((h, idx) => (
              <View key={idx} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{h.icon}</Text>
                <View style={styles.featureDetails}>
                  <Text style={styles.featureTitle}>{h.title}</Text>
                  <Text style={styles.featureDesc}>{h.desc}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.actionBtn} onPress={onDismiss} activeOpacity={0.8}>
            <Text style={styles.actionText}>Got it, let's go!</Text>
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
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.lg,
      padding: spacing.xl,
      gap: spacing.sm,
      alignItems: 'center',
      maxHeight: '85%',
    },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
    sparkle: { fontSize: 20 },
    versionPill: {
      backgroundColor: colors.bgActive,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radiuses.full,
    },
    versionText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
    title: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700', textAlign: 'center' },
    subtitle: { color: colors.textSecondary, fontSize: typography.caption, textAlign: 'center', marginBottom: spacing.xs },
    featureList: { width: '100%', marginVertical: spacing.xs },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      padding: spacing.md,
      marginBottom: spacing.xs,
    },
    featureIcon: { fontSize: 24 },
    featureDetails: { flex: 1, gap: 2 },
    featureTitle: { color: colors.textPrimary, fontSize: typography.body, fontWeight: '600' },
    featureDesc: { color: colors.textTertiary, fontSize: 11, lineHeight: 16 },
    actionBtn: {
      width: '100%',
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: radiuses.md,
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    actionText: { color: '#FFFFFF', fontSize: typography.body, fontWeight: '700' },
  });
