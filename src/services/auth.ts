/**
 * Laya (లయ) Mobile — Authentication Service
 * Email OTP with Resend & Persistent JWT Session
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';

const SESSION_KEY = '@laya:auth_session';
const PROFILE_KEY = '@laya:user_profile';

export interface AuthSession {
  userId: string;
  email: string;
  accessToken: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  sleepingTime?: string;
  eodNotificationsEnabled?: boolean;
}

export const DEFAULT_BACKEND_URL = CONFIG.BACKEND_URL;

export class AuthService {
  public static async getStoredSession(): Promise<AuthSession | null> {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public static async getStoredProfile(): Promise<UserProfile> {
    try {
      const raw = await AsyncStorage.getItem(PROFILE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          name: parsed.name || '',
          phone: parsed.phone || '',
          sleepingTime: parsed.sleepingTime || '20:00',
          eodNotificationsEnabled: parsed.eodNotificationsEnabled ?? true,
        };
      }
      return { name: '', phone: '', sleepingTime: '20:00', eodNotificationsEnabled: true };
    } catch {
      return { name: '', phone: '', sleepingTime: '20:00', eodNotificationsEnabled: true };
    }
  }

  public static async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }

  public static async sendOtp(
    email: string,
    backendUrl: string = DEFAULT_BACKEND_URL
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${backendUrl}/api/v1/auth/email/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.detail || 'Failed to send verification code' };
      }
      return { success: true, message: data.message };
    } catch {
      return { success: false, message: 'Unable to reach authentication server. Check your network.' };
    }
  }

  public static async verifyOtp(
    email: string,
    otpCode: string,
    backendUrl: string = DEFAULT_BACKEND_URL
  ): Promise<{ success: boolean; session?: AuthSession; message?: string }> {
    try {
      const res = await fetch(`${backendUrl}/api/v1/auth/email/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otpCode: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.detail || 'Invalid verification code' };
      }

      const session: AuthSession = {
        userId: data.user.id,
        email: data.user.email,
        accessToken: data.session.accessToken,
      };

      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { success: true, session };
    } catch {
      return { success: false, message: 'Verification failed. Please check network connection.' };
    }
  }

  public static async logout(): Promise<void> {
    await AsyncStorage.removeItem(SESSION_KEY);
  }
}

