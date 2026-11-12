/**
 * Laya (లయ) Mobile — In-App Feedback Modal Styles
 */

import { StyleSheet } from 'react-native';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';

export const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: radiuses.lg,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      width: '100%',
      maxWidth: 420,
      maxHeight: '90%',
      padding: spacing.xl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: typography.heading,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    closeBtn: {
      fontSize: 18,
      color: colors.textTertiary,
      padding: spacing.xs,
    },
    subtitle: {
      fontSize: typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    categoryRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    categoryChip: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: radiuses.md,
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      alignItems: 'center',
    },
    categoryChipActive: {
      backgroundColor: colors.bgActive,
      borderColor: colors.primary,
    },
    categoryLabel: {
      fontSize: typography.caption,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    categoryLabelActive: {
      color: colors.primary,
    },
    field: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: typography.caption,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.textPrimary,
      fontSize: typography.body,
    },
    textArea: {
      height: 90,
      textAlignVertical: 'top',
    },
    diagnosticsCard: {
      backgroundColor: colors.bgInput,
      borderRadius: radiuses.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      marginBottom: spacing.lg,
    },
    diagnosticsTitle: {
      fontSize: typography.caption,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    diagnosticsText: {
      fontSize: typography.caption,
      color: colors.textTertiary,
      lineHeight: 16,
    },
    footer: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: radiuses.md,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      alignItems: 'center',
    },
    cancelBtnText: {
      color: colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '600',
    },
    submitBtn: {
      flex: 2,
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: radiuses.md,
      alignItems: 'center',
    },
    submitBtnDisabled: {
      opacity: 0.5,
    },
    submitBtnText: {
      color: '#FFFFFF',
      fontSize: typography.body,
      fontWeight: '700',
    },
  });
