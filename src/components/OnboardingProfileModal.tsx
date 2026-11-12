/**
 * Laya (లయ) Mobile — Post-Login Profile Onboarding Modal (Phase 6)
 * Collects Display Name (required) & Phone with Searchable Country Code (optional)
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { CountryCode, DEFAULT_COUNTRY } from '../data/countryCodes';
import { CountryCodePickerModal } from './CountryCodePickerModal';
import { getStyles } from './OnboardingProfileModal.styles';

interface Props {
  visible: boolean;
  initialEmail?: string;
  onComplete: (name: string, phone: string) => void;
  onSkip: () => void;
}

export const OnboardingProfileModal: React.FC<Props> = ({
  visible,
  initialEmail,
  onComplete,
  onSkip,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [name, setName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Please enter your name to continue');
      return;
    }
    setError(null);
    const fullPhone = phoneDigits.trim() ? `${selectedCountry.dialCode} ${phoneDigits.trim()}` : '';
    onComplete(name.trim(), fullPhone);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>✨</Text>
          </View>

          <Text style={styles.brandTitle}>
            Welcome to Laya <Text style={styles.brandNative}>లయ</Text>
          </Text>
          <Text style={styles.subtitle}>
            Personalize your identity for guilt-free daily rhythm
          </Text>

          {initialEmail && (
            <View style={styles.emailPill}>
              <Text style={styles.emailText}>Signed in as {initialEmail}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>
              Display Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alice"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={(t) => { setName(t); if (error) setError(null); }}
              autoCapitalize="words"
              autoFocus
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone Number (Optional)</Text>
            <View style={styles.phoneRow}>
              <TouchableOpacity
                style={styles.countryBtn}
                onPress={() => setPickerVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.flag}>{selectedCountry.flag}</Text>
                <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
                <Text style={styles.chevron}>▾</Text>
              </TouchableOpacity>

              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="98765 43210"
                placeholderTextColor={colors.textTertiary}
                value={phoneDigits}
                onChangeText={setPhoneDigits}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.7}>
            <Text style={styles.skipBtnText}>Skip for now</Text>
          </TouchableOpacity>
        </View>

        <CountryCodePickerModal
          visible={pickerVisible}
          selectedDialCode={selectedCountry.dialCode}
          onSelect={setSelectedCountry}
          onClose={() => setPickerVisible(false)}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};
