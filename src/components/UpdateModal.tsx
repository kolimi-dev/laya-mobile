/**
 * Laya (లయ) Mobile — In-App Update Notification Modal (Phase D)
 * Respectful "Update Later" workflow with release notes and 1-tap download
 */

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';
import { AppUpdateManifest } from '../services/updates';

interface Props {
  visible: boolean;
  manifest: AppUpdateManifest | null;
  currentVersion: string;
  isDownloading?: boolean;
  downloadProgress?: number;
  onClose: () => void;
  onUpdateNow: () => void;
}

export const UpdateModal: React.FC<Props> = ({
  visible,
  manifest,
  currentVersion,
  isDownloading,
  downloadProgress = 0,
  onClose,
  onUpdateNow,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  if (!manifest) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={isDownloading ? undefined : onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Text style={styles.rocketIcon}>🚀</Text>
          </View>

          <Text style={styles.title}>New Update Available</Text>
          <Text style={styles.subtitle}>
            Version {manifest.latestVersion} is ready (current: v{currentVersion})
          </Text>

          <View style={styles.notesBox}>
            <Text style={styles.notesHeading}>Highlights in this release:</Text>
            <ScrollView style={styles.notesScroll} showsVerticalScrollIndicator={false}>
              {manifest.releaseNotes.map((note, idx) => (
                <View key={idx} style={styles.noteRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <Text style={styles.helperText}>
            Direct in-app install without opening browser or store.
          </Text>

          {isDownloading ? (
            <View style={styles.downloadBox}>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${Math.round(downloadProgress * 100)}%` }]} />
              </View>
              <Text style={styles.downloadText}>
                {downloadProgress >= 1
                  ? 'Launching installer...'
                  : `Downloading update... ${Math.round(downloadProgress * 100)}%`}
              </Text>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.laterBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.laterText}>Later</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.updateBtn} onPress={onUpdateNow} activeOpacity={0.8}>
                <Text style={styles.updateText}>Update Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.lg,
      padding: spacing.xl,
      gap: spacing.sm,
      alignItems: 'center',
    },
    iconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.bgActive,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    rocketIcon: { fontSize: 26 },
    title: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700', textAlign: 'center' },
    subtitle: { color: colors.textSecondary, fontSize: typography.caption, textAlign: 'center' },
    notesBox: {
      width: '100%',
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      padding: spacing.md,
      marginVertical: spacing.xs,
      maxHeight: 160,
    },
    notesHeading: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
    notesScroll: { width: '100%' },
    noteRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
    bullet: { color: colors.primary, fontSize: 14, lineHeight: 18 },
    noteText: { color: colors.textPrimary, fontSize: 12, flex: 1, lineHeight: 18 },
    helperText: { color: colors.textTertiary, fontSize: 11, textAlign: 'center', lineHeight: 16 },
    buttonRow: { flexDirection: 'row', gap: spacing.sm, width: '100%', marginTop: spacing.xs },
    laterBtn: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: radiuses.md,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      alignItems: 'center',
    },
    laterText: { color: colors.textSecondary, fontSize: typography.body, fontWeight: '600' },
    updateBtn: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: radiuses.md,
      alignItems: 'center',
    },
    updateText: { color: '#FFFFFF', fontSize: typography.body, fontWeight: '700' },
    downloadBox: {
      width: '100%',
      paddingVertical: spacing.sm,
      gap: spacing.xs,
      alignItems: 'center',
    },
    progressBarTrack: {
      width: '100%',
      height: 8,
      backgroundColor: colors.bgInput,
      borderRadius: radiuses.full,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: radiuses.full,
    },
    downloadText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
  });
