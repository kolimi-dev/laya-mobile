/**
 * Laya (లయ) Mobile — Header Shell Bar
 * Matte Dark Branding, Operational Date & Night Owl Offset
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing, radiuses, typography } from '../theme/tokens';
import { OperationalDateInfo } from '../core/recurrence';

interface Props {
  opInfo: OperationalDateInfo;
  consistencyScore: number;
  isOnline: boolean;
  isSyncing?: boolean;
  onSyncPress?: () => void;
}

export const HeaderBar: React.FC<Props> = ({
  opInfo,
  consistencyScore,
  isOnline,
  isSyncing = false,
  onSyncPress,
}) => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formattedDate = `${dayNames[opInfo.dayOfWeek]}, ${monthNames[opInfo.month]} ${opInfo.dayOfMonth}`;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandWrap}>
          <Text style={styles.brandTitle}>Laya </Text>
          <Text style={styles.brandNative}>లయ</Text>
        </View>

        <View style={styles.statsWrap}>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{consistencyScore}% Consistency</Text>
          </View>

          <TouchableOpacity
            style={styles.syncButton}
            onPress={onSyncPress}
            activeOpacity={0.7}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <View style={[styles.networkDot, isOnline ? styles.onlineDot : styles.offlineDot]} />
            )}
            <Text style={styles.syncStatusText}>
              {isSyncing ? 'Syncing...' : isOnline ? 'Online' : 'Offline'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dateRow}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <View style={styles.nightOwlPill}>
          <Text style={styles.nightOwlText}>Night Owl: 03:00 AM</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgDark,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
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
  statsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreBadge: {
    backgroundColor: '#16222F',
    borderColor: '#243A4F',
    borderWidth: 1,
    borderRadius: radiuses.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  scoreText: {
    color: colors.progress,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radiuses.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    gap: 5,
  },
  syncStatusText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '500',
  },
  networkDot: {
    width: 7,
    height: 7,
    borderRadius: radiuses.full,
  },
  onlineDot: {
    backgroundColor: colors.done,
  },
  offlineDot: {
    backgroundColor: colors.danger,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: typography.subheading,
    fontWeight: '500',
  },
  nightOwlPill: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radiuses.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  nightOwlText: {
    color: colors.textTertiary,
    fontSize: typography.caption,
  },
});
