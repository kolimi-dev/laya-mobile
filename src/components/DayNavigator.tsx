/**
 * Laya (లయ) Mobile — Day Navigator & Retroactive Check-in Header (ADR-0015, V2.1)
 * Allows stepping into past days with philosophical grounding or previewing upcoming horizons.
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { OperationalDateInfo } from '../core/recurrence';
import { getStyles } from './DayNavigator.styles';

export type HorizonMode = 'day' | 'upcoming';

interface Props {
  currentOffset: number; // 0 for today, -1 for yesterday, -2 for day before
  opInfo: OperationalDateInfo;
  horizonMode: HorizonMode;
  onSelectOffset: (offset: number) => void;
  onToggleHorizon: (mode: HorizonMode) => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DayNavigator: React.FC<Props> = ({
  currentOffset,
  opInfo,
  horizonMode,
  onSelectOffset,
  onToggleHorizon,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const displayDate = useMemo(() => {
    const dayStr = DAY_NAMES[opInfo.dayOfWeek];
    const monthStr = MONTH_NAMES[opInfo.month];
    if (currentOffset === 0) return `Today (${dayStr}, ${monthStr} ${opInfo.dayOfMonth})`;
    if (currentOffset === -1) return `Yesterday (${dayStr}, ${monthStr} ${opInfo.dayOfMonth})`;
    return `${dayStr}, ${monthStr} ${opInfo.dayOfMonth}`;
  }, [currentOffset, opInfo]);

  const philosophicalQuote = useMemo(() => {
    if (currentOffset === -1) {
      return '"You can change your records, but not your past. Forgive yesterday; breathe today."';
    }
    if (currentOffset < -1) {
      return '"We can record what was done, but only live what is now."';
    }
    return null;
  }, [currentOffset]);

  const canGoForward = currentOffset < 0;
  const canGoBack = currentOffset > -14;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Left: Stepper Navigation */}
        <View style={styles.stepperWrap}>
          <TouchableOpacity
            style={[styles.navArrowBtn, !canGoBack && styles.navArrowDisabled]}
            disabled={!canGoBack}
            onPress={() => {
              if (horizonMode === 'upcoming') onToggleHorizon('day');
              onSelectOffset(currentOffset - 1);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.navArrowText}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateDisplay}
            onPress={() => {
              if (horizonMode === 'upcoming') onToggleHorizon('day');
              else if (currentOffset !== 0) onSelectOffset(0);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.dateMainLabel}>
              {horizonMode === 'upcoming' ? 'Upcoming Horizon (5d)' : displayDate}
            </Text>
            <Text style={styles.dateSubLabel}>
              {horizonMode === 'upcoming'
                ? 'Future cadences without pressure'
                : currentOffset === 0
                ? 'Active Daily Rhythm'
                : `${Math.abs(currentOffset)} day${Math.abs(currentOffset) > 1 ? 's' : ''} ago • Retroactive Logging`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navArrowBtn, !canGoForward && styles.navArrowDisabled]}
            disabled={!canGoForward}
            onPress={() => {
              if (horizonMode === 'upcoming') onToggleHorizon('day');
              onSelectOffset(currentOffset + 1);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.navArrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Right: Horizon & Jump to Today Pills */}
        <View style={styles.horizonPills}>
          {currentOffset !== 0 && horizonMode === 'day' ? (
            <TouchableOpacity style={styles.jumpTodayBtn} onPress={() => onSelectOffset(0)}>
              <Text style={styles.jumpTodayText}>Today ⤶</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.horizonBtn, horizonMode === 'upcoming' && styles.horizonBtnActive]}
              onPress={() => onToggleHorizon(horizonMode === 'upcoming' ? 'day' : 'upcoming')}
              activeOpacity={0.7}
            >
              <Text style={[styles.horizonBtnText, horizonMode === 'upcoming' && styles.horizonBtnTextActive]}>
                {horizonMode === 'upcoming' ? '← Today' : 'Upcoming (5d) 🔭'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Philosophical Retroactive Quote Banner */}
      {philosophicalQuote && horizonMode === 'day' && (
        <View style={styles.philosophicalCard}>
          <Text style={styles.philosophicalText}>{philosophicalQuote}</Text>
        </View>
      )}
    </View>
  );
};
