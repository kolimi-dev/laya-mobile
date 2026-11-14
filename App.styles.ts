/**
 * Laya (లయ) Mobile — Root App Styles (ADR-0010, ADR-0011, ADR-0015)
 */

import { StyleSheet, Platform, StatusBar } from 'react-native';
import { ColorPalette, darkColors, spacing, radiuses, typography } from './src/theme/tokens';

export const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bgDark,
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0,
    },
    center: {
      flex: 1,
      backgroundColor: colors.bgDark,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgDark,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
    },
    addHabitBtn: {
      backgroundColor: colors.textPrimary,
      paddingHorizontal: spacing.md,
      paddingVertical: 7,
      borderRadius: radiuses.md,
      marginLeft: spacing.xs,
    },
    addHabitText: {
      color: colors.bgDark,
      fontSize: typography.caption,
      fontWeight: '700',
    },
    backToTasksBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      backgroundColor: colors.bgDark,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    backToTasksText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
  });

export const styles = getStyles();
