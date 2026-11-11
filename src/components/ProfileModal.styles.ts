/**
 * Laya (లయ) Mobile — Profile Modal Styles
 */

import { StyleSheet } from 'react-native';
import { radiuses, spacing, typography } from '../theme/tokens';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: radiuses.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '700',
  },
  closeIcon: {
    fontSize: 18,
    padding: 4,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radiuses.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radiuses.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  identityDetails: {
    flex: 1,
  },
  identityName: {
    fontSize: typography.subheading,
    fontWeight: '600',
  },
  identityId: {
    fontSize: typography.caption,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  field: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.caption,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: radiuses.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
  },
  readonlyInput: {
    opacity: 0.7,
  },
  oauthSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.xs,
  },
  sectionHeading: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radiuses.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  providerIcon: {
    fontSize: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: typography.caption + 1,
    fontWeight: '600',
  },
  providerDesc: {
    fontSize: 11,
  },
  activePill: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radiuses.full,
  },
  activePillText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '600',
  },
  linkPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radiuses.full,
  },
  linkPillText: {
    fontSize: 11,
  },
  statusSuccess: {
    color: '#4ADE80',
    fontSize: typography.caption,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
  },
  signOutBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  signOutText: {
    color: '#F87171',
    fontSize: typography.body,
    fontWeight: '600',
  },
  saveBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radiuses.md,
  },
  saveBtnText: {
    fontWeight: '600',
    fontSize: typography.body,
  },
});

