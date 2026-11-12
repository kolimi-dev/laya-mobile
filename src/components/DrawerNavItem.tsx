/**
 * Laya (లయ) Mobile — Navigation Drawer Nav Item Component
 */

import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getStyles } from './NavigationDrawer.styles';

interface Props {
  icon: string;
  label: string;
  isActive?: boolean;
  badge?: string | number;
  onPress: () => void;
}

export const DrawerNavItem: React.FC<Props> = ({
  icon,
  label,
  isActive = false,
  badge,
  onPress,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.navItem, isActive && styles.navItemActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.navItemLeft}>
        <Text style={styles.navItemIcon}>{icon}</Text>
        <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
          {label}
        </Text>
      </View>
      {badge !== undefined && (
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
