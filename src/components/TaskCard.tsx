/**
 * Laya (లయ) Mobile — Polymorphic Task Card Component
 * Supports Checklist, Milestones, Quantified Targets & Guilt-Free Rest (ADR-0001, ADR-0004)
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Task, EvaluatedTask, UserGroup } from '../core/types';
import { speakReminder } from '../services/voice';
import { getStyles } from './TaskCard.styles';

interface Props {
  evaluated: EvaluatedTask;
  group?: UserGroup;
  onToggleComplete: (taskId: string) => void;
  onToggleMilestone: (taskId: string, milestoneId: string) => void;
  onUpdateQuantified: (taskId: string, delta: number) => void;
  onToggleIgnore: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string, title: string) => void;
}

export const TaskCard: React.FC<Props> = ({
  evaluated,
  group,
  onToggleComplete,
  onToggleMilestone,
  onUpdateQuantified,
  onToggleIgnore,
  onEditTask,
  onDeleteTask,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { task, isCompleted, isIgnored, percentage, completedMilestones, quantifiedValue } = evaluated;

  const handleTestVoice = async () => {
    await speakReminder(task.title, group);
  };

  const getBorderColor = () => {
    if (isCompleted) return colors.done;
    if (isIgnored) return colors.ignored;
    return colors.progress;
  };

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
            <Text style={styles.flavorBadge}>{task.flavor}</Text>
          </View>
        </View>

        {/* Binary Checklist Toggle */}
        {task.flavor === 'checklist' && !task.targetAmount && (
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

      {/* Discrete Milestones Pills */}
      {task.flavor === 'milestone' && task.milestones && task.milestones.length > 0 && (
        <View style={styles.milestonesRow}>
          {task.milestones.map((m) => {
            const isMilestoneDone = completedMilestones.includes(m.id);
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.milestonePill, isMilestoneDone && styles.milestonePillDone]}
                onPress={() => onToggleMilestone(task.id, m.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.milestoneText, isMilestoneDone && styles.milestoneTextDone]}>
                  {m.label} {isMilestoneDone ? '✓' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Quantified Target Controls */}
      {task.targetAmount && task.targetAmount > 0 && (
        <View style={styles.quantifiedRow}>
          <Text style={styles.quantifiedLabel}>
            {quantifiedValue} / {task.targetAmount} {task.unit || ''}
          </Text>
          <View style={styles.quantifiedActions}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => onUpdateQuantified(task.id, -1)}
              activeOpacity={0.7}
            >
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => onUpdateQuantified(task.id, 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Footer Actions: Guilt-Free Rest (Ignore) & Voice Trigger */}
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

        <TouchableOpacity
          style={styles.voiceBtn}
          onPress={handleTestVoice}
          activeOpacity={0.7}
        >
          <Text style={styles.voiceBtnText}>🔊 Voice</Text>
        </TouchableOpacity>

        {onEditTask && (
          <TouchableOpacity
            style={styles.cardActionBtn}
            onPress={() => onEditTask(task)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardActionText}>✏️</Text>
          </TouchableOpacity>
        )}

        {onDeleteTask && (
          <TouchableOpacity
            style={styles.cardActionBtn}
            onPress={() => onDeleteTask(task.id, task.title)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardActionText}>🗑️</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.progressText}>{percentage}%</Text>
      </View>
    </View>
  );
};
