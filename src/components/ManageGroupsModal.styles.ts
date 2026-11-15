/**
 * Laya (లయ) Mobile — Manage Groups Modal Styles
 * Styling tokens for group manager (ADR-0005, ADR-0016)
 */

import { StyleSheet } from 'react-native';
import { ColorPalette, spacing, radiuses, typography } from '../theme/tokens';

export const getStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      padding: spacing.md,
    },
    modalCard: {
      backgroundColor: colors.bgCard,
      borderRadius: radiuses.lg,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: spacing.lg,
      maxHeight: '85%',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    title: {
      color: colors.textPrimary,
      fontSize: typography.heading,
      fontWeight: '700',
    },
    closeBtn: {
      padding: 6,
    },
    closeText: {
      color: colors.textTertiary,
      fontSize: 16,
      fontWeight: '600',
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: typography.caption,
      marginBottom: spacing.md,
    },
    list: {
      marginBottom: spacing.md,
    },
    groupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgInput,
      borderRadius: radiuses.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      marginBottom: spacing.xs,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    groupInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    colorDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    groupName: {
      color: colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '600',
      flex: 1,
    },
    countBadge: {
      color: colors.textTertiary,
      fontSize: 11,
      marginRight: 6,
    },
    statusBadge: {
      fontSize: 10,
      color: colors.warning,
      backgroundColor: 'rgba(234, 179, 8, 0.15)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginRight: 6,
      fontWeight: '600',
    },
    statusBadgeDone: {
      color: colors.done,
      backgroundColor: 'rgba(52, 211, 153, 0.15)',
    },
    iconBtn: {
      padding: 6,
    },
    iconBtnText: {
      fontSize: 14,
    },
    // Inline edit box
    editBox: {
      backgroundColor: colors.bgInput,
      borderRadius: radiuses.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    input: {
      backgroundColor: colors.bgCard,
      color: colors.textPrimary,
      borderRadius: radiuses.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      fontSize: typography.body,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      marginBottom: spacing.sm,
    },
    paletteRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: spacing.sm,
    },
    lifecycleRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: spacing.md,
    },
    lifecycleBtn: {
      flex: 1,
      paddingVertical: 6,
      borderRadius: radiuses.sm,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      alignItems: 'center',
      backgroundColor: colors.bgCard,
    },
    lifecycleBtnActive: {
      borderColor: colors.primary,
      backgroundColor: 'rgba(56, 189, 248, 0.15)',
    },
    lifecycleBtnText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    lifecycleBtnTextActive: {
      color: colors.primary,
    },
    colorCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    colorCircleSelected: {
      borderColor: colors.textPrimary,
      transform: [{ scale: 1.15 }],
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 10,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: radiuses.md,
    },
    cancelBtn: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    cancelBtnText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    deleteBtn: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      borderWidth: 1,
      borderColor: colors.danger,
    },
    deleteBtnText: {
      color: colors.danger,
      fontSize: 12,
      fontWeight: '600',
    },
    saveBtn: {
      backgroundColor: colors.primary,
    },
    saveBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    // Add new trigger
    addTriggerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: radiuses.md,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderSubtle,
      backgroundColor: colors.bgInput,
    },
    addTriggerText: {
      color: colors.primary,
      fontSize: typography.body,
      fontWeight: '600',
    },
  });
