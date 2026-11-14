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

export type AppView = 'tasks' | 'charts' | 'all_habits' | 'not_active' | 'trash';

export interface NavigationDrawerProps {
  visible: boolean;
  onClose: () => void;
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  session: AuthSession | null;
  profileName?: string;
  isOnline: boolean;
  isSyncing: boolean;
  onSyncPress: () => void;
  remainingTasksCount: number;
  pinnedChartsCount: number;
  allHabitsCount?: number;
  notActiveCount?: number;
  trashCount?: number;
  onOpenGuide: () => void;
  onOpenProfile: () => void;
  onOpenFeedback?: () => void;
  onOpenManageGroups?: () => void;
  updateAvailableVersion?: string | null;
  onTriggerUpdate?: () => void;
  onOpenPrivacy?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  visible,
  onClose,
  activeView,
  onSelectView,
  session,
  profileName,
  isOnline,
  isSyncing,
  onSyncPress,
  remainingTasksCount,
  pinnedChartsCount,
  allHabitsCount,
  notActiveCount,
  trashCount,
  onOpenGuide,
  onOpenProfile,
  onOpenFeedback,
  onOpenManageGroups,
  updateAvailableVersion,
  onTriggerUpdate,
  onOpenPrivacy,
}) => {
  const { colors, theme, toggleTheme } = useTheme();
  const styles = getStyles(colors);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    if (visible) Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  }, [visible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 180, useNativeDriver: true })
      .start(() => onClose());
  };

  const handleSupport = () => {
    Alert.alert('Support Kolimi', 'Kolimi apps are 100% free, private, and ad-free.\n\nSponsor open infrastructure on GitHub Sponsors.', [
      { text: 'GitHub Sponsors', onPress: () => Linking.openURL('https://github.com/sponsors/kolimi') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleFeedback = () => {
    if (onOpenFeedback) { handleClose(); onOpenFeedback(); return; }
    Alert.alert('Share Feedback', 'Diagnostics & ideas go directly to feedback@kolimi.dev', [
      { text: 'Email Developer', onPress: () => Linking.openURL('mailto:feedback@kolimi.dev?subject=Laya%20Feedback') },
      { text: 'Close', style: 'cancel' },
    ]);
  };

  const email = session?.email || 'guest@offline.local';
  const displayName = profileName?.trim() || (session ? email.split('@')[0] : 'Guest (Offline)');
  const nameInitial = displayName ? displayName[0].toUpperCase() : 'G';
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
                <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>{session ? email : 'Local Offline Mode'}</Text>
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
            {updateAvailableVersion ? (
              <TouchableOpacity
                style={styles.updatePill}
                onPress={() => { handleClose(); onTriggerUpdate?.(); }}
                activeOpacity={0.8}
              >
                <Text style={styles.updateIcon}>🚀</Text>
                <View style={styles.updateDetails}>
                  <Text style={styles.updateTitle}>Update to v{updateAvailableVersion} Available</Text>
                  <Text style={styles.updateSubtitle}>Tap to download standalone APK</Text>
                </View>
                <Text style={styles.updateChevron}>›</Text>
              </TouchableOpacity>
            ) : null}

            <Text style={styles.sectionLabel}>Rhythm & Habits</Text>
            <DrawerNavItem
              icon="📋"
              label="Today's Rhythm"
              isActive={activeView === 'tasks'}
              badge={remainingTasksCount}
              onPress={() => { handleClose(); onSelectView('tasks'); }}
            />
            <DrawerNavItem
              icon="🗂️"
              label="All Habits Catalog"
              isActive={activeView === 'all_habits'}
              badge={allHabitsCount}
              onPress={() => { handleClose(); onSelectView('all_habits'); }}
            />
            <DrawerNavItem
              icon="📊"
              label="Dashboards & Insights"
              isActive={activeView === 'charts'}
              badge={pinnedChartsCount}
              onPress={() => { handleClose(); onSelectView('charts'); }}
            />
            <DrawerNavItem
              icon="🗄️"
              label="Not Active Habits"
              isActive={activeView === 'not_active'}
              badge={notActiveCount}
              onPress={() => { handleClose(); onSelectView('not_active'); }}
            />
            <DrawerNavItem
              icon="🗑️"
              label="Trash & Recycle Bin"
              isActive={activeView === 'trash'}
              badge={trashCount}
              onPress={() => { handleClose(); onSelectView('trash'); }}
            />

            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Utilities & Preferences</Text>
            {onOpenManageGroups ? (
              <DrawerNavItem icon="📁" label="Manage Groups" onPress={() => { handleClose(); onOpenManageGroups(); }} />
            ) : null}
            <DrawerNavItem icon="📖" label="App Tour & Guide" onPress={() => { handleClose(); onOpenGuide(); }} />
            <DrawerNavItem icon="💬" label="Share Feedback" onPress={handleFeedback} />
            <DrawerNavItem icon="❤️" label="Support Kolimi" onPress={handleSupport} />
            <DrawerNavItem
              icon={theme === 'dark' ? '🌙' : '☀️'}
              label="Appearance"
              badge={theme === 'dark' ? 'Dark' : 'Light'}
              onPress={toggleTheme}
            />
            <DrawerNavItem
              icon="⏰"
              label="Day Rollover"
              badge="03:00 AM"
              onPress={() => Alert.alert('Day Rollover (03:00 AM)', 'Resets at 03:00 AM so evening habits never reset prematurely.')}
            />
            <DrawerNavItem icon="🛡️" label="Privacy & Ethics" onPress={() => { handleClose(); onOpenPrivacy?.(); }} />
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
