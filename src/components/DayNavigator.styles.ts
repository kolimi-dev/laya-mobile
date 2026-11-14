/**
 * Laya (లయ) Mobile — Day Navigator Styles (ADR-0015, V2.1)
 */

import { StyleSheet } from 'react-native';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';

export const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.bgDark,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xs,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
      gap: spacing.xs,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    stepperWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    navArrowBtn: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navArrowText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    navArrowDisabled: {
      opacity: 0.35,
    },
    dateDisplay: {
      flexDirection: 'column',
      paddingHorizontal: spacing.xs,
    },
    dateMainLabel: {
      color: colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '700',
    },
    dateSubLabel: {
      color: colors.textTertiary,
      fontSize: 10,
    },
    horizonPills: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    horizonBtn: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
    },
    horizonBtnActive: {
      backgroundColor: colors.bgActive,
      borderColor: colors.borderStrong,
    },
    horizonBtnText: {
      color: colors.textSecondary,
      fontSize: typography.caption,
      fontWeight: '600',
    },
    horizonBtnTextActive: {
      color: colors.textPrimary,
    },
    jumpTodayBtn: {
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      borderColor: colors.primary,
      borderWidth: 1,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    jumpTodayText: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: '700',
    },
    philosophicalCard: {
      backgroundColor: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.2)',
      borderWidth: 1,
      borderRadius: radiuses.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      marginTop: 2,
    },
    philosophicalText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontStyle: 'italic',
      textAlign: 'center',
      lineHeight: 16,
    },
  });

export const styles = getStyles();
