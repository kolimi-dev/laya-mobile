/**
 * Laya (లయ) Mobile — Dashboard Picker & Pinning Modal (ADR-0015, V2.1)
 * Dropdown selector allowing users to switch dashboards and pin a default dashboard
 */

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';
import { UserDashboard } from '../core/types';

interface Props {
  visible: boolean;
  dashboards: UserDashboard[];
  activeDashboardId: string;
  defaultDashboardId: string;
  onSelectDashboard: (dashId: string) => void;
  onSetDefaultDashboard: (dashId: string) => void;
  onOpenCreateDashboard: () => void;
  onClose: () => void;
}

export const DashboardPickerModal: React.FC<Props> = ({
  visible,
  dashboards,
  activeDashboardId,
  defaultDashboardId,
  onSelectDashboard,
  onSetDefaultDashboard,
  onOpenCreateDashboard,
  onClose,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Your Dashboards</Text>
              <Text style={styles.subtitle}>Select a dashboard or pin your default</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {dashboards.map((dash) => {
              const isActive = dash.id === activeDashboardId;
              const isDefault = dash.id === defaultDashboardId;

              return (
                <View key={dash.id} style={[styles.itemRow, isActive && styles.itemRowActive]}>
                  <TouchableOpacity
                    style={styles.itemMain}
                    onPress={() => {
                      onSelectDashboard(dash.id);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.itemIcon}>{dash.icon || '📊'}</Text>
                    <Text style={[styles.itemTitle, isActive && styles.itemTitleActive]}>{dash.title}</Text>
                    {isActive && <Text style={styles.activeCheck}>✓</Text>}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.pinBtn, isDefault && styles.pinBtnActive]}
                    onPress={() => onSetDefaultDashboard(dash.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={[styles.pinIcon, isDefault && styles.pinIconActive]}>
                      {isDefault ? '📌 Default' : 'Pin'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => {
              onClose();
              onOpenCreateDashboard();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.createBtnText}>+ Create New Dashboard</Text>
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
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.lg,
      padding: spacing.xl,
      gap: spacing.md,
      maxHeight: '80%',
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700' },
    subtitle: { color: colors.textTertiary, fontSize: 11, marginTop: 1 },
    closeBtn: { color: colors.textSecondary, fontSize: 16 },
    list: { marginVertical: spacing.xs },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.xs,
    },
    itemRowActive: { borderColor: colors.primary, backgroundColor: colors.bgActive },
    itemMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
    itemIcon: { fontSize: 16 },
    itemTitle: { color: colors.textSecondary, fontSize: typography.body, fontWeight: '500' },
    itemTitleActive: { color: colors.textPrimary, fontWeight: '700' },
    activeCheck: { color: colors.done, fontSize: 14, fontWeight: '700', marginLeft: spacing.xs },
    pinBtn: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.full,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    pinBtnActive: { backgroundColor: 'rgba(99, 102, 241, 0.2)', borderColor: colors.primary },
    pinIcon: { color: colors.textTertiary, fontSize: 10, fontWeight: '600' },
    pinIconActive: { color: colors.primary },
    createBtn: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: radiuses.md,
      alignItems: 'center',
    },
    createBtnText: { color: '#FFFFFF', fontSize: typography.body, fontWeight: '700' },
  });
