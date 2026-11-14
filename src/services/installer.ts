/**
 * Laya (లయ) Mobile — In-App APK Downloader & Installer Service (ADR-0010, Option 1)
 * Downloads APK to cache with progress tracking and launches Android Package Installer
 */

import { Platform, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

export class AppInstallerService {
  public static async downloadAndInstall(
    apkUrl: string,
    onProgress: (progress: number) => void
  ): Promise<void> {
    if (Platform.OS !== 'android') {
      Linking.openURL(apkUrl);
      return;
    }

    try {
      const filename = apkUrl.split('/').pop()?.split('?')[0] || 'laya-update.apk';
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      // Clean up previous stale download if exists
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
      }

      onProgress(0.05);

      const downloadResumable = FileSystem.createDownloadResumable(
        apkUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const total = downloadProgress.totalBytesExpectedToWrite;
          const written = downloadProgress.totalBytesWritten;
          if (total > 0) {
            const fraction = Math.min(0.99, Math.max(0.05, written / total));
            onProgress(fraction);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (!result || !result.uri) {
        throw new Error('Download failed: empty response');
      }

      onProgress(1.0);

      // Convert file:// to content:// URI using Expo's FileProvider
      const contentUri = await FileSystem.getContentUriAsync(result.uri);

      // Launch native Android Package Installer directly without browser
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1, // Intent.FLAG_GRANT_READ_URI_PERMISSION
        type: 'application/vnd.android.package-archive',
      });
    } catch (err) {
      console.warn('In-app installer fallback to browser:', err);
      Linking.openURL(apkUrl);
    }
  }
}
