/**
 * Laya (లయ) Mobile — TaskCard Component Styles (ADR-0010, ADR-0011, ADR-0012)
 * Enforces minimum 44dp touch targets for accessibility.
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
      gap: spacing.xs,
    },
    cardIgnored: {
      backgroundColor: colors.ignoredBg,
      opacity: 0.8,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
    },
    titleWrap: { flex: 1, gap: 2, paddingRight: spacing.sm },
    title: {
      color: colors.textPrimary,
      fontSize: typography.heading,
      fontWeight: '600',
    },
    completedText: {
      textDecorationLine: 'line-through',
      color: colors.textTertiary,
    },
    ignoredText: { color: colors.ignored },
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
    groupDot: { width: 6, height: 6, borderRadius: radiuses.full },
    groupBadgeText: { color: colors.textSecondary, fontSize: typography.caption },
    flavorBadge: {
      color: colors.textTertiary,
      fontSize: typography.caption,
      textTransform: 'uppercase',
    },
    metaPill: {
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.full,
      paddingHorizontal: 6,
      paddingVertical: 1,
    },
    metaPillText: {
      color: colors.progress,
      fontSize: 10,
      fontWeight: '600',
    },
    // Checkbox hit target: minimum 44x44dp bounding box
    checkBtn: {
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkBtnBox: {
      width: 26,
      height: 26,
      borderRadius: radiuses.full,
      borderWidth: 2,
      borderColor: colors.borderActive,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkBtnBoxDone: {
      backgroundColor: colors.done,
      borderColor: colors.done,
    },
    checkIcon: {
      color: 'transparent',
      fontSize: 14,
      fontWeight: '700',
    },
    checkIconDone: { color: '#FFFFFF' },
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
      paddingVertical: 6,
      minHeight: 36,
      justifyContent: 'center',
    },
    milestonePillDone: {
      backgroundColor: colors.done,
      borderColor: colors.done,
    },
    milestonePillSkipped: {
      backgroundColor: colors.ignoredBg,
      borderColor: colors.borderSubtle,
    },
    milestoneText: {
      color: colors.textSecondary,
      fontSize: typography.caption,
      fontWeight: '500',
    },
    milestoneTextDone: { color: '#FFFFFF', fontWeight: '600' },
    milestoneTextSkipped: {
      color: colors.ignored,
      textDecorationLine: 'line-through',
    },
    quantifiedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgInput,
      padding: spacing.xs,
      borderRadius: radiuses.sm,
      minHeight: 48,
    },
    quantifiedLabel: {
      color: colors.progress,
      fontSize: typography.body,
      fontWeight: '600',
      paddingLeft: spacing.xs,
      minHeight: 44,
      justifyContent: 'center',
      textAlignVertical: 'center',
    },
    quantifiedActions: { flexDirection: 'row', gap: spacing.xs },
    stepBtn: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.sm,
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBtnText: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: '600',
    },
    progressPill: {
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      alignSelf: 'center',
    },
    progressPillText: {
      color: colors.progress,
      fontSize: typography.caption,
      fontWeight: '700',
    },
    drawerContainer: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      gap: spacing.sm,
    },
    drawerSection: { gap: 4 },
    drawerSectionLabel: {
      color: colors.textTertiary,
      fontSize: typography.caption,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    drawerBadgesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      alignItems: 'center',
    },
    drawerActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    drawerActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      minHeight: 40,
      justifyContent: 'center',
    },
    drawerActionBtnActive: {
      backgroundColor: colors.bgActive,
      borderColor: colors.borderStrong,
    },
    drawerActionBtnText: {
      color: colors.textSecondary,
      fontSize: typography.caption,
      fontWeight: '600',
    },
    drawerActionBtnTextActive: {
      color: colors.textPrimary,
    },
  });

export const styles = getStyles();
