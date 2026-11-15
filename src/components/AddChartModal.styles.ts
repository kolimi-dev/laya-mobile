/**
 * Laya (లయ) Mobile — Add Chart Modal Styles (ADR-0004, ADR-0012, Phase C)
 */

import { StyleSheet } from 'react-native';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';

export const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      padding: spacing.md,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.lg,
      maxHeight: '90%',
      padding: spacing.lg,
      gap: spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      color: colors.textPrimary,
      fontSize: typography.heading,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.textTertiary,
      fontSize: 11,
      textTransform: 'uppercase',
    },
    closeBtn: {
      padding: 4,
    },
    closeText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    body: {
      gap: spacing.md,
    },
    section: {
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    sectionHeading: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    searchInput: {
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      color: colors.textPrimary,
      fontSize: typography.body,
      marginBottom: spacing.xs,
    },
    emptyText: {
      color: colors.textTertiary,
      fontSize: typography.caption,
      fontStyle: 'italic',
      paddingVertical: spacing.xs,
    },
    pillList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    groupPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
    },
    groupPillActive: {
      backgroundColor: colors.bgActive,
      borderColor: colors.primary,
    },
    groupDot: {
      width: 7,
      height: 7,
      borderRadius: radiuses.full,
    },
    groupPillText: {
      color: colors.textSecondary,
      fontSize: typography.caption,
      fontWeight: '500',
    },
    groupPillTextActive: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
    taskPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
    },
    taskPillActive: {
      backgroundColor: colors.bgActive,
      borderColor: colors.borderStrong,
    },
    taskPillText: {
      color: colors.textSecondary,
      fontSize: typography.caption,
    },
    taskPillTextActive: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
    flavorTag: {
      fontSize: 9,
      color: colors.textTertiary,
      textTransform: 'uppercase',
      fontWeight: '600',
    },
    styleGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    styleCard: {
      width: '48%',
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      padding: spacing.sm,
      gap: 2,
    },
    styleCardActive: {
      backgroundColor: colors.bgActive,
      borderColor: colors.primary,
    },
    styleIcon: {
      fontSize: 18,
    },
    styleTitle: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    styleTitleActive: {
      color: colors.primary,
    },
    styleDesc: {
      color: colors.textTertiary,
      fontSize: 9,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      paddingTop: spacing.sm,
    },
    cancelBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
    },
    cancelText: {
      color: colors.textSecondary,
      fontSize: typography.body,
    },
    submitBtn: {
      backgroundColor: colors.textPrimary,
      borderRadius: radiuses.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: 8,
    },
    submitBtnDisabled: {
      opacity: 0.5,
    },
    submitText: {
      color: colors.bgDark,
      fontSize: typography.body,
      fontWeight: '600',
    },
  });

