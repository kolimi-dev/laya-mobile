/**
 * Laya (లయ) Mobile — Minimalist Email OTP Login Screen
 * Powered by Resend (laya@kolimi.dev) with Offline Skip
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/tokens';
import { AuthService, AuthSession } from '../services/auth';
import { styles } from './LoginScreen.styles';

interface Props {
  onLoginSuccess: (session: AuthSession) => void;
  onSkipOffline: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onLoginSuccess, onSkipOffline }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setLoading(true);
    const result = await AuthService.sendOtp(email);
    setLoading(false);

    if (result.success) {
      setStep('otp');
    } else {
      setError(result.message || 'Failed to send code');
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setError(null);
    setLoading(true);
    const result = await AuthService.verifyOtp(email, otpCode);
    setLoading(false);

    if (result.success && result.session) {
      onLoginSuccess(result.session);
    } else {
      setError(result.message || 'Invalid code');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.brandTitle}>
            Laya <Text style={styles.brandNative}>లయ</Text>
          </Text>
          <Text style={styles.subtitle}>Natural Cadence & Rhythm Engine</Text>
          <Text style={styles.domainNotice}>Official OTP from auth@kolimi.dev</Text>
        </View>

        {step === 'email' ? (
          <View style={styles.form}>
            <Text style={styles.label}>Your Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="friend@example.com"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={styles.btn}
              onPress={handleSendOtp}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color={colors.bgDark} />
              ) : (
                <Text style={styles.btnText}>Send Verification Code</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Enter 6-Digit Code</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              value={otpCode}
              onChangeText={setOtpCode}
              placeholder="123456"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              maxLength={6}
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              selectTextOnFocus={true}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={styles.btn}
              onPress={handleVerifyOtp}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color={colors.bgDark} />
              ) : (
                <Text style={styles.btnText}>Verify & Enter</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                setStep('email');
                setError(null);
              }}
            >
              <Text style={styles.backBtnText}>← Change Email</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.offlineSkipBtn} onPress={onSkipOffline}>
          <Text style={styles.offlineSkipText}>Continue in Local Offline Mode →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

