/**
 * Laya (లయ) Mobile — Baseline Criteria Builder Styles (ADR-0016, V2.2)
 */

import { StyleSheet } from 'react-native';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';

export const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: {
      gap: spacing.sm,
      marginVertical: spacing.xs,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      color: colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '600',
    },
    subtitle: {
      color: colors.textTertiary,
      fontSize: 10,
    },
    criterionCard: {
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      padding: spacing.sm,
      gap: spacing.xs,
    },
    criterionTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    criterionNum: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    removeBtn: {
      padding: 4,
    },
    removeText: {
      color: colors.danger,
      fontSize: 12,
      fontWeight: '700',
    },
    inputRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    labelInput: {
      flex: 2,
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.sm,
      color: colors.textPrimary,
      paddingHorizontal: spacing.sm,
      paddingVertical: 5,
      fontSize: 12,
    },
    targetInput: {
      flex: 1.2,
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.sm,
      color: colors.textPrimary,
      paddingHorizontal: spacing.sm,
      paddingVertical: 5,
      fontSize: 12,
      textAlign: 'center',
    },
    unitInput: {
      flex: 1.2,
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.sm,
      color: colors.textPrimary,
      paddingHorizontal: spacing.sm,
      paddingVertical: 5,
      fontSize: 12,
      textAlign: 'center',
    },
    stepInput: {
      flex: 1,
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.sm,
      color: colors.textPrimary,
      paddingHorizontal: spacing.sm,
      paddingVertical: 5,
      fontSize: 12,
      textAlign: 'center',
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderRadius: radiuses.md,
      paddingVertical: spacing.sm,
    },
    addBtnText: {
      color: colors.primary,
      fontSize: typography.caption,
      fontWeight: '600',
    },
  });
