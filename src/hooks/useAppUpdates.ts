/**
 * Laya (లయ) Mobile — App Updates & Consent Hook (ADR-0014)
 * In-app update checks, changelog spotlights, and privacy consent state
 */

import { useState, useEffect } from 'react';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';
import { UpdateService, AppUpdateManifest } from '../services/updates';
import { AppInstallerService } from '../services/installer';

export function useAppUpdates(onShowGuide?: () => void) {
  const [updateManifest, setUpdateManifest] = useState<AppUpdateManifest | null>(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [whatsNewVisible, setWhatsNewVisible] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('@laya:consent_agreed').then((v) => !v && setConsentAgreed(false));
    AsyncStorage.getItem('@laya:guide_seen').then((s) => !s && onShowGuide?.());

    async function checkUpdates() {
      const manifest = await UpdateService.fetchManifest();
      if (manifest && UpdateService.isNewerVersion(manifest.latestVersion, CONFIG.APP_VERSION)) {
        setUpdateManifest(manifest);
        const dismissed = await UpdateService.getDismissedVersion();
        if (dismissed !== manifest.latestVersion) setUpdateModalVisible(true);
      } else {
        const lastSeen = await UpdateService.getLastSeenVersion();
        if (lastSeen && UpdateService.isNewerVersion(CONFIG.APP_VERSION, lastSeen)) setWhatsNewVisible(true);
        await UpdateService.setLastSeenVersion(CONFIG.APP_VERSION);
      }
    }
    checkUpdates();
  }, [onShowGuide]);

  const handleAgreeConsent = () => {
    AsyncStorage.setItem('@laya:consent_agreed', 'true');
    setConsentAgreed(true);
  };

  const handleCloseUpdate = async () => {
    if (updateManifest) await UpdateService.setDismissedVersion(updateManifest.latestVersion);
    setUpdateModalVisible(false);
    setIsDownloading(false);
  };

  const handleUpdateNow = async () => {
    if (!updateManifest?.apkUrl) return;
    setIsDownloading(true);
    setDownloadProgress(0.05);
    await AppInstallerService.downloadAndInstall(updateManifest.apkUrl, (p) => {
      setDownloadProgress(p);
    });
    setIsDownloading(false);
  };

  return {
    consentAgreed,
    handleAgreeConsent,
    updateManifest,
    updateModalVisible,
    setUpdateModalVisible,
    whatsNewVisible,
    setWhatsNewVisible,
    isDownloading,
    downloadProgress,
    handleCloseUpdate,
    handleUpdateNow,
  };
}
