/**
 * Laya (లయ) Mobile — Navigation Drawer Styles (ADR-0011)
 */

import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';
import { ColorPalette, darkColors, radiuses, spacing, typography } from '../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 320);

export const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    overlay: { flex: 1, flexDirection: 'row' },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
    },
    drawer: {
      width: DRAWER_WIDTH,
      height: '100%',
      backgroundColor: colors.bgCard,
      borderRightWidth: 1,
      borderRightColor: colors.borderSubtle,
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 44,
      paddingBottom: 20,
    },
    drawerHeader: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    closeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    brandTitle: {
      fontSize: typography.brandTitle,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    brandNative: {
      color: colors.progress,
      fontSize: typography.heading,
      fontWeight: '600',
    },
    closeBtn: { padding: spacing.xs },
    closeText: { color: colors.textSecondary, fontSize: 18 },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.bgDark,
      padding: spacing.sm,
      borderRadius: radiuses.md,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: radiuses.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    userDetails: { flex: 1 },
    userName: { color: colors.textPrimary, fontSize: typography.body, fontWeight: '600' },
    userEmail: {
      color: colors.textTertiary,
      fontSize: 11,
    },
    userId: {
      color: colors.textTertiary,
      fontSize: 11,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    syncPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radiuses.full,
      alignSelf: 'flex-start',
      marginTop: spacing.xs,
    },
    syncDot: { width: 6, height: 6, borderRadius: radiuses.full },
    syncDotOnline: { backgroundColor: colors.done },
    syncDotOffline: { backgroundColor: colors.danger },
    syncLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '500' },
    scrollContent: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.sm },
    sectionLabel: {
      color: colors.textTertiary,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginTop: spacing.md,
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: spacing.sm,
      borderRadius: radiuses.md,
      marginBottom: 2,
    },
    navItemActive: { backgroundColor: colors.bgCardHover },
    navItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    navItemIcon: { fontSize: 16, width: 22, textAlign: 'center' },
    navItemText: { color: colors.textSecondary, fontSize: typography.body, fontWeight: '500' },
    navItemTextActive: { color: colors.textPrimary, fontWeight: '600' },
    countBadge: {
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.full,
      paddingHorizontal: 7,
      paddingVertical: 1,
    },
    countBadgeText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
    themeBadge: {
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.full,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    themeBadgeText: { color: colors.textPrimary, fontSize: 11, fontWeight: '600' },
    divider: { height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.sm },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
    },
    footerBrand: { color: colors.textTertiary, fontSize: 11, fontWeight: '600' },
    footerMotto: { color: colors.textTertiary, fontSize: 10, marginTop: 2 },
  });

export const styles = getStyles();
