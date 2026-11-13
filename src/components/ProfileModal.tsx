/**
 * Laya (లయ) Mobile — User Profile & OAuth Providers Modal (ADR-0010, ADR-0011)
 * Displays User ID, Email, Phone with Country Picker, and OAuth Providers
 */

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AuthService, AuthSession, UserProfile } from '../services/auth';
import { CountryCode, COUNTRY_CODES, DEFAULT_COUNTRY } from '../data/countryCodes';
import { CountryCodePickerModal } from './CountryCodePickerModal';
import { getStyles } from './ProfileModal.styles';

interface Props {
  visible: boolean;
  session: AuthSession | null;
  onClose: () => void;
  onLogout: () => void;
  onOpenGuide?: () => void;
  onSaveProfile?: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<Props> = ({
  visible,
  session,
  onClose,
  onLogout,
  onOpenGuide,
  onSaveProfile,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [name, setName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      AuthService.getStoredProfile().then((p) => {
        setName(p.name || '');
        const rawPhone = (p.phone || '').trim();
        if (rawPhone) {
          const matched = COUNTRY_CODES.find((c) => rawPhone.startsWith(c.dialCode));
          if (matched) {
            setSelectedCountry(matched);
            setPhoneDigits(rawPhone.slice(matched.dialCode.length).trim());
          } else {
            setSelectedCountry(DEFAULT_COUNTRY);
            setPhoneDigits(rawPhone);
          }
        } else {
          setSelectedCountry(DEFAULT_COUNTRY);
          setPhoneDigits('');
        }
        setStatusMsg(null);
      });
    }
  }, [visible]);

  const handleSave = async () => {
    const fullPhone = phoneDigits.trim() ? `${selectedCountry.dialCode} ${phoneDigits.trim()}` : '';
    const updated: UserProfile = { name: name.trim(), phone: fullPhone };
    await AuthService.saveProfile(updated);
    onSaveProfile?.(updated);
    setStatusMsg('Profile updated');
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const handleSignOut = async () => {
    await AuthService.logout();
    onClose();
    onLogout();
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
                <Text style={styles.identityName} numberOfLines={1}>
                  {name || (session ? email.split('@')[0] : 'Guest User')}
                </Text>
                <View style={styles.statusPillRow}>
                  <View style={session ? styles.verifiedPill : styles.offlinePill}>
                    <Text style={session ? styles.verifiedPillText : styles.offlinePillText}>
                      {session ? '✓ Kolimi ID Verified' : 'Local Offline Mode'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Alice"
                placeholderTextColor={colors.textTertiary}
              />
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

                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  value={phoneDigits}
                  onChangeText={setPhoneDigits}
                  placeholder="98765 43210"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.oauthSection}>
              <Text style={styles.sectionHeading}>Connected Accounts & OAuth</Text>
              <View style={styles.providerRow}>
                <Text style={styles.providerIcon}>🔑</Text>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>Kolimi ID</Text>
                  <Text style={styles.providerDesc}>Resend OTP (auth@kolimi.dev)</Text>
                </View>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>{session ? 'Connected' : 'Offline'}</Text>
                </View>
              </View>

              <View style={styles.providerRow}>
                <Text style={styles.providerIcon}>🌐</Text>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>Google Account</Text>
                  <Text style={styles.providerDesc}>Platform Single Sign-On</Text>
                </View>
                <View style={styles.comingSoonPill}>
                  <Text style={styles.comingSoonPillText}>Coming Soon (Beta)</Text>
                </View>
              </View>

              <View style={styles.providerRow}>
                <Text style={styles.providerIcon}>🐙</Text>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>GitHub Account</Text>
                  <Text style={styles.providerDesc}>Developer SSO & Keys</Text>
                </View>
                <View style={styles.comingSoonPill}>
                  <Text style={styles.comingSoonPillText}>Coming Soon (Beta)</Text>
                </View>
              </View>
            </View>

            <View style={[styles.oauthSection, { marginTop: 12 }]}>
              <Text style={styles.sectionHeading}>Help & Onboarding</Text>
              <TouchableOpacity
                style={styles.providerRow}
                onPress={() => { onClose(); onOpenGuide?.(); }}
                activeOpacity={0.7}
              >
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
