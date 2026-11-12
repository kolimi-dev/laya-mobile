/**
 * Laya (లయ) Mobile — Interactive Guide & Walkthrough Styles
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, radiuses, typography } from '../theme/tokens';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: colors.bgCard,
    borderRadius: radiuses.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stepIndicator: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeIcon: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  slideBody: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  slideIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radiuses.full,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  slideIcon: {
    fontSize: 32,
  },
  slideTitle: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  slideSubtitle: {
    color: colors.progress,
    fontSize: typography.caption,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideDescription: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pillItem: {
    backgroundColor: colors.bgDark,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radiuses.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  pillText: {
    color: colors.textTertiary,
    fontSize: typography.caption,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginVertical: spacing.md,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radiuses.full,
    backgroundColor: colors.borderSubtle,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.md,
  },
  navBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radiuses.md,
  },
  navBtnText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '500',
  },
  actionBtn: {
    backgroundColor: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radiuses.md,
  },
  actionBtnText: {
    color: colors.bgDark,
    fontSize: typography.body,
    fontWeight: '600',
  },
});
