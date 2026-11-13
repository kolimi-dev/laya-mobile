/**
 * Laya (లయ) Mobile — Add Chart Modal (ADR-0004, ADR-0012, Phase C)
 * Select recurring habit (excluding one-time) and visualizer style
 */

import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';
import { Task, ChartVisualizerStyle } from '../core/types';

const STYLES: { id: ChartVisualizerStyle; label: string; icon: string; desc: string }[] = [
  { id: 'volume_bars', label: 'Volume Bars', icon: '📊', desc: 'Vertical bars with target line' },
  { id: 'continuity_ring', label: 'Continuity Ring', icon: '⭕', desc: 'Streak dial & active rhythm' },
  { id: 'activity_heatmap', label: 'Activity Heatmap', icon: '🟩', desc: 'Consistency calendar grid' },
  { id: 'progression_line', label: 'Progression Line', icon: '📈', desc: 'Growth trend curve' },
];

interface Props {
  visible: boolean;
  dashboardTitle: string;
  tasks: Task[];
  onClose: () => void;
  onAddChart: (taskId: string, style: ChartVisualizerStyle) => void;
}

export const AddChartModal: React.FC<Props> = ({
  visible,
  dashboardTitle,
  tasks,
  onClose,
  onAddChart,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Exclude one-time tasks per Phase C spec
  const eligibleTasks = tasks.filter(
    (t) => !t.deletedAt && t.flavor !== 'one_time' && t.frequency !== 'one_time'
  );

  const [selectedTaskId, setSelectedTaskId] = useState<string>(eligibleTasks[0]?.id || '');
  const [selectedStyle, setSelectedStyle] = useState<ChartVisualizerStyle>('volume_bars');

  const handleConfirm = () => {
    if (!selectedTaskId) return;
    onAddChart(selectedTaskId, selectedStyle);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Add Chart to Dashboard</Text>
              <Text style={styles.subtitle}>{dashboardTitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Step 1: Select Habit */}
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>1. Select Recurring Habit</Text>
              {eligibleTasks.length === 0 ? (
                <Text style={styles.emptyText}>No recurring habits found. Create a habit first.</Text>
              ) : (
                <View style={styles.pillList}>
                  {eligibleTasks.map((t) => {
                    const isSelected = selectedTaskId === t.id;
                    return (
                      <TouchableOpacity
                        key={t.id}
                        style={[styles.taskPill, isSelected && styles.taskPillActive]}
                        onPress={() => setSelectedTaskId(t.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.taskPillText, isSelected && styles.taskPillTextActive]}>
                          {t.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Step 2: Select Visualizer Style */}
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>2. Select Visualizer Style</Text>
              <View style={styles.styleGrid}>
                {STYLES.map((st) => {
                  const isSelected = selectedStyle === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      style={[styles.styleCard, isSelected && styles.styleCardActive]}
                      onPress={() => setSelectedStyle(st.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.styleIcon}>{st.icon}</Text>
                      <Text style={[styles.styleTitle, isSelected && styles.styleTitleActive]}>
                        {st.label}
                      </Text>
                      <Text style={styles.styleDesc}>{st.desc}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.submitBtn, !selectedTaskId && styles.submitBtnDisabled]}
              disabled={!selectedTaskId}
            >
              <Text style={styles.submitText}>+ Add Chart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      padding: spacing.md,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.lg,
      maxHeight: '90%',
      padding: spacing.lg,
      gap: spacing.md,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700' },
    subtitle: { color: colors.textTertiary, fontSize: 11, textTransform: 'uppercase' },
    closeBtn: { padding: 4 },
    closeText: { color: colors.textSecondary, fontSize: 16 },
    body: { gap: spacing.md },
    section: { gap: spacing.xs, marginBottom: spacing.sm },
    sectionHeading: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    emptyText: { color: colors.textTertiary, fontSize: typography.body },
    pillList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    taskPill: {
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
    },
    taskPillActive: { backgroundColor: colors.bgActive, borderColor: colors.borderStrong },
    taskPillText: { color: colors.textSecondary, fontSize: typography.caption },
    taskPillTextActive: { color: colors.textPrimary, fontWeight: '700' },
    styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    styleCard: {
      width: '48%',
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.md,
      padding: spacing.sm,
      gap: 2,
    },
    styleCardActive: { backgroundColor: colors.bgActive, borderColor: colors.primary },
    styleIcon: { fontSize: 18 },
    styleTitle: { color: colors.textPrimary, fontSize: 12, fontWeight: '600' },
    styleTitleActive: { color: colors.primary },
    styleDesc: { color: colors.textTertiary, fontSize: 9 },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      paddingTop: spacing.sm,
    },
    cancelBtn: { paddingHorizontal: spacing.md, paddingVertical: 8 },
    cancelText: { color: colors.textSecondary, fontSize: typography.body },
    submitBtn: {
      backgroundColor: colors.textPrimary,
      borderRadius: radiuses.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: 8,
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitText: { color: colors.bgDark, fontSize: typography.body, fontWeight: '600' },
  });
