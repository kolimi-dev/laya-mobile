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
    title: 'Track Habits Without Guilt',
    subtitle: 'Rhythm over streaks',
    description:
      'Life happens. Missing one day should not erase weeks of hard work. Laya focuses on your steady routine instead of fragile streaks.\n\nExample: Missed a day? No red cross, no reset to zero. Just keep going tomorrow.',
    tags: ['No Broken Streaks', 'Zero Guilt', 'Real Life'],
  },
  {
    icon: '🎯',
    title: 'Pick How You Track',
    subtitle: 'Simple styles for any habit',
    description:
      '• Checklist: Quick 1-tap check-off (e.g. "Take vitamins").\n• Numbers: Track daily amounts (e.g. "Drink 3.5 L water" or "Read 20 pages").\n• Steps: Check off multi-part routines (e.g. "Workout: stretch, cardio, cool down").',
    tags: ['Checklist', 'Numbers', 'Steps'],
  },
  {
    icon: '🌙',
    title: 'Guilt-Free Rest Days',
    subtitle: 'Resting is part of life',
    description:
      'Feeling sick, traveling, or taking a break? Tap "Rest Day" on any habit. Rested days protect your score with zero penalties.\n\nExample: Rest your "Gym" habit when you have a sore knee or fever.',
    tags: ['Rest Day', 'Zero Penalties', 'Recovery'],
  },
  {
    icon: '🔄',
    title: 'Habits Roll Forward',
    subtitle: 'Never lose a missed habit',
    description:
      'If you miss a weekly or interval habit, Laya brings it forward to today so you don\'t lose track of it.\n\nExample: Scheduled "Clean desk" for Monday but missed it? It appears on Tuesday so you can still complete it.',
    tags: ['Auto Carry-Forward', 'Never Miss', 'Flexible'],
  },
  {
    icon: '🛡️',
    title: '100% Offline & Private',
    subtitle: 'Your data stays on your phone',
    description:
      'Laya works completely offline with zero loading time. When you are ready, sign in with Kolimi ID to back up your habits securely.\n\nExample: Track your habits on a flight or in the subway without any internet.',
    tags: ['Works Offline', 'Private', 'Secure Backup'],
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
