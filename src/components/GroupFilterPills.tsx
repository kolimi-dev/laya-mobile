/**
 * Laya (లయ) Mobile — Group Filter Pills
 * Minimalist Group Filter Bar (ADR-0005, ADR-0010)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';
import { UserGroup } from '../core/types';

interface Props {
  groups: UserGroup[];
  activeGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onManageGroups?: () => void;
}

export const GroupFilterPills: React.FC<Props> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  onManageGroups,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={[styles.pill, activeGroupId === null && styles.activePill]}
          onPress={() => onSelectGroup(null)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, activeGroupId === null && styles.activePillText]}>
            All Groups
          </Text>
        </TouchableOpacity>

        {groups.map((grp) => {
          const isActive = activeGroupId === grp.id;
          return (
            <TouchableOpacity
              key={grp.id}
              style={[styles.pill, isActive && styles.activePill]}
              onPress={() => onSelectGroup(grp.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.colorDot, { backgroundColor: grp.color }]} />
              <Text style={[styles.pillText, isActive && styles.activePillText]}>
                {grp.name}
              </Text>
            </TouchableOpacity>
          );
        })}

        {onManageGroups && (
          <TouchableOpacity
            style={[styles.pill, styles.managePill]}
            onPress={onManageGroups}
            activeOpacity={0.7}
          >
            <Text style={styles.managePillText}>⚙️ Groups</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: colors.bgDark,
      paddingVertical: spacing.sm,
    },
    container: {
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      gap: spacing.sm,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      gap: 6,
    },
    activePill: {
      backgroundColor: colors.bgActive,
      borderColor: colors.borderStrong,
    },
    colorDot: {
      width: 6,
      height: 6,
      borderRadius: radiuses.full,
    },
    pillText: {
      color: colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '500',
    },
    activePillText: {
      color: colors.textPrimary,
      fontWeight: '600',
    },
    managePill: {
      borderStyle: 'dashed',
      backgroundColor: colors.bgInput,
    },
    managePillText: {
      color: colors.textTertiary,
      fontSize: typography.caption,
      fontWeight: '600',
    },
  });
