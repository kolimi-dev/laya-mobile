/**
 * Laya (లయ) Mobile — Header Shell Bar (ADR-0011)
 * Pristine Top Bar: Hamburger Menu, Laya Branding, Guilt-Free Rhythm Badge
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { OperationalDateInfo } from '../core/recurrence';
import { getStyles } from './HeaderBar.styles';

interface Props {
  opInfo: OperationalDateInfo;
  consistencyScore: number;
  onMenuPress: () => void;
}

export const HeaderBar: React.FC<Props> = ({
  opInfo,
  consistencyScore,
  onMenuPress,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formattedDate = `${dayNames[opInfo.dayOfWeek]}, ${monthNames[opInfo.month]} ${opInfo.dayOfMonth}`;
  const isRhythmActive = consistencyScore > 0;
  const rhythmText = isRhythmActive ? `${consistencyScore}% Rhythm` : 'Ready today';

  return (
    <View style={styles.container}>
      {/* Pristine Top Bar: ☰ Menu on Left, Brand in Center, Rhythm Badge on Right */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={onMenuPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Open navigation menu"
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <View style={styles.brandWrap}>
          <Text style={styles.brandTitle}>Laya</Text>
          <Text style={styles.brandNative}>లయ</Text>
        </View>

        <View style={[styles.scoreBadge, isRhythmActive && styles.scoreBadgeActive]}>
          <Text style={[styles.scoreText, isRhythmActive && styles.scoreTextActive]}>
            {rhythmText}
          </Text>
        </View>
      </View>

      {/* Sub-row: Operational Date */}
      <View style={styles.dateRow}>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
    </View>
  );
};
