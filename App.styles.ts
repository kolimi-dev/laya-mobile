/**
 * Laya (లయ) Mobile — Root App Styles
 */

import { StyleSheet, Platform, StatusBar } from 'react-native';
import { colors, spacing, radiuses, typography } from './src/theme/tokens';

export const styles = StyleSheet.create({
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
  viewSwitchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgDark,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: radiuses.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 2,
  },
  segmentBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radiuses.sm,
  },
  segmentBtnActive: {
    backgroundColor: '#27272A',
  },
  segmentText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  addBtn: {
    backgroundColor: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radiuses.md,
  },
  addBtnText: {
    color: colors.bgDark,
    fontSize: typography.body,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});

