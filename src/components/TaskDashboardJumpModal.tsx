/**
 * Laya (లయ) Mobile — Task-to-Dashboard Jump Modal (ADR-0016)
 * Direct navigation from task card to dashboards containing this habit's chart.
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, spacing, radiuses, typography } from '../theme/tokens';
import { UserDashboard } from '../core/types';

interface Props {
  visible: boolean;
  taskTitle: string;
  dashboards: UserDashboard[];
  onSelect: (dashboardId: string) => void;
  onClose: () => void;
}

export const TaskDashboardJumpModal: React.FC<Props> = ({
  visible,
  taskTitle,
  dashboards,
  onSelect,
  onClose,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.card} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>Dashboards with "{taskTitle}"</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtext}>Select a dashboard to view this habit's visualizers:</Text>

          <View style={styles.list}>
            {dashboards.map((dash) => (
              <TouchableOpacity
                key={dash.id}
                style={styles.itemBtn}
                onPress={() => {
                  onSelect(dash.id);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.itemIcon}>{dash.icon || '📊'}</Text>
                <Text style={styles.itemTitle}>{dash.title}</Text>
                <Text style={styles.itemArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const getStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.md,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: radiuses.lg,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      width: '100%',
      maxWidth: 340,
      padding: spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    title: {
      color: colors.textPrimary,
      fontSize: typography.heading,
      fontWeight: 'bold',
      flex: 1,
    },
    closeBtn: {
      padding: 4,
    },
    closeText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    subtext: {
      color: colors.textSecondary,
      fontSize: typography.caption,
      marginBottom: spacing.sm,
    },
    list: {
      gap: spacing.xs,
    },
    itemBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.bgInput,
      borderRadius: radiuses.md,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    itemIcon: {
      fontSize: 16,
      marginRight: spacing.sm,
    },
    itemTitle: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: '600',
      flex: 1,
    },
    itemArrow: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: 'bold',
    },
  });
