/**
 * Laya (లయ) Mobile — Onboarding Profile Modal Styles
 */

import { StyleSheet } from 'react-native';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';

export const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: radiuses.lg,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: spacing.xl,
      width: '100%',
      maxWidth: 400,
      alignItems: 'center',
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.bgActive,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    iconText: {
      fontSize: 26,
    },
    brandTitle: {
      fontSize: typography.heading,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    brandNative: {
      fontSize: typography.subheading,
      color: colors.primary,
      fontWeight: '400',
    },
    subtitle: {
      fontSize: typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
      marginBottom: spacing.md,
    },
    emailPill: {
      backgroundColor: colors.bgInput,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      borderRadius: radiuses.full,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    emailText: {
      fontSize: typography.caption,
      color: colors.textSecondary,
    },
    field: {
      width: '100%',
      marginBottom: spacing.md,
    },
    label: {
      fontSize: typography.caption,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 6,
    },
    required: {
      color: colors.danger,
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
    phoneRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    countryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.md,
      paddingHorizontal: spacing.sm,
      gap: 4,
    },
    flag: {
      fontSize: 18,
    },
    dialCode: {
      color: colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '600',
    },
    chevron: {
      color: colors.textTertiary,
      fontSize: 10,
    },
    phoneInput: {
      flex: 1,
    },
    errorText: {
      color: colors.danger,
      fontSize: typography.caption,
      marginTop: 4,
    },
    submitBtn: {
      width: '100%',
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: radiuses.md,
      alignItems: 'center',
      marginTop: spacing.md,
    },
    submitBtnText: {
      color: '#FFFFFF',
      fontSize: typography.body,
      fontWeight: '700',
    },
    skipBtn: {
      marginTop: spacing.md,
      paddingVertical: spacing.xs,
    },
    skipBtnText: {
      color: colors.textTertiary,
      fontSize: typography.caption,
    },
  });
