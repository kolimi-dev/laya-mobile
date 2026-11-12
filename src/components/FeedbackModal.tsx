/**
 * Laya (లయ) Mobile — In-App Feedback & Diagnostics Modal (Phase 7)
 * Direct listening channel to feedback@kolimi.dev with zero PII
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AuthSession } from '../services/auth';
import { getOperationalDate } from '../core/recurrence';
import { getStyles } from './FeedbackModal.styles';

type FeedbackCategory = 'bug' | 'feature' | 'compliment';

interface Props {
  visible: boolean;
  session: AuthSession | null;
  onClose: () => void;
}

const CATEGORIES: { id: FeedbackCategory; label: string; icon: string }[] = [
  { id: 'bug', label: 'Bug Report', icon: '🐛' },
  { id: 'feature', label: 'Feature Idea', icon: '✨' },
  { id: 'compliment', label: 'Compliment', icon: '❤️' },
];

export const FeedbackModal: React.FC<Props> = ({ visible, session, onClose }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [category, setCategory] = useState<FeedbackCategory>('feature');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);

  useEffect(() => {
    if (visible) {
      setEmail(session?.email || '');
      setMessage('');
    }
  }, [visible, session]);

  const opInfo = useMemo(() => getOperationalDate(), []);

  const diagnosticsSummary = `• Laya Native Mobile v1.0.0\n• OS: ${Platform.OS} (v${Platform.Version})\n• Date: ${opInfo.dateString} (Night Owl: 03:00 AM)\n• Privacy: 0 PII, 0 Location, 0 Trackers`;

  const handleSubmit = async () => {
    if (!message.trim()) return;

    const catObj = CATEGORIES.find((c) => c.id === category);
    const catLabel = catObj ? `${catObj.icon} ${catObj.label}` : 'Feedback';
    const previewSubject = message.trim().slice(0, 35);
    const subject = encodeURIComponent(`[Laya Feedback] ${catLabel}: ${previewSubject}...`);

    let bodyText = `${message.trim()}\n\n---\n`;
    bodyText += `Contact: ${email.trim() || 'Anonymous'}\n`;
    if (includeDiagnostics) {
      bodyText += `\nSanitized Diagnostics (Zero PII):\n${diagnosticsSummary}\n`;
    }

    const mailtoUrl = `mailto:feedback@kolimi.dev?subject=${subject}&body=${encodeURIComponent(bodyText)}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        onClose();
      } else {
        Alert.alert(
          'Email Client Not Found',
          'Please send your feedback directly to feedback@kolimi.dev.\n\nThank you for helping improve Laya!',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    } catch {
      Alert.alert('Send Feedback', 'Please email feedback@kolimi.dev', [{ text: 'OK', onPress: onClose }]);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Share Feedback</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Help shape the future of Laya (లయ)</Text>

          <View style={styles.categoryRow}>
            {CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  onPress={() => setCategory(c.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>
                    {c.icon} {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Your Feedback or Idea</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What went well? What could be better? Any features you'd love to see?"
              placeholderTextColor={colors.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contact Email (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="friend@example.com"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.diagnosticsCard}
            onPress={() => setIncludeDiagnostics(!includeDiagnostics)}
            activeOpacity={0.8}
          >
            <Text style={styles.diagnosticsTitle}>
              {includeDiagnostics ? '☑ Including Diagnostics' : '☐ Diagnostics Excluded'}
            </Text>
            <Text style={styles.diagnosticsText}>{diagnosticsSummary}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, !message.trim() && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!message.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>Send Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
