/**
 * Laya (లయ) Mobile — Header Shell Styles
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, radiuses, typography } from '../theme/tokens';

export const styles = StyleSheet.create({
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
    marginBottom: spacing.xs,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  actionsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionBtn: {
    backgroundColor: colors.bgCard,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radiuses.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  actionIconText: {
    fontSize: 13,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: radiuses.full,
  },
  onlineDot: {
    backgroundColor: colors.done,
  },
  offlineDot: {
    backgroundColor: colors.danger,
  },
  syncStatusText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  dateMetaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  scoreBadge: {
    backgroundColor: '#16222F',
    borderColor: '#243A4F',
    borderWidth: 1,
    borderRadius: radiuses.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
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
});
