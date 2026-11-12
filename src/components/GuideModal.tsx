/**
 * Laya (లయ) Mobile — Interactive Onboarding & Feature Guide Modal
 * Universal App UX Standard (ADR-0001 through ADR-0008)
 */

import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { getStyles } from './GuideModal.styles';

interface GuideSlide {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  tags?: string[];
}

const GUIDE_SLIDES: GuideSlide[] = [
  {
    icon: '🌱',
    title: 'Natural Rhythm, No Guilt',
    subtitle: 'Welcome to Laya (లయ)',
    description:
      'Unlike conventional trackers that punish you with broken streaks, Laya adapts to the reality of life. Track your daily habits with zero anxiety and zero pressure.',
    tags: ['Pressure-Free', 'Rest Friendly', 'Privacy-First'],
  },
  {
    icon: '🎯',
    title: 'Three Habit Flavors',
    subtitle: 'Tailored for every routine',
    description:
      '1. Checklist: Simple daily check-off.\n2. Milestones: Step-by-step progress points.\n3. Quantified: Number targets like 4 Liters or 10 Pages.',
    tags: ['Checklist', 'Milestones', 'Quantified Targets'],
  },
  {
    icon: '☕',
    title: 'Guilt-Free Rest',
    subtitle: 'Resting is part of the cadence',
    description:
      'Unwell, traveling, or taking a recovery day? Tap "Rest" on any habit. Rested days are completely exempt from penalties — your rhythm score stays intact.',
    tags: ['Rest Exemptions', 'Zero Guilt', 'Honest Cadence'],
  },
  {
    icon: '🌙',
    title: 'Night Owl Rollover',
    subtitle: 'Cutoff at 03:00 AM',
    description:
      'Real lives don’t sleep at midnight. Your operational day rolls over at 03:00 AM. Completing a habit at 1:30 AM counts for your waking day, not tomorrow.',
    tags: ['Circadian Friendly', '03:00 AM Offset'],
  },
  {
    icon: '🛡️',
    title: 'Offline & Cloud Sync',
    subtitle: 'Local-first architecture',
    description:
      'Laya functions 100% offline with zero data lag. When you sign in with Kolimi ID, your habits and events sync securely across all your devices.',
    tags: ['100% Offline', 'Kolimi ID', 'Encrypted Sync'],
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<Props> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [currentIdx, setCurrentIdx] = useState(0);

  const slide = GUIDE_SLIDES[currentIdx];
  const isLast = currentIdx === GUIDE_SLIDES.length - 1;

  const handleFinish = async () => {
    await AsyncStorage.setItem('@laya:guide_seen', 'true');
    setCurrentIdx(0);
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.stepIndicator}>
              Step {currentIdx + 1} of {GUIDE_SLIDES.length}
            </Text>
            <TouchableOpacity onPress={handleFinish} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.slideBody}>
              <View style={styles.slideIconWrap}>
                <Text style={styles.slideIcon}>{slide.icon}</Text>
              </View>

              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
              <Text style={styles.slideDescription}>{slide.description}</Text>

              {slide.tags && (
                <View style={styles.pillRow}>
                  {slide.tags.map((tag) => (
                    <View key={tag} style={styles.pillItem}>
                      <Text style={styles.pillText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.dotsRow}>
            {GUIDE_SLIDES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentIdx && styles.dotActive]}
              />
            ))}
          </View>

          <View style={styles.footer}>
            {currentIdx > 0 ? (
              <TouchableOpacity style={styles.navBtn} onPress={handlePrev}>
                <Text style={styles.navBtnText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 60 }} />
            )}

            <TouchableOpacity style={styles.actionBtn} onPress={handleNext}>
              <Text style={styles.actionBtnText}>{isLast ? 'Get Started' : 'Next →'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
