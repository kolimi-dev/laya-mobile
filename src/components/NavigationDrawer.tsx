/**
 * Laya (లయ) Mobile — Universal Navigation Drawer (ADR-0011)
 * Clean Hub for Navigation, Profile, Theme, Life Cycle & Support
 */

import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AuthSession } from '../services/auth';
import { getStyles, DRAWER_WIDTH } from './NavigationDrawer.styles';
import { DrawerNavItem } from './DrawerNavItem';

export interface NavigationDrawerProps {
  visible: boolean;
  onClose: () => void;
  activeView: 'tasks' | 'charts';
  onSelectView: (view: 'tasks' | 'charts') => void;
  session: AuthSession | null;
  isOnline: boolean;
  isSyncing: boolean;
  onSyncPress: () => void;
  remainingTasksCount: number;
  pinnedChartsCount: number;
  onOpenGuide: () => void;
  onOpenProfile: () => void;
  onOpenNotActive?: () => void;
  onOpenTrash?: () => void;
  onOpenFeedback?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  visible,
  onClose,
  activeView,
  onSelectView,
  session,
  isOnline,
  isSyncing,
  onSyncPress,
  remainingTasksCount,
  pinnedChartsCount,
  onOpenGuide,
  onOpenProfile,
  onOpenNotActive,
  onOpenTrash,
  onOpenFeedback,
}) => {
  const { colors, theme, toggleTheme } = useTheme();
  const styles = getStyles(colors);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 180, useNativeDriver: true })
      .start(() => onClose());
  };

  const handleSupport = () => {
    Alert.alert(
      'Support Kolimi',
      'Kolimi apps are 100% free, private, and ad-free.\n\nSponsor open infrastructure on GitHub Sponsors.',
      [
        { text: 'GitHub Sponsors', onPress: () => Linking.openURL('https://github.com/sponsors/kolimi') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleFeedback = () => {
    if (onOpenFeedback) {
      handleClose();
      onOpenFeedback();
    } else {
      Alert.alert('Share Feedback', 'Diagnostics & ideas go directly to feedback@kolimi.dev', [
        { text: 'Email Developer', onPress: () => Linking.openURL('mailto:feedback@kolimi.dev?subject=Laya%20Feedback') },
        { text: 'Close', style: 'cancel' },
      ]);
    }
  };

  const handleNotActive = () => {
    if (onOpenNotActive) {
      handleClose();
      onOpenNotActive();
    } else {
      Alert.alert('Not Active Habits', 'Preserves completed & paused routines with 1-tap reactivate. (Phase 4)', [{ text: 'OK' }]);
    }
  };

  const handleTrash = () => {
    if (onOpenTrash) {
      handleClose();
      onOpenTrash();
    } else {
      Alert.alert('Trash & Recycle Bin', 'Soft-deleted habits stay safe with a 30-day countdown and 1-tap restore. (Phase 4)', [{ text: 'OK' }]);
    }
  };

  const email = session?.email || 'guest@offline.local';
  const nameInitial = session?.email ? session.email[0].toUpperCase() : 'G';
  const userId = session?.userId || 'usr_guest';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.drawerHeader}>
            <View style={styles.closeRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.brandTitle}>Laya</Text>
                <Text style={styles.brandNative}>లయ</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.userCard} onPress={() => { handleClose(); onOpenProfile(); }} activeOpacity={0.8}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{nameInitial}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName} numberOfLines={1}>{session ? email.split('@')[0] : 'Guest (Offline)'}</Text>
                <Text style={styles.userId} numberOfLines={1}>{userId}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.syncPill} onPress={onSyncPress} activeOpacity={0.7} disabled={isSyncing}>
              {isSyncing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <View style={[styles.syncDot, isOnline ? styles.syncDotOnline : styles.syncDotOffline]} />
              )}
              <Text style={styles.syncLabel}>{isSyncing ? 'Syncing...' : isOnline ? 'Online Sync' : 'Offline Mode'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Rhythm & Habits</Text>
            <DrawerNavItem
              icon="📋"
              label="Today's Rhythm"
              isActive={activeView === 'tasks'}
              badge={remainingTasksCount}
              onPress={() => { handleClose(); onSelectView('tasks'); }}
            />
            <DrawerNavItem
              icon="📊"
              label="Dashboards & Insights"
              isActive={activeView === 'charts'}
              badge={pinnedChartsCount}
              onPress={() => { handleClose(); onSelectView('charts'); }}
            />
            <DrawerNavItem icon="🗄️" label="Not Active Habits" onPress={handleNotActive} />
            <DrawerNavItem icon="🗑️" label="Trash & Recycle Bin" onPress={handleTrash} />

            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Utilities & Preferences</Text>
            <DrawerNavItem icon="📖" label="App Tour & Guide" onPress={() => { handleClose(); onOpenGuide(); }} />
            <DrawerNavItem icon="💬" label="Share Feedback" onPress={handleFeedback} />
            <DrawerNavItem icon="❤️" label="Support Kolimi" onPress={handleSupport} />
            <DrawerNavItem
              icon={theme === 'dark' ? '🌙' : '☀️'}
              label="Appearance"
              badge={theme === 'dark' ? 'Dark' : 'Light'}
              onPress={toggleTheme}
            />
            <DrawerNavItem icon="⚙️" label="Kolimi ID Profile" onPress={() => { handleClose(); onOpenProfile(); }} />
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerBrand}>Laya (లయ) • Kolimi Studio</Text>
            <Text style={styles.footerMotto}>Natural Cadence • Guilt-Free</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
