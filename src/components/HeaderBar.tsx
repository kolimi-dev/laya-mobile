/**
 * Laya (లయ) Mobile — Header Shell Bar
 * Matte Dark Branding, Operational Date & Night Owl Offset
 */

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme/tokens';
import { useTheme } from '../theme/ThemeContext';
import { OperationalDateInfo } from '../core/recurrence';
import { styles } from './HeaderBar.styles';

interface Props {
  opInfo: OperationalDateInfo;
  consistencyScore: number;
  isOnline: boolean;
  isSyncing?: boolean;
  onSyncPress?: () => void;
  onProfilePress?: () => void;
  onGuidePress?: () => void;
}

export const HeaderBar: React.FC<Props> = ({
  opInfo,
  consistencyScore,
  isOnline,
  isSyncing = false,
  onSyncPress,
  onProfilePress,
  onGuidePress,
}) => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formattedDate = `${dayNames[opInfo.dayOfWeek]}, ${monthNames[opInfo.month]} ${opInfo.dayOfMonth}`;
  const { theme, toggleTheme } = useTheme();

  const isRhythmActive = consistencyScore > 0;
  const rhythmText = isRhythmActive ? `${consistencyScore}% Rhythm` : 'Ready today';

  return (
    <View style={styles.container}>
      {/* Top Bar: Branding on Left, Mobile Action Icons on Right */}
      <View style={styles.topRow}>
        <View style={styles.brandWrap}>
          <Text style={styles.brandTitle}>Laya</Text>
          <Text style={styles.brandNative}>లయ</Text>
        </View>

        <View style={styles.actionsWrap}>
          {/* 1. Sync & Network Connectivity */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onSyncPress}
            activeOpacity={0.7}
            disabled={isSyncing}
            accessibilityLabel="Sync status"
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

          {/* 2. Walkthrough & Guide Button (Universal App UX Standard) */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onGuidePress}
            activeOpacity={0.7}
            accessibilityLabel="Open feature guide"
          >
            <Text style={styles.actionIconText}>📖</Text>
          </TouchableOpacity>

          {/* 3. Theme Toggle */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={toggleTheme}
            activeOpacity={0.7}
            accessibilityLabel="Toggle dark/light theme"
          >
            <Text style={styles.actionIconText}>{theme === 'dark' ? '🌙' : '☀️'}</Text>
          </TouchableOpacity>

          {/* 4. Profile & Identity */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onProfilePress}
            activeOpacity={0.7}
            accessibilityLabel="Open user profile"
          >
            <Text style={styles.actionIconText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub-row: Operational Date, Night Owl, and Guilt-Free Rhythm Badge */}
      <View style={styles.dateRow}>
        <View style={styles.dateMetaWrap}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <View style={styles.nightOwlPill}>
            <Text style={styles.nightOwlText}>Night Owl: 03:00 AM</Text>
          </View>
        </View>

        <View style={[styles.scoreBadge, isRhythmActive && styles.scoreBadgeActive]}>
          <Text style={[styles.scoreText, isRhythmActive && styles.scoreTextActive]}>
            {rhythmText}
          </Text>
        </View>
      </View>
    </View>
  );
};
