/**
 * Laya (లయ) Mobile — Task Charts & Custom Dashboards Screen Styles
 */

import { StyleSheet } from 'react-native';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';

export const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: { paddingBottom: spacing.xxl },
    topSelectorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    dropdownBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      gap: spacing.sm,
    },
    dropdownIcon: { fontSize: 16 },
    dropdownTitle: { color: colors.textPrimary, fontSize: typography.subheading, fontWeight: '700', flex: 1 },
    defaultBadge: { fontSize: 12 },
    dropdownChevron: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
    editDashBtn: {
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    editDashText: { fontSize: 14 },
    newDashBtn: {
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
    },
    newDashText: { color: colors.primary, fontSize: typography.caption, fontWeight: '700' },
    dashHeaderBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.xs,
      marginBottom: spacing.xs,
    },
    dashTitleWrap: { gap: 2 },
    dashCount: { color: colors.textTertiary, fontSize: typography.caption },
    dashActionsRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
    rearrangeBtn: {
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      paddingHorizontal: spacing.sm,
      paddingVertical: 5,
      borderRadius: radiuses.sm,
    },
    rearrangeBtnActive: {
      backgroundColor: colors.badgeBg,
      borderColor: colors.primary,
    },
    rearrangeBtnText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
    addChartBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radiuses.sm,
    },
    addChartText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
    emptyCard: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.lg,
      padding: spacing.xl,
      alignItems: 'center',
      gap: 6,
      marginTop: spacing.sm,
    },
    emptyTitle: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '600' },
    emptySubtext: { color: colors.textTertiary, fontSize: typography.caption, textAlign: 'center', lineHeight: 18 },
    addFirstBtn: {
      backgroundColor: colors.primary,
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radiuses.md,
    },
    addFirstText: { color: '#FFFFFF', fontSize: typography.body, fontWeight: '700' },
  });

export const styles = getStyles();
