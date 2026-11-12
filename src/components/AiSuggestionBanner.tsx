/**
 * Laya (లయ) Mobile — AI Chart Suggestion Banner
 * 1-Tap Opt-In Recommendations (ADR-0004)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';
import { ChartRecommendation } from '../services/ai-suggestions';

interface Props {
  recommendations: ChartRecommendation[];
  onPin: (rec: ChartRecommendation) => void;
}

export const AiSuggestionBanner: React.FC<Props> = ({ recommendations, onPin }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  if (recommendations.length === 0) return null;
  const top = recommendations[0];

  return (
    <View style={styles.banner}>
      <View style={styles.contentWrap}>
        <View style={styles.titleRow}>
          <Text style={styles.badge}>Suggested Visualization</Text>
          <Text style={styles.taskTitle}>{top.taskTitle}</Text>
        </View>
        <Text style={styles.reason}>{top.reason}</Text>
      </View>

      <TouchableOpacity
        style={styles.pinBtn}
        onPress={() => onPin(top)}
        activeOpacity={0.7}
      >
        <Text style={styles.pinBtnText}>+ Pin {top.label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    banner: {
      backgroundColor: colors.badgeBg,
      borderColor: colors.badgeBorder,
      borderWidth: 1,
      borderRadius: radiuses.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    contentWrap: { gap: 4 },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    badge: {
      color: colors.progress,
      fontSize: typography.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    taskTitle: {
      color: colors.textPrimary,
      fontSize: typography.subheading,
      fontWeight: '600',
    },
    reason: {
      color: colors.textSecondary,
      fontSize: typography.caption,
    },
    pinBtn: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.progress,
      borderRadius: radiuses.sm,
      paddingVertical: 6,
      alignItems: 'center',
    },
    pinBtnText: {
      color: colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '600',
    },
  });
