/**
 * Laya (లయ) Mobile — Group Selector Dropdown Styles (ADR-0016, V2.2)
 */

import { StyleSheet } from 'react-native';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';

export const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    triggerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      minWidth: 140,
      maxWidth: 220,
    },
    triggerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },
    colorDot: {
      width: 7,
      height: 7,
      borderRadius: radiuses.full,
    },
    colorDotLg: {
      width: 10,
      height: 10,
      borderRadius: radiuses.full,
    },
    folderIcon: {
      fontSize: 12,
    },
    triggerText: {
      color: colors.textPrimary,
      fontSize: typography.caption,
      fontWeight: '600',
      flexShrink: 1,
    },
    countBadge: {
      backgroundColor: colors.bgInput,
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: radiuses.full,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    countBadgeText: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: '700',
    },
    chevron: {
      color: colors.textTertiary,
      fontSize: 12,
      marginLeft: 4,
    },
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
      marginTop: 1,
    },
    closeBtn: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    list: {
      marginVertical: spacing.xs,
    },
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
    itemRowActive: {
      borderColor: colors.primary,
      backgroundColor: colors.bgActive,
    },
    itemMain: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    itemIcon: {
      fontSize: 16,
    },
    itemTextWrap: {
      flex: 1,
    },
    itemTitle: {
      color: colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '500',
    },
    itemTitleActive: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
    itemSubtitle: {
      color: colors.textTertiary,
      fontSize: 10,
      marginTop: 1,
    },
    activeCheck: {
      color: colors.done,
      fontSize: 14,
      fontWeight: '700',
      marginLeft: spacing.xs,
    },
    manageBtn: {
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderStyle: 'dashed',
      paddingVertical: spacing.sm,
      borderRadius: radiuses.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xs,
    },
    manageBtnText: {
      color: colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '600',
    },
  });

