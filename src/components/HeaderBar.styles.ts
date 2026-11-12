/**
 * Laya (లయ) Mobile — Header Shell Styles (ADR-0011)
 */

import { StyleSheet } from 'react-native';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';

export const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.bgDark,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    menuBtn: {
      width: 36,
      height: 36,
      borderRadius: radiuses.md,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuIcon: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: '600',
    },
    brandWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    brandTitle: {
      color: colors.textPrimary,
      fontSize: typography.brandTitle,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    brandNative: {
      color: colors.progress,
      fontSize: typography.heading,
      fontWeight: '600',
    },
    scoreBadge: {
      backgroundColor: '#16222F',
      borderColor: '#243A4F',
      borderWidth: 1,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    scoreBadgeActive: {
      backgroundColor: '#0F2E28',
      borderColor: '#1D584C',
    },
    scoreText: {
      color: colors.progress,
      fontSize: typography.caption,
      fontWeight: '600',
    },
    scoreTextActive: {
      color: colors.done,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
      paddingTop: 2,
    },
    dateText: {
      color: colors.textSecondary,
      fontSize: typography.caption,
      fontWeight: '600',
    },
    nightOwlPill: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.xs,
      paddingVertical: 1,
    },
    nightOwlText: {
      color: colors.textTertiary,
      fontSize: 10,
      fontWeight: '500',
    },
  });

export const styles = getStyles();
