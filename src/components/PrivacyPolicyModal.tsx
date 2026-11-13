/**
 * Laya (లయ) Mobile — Privacy & Ethics Policy Modal (ADR-0010, Phase E)
 * 100% Ad-Free, 0 Trackers, Offline-First & GDPR/DPDP Compliant
 */

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const POLICIES = [
  {
    icon: '🛡️',
    title: 'Zero Ads & Zero Trackers',
    desc: 'Laya contains 0 advertising SDKs, 0 social trackers, and 0 behavioral marketing pixels. We never monetize your attention or habits.',
  },
  {
    icon: '📱',
    title: 'Offline-First Vault Isolation',
    desc: 'Your daily check-ins, micro-notes, and consistency ratings reside on your device in secure user-scoped storage. The app works 100% offline.',
  },
  {
    icon: '🔑',
    title: 'Passwordless Authentication',
    desc: 'We use temporary cryptographic email OTPs. We never store passwords or sell your contact information to third parties.',
  },
  {
    icon: '⚖️',
    title: 'Data Portability & Deletion',
    desc: 'You own your data. You have the right to export your entire event stream or permanently purge all records from the cloud at any time.',
  },
];

export const PrivacyPolicyModal: React.FC<Props> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>Privacy & Ethics Policy</Text>
              <Text style={styles.subtitle}>Kolimi Studio Ethical Standard</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {POLICIES.map((p, idx) => (
              <View key={idx} style={styles.policyRow}>
                <Text style={styles.policyIcon}>{p.icon}</Text>
                <View style={styles.policyTextWrap}>
                  <Text style={styles.policyTitle}>{p.title}</Text>
                  <Text style={styles.policyDesc}>{p.desc}</Text>
                </View>
              </View>
            ))}

            <View style={styles.commitmentCard}>
              <Text style={styles.commitmentText}>
                "Discipline should inspire peace, not surveillance. Laya is built with honest free software ethics."
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeActionBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeActionText}>Close</Text>
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
      maxHeight: '85%',
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
    titleWrap: { gap: 2 },
    title: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700' },
    subtitle: { color: colors.textTertiary, fontSize: 11, textTransform: 'uppercase' },
    closeBtn: { padding: 4 },
    closeText: { color: colors.textSecondary, fontSize: 16 },
    content: { width: '100%', marginVertical: spacing.xs },
    policyRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      padding: spacing.md,
      marginBottom: spacing.xs,
    },
    policyIcon: { fontSize: 22, marginTop: 2 },
    policyTextWrap: { flex: 1, gap: 2 },
    policyTitle: { color: colors.textPrimary, fontSize: typography.body, fontWeight: '600' },
    policyDesc: { color: colors.textTertiary, fontSize: 11, lineHeight: 16 },
    commitmentCard: {
      padding: spacing.md,
      backgroundColor: 'rgba(99, 102, 241, 0.08)',
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      marginTop: spacing.xs,
    },
    commitmentText: { color: colors.primary, fontSize: 11, fontStyle: 'italic', textAlign: 'center', lineHeight: 16 },
    closeActionBtn: {
      width: '100%',
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: radiuses.md,
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    closeActionText: { color: '#FFFFFF', fontSize: typography.body, fontWeight: '700' },
  });
