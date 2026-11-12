/**
 * Laya (లయ) Mobile — TaskCard Component Styles (ADR-0010, ADR-0011)
 */

import { StyleSheet } from 'react-native';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';

export const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderLeftWidth: 3,
      borderRadius: radiuses.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    cardIgnored: {
      backgroundColor: colors.ignoredBg,
      opacity: 0.8,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    titleWrap: {
      flex: 1,
      gap: 3,
    },
    title: {
      color: colors.textPrimary,
      fontSize: typography.heading,
      fontWeight: '600',
    },
    completedText: {
      textDecorationLine: 'line-through',
      color: colors.textTertiary,
    },
    ignoredText: {
      color: colors.ignored,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    groupBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    groupDot: {
      width: 6,
      height: 6,
      borderRadius: radiuses.full,
    },
    groupBadgeText: {
      color: colors.textSecondary,
      fontSize: typography.caption,
    },
    flavorBadge: {
      color: colors.textTertiary,
      fontSize: typography.caption,
      textTransform: 'uppercase',
    },
    checkBtn: {
      width: 28,
      height: 28,
      borderRadius: radiuses.full,
      borderWidth: 2,
      borderColor: colors.borderActive,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkBtnDone: {
      backgroundColor: colors.done,
      borderColor: colors.done,
    },
    checkIcon: {
      color: 'transparent',
      fontSize: 14,
      fontWeight: '700',
    },
    checkIconDone: {
      color: '#FFFFFF',
    },
    milestonesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    milestonePill: {
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    milestonePillDone: {
      backgroundColor: colors.done,
      borderColor: colors.done,
    },
    milestoneText: {
      color: colors.textSecondary,
      fontSize: typography.caption,
      fontWeight: '500',
    },
    milestoneTextDone: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    quantifiedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgInput,
      padding: spacing.xs,
      borderRadius: radiuses.sm,
    },
    quantifiedLabel: {
      color: colors.progress,
      fontSize: typography.body,
      fontWeight: '600',
      paddingLeft: spacing.xs,
    },
    quantifiedActions: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    stepBtn: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.sm,
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBtnText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      paddingTop: spacing.xs,
      marginTop: spacing.xs,
    },
    ignoreBtn: {
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    ignoreBtnActive: {
      backgroundColor: colors.bgActive,
      borderColor: colors.borderStrong,
    },
    ignoreBtnText: {
      color: colors.textTertiary,
      fontSize: typography.caption,
    },
    ignoreBtnTextActive: {
      color: colors.textPrimary,
      fontWeight: '600',
    },
    voiceBtn: {
      backgroundColor: colors.bgInput,
      borderRadius: radiuses.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    voiceBtnText: {
      color: colors.textSecondary,
      fontSize: typography.caption,
    },
    progressText: {
      color: colors.textTertiary,
      fontSize: typography.caption,
      fontWeight: '600',
    },
    cardActionBtn: {
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.sm,
      paddingHorizontal: 6,
      paddingVertical: 3,
    },
    cardActionText: {
      fontSize: 12,
    },
  });

export const styles = getStyles();
