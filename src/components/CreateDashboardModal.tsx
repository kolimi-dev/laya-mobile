/**
 * Laya (లయ) Mobile — Create Dashboard Modal (ADR-0004, ADR-0012, Phase C)
 * Custom User-Created Dashboards with Title and Icon
 */

import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';
import { UserDashboard } from '../core/types';
import { generateUUID } from '../services/storage';

const ICONS = ['📊', '⚡', '🏋️', '📚', '🧘', '🎯', '💧', '🌿', '💼', '🔥', '🧠', '✨'];

interface Props {
  visible: boolean;
  userId?: string;
  onClose: () => void;
  onSave: (dashboard: UserDashboard) => void;
}

export const CreateDashboardModal: React.FC<Props> = ({
  visible,
  userId = 'usr_guest',
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [title, setTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📊');

  const handleSubmit = () => {
    if (!title.trim()) return;

    const newDash: UserDashboard = {
      id: generateUUID('dsh'),
      userId,
      title: title.trim(),
      icon: selectedIcon,
      sortOrder: Date.now(),
      createdAt: new Date().toISOString(),
    };

    onSave(newDash);
    setTitle('');
    setSelectedIcon('📊');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>New Custom Dashboard</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={styles.field}>
              <Text style={styles.label}>Dashboard Name</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Morning Routine, Fitness, Study"
                placeholderTextColor={colors.textTertiary}
                autoFocus
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Select Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconRow}>
                {ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[styles.iconPill, selectedIcon === icon && styles.iconPillActive]}
                    onPress={() => setSelectedIcon(icon)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
              <Text style={styles.submitText}>Create Dashboard</Text>
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
      padding: spacing.md,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.lg,
      padding: spacing.lg,
      gap: spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700' },
    closeBtn: { padding: 4 },
    closeText: { color: colors.textSecondary, fontSize: 16 },
    body: { gap: spacing.md },
    field: { gap: 6 },
    label: { color: colors.textSecondary, fontSize: typography.body, fontWeight: '600' },
    input: {
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      color: colors.textPrimary,
      fontSize: typography.body,
    },
    iconRow: { flexDirection: 'row', gap: spacing.xs, paddingVertical: 4 },
    iconPill: {
      width: 42,
      height: 42,
      borderRadius: radiuses.md,
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconPillActive: {
      backgroundColor: colors.bgActive,
      borderColor: colors.borderStrong,
    },
    iconText: { fontSize: 20 },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.sm,
      marginTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      paddingTop: spacing.sm,
    },
    cancelBtn: { paddingHorizontal: spacing.md, paddingVertical: 8 },
    cancelText: { color: colors.textSecondary, fontSize: typography.body },
    submitBtn: {
      backgroundColor: colors.textPrimary,
      borderRadius: radiuses.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: 8,
    },
    submitText: { color: colors.bgDark, fontSize: typography.body, fontWeight: '600' },
  });
