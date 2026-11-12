/**
 * Laya (లయ) Mobile — User Profile & OAuth Providers Modal
 * Displays User ID, Email, Phone, and Connected Identity Providers
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AuthService, AuthSession } from '../services/auth';
import { styles } from './ProfileModal.styles';

interface Props {
  visible: boolean;
  session: AuthSession | null;
  onClose: () => void;
  onLogout: () => void;
  onOpenGuide?: () => void;
}

export const ProfileModal: React.FC<Props> = ({
  visible,
  session,
  onClose,
  onLogout,
  onOpenGuide,
}) => {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      AuthService.getStoredProfile().then((p) => {
        setName(p.name || '');
        setPhone(p.phone || '');
        setStatusMsg(null);
      });
    }
  }, [visible]);

  const handleSave = async () => {
    await AuthService.saveProfile({ name: name.trim(), phone: phone.trim() });
    setStatusMsg('Profile updated');
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const handleSignOut = async () => {
    await AuthService.logout();
    onClose();
    onLogout();
  };

  const userId = session?.userId || 'usr_guest';
  const email = session?.email || 'guest@local.offline';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Kolimi ID Profile</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.closeIcon, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Identity Header */}
            <View style={[styles.identityCard, { backgroundColor: colors.bgDark, borderColor: colors.borderSubtle }]}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {name ? name[0].toUpperCase() : email[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.identityDetails}>
                <Text style={[styles.identityName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {name || (session ? email.split('@')[0] : 'Guest User')}
                </Text>
                <Text style={[styles.identityId, { color: colors.textTertiary }]}>{userId}</Text>
              </View>
            </View>

            {/* Inputs */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Display Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bgDark, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Alice"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
              <TextInput
                style={[styles.input, styles.readonlyInput, { backgroundColor: colors.bgDark, color: colors.textSecondary, borderColor: colors.borderSubtle }]}
                value={email}
                editable={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bgDark, color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
              />
            </View>

            {/* OAuth Providers Section */}
            <View style={[styles.oauthSection, { borderTopColor: colors.borderSubtle }]}>
              <Text style={[styles.sectionHeading, { color: colors.textTertiary }]}>Connected Accounts & OAuth</Text>

              <View style={[styles.providerRow, { backgroundColor: colors.bgDark, borderColor: colors.borderSubtle }]}>
                <Text style={styles.providerIcon}>🔑</Text>
                <View style={styles.providerInfo}>
                  <Text style={[styles.providerName, { color: colors.textPrimary }]}>Kolimi ID</Text>
                  <Text style={[styles.providerDesc, { color: colors.textTertiary }]}>Resend OTP (auth@kolimi.dev)</Text>
                </View>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>{session ? 'Connected' : 'Offline'}</Text>
                </View>
              </View>

              <View style={[styles.providerRow, { backgroundColor: colors.bgDark, borderColor: colors.borderSubtle }]}>
                <Text style={styles.providerIcon}>🌐</Text>
                <View style={styles.providerInfo}>
                  <Text style={[styles.providerName, { color: colors.textPrimary }]}>Google Account</Text>
                  <Text style={[styles.providerDesc, { color: colors.textTertiary }]}>Platform Single Sign-On</Text>
                </View>
                <View style={styles.linkPill}>
                  <Text style={[styles.linkPillText, { color: colors.textTertiary }]}>Link</Text>
                </View>
              </View>

              <View style={[styles.providerRow, { backgroundColor: colors.bgDark, borderColor: colors.borderSubtle }]}>
                <Text style={styles.providerIcon}>🐙</Text>
                <View style={styles.providerInfo}>
                  <Text style={[styles.providerName, { color: colors.textPrimary }]}>GitHub Account</Text>
                  <Text style={[styles.providerDesc, { color: colors.textTertiary }]}>Developer SSO & Keys</Text>
                </View>
                <View style={styles.linkPill}>
                  <Text style={[styles.linkPillText, { color: colors.textTertiary }]}>Link</Text>
                </View>
              </View>
            </View>

            {/* Guide & Tour Section (Universal App UX Standard) */}
            <View style={[styles.oauthSection, { borderTopColor: colors.borderSubtle, marginTop: 12 }]}>
              <Text style={[styles.sectionHeading, { color: colors.textTertiary }]}>Help & Onboarding</Text>
              <TouchableOpacity
                style={[styles.providerRow, { backgroundColor: colors.bgDark, borderColor: colors.borderSubtle }]}
                onPress={() => {
                  onClose();
                  onOpenGuide?.();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.providerIcon}>📖</Text>
                <View style={styles.providerInfo}>
                  <Text style={[styles.providerName, { color: colors.textPrimary }]}>App Tour & Guide</Text>
                  <Text style={[styles.providerDesc, { color: colors.textTertiary }]}>Learn flavors, rest exemptions & night owl</Text>
                </View>
              </TouchableOpacity>
            </View>

            {statusMsg && <Text style={styles.statusSuccess}>{statusMsg}</Text>}
          </ScrollView>

          {/* Action Footer */}
          <View style={[styles.footer, { borderTopColor: colors.borderSubtle }]}>
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.textPrimary }]} onPress={handleSave} activeOpacity={0.7}>
              <Text style={[styles.saveBtnText, { color: colors.bgDark }]}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
