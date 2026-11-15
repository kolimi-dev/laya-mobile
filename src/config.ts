/**
 * Laya (లయ) Mobile — Application Configuration
 * Centralized endpoint tokens and runtime environment standards (v1.2.0)
 */

export const CONFIG = {
  // Public HTTPS backend URL (override with EXPO_PUBLIC_BACKEND_URL env var during build)
  BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL || 'https://laya.kolimi.dev',
  DEFAULT_USER_ID: 'usr_beta_friend',
  APP_VERSION: '1.2.0',
  SYNC_INTERVAL_MS: 30000, // 30 seconds periodic check
};
