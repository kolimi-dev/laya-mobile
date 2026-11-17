/**
 * Laya (లయ) Mobile — User Profile & OAuth Providers Modal (ADR-0010, ADR-0011)
 * Displays User ID, Email, Phone with Country Picker, Sleeping Time, and EOD Notification Settings
 */

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AuthService, AuthSession, UserProfile } from '../services/auth';
import { NotificationService } from '../services/notifications';
import { CountryCode, COUNTRY_CODES, DEFAULT_COUNTRY } from '../data/countryCodes';
import { CountryCodePickerModal } from './CountryCodePickerModal';
import { getStyles } from './ProfileModal.styles';

const PROVIDERS = [
  { icon: '🔑', name: 'Kolimi ID', desc: 'Resend OTP (auth@kolimi.dev)', live: true },
  { icon: '🌐', name: 'Google Account', desc: 'Platform Single Sign-On', live: false },
  { icon: '🐙', name: 'GitHub Account', desc: 'Developer SSO & Keys', live: false },
];
const PRESET_TIMES = [
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
  { label: '10:00 PM', value: '22:00' },
  { label: '11:00 PM', value: '23:00' },
];

interface Props {
  visible: boolean;
  session: AuthSession | null;
  onClose: () => void;
  onLogout: () => void;
  onOpenGuide?: () => void;
  onSaveProfile?: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<Props> = ({
  visible, session, onClose, onLogout, onOpenGuide, onSaveProfile,
}) => {
  const { colors } = useTheme(), styles = getStyles(colors);
  const [name, setName] = useState(''), [phoneDigits, setPhoneDigits] = useState('');
  const [sleepingTime, setSleepingTime] = useState('20:00'), [eodNotificationsEnabled, setEodNotificationsEnabled] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [pickerVisible, setPickerVisible] = useState(false), [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      AuthService.getStoredProfile().then((p) => {
        setName(p.name || '');
        setSleepingTime(p.sleepingTime || '20:00');
        setEodNotificationsEnabled(p.eodNotificationsEnabled ?? true);
        const raw = (p.phone || '').trim();
        const matched = raw ? COUNTRY_CODES.find((c) => raw.startsWith(c.dialCode)) : null;
        setSelectedCountry(matched || DEFAULT_COUNTRY);
        setPhoneDigits(matched ? raw.slice(matched.dialCode.length).trim() : raw);
        setStatusMsg(null);
      });
    }
  }, [visible]);

  const handleSave = async () => {
    const fullPhone = phoneDigits.trim() ? `${selectedCountry.dialCode} ${phoneDigits.trim()}` : '';
    const updated: UserProfile = { name: name.trim(), phone: fullPhone, sleepingTime: sleepingTime.trim() || '20:00', eodNotificationsEnabled };
    await AuthService.saveProfile(updated);
    await NotificationService.scheduleEodReviewReminder(updated.sleepingTime || '20:00', updated.eodNotificationsEnabled ?? true);
    onSaveProfile?.(updated);
    setStatusMsg('Profile updated');
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await AuthService.logout(); onClose(); onLogout(); } },
    ]);
  };

  const email = session?.email || 'guest@local.offline';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Kolimi ID Profile</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.identityCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{name ? name[0].toUpperCase() : email[0].toUpperCase()}</Text>
              </View>
              <View style={styles.identityDetails}>
                <Text style={styles.identityName} numberOfLines={1}>{name || (session ? email.split('@')[0] : 'Guest User')}</Text>
                <View style={styles.statusPillRow}>
                  <View style={session ? styles.verifiedPill : styles.offlinePill}>
                    <Text style={session ? styles.verifiedPillText : styles.offlinePillText}>{session ? '✓ Kolimi ID Verified' : 'Local Offline Mode'}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Alice" placeholderTextColor={colors.textTertiary} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={[styles.input, styles.readonlyInput]} value={email} editable={false} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneRow}>
                <TouchableOpacity style={styles.countryBtn} onPress={() => setPickerVisible(true)} activeOpacity={0.7}>
                  <Text style={styles.flag}>{selectedCountry.flag}</Text>
                  <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
                  <Text style={styles.chevron}>▾</Text>
                </TouchableOpacity>
                <TextInput style={[styles.input, styles.phoneInput]} value={phoneDigits} onChangeText={setPhoneDigits} placeholder="98765 43210" placeholderTextColor={colors.textTertiary} keyboardType="phone-pad" />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Sleeping Time (Default: 8:00 PM / 20:00)</Text>
              <TextInput style={styles.input} value={sleepingTime} onChangeText={setSleepingTime} placeholder="20:00" placeholderTextColor={colors.textTertiary} />
              <View style={styles.timePresetRow}>
                {PRESET_TIMES.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.timePresetPill, sleepingTime === item.value && styles.timePresetPillActive]}
                    onPress={() => setSleepingTime(item.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.timePresetText, sleepingTime === item.value && styles.timePresetTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.settingToggleRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.settingToggleLabel}>🌙 Evening Rhythm Review</Text>
                  <Text style={styles.settingToggleDesc}>Offline notification at sleeping time to wind down</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggleSwitch, eodNotificationsEnabled && styles.toggleSwitchActive]}
                  onPress={() => setEodNotificationsEnabled(!eodNotificationsEnabled)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.toggleSwitchText, eodNotificationsEnabled && styles.toggleSwitchTextActive]}>
                    {eodNotificationsEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.oauthSection}>
              <Text style={styles.sectionHeading}>Connected Accounts & OAuth</Text>
              {PROVIDERS.map((p) => (
                <View key={p.name} style={styles.providerRow}>
                  <Text style={styles.providerIcon}>{p.icon}</Text>
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{p.name}</Text>
                    <Text style={styles.providerDesc}>{p.desc}</Text>
                  </View>
                  <View style={p.live && session ? styles.activePill : styles.comingSoonPill}>
                    <Text style={p.live && session ? styles.activePillText : styles.comingSoonPillText}>
                      {p.live ? (session ? 'Connected' : 'Offline') : 'Coming Soon'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.oauthSection, { marginTop: 12 }]}>
              <Text style={styles.sectionHeading}>Help & Onboarding</Text>
              <TouchableOpacity style={styles.providerRow} onPress={() => { onClose(); onOpenGuide?.(); }} activeOpacity={0.7}>
                <Text style={styles.providerIcon}>📖</Text>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>App Tour & Guide</Text>
                  <Text style={styles.providerDesc}>Learn flavors, rest exemptions & night owl</Text>
                </View>
              </TouchableOpacity>
            </View>

            {statusMsg && <Text style={styles.statusSuccess}>{statusMsg}</Text>}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.7}>
              <Text style={styles.saveBtnText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <CountryCodePickerModal
        visible={pickerVisible}
        selectedDialCode={selectedCountry.dialCode}
        onSelect={setSelectedCountry}
        onClose={() => setPickerVisible(false)}
      />
    </Modal>
  );
};
