/**
 * Laya (లయ) Mobile — Today's Tasks Screen Styles
 */

import { StyleSheet } from 'react-native';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';

export const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: { paddingBottom: spacing.xxl },
    bucketHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    bucketTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    bucketDot: { width: 8, height: 8, borderRadius: radiuses.full },
    bucketTitle: { color: colors.textSecondary, fontSize: typography.subheading, fontWeight: '600' },
    reorderToggleBtn: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radiuses.sm,
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    reorderToggleBtnActive: {
      backgroundColor: colors.bgActive,
      borderColor: colors.primary,
    },
    reorderToggleText: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: '600',
    },
    reorderToggleTextActive: {
      color: colors.primary,
    },
    reorderCardWrap: {
      position: 'relative',
      marginBottom: spacing.xs,
    },
    reorderOverlayRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.xs,
      marginBottom: 2,
    },
    reorderBtn: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radiuses.sm,
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    reorderBtnText: {
      color: colors.textPrimary,
      fontSize: 11,
      fontWeight: 'bold',
    },
    completedSection: {
      marginTop: spacing.lg,
      paddingTop: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
    },
    accordionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 48,
      paddingVertical: spacing.xs,
      marginBottom: spacing.xs,
    },
    accordionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    accordionIcon: {
      color: colors.textTertiary,
      fontSize: 18,
      fontWeight: '700',
      paddingHorizontal: spacing.xs,
    },
    emptyCard: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.lg,
      padding: spacing.xl,
      alignItems: 'center',
      gap: 4,
    },
    emptyTitle: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '600' },
    emptySubtext: { color: colors.textTertiary, fontSize: typography.body },
    celebrationCard: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.lg,
      padding: spacing.lg,
      alignItems: 'center',
      gap: 4,
      marginBottom: spacing.sm,
    },
    celebrationEmoji: { fontSize: 28 },
    celebrationTitle: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700' },
    celebrationSubtext: { color: colors.textSecondary, fontSize: typography.body, textAlign: 'center' },
    feedbackCard: {
      marginTop: spacing.xl,
      padding: spacing.md,
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    feedbackTextWrap: { flex: 1, gap: 2 },
    feedbackTitle: { color: colors.textPrimary, fontSize: 11, fontWeight: '700' },
    feedbackSubtext: { color: colors.textTertiary, fontSize: 10 },
    feedbackActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginLeft: spacing.sm },
    feedbackBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radiuses.sm,
    },
    feedbackBtnText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
    feedbackCloseText: { color: colors.textTertiary, fontSize: 14 },
  });

