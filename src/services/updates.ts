/**
 * Laya (లయ) Mobile — In-App Update Engine & Manifest Checker (ADR-0010, Phase D)
 * Compares remote manifest with on-device version, checks for updates, and tracks release notes
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';

export interface AppUpdateManifest {
  latestVersion: string;
  apkUrl: string;
  releaseNotes: string[];
}

const STORAGE_KEYS = {
  LAST_SEEN_VERSION: '@laya:last_seen_version',
  DISMISSED_UPDATE: '@laya:dismissed_update_version',
};

export class UpdateService {
  /**
   * Compares two semver strings (e.g. "1.1.0" > "1.0.0")
   */
  public static isNewerVersion(remote: string, current: string): boolean {
    const parse = (v: string) => v.split('.').map((p) => parseInt(p, 10) || 0);
    const [rMajor, rMinor, rPatch] = parse(remote);
    const [cMajor, cMinor, cPatch] = parse(current);

    if (rMajor !== cMajor) return rMajor > cMajor;
    if (rMinor !== cMinor) return rMinor > cMinor;
    return rPatch > cPatch;
  }

  /**
   * Fetches latest update manifest with graceful offline fallbacks
   */
  public static async fetchManifest(): Promise<AppUpdateManifest | null> {
    let manifest: AppUpdateManifest | null = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      // Attempt platform version endpoint first
      const endpoint = `${CONFIG.BACKEND_URL}/api/v1/app/version`;
      const response = await fetch(endpoint, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);

      if (response.ok) {
        manifest = (await response.json()) as AppUpdateManifest;
      }
    } catch {
      // Backend offline or network timeout
    }

    // If backend didn't yield a newer version, check the instant GitHub raw manifest on publish branch
    if (!manifest || !UpdateService.isNewerVersion(manifest.latestVersion, CONFIG.APP_VERSION)) {
      try {
        const fallbackUrl = 'https://raw.githubusercontent.com/kolimi-dev/laya-mobile/publish/version.json';
        const fallbackRes = await fetch(fallbackUrl);
        if (fallbackRes.ok) {
          const fallback = (await fallbackRes.json()) as AppUpdateManifest;
          if (fallback && (!manifest || UpdateService.isNewerVersion(fallback.latestVersion, manifest.latestVersion))) {
            return fallback;
          }
        }
      } catch {
        // GitHub fallback offline
      }
    }

    return manifest;
  }

  public static async getLastSeenVersion(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.LAST_SEEN_VERSION);
  }

  public static async setLastSeenVersion(version: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SEEN_VERSION, version);
  }

  public static async getDismissedVersion(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.DISMISSED_UPDATE);
  }

  public static async setDismissedVersion(version: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.DISMISSED_UPDATE, version);
  }
}
