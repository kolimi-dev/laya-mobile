/**
 * Laya (లయ) Mobile — LoginScreen Styles (ADR-0010, ADR-0011)
 */

import { StyleSheet } from 'react-native';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';

export const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgDark,
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.lg,
      padding: spacing.xl,
      gap: spacing.lg,
    },
    header: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    brandTitle: {
      color: colors.textPrimary,
      fontSize: 26,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    brandNative: {
      color: colors.progress,
      fontSize: 22,
      fontWeight: '600',
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: typography.body,
      textAlign: 'center',
      marginTop: 4,
    },
    domainNotice: {
      color: colors.textTertiary,
      fontSize: typography.caption,
      textAlign: 'center',
    },
    form: {
      gap: spacing.md,
    },
    label: {
      color: colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '600',
    },
    input: {
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      color: colors.textPrimary,
      fontSize: typography.heading,
    },
    otpInput: {
      textAlign: 'center',
      letterSpacing: 8,
      fontSize: 24,
      fontWeight: '700',
      fontFamily: 'monospace',
      color: colors.progress,
    },
    errorText: {
      color: colors.danger,
      fontSize: typography.caption,
    },
    btn: {
      backgroundColor: colors.textPrimary,
      borderRadius: radiuses.md,
      paddingVertical: 12,
      alignItems: 'center',
    },
    btnText: {
      color: colors.bgDark,
      fontSize: typography.heading,
      fontWeight: '600',
    },
    backBtn: {
      alignItems: 'center',
      paddingVertical: 6,
    },
    backBtnText: {
      color: colors.textSecondary,
      fontSize: typography.body,
    },
    offlineSkipBtn: {
      alignItems: 'center',
      marginTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      paddingTop: spacing.md,
    },
    offlineSkipText: {
      color: colors.textTertiary,
      fontSize: typography.caption,
    },
  });

export const styles = getStyles();
