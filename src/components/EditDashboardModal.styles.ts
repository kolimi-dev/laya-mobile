/**
 * Laya (లయ) Mobile — Edit Dashboard Modal Styles
 */

import { StyleSheet } from 'react-native';
import { ColorPalette, spacing, radiuses, typography } from '../theme/tokens';

export const getStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.md,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: radiuses.lg,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      width: '100%',
      maxWidth: 360,
      padding: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    headerTitle: {
      color: colors.textPrimary,
      fontSize: typography.heading,
      fontWeight: 'bold',
    },
    iconBtn: { padding: 4 },
    cancelText: { color: colors.textSecondary, fontSize: 16 },
    field: { marginBottom: spacing.md },
    label: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.md,
      color: colors.textPrimary,
      fontSize: 13,
      paddingHorizontal: spacing.sm,
      paddingVertical: 8,
    },
    iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    emojiBtn: {
      width: 36,
      height: 36,
      borderRadius: radiuses.md,
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emojiBtnActive: { borderColor: colors.primary, backgroundColor: colors.badgeBg },
    emojiText: { fontSize: 18 },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
    },
    deleteBtn: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: radiuses.md,
      backgroundColor: colors.bgDark,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    deleteBtnText: { color: colors.danger, fontSize: 12, fontWeight: '600' },
    rightActions: { flexDirection: 'row', gap: spacing.sm },
    secondaryBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radiuses.md, backgroundColor: colors.bgDark },
    secondaryBtnText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
    primaryBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radiuses.md, backgroundColor: colors.primary },
    primaryBtnDisabled: { opacity: 0.5 },
    primaryBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  });
