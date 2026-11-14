/**
 * Laya (లయ) Mobile — Flexible Baseline Control Styles (ADR-0016, V2.2)
 */

import { StyleSheet } from 'react-native';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';

export const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: {
      gap: spacing.xs,
      marginVertical: spacing.xs,
    },
    criteriaTabs: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    criterionTab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    criterionTabActive: {
      backgroundColor: colors.bgActive,
      borderColor: colors.primary,
    },
    criterionTabText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '500',
    },
    criterionTabTextActive: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
    tabDoneDot: {
      color: colors.done,
      fontSize: 10,
      fontWeight: '700',
    },
    controlRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
    },
    progressWrap: {
      flex: 1,
      gap: 2,
    },
    mainValText: {
      color: colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '700',
    },
    pctBadge: {
      fontSize: 11,
      fontWeight: '600',
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    stepBtn: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBtnText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    trackWrap: {
      height: 4,
      backgroundColor: colors.bgInput,
      borderRadius: radiuses.full,
      overflow: 'hidden',
      marginTop: 2,
    },
    fillBar: {
      height: '100%',
      backgroundColor: colors.progress,
      borderRadius: radiuses.full,
    },
    fillBarDone: {
      backgroundColor: colors.done,
    },
  });
