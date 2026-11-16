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
import { CONFIG } from '../config';
import { getStyles } from './FeedbackModal.styles';

type FeedbackCategory = 'bug' | 'feature' | 'compliment';

interface Props {
  visible: boolean;
  session: AuthSession | null;
  onClose: () => void;
}

const CATEGORIES: {
  id: FeedbackCategory;
  label: string;
  icon: string;
  prompt: string;
  example: string;
  placeholder: string;
}[] = [
  {
    id: 'bug',
    label: 'Bug Report',
    icon: '🐛',
    prompt: 'What went wrong? Steps to reproduce:',
    example: 'e.g. "I edited water intake from 2L to 3.5L on yesterday\'s screen, but it stayed at 2L."',
    placeholder: '1. What happened?\n2. What did you expect?\n3. What screen were you on?',
  },
  {
    id: 'feature',
    label: 'Feature Idea',
    icon: '✨',
    prompt: 'What new feature would help your routine?',
    example: 'e.g. "A home screen widget to check off remaining habits today without opening the app."',
    placeholder: 'Describe your idea and how it would improve your daily rhythm...',
  },
  {
    id: 'compliment',
    label: 'Compliment',
    icon: '❤️',
    prompt: 'What part of Laya do you enjoy the most?',
    example: 'e.g. "The guilt-free Rest Day is awesome—it removed my streak anxiety completely!"',
    placeholder: 'Tell us what you enjoy about Laya...',
  },
];

export const FeedbackModal: React.FC<Props> = ({ visible, session, onClose }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [category, setCategory] = useState<FeedbackCategory>('feature');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [email, setEmail] = useState('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);

  useEffect(() => {
    if (visible) {
      setEmail(session?.email || '');
      setSenderName('');
      setMessage('');
    }
  }, [visible, session]);

  const opInfo = useMemo(() => getOperationalDate(), []);

  const diagnosticsSummary = `• Laya Native Mobile v${CONFIG.APP_VERSION}\n• OS: ${Platform.OS} (v${Platform.Version})\n• Date: ${opInfo.dateString}\n• Privacy: 0 PII, 0 Location, 0 Trackers`;

  const activeCat = CATEGORIES.find((c) => c.id === category) || CATEGORIES[1];

  const handleSubmit = async () => {
    if (!message.trim()) return;

    const catLabel = `${activeCat.icon} ${activeCat.label}`;
    const previewSubject = message.trim().slice(0, 35);
    const subject = encodeURIComponent(`[Laya Feedback] ${catLabel}: ${previewSubject}...`);

    const senderIdentifier = senderName.trim()
      ? `${senderName.trim()}${session?.email ? ` (${session.email})` : email.trim() ? ` (${email.trim()})` : ''}`
      : session?.email || email.trim() || 'Guest (Anonymous)';

    let bodyText = `SENDER IDENTIFICATION:\n`;
    bodyText += `• Contact: ${senderIdentifier}\n`;
    if (session?.userId) bodyText += `• Kolimi ID: ${session.userId}\n`;
    bodyText += `• Category: ${catLabel}\n\n`;
    bodyText += `FEEDBACK DETAILS:\n${message.trim()}\n\n`;
    bodyText += `---\n`;
    if (includeDiagnostics) {
      bodyText += `Sanitized Diagnostics (Zero PII):\n${diagnosticsSummary}\n`;
    }

    const mailtoUrl = `mailto:feedback@kolimi.dev?subject=${subject}&body=${encodeURIComponent(bodyText)}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        onClose();
        return;
      }
    } catch {}

    try {
      const res = await fetch(`${CONFIG.BACKEND_URL}/api/v1/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category === 'bug' ? 'bug' : 'feature_request',
          message: bodyText,
        }),
      });
      if (res.ok) {
        Alert.alert('Feedback Sent', 'Thank you! Your feedback was received directly.', [{ text: 'OK', onPress: onClose }]);
        return;
      }
    } catch {}

    Alert.alert('Send Feedback', 'Please email feedback@kolimi.dev\n\nThank you for helping improve Laya!', [{ text: 'OK', onPress: onClose }]);
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

          <View style={styles.promptBox}>
            <Text style={styles.promptText}>{activeCat.prompt}</Text>
            <Text style={styles.exampleText}>{activeCat.example}</Text>
          </View>

          <View style={styles.field}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={activeCat.placeholder}
              placeholderTextColor={colors.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              {session?.email ? `Your Identity (${session.email})` : 'Your Name or Email (Optional)'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={session?.email ? 'Add your name or handle (e.g. Alex)' : 'friend@example.com or Your Name'}
              placeholderTextColor={colors.textTertiary}
              value={senderName}
              onChangeText={setSenderName}
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
