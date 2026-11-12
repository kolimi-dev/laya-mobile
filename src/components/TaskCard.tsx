/**
 * Laya (లయ) Mobile — Polymorphic Task Card Component (ADR-0001, ADR-0004, ADR-0012)
 * Supports Checklist, Milestones (AND/OR + Skip), Quantified Step Jumps & Weekly Dot Trail
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Task, EvaluatedTask, UserGroup, CompletionEvent } from '../core/types';
import { speakReminder } from '../services/voice';
import { DirectNumberModal } from './DirectNumberModal';
import { SkipMilestoneModal } from './SkipMilestoneModal';
import { WeeklyDotTrail } from './WeeklyDotTrail';
import { getStyles } from './TaskCard.styles';

interface Props {
  evaluated: EvaluatedTask;
  group?: UserGroup;
  events?: CompletionEvent[];
  onToggleComplete: (taskId: string) => void;
  onToggleMilestone: (taskId: string, milestoneId: string) => void;
  onSkipMilestone?: (taskId: string, milestoneId: string, reason?: string) => void;
  onUpdateQuantified: (taskId: string, delta: number) => void;
  onSetQuantifiedExact?: (taskId: string, value: number) => void;
  onToggleIgnore: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string, title: string) => void;
}

export const TaskCard: React.FC<Props> = ({
  evaluated,
  group,
  events = [],
  onToggleComplete,
  onToggleMilestone,
  onSkipMilestone,
  onUpdateQuantified,
  onSetQuantifiedExact,
  onToggleIgnore,
  onEditTask,
  onDeleteTask,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [directNumberOpen, setDirectNumberOpen] = useState(false);
  const [skipTarget, setSkipTarget] = useState<{ id: string; label: string; isSkipped: boolean } | null>(null);

  const { task, isCompleted, isIgnored, percentage, completedMilestones, skippedMilestones = [], quantifiedValue } = evaluated;
  const step = task.stepAmount || 1;

  const getBorderColor = () => {
    if (isCompleted) return colors.done;
    if (isIgnored) return colors.ignored;
    return colors.progress;
  };

  const isQuantifiedFlavor = task.flavor === 'quantified' || (task.flavor === 'checklist' && !!task.targetAmount && task.targetAmount > 0);
  const isBinaryChecklist = (task.flavor === 'checklist' && !task.targetAmount) || task.flavor === 'one_time';

  return (
    <View style={[styles.card, { borderLeftColor: getBorderColor() }, isIgnored && styles.cardIgnored]}>
      {/* Header Info */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, isCompleted && styles.completedText, isIgnored && styles.ignoredText]}>
            {task.title}
          </Text>
          <View style={styles.badgeRow}>
            {group && (
              <View style={styles.groupBadge}>
                <View style={[styles.groupDot, { backgroundColor: group.color }]} />
                <Text style={styles.groupBadgeText}>{group.name}</Text>
              </View>
            )}
            <Text style={styles.flavorBadge}>{task.flavor.replace('_', ' ')}</Text>
            {task.flavor === 'milestone' && task.milestoneMode === 'any' && (
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>ANY 1 (OR)</Text>
              </View>
            )}
            {task.reminderTime ? (
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>⏰ {task.reminderTime}</Text>
              </View>
            ) : null}
            {task.flavor === 'one_time' && task.targetDate ? (
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>📅 {task.targetDate}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Binary Checklist Toggle */}
        {isBinaryChecklist && (
          <TouchableOpacity
            style={[styles.checkBtn, isCompleted && styles.checkBtnDone]}
            onPress={() => onToggleComplete(task.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.checkIcon, isCompleted && styles.checkIconDone]}>
              {isCompleted ? '✓' : ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Inline 7-Day Dot Trail (ADR-0012, Phase 5) */}
      <WeeklyDotTrail taskId={task.id} events={events} />

      {/* Discrete Milestones Pills */}
      {task.flavor === 'milestone' && task.milestones && task.milestones.length > 0 && (
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

      {/* Quantified Target Controls */}
      {isQuantifiedFlavor && (
        <View style={styles.quantifiedRow}>
          <TouchableOpacity onPress={() => setDirectNumberOpen(true)} activeOpacity={0.7}>
            <Text style={styles.quantifiedLabel}>
              {quantifiedValue} / {task.targetAmount || 1} {task.unit || ''} (±{step})
            </Text>
          </TouchableOpacity>
          <View style={styles.quantifiedActions}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => onUpdateQuantified(task.id, -step)} activeOpacity={0.7}>
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn} onPress={() => onUpdateQuantified(task.id, step)} activeOpacity={0.7}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Footer Actions */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          style={[styles.ignoreBtn, isIgnored && styles.ignoreBtnActive]}
          onPress={() => onToggleIgnore(task.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.ignoreBtnText, isIgnored && styles.ignoreBtnTextActive]}>
            {isIgnored ? '✓ Rest Day (Guilt-Free)' : 'Rest / Ignore'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.voiceBtn} onPress={() => speakReminder(task.title, group)} activeOpacity={0.7}>
          <Text style={styles.voiceBtnText}>🔊 Voice</Text>
        </TouchableOpacity>

        {onEditTask && (
          <TouchableOpacity style={styles.cardActionBtn} onPress={() => onEditTask(task)} activeOpacity={0.7}>
            <Text style={styles.cardActionText}>✏️</Text>
          </TouchableOpacity>
        )}

        {onDeleteTask && (
          <TouchableOpacity style={styles.cardActionBtn} onPress={() => onDeleteTask(task.id, task.title)} activeOpacity={0.7}>
            <Text style={styles.cardActionText}>🗑️</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.progressText}>{percentage}%</Text>
      </View>

      <DirectNumberModal
        visible={directNumberOpen}
        title={task.title}
        currentValue={quantifiedValue}
        targetAmount={task.targetAmount}
        unit={task.unit}
        onClose={() => setDirectNumberOpen(false)}
        onSave={(val) => onSetQuantifiedExact?.(task.id, val)}
      />

      {skipTarget && (
        <SkipMilestoneModal
          visible={!!skipTarget}
          milestoneLabel={skipTarget.label}
          isSkipped={skipTarget.isSkipped}
          onClose={() => setSkipTarget(null)}
          onConfirmSkip={(reason) => onSkipMilestone?.(task.id, skipTarget.id, reason)}
          onUnskip={() => onSkipMilestone?.(task.id, skipTarget.id, undefined)}
        />
      )}
    </View>
  );
};
