/**
 * Laya (లయ) Mobile — Progressive Disclosure TaskCard Component (ADR-0001, ADR-0012, ADR-0014)
 * Collapsed by default. Tapping body expands drawer for history, resting, editing.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Task, EvaluatedTask, UserGroup, CompletionEvent, UserDashboard, PinnedChart } from '../core/types';
import { DirectNumberModal } from './DirectNumberModal';
import { SkipMilestoneModal } from './SkipMilestoneModal';
import { RestTaskModal } from './RestTaskModal';
import { TaskDashboardJumpModal } from './TaskDashboardJumpModal';
import { FlexibleBaselineControl } from './FlexibleBaselineControl';
import { TaskCardDrawer } from './TaskCardDrawer';
import { getStyles } from './TaskCard.styles';

interface Props {
  evaluated: EvaluatedTask;
  group?: UserGroup;
  events?: CompletionEvent[];
  dashboards?: UserDashboard[];
  pinnedCharts?: PinnedChart[];
  onToggleComplete: (taskId: string) => void;
  onToggleMilestone: (taskId: string, milestoneId: string) => void;
  onSkipMilestone?: (taskId: string, milestoneId: string, reason?: string) => void;
  onUpdateQuantified: (taskId: string, delta: number, criterionId?: string) => void;
  onSetQuantifiedExact?: (taskId: string, value: number, criterionId?: string) => void;
  onToggleIgnore: (taskId: string, notes?: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string, title: string) => void;
  onNavigateToDashboard?: (dashboardId: string) => void;
  onSetLifecycleStatus?: (taskId: string, status: 'active' | 'completed' | 'paused' | 'retired') => void;
}

export const TaskCard: React.FC<Props> = ({
  evaluated,
  group,
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
  onNavigateToDashboard,
  onSetLifecycleStatus,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [isExpanded, setIsExpanded] = useState(false);
  const [directNumberOpen, setDirectNumberOpen] = useState(false);
  const [restModalOpen, setRestModalOpen] = useState(false);
  const [jumpModalOpen, setJumpModalOpen] = useState(false);
  const [skipTarget, setSkipTarget] = useState<{ id: string; label: string; isSkipped: boolean } | null>(null);

  const { task, isCompleted, isIgnored, percentage, completedMilestones, skippedMilestones = [], quantifiedValue } = evaluated;
  const step = task.stepAmount || 1;

  const latestEvent = events.filter((e) => e.taskId === task.id).pop();
  const restReason = latestEvent?.notes;

  const getBorderColor = () => {
    if (isCompleted) return colors.done;
    if (isIgnored) return colors.ignored;
    return colors.progress;
  };

  const isQuantifiedFlavor = task.flavor === 'quantified' || (task.flavor === 'checklist' && !!task.targetAmount && task.targetAmount > 0);
  const isBinaryChecklist = (task.flavor === 'checklist' && !task.targetAmount) || task.flavor === 'one_time';

  return (
    <View style={[styles.card, { borderLeftColor: getBorderColor() }, isIgnored && styles.cardIgnored]}>
      {/* Primary Card Face (Always Visible) */}
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setIsExpanded((prev) => !prev)}
        activeOpacity={0.8}
      >
        <View style={styles.titleWrap}>
          <Text style={[styles.title, isCompleted && styles.completedText, isIgnored && styles.ignoredText]}>
            {task.title}
          </Text>
          {isIgnored && (
            <Text style={styles.ignoredText}>
              🌙 Rest ({restReason || 'Guilt-Free'})
            </Text>
          )}
        </View>

        {/* Primary Interactive Control Based on Flavor */}
        {isBinaryChecklist && (
          <TouchableOpacity
            style={styles.checkBtn}
            onPress={() => onToggleComplete(task.id)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={[styles.checkBtnBox, isCompleted && styles.checkBtnBoxDone]}>
              <Text style={[styles.checkIcon, isCompleted && styles.checkIconDone]}>
                {isCompleted ? '✓' : ''}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {task.flavor === 'flexible_baseline' && (
          <View style={styles.progressPill}>
            <Text style={styles.progressPillText}>{percentage}%</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Quantified Steppers Face */}
      {isQuantifiedFlavor && !isIgnored && (
        <View style={styles.quantifiedRow}>
          <TouchableOpacity
            onPress={() => setDirectNumberOpen(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.quantifiedLabel}>
              {quantifiedValue} / {task.targetAmount || 1} {task.unit || ''}
            </Text>
          </TouchableOpacity>
          <View style={styles.quantifiedActions}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => onUpdateQuantified(task.id, -step)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => onUpdateQuantified(task.id, step)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Discrete Milestones Pills Face */}
      {task.flavor === 'milestone' && task.milestones && task.milestones.length > 0 && !isIgnored && (
        <View style={styles.milestonesRow}>
          {task.milestones.map((m) => {
            const isMilestoneDone = completedMilestones.includes(m.id);
            const isMilestoneSkipped = skippedMilestones.includes(m.id);

            return (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.milestonePill,
                  isMilestoneDone && styles.milestonePillDone,
                  isMilestoneSkipped && styles.milestonePillSkipped,
                ]}
                onPress={() => {
                  if (isMilestoneSkipped) setSkipTarget({ id: m.id, label: m.label, isSkipped: true });
                  else onToggleMilestone(task.id, m.id);
                }}
                onLongPress={() => setSkipTarget({ id: m.id, label: m.label, isSkipped: isMilestoneSkipped })}
                delayLongPress={350}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[
                  styles.milestoneText,
                  isMilestoneDone && styles.milestoneTextDone,
                  isMilestoneSkipped && styles.milestoneTextSkipped,
                ]}>
                  {m.label} {isMilestoneDone ? '✓' : isMilestoneSkipped ? '(Rest)' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Flexible Baseline Criterion Control */}
      {task.flavor === 'flexible_baseline' && !isIgnored && (
        <FlexibleBaselineControl
          task={task}
          criterionValues={evaluated.criterionValues}
          percentage={percentage}
          isCompleted={isCompleted}
          onUpdateQuantified={onUpdateQuantified}
        />
      )}

      {/* Progressive Disclosure Drawer (Revealed on Tap) */}
      {isExpanded && (
        <TaskCardDrawer
          task={task}
          isIgnored={isIgnored}
          notes={restReason}
          group={group}
          events={events}
          dashboards={dashboards}
          pinnedCharts={pinnedCharts}
          onOpenRestModal={() => setRestModalOpen(true)}
          onEditTask={onEditTask}
          onNavigateToDashboard={onNavigateToDashboard}
          onSetLifecycleStatus={onSetLifecycleStatus}
          isRolledForward={evaluated.isRolledForward}
        />
      )}

      <DirectNumberModal visible={directNumberOpen} title={task.title} currentValue={quantifiedValue} targetAmount={task.targetAmount} unit={task.unit} onClose={() => setDirectNumberOpen(false)} onSave={(val) => onSetQuantifiedExact?.(task.id, val)} />
      <RestTaskModal visible={restModalOpen} taskTitle={task.title} isCurrentlyRested={isIgnored} currentNotes={restReason} onClose={() => setRestModalOpen(false)} onConfirmRest={(r) => onToggleIgnore(task.id, r)} onUnrest={() => onToggleIgnore(task.id)} />
      {skipTarget && <SkipMilestoneModal visible={!!skipTarget} milestoneLabel={skipTarget.label} isSkipped={skipTarget.isSkipped} onClose={() => setSkipTarget(null)} onConfirmSkip={(r) => onSkipMilestone?.(task.id, skipTarget.id, r)} onUnskip={() => onSkipMilestone?.(task.id, skipTarget.id, undefined)} />}
      {dashboards.length > 1 && <TaskDashboardJumpModal visible={jumpModalOpen} taskTitle={task.title} dashboards={dashboards} onSelect={(id) => onNavigateToDashboard?.(id)} onClose={() => setJumpModalOpen(false)} />}
    </View>
  );
};
