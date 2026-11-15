/**
 * Laya (లయ) Mobile — Today's Tasks Screen (ADR-0004, ADR-0010, ADR-0012, ADR-0015)
 * Remaining rhythm focus with collapsible "Completed & Rested" accordion
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { EvaluatedTask, UserGroup, Task, CompletionEvent, UserDashboard, PinnedChart } from '../core/types';
import { TaskCard } from '../components/TaskCard';
import { DraggableTaskCard } from '../components/DraggableTaskCard';
import { useReorderList } from '../hooks/useReorderList';
import { getStyles } from './TodayTasksScreen.styles';

interface Props {
  remainingTasks: EvaluatedTask[];
  completedOrRestedTasks: EvaluatedTask[];
  groups: UserGroup[];
  events?: CompletionEvent[];
  dashboards?: UserDashboard[];
  pinnedCharts?: PinnedChart[];
  onToggleComplete: (taskId: string) => void;
  onToggleMilestone: (taskId: string, milestoneId: string) => void;
  onSkipMilestone?: (taskId: string, milestoneId: string, reason?: string) => void;
  onUpdateQuantified: (taskId: string, delta: number) => void;
  onSetQuantifiedExact?: (taskId: string, value: number) => void;
  onToggleIgnore: (taskId: string, notes?: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string, title: string) => void;
  onNavigateToDashboard?: (dashboardId: string) => void;
  onOpenFeedback?: () => void;
  onReorderTasks?: (taskIds: string[]) => void;
  onSetLifecycleStatus?: (taskId: string, status: 'active' | 'completed' | 'paused' | 'retired') => void;
}

export const TodayTasksScreen: React.FC<Props> = ({
  remainingTasks,
  completedOrRestedTasks,
  groups,
  events = [],
  dashboards = [],
  pinnedCharts = [],
  onToggleComplete,
  onToggleMilestone,
  onSkipMilestone,
  onUpdateQuantified,
  onSetQuantifiedExact,
  onToggleIgnore,
  onEditTask,
  onDeleteTask,
  onNavigateToDashboard,
  onOpenFeedback,
  onReorderTasks,
  onSetLifecycleStatus,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [showFeedback, setShowFeedback] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(remainingTasks.length === 0);

  const { isRearrangeMode, toggleRearrangeMode, moveUp, moveDown, handleDeepPressLift } = useReorderList({
    items: remainingTasks,
    keyExtractor: (t) => t.task.id,
    onCommitOrder: (orderedKeys) => onReorderTasks?.(orderedKeys),
  });

  useEffect(() => {
    if (remainingTasks.length === 0 && completedOrRestedTasks.length > 0) {
      setAccordionOpen(true);
    }
  }, [remainingTasks.length, completedOrRestedTasks.length]);

  useEffect(() => {
    AsyncStorage.getItem('@laya:feedback_card_dismissed').then((val) => {
      const lastDismissed = val ? parseInt(val, 10) : 0;
      if (Date.now() - lastDismissed > 14 * 24 * 60 * 60 * 1000) setShowFeedback(true);
    });
  }, []);

  const handleDismissFeedback = async () => {
    setShowFeedback(false);
    await AsyncStorage.setItem('@laya:feedback_card_dismissed', Date.now().toString());
  };

  const renderCard = (item: EvaluatedTask, idx?: number, total?: number) => {
    return (
      <DraggableTaskCard
        key={item.task.id}
        id={item.task.id}
        index={idx ?? 0}
        total={total ?? 1}
        isRearrangeMode={isRearrangeMode && typeof idx === 'number'}
        onMoveUp={moveUp}
        onMoveDown={moveDown}
        onLongPressLift={handleDeepPressLift}
      >
        <TaskCard
          evaluated={item}
          group={groups.find((g) => g.id === item.task.groupId)}
          events={events}
          dashboards={dashboards}
          pinnedCharts={pinnedCharts}
          onToggleComplete={onToggleComplete}
          onToggleMilestone={onToggleMilestone}
          onSkipMilestone={onSkipMilestone}
          onUpdateQuantified={onUpdateQuantified}
          onSetQuantifiedExact={onSetQuantifiedExact}
          onToggleIgnore={onToggleIgnore}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onNavigateToDashboard={onNavigateToDashboard}
          onSetLifecycleStatus={onSetLifecycleStatus}
        />
      </DraggableTaskCard>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bucket: Remaining Tasks */}
      <View style={styles.bucketHeader}>
        <View style={styles.bucketTitleRow}>
          <View style={[styles.bucketDot, { backgroundColor: colors.warning }]} />
          <Text style={styles.bucketTitle}>Remaining ({remainingTasks.length})</Text>
        </View>
        {remainingTasks.length > 1 && (
          <TouchableOpacity
            style={[styles.reorderToggleBtn, isRearrangeMode && styles.reorderToggleBtnActive]}
            onPress={toggleRearrangeMode}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.reorderToggleText, isRearrangeMode && styles.reorderToggleTextActive]}>
              {isRearrangeMode ? '✓ Done Reordering' : '⚙️ Reorder'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {remainingTasks.length === 0 ? (
        completedOrRestedTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySubtext}>
              Tap "+ Add" above to start your daily rhythm, or open the menu ☰ for the guide.
            </Text>
          </View>
        ) : (
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>All Rhythms Harmonized!</Text>
            <Text style={styles.celebrationSubtext}>
              You have honored all your rhythms today. Rest peacefully.
            </Text>
          </View>
        )
      ) : (
        remainingTasks.map((t, idx) => renderCard(t, idx, remainingTasks.length))
      )}

      {/* Bottom Collapsible Bucket: Completed & Rested Today */}
      {completedOrRestedTasks.length > 0 && (
        <View style={styles.completedSection}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setAccordionOpen((prev) => !prev)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.accordionTitleRow}>
              <View style={[styles.bucketDot, { backgroundColor: colors.done }]} />
              <Text style={styles.bucketTitle}>
                Completed & Rested ({completedOrRestedTasks.length})
              </Text>
            </View>
            <Text style={styles.accordionIcon}>{accordionOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>

          {accordionOpen && completedOrRestedTasks.map((t) => renderCard(t))}
        </View>
      )}

      {/* Ethical 14-day Feedback Check-in */}
      {showFeedback && (
        <View style={styles.feedbackCard}>
          <View style={styles.feedbackTextWrap}>
            <Text style={styles.feedbackTitle}>💬 How is your rhythm feeling?</Text>
            <Text style={styles.feedbackSubtext}>Share ideas or suggestions directly with Kolimi Studio.</Text>
          </View>
          <View style={styles.feedbackActions}>
            <TouchableOpacity style={styles.feedbackBtn} onPress={onOpenFeedback}>
              <Text style={styles.feedbackBtnText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDismissFeedback} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.feedbackCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
