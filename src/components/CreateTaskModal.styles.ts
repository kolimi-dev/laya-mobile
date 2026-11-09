/**
 * Laya (లయ) Mobile — CreateTaskModal Styles
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, radiuses, typography } from '../theme/tokens';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radiuses.lg,
    maxHeight: '85%',
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: '700',
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
  field: {
    marginBottom: spacing.md,
    gap: 6,
  },
  rowField: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radiuses.sm,
    color: colors.textPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    fontSize: typography.body,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  selectPill: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radiuses.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  selectPillActive: {
    backgroundColor: '#27272A',
    borderColor: '#3F3F46',
  },
  selectText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  selectTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },
  delBtn: {
    padding: 6,
  },
  delText: {
    color: colors.danger,
    fontSize: 14,
  },
  addBtn: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderStyle: 'dashed',
    borderRadius: radiuses.sm,
    padding: spacing.xs,
    alignItems: 'center',
    marginTop: 4,
  },
  addText: {
    color: colors.progress,
    fontSize: typography.caption,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
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
  submitText: {
    color: colors.bgDark,
    fontSize: typography.body,
    fontWeight: '600',
  },
});

