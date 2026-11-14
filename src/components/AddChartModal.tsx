/**
 * Laya (లయ) Mobile — Add Chart Modal (ADR-0004, ADR-0012, Phase C, V2.2)
 * Category-first habit selection with task-flavor visualizer suitability filter
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Task, UserGroup, TaskFlavor, ChartVisualizerStyle } from '../core/types';
import { getStyles } from './AddChartModal.styles';

const ALL_STYLES: { id: ChartVisualizerStyle; label: string; icon: string; desc: string }[] = [
  { id: 'volume_bars', label: 'Volume Bars', icon: '📊', desc: 'Vertical bars with target line' },
  { id: 'continuity_ring', label: 'Continuity Ring', icon: '⭕', desc: 'Streak dial & active rhythm' },
  { id: 'activity_heatmap', label: 'Activity Heatmap', icon: '🟩', desc: 'Consistency calendar grid' },
  { id: 'progression_line', label: 'Progression Line', icon: '📈', desc: 'Growth trend curve' },
];

function getSuitableStyles(flavor: TaskFlavor): ChartVisualizerStyle[] {
  switch (flavor) {
    case 'quantified':
      return ['volume_bars', 'progression_line'];
    case 'flexible_baseline':
      return ['volume_bars', 'progression_line', 'activity_heatmap'];
    case 'checklist':
      return ['activity_heatmap', 'continuity_ring'];
    case 'milestone':
      return ['continuity_ring', 'activity_heatmap', 'progression_line'];
    default:
      return ['activity_heatmap', 'continuity_ring', 'progression_line'];
  }
}

interface Props {
  visible: boolean;
  dashboardTitle: string;
  tasks: Task[];
  groups?: UserGroup[];
  onClose: () => void;
  onAddChart: (taskId: string, style: ChartVisualizerStyle) => void;
}

export const AddChartModal: React.FC<Props> = ({
  visible,
  dashboardTitle,
  tasks,
  groups = [],
  onClose,
  onAddChart,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const eligibleTasks = useMemo(() => {
    return tasks.filter(
      (t) => !t.deletedAt && !t.archivedAt && t.flavor !== 'one_time' && t.frequency !== 'one_time'
    );
  }, [tasks]);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<ChartVisualizerStyle>('volume_bars');

  const filteredTasks = useMemo(() => {
    if (!selectedGroupId) return eligibleTasks;
    return eligibleTasks.filter((t) => t.groupId === selectedGroupId);
  }, [eligibleTasks, selectedGroupId]);

  useEffect(() => {
    if (!filteredTasks.some((t) => t.id === selectedTaskId)) {
      setSelectedTaskId(filteredTasks[0]?.id || '');
    }
  }, [filteredTasks, selectedTaskId]);

  const selectedTask = useMemo(() => {
    return eligibleTasks.find((t) => t.id === selectedTaskId);
  }, [eligibleTasks, selectedTaskId]);

  const suitableStyles = useMemo(() => {
    if (!selectedTask) return ALL_STYLES;
    const allowed = getSuitableStyles(selectedTask.flavor);
    return ALL_STYLES.filter((s) => allowed.includes(s.id));
  }, [selectedTask]);

  useEffect(() => {
    if (suitableStyles.length > 0 && !suitableStyles.some((s) => s.id === selectedStyle)) {
      setSelectedStyle(suitableStyles[0].id);
    }
  }, [suitableStyles, selectedStyle]);

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
            {/* Step 1: Category-First Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>1. Pick Category</Text>
              <View style={styles.pillList}>
                <TouchableOpacity
                  style={[styles.groupPill, selectedGroupId === null && styles.groupPillActive]}
                  onPress={() => setSelectedGroupId(null)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.groupPillText, selectedGroupId === null && styles.groupPillTextActive]}>
                    All ({eligibleTasks.length})
                  </Text>
                </TouchableOpacity>

                {groups.map((grp) => {
                  const count = eligibleTasks.filter((t) => t.groupId === grp.id).length;
                  const isSel = selectedGroupId === grp.id;
                  return (
                    <TouchableOpacity
                      key={grp.id}
                      style={[styles.groupPill, isSel && styles.groupPillActive]}
                      onPress={() => setSelectedGroupId(grp.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.groupDot, { backgroundColor: grp.color }]} />
                      <Text style={[styles.groupPillText, isSel && styles.groupPillTextActive]}>
                        {grp.name} ({count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Step 2: Pick Habit */}
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>2. Pick Habit</Text>
              {filteredTasks.length === 0 ? (
                <Text style={styles.emptyText}>No recurring habits in this category.</Text>
              ) : (
                <View style={styles.pillList}>
                  {filteredTasks.map((t) => {
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
                        <Text style={styles.flavorTag}>• {t.flavor}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Step 3: Select Visualizer Style (Suitability Filtered) */}
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>3. Select Visualizer Style</Text>
              <View style={styles.styleGrid}>
                {suitableStyles.map((st) => {
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
