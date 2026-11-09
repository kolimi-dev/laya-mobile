/**
 * Laya (లయ) Mobile — Application Configuration
 * Centralized endpoint tokens and runtime environment standards
 */

export const CONFIG = {
  // Public HTTPS backend URL (override with EXPO_PUBLIC_BACKEND_URL env var during build)
  BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL || 'https://laya-backend.onrender.com',
  DEFAULT_USER_ID: 'usr_beta_friend',
  APP_VERSION: '1.0.0',
  SYNC_INTERVAL_MS: 30000, // 30 seconds periodic check
};
