/**
 * Laya (లయ) Mobile — Create Task Modal (ADR-0005, ADR-0012)
 * Clean separation of How you measure (Flavor) vs When you do it (Schedule)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Task, TaskFlavor, FrequencyType, UserGroup, MilestoneItem, MilestoneMode, BaselineCriterion } from '../core/types';
import { generateUUID } from '../services/storage';
import { MilestonesBuilder } from './MilestonesBuilder';
import { BaselineCriteriaBuilder } from './BaselineCriteriaBuilder';
import { TaskFrequencyFields } from './TaskFrequencyFields';
import { TaskQuantifiedFields } from './TaskQuantifiedFields';
import { getStyles } from './CreateTaskModal.styles';

const FLAVORS: { id: TaskFlavor; label: string }[] = [
  { id: 'checklist', label: 'Simple Checklist' },
  { id: 'quantified', label: 'Target Number' },
  { id: 'milestone', label: 'Milestones' },
  { id: 'flexible_baseline', label: 'Flexible Baseline' },
];

interface Props {
  visible: boolean;
  groups: UserGroup[];
  initialTask?: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export const CreateTaskModal: React.FC<Props> = ({
  visible,
  groups,
  initialTask,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [title, setTitle] = useState('');
  const [groupId, setGroupId] = useState(groups[0]?.id || 'grp_personal');
  const [flavor, setFlavor] = useState<TaskFlavor>('checklist');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [targetAmount, setTargetAmount] = useState('4');
  const [stepAmount, setStepAmount] = useState('1');
  const [unit, setUnit] = useState('L');
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [milestoneMode, setMilestoneMode] = useState<MilestoneMode>('all');
  const [baselineCriteria, setBaselineCriteria] = useState<BaselineCriterion[]>([]);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [monthOfYear, setMonthOfYear] = useState('1');
  const [intervalDays, setIntervalDays] = useState('2');
  const [targetDate, setTargetDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setGroupId(initialTask.groupId);
      setFlavor(initialTask.flavor === 'one_time' ? 'checklist' : initialTask.flavor === 'percentage' ? 'quantified' : initialTask.flavor);
      setFrequency(initialTask.flavor === 'one_time' ? 'one_time' : initialTask.frequency);
      setTargetAmount(initialTask.targetAmount ? String(initialTask.targetAmount) : '4');
      setStepAmount(initialTask.stepAmount ? String(initialTask.stepAmount) : '1');
      setUnit(initialTask.unit || '');
      setMilestones(initialTask.milestones || []);
      setMilestoneMode(initialTask.milestoneMode || 'all');
      setBaselineCriteria(initialTask.baselineCriteria || []);
      setDaysOfWeek(initialTask.daysOfWeek || [1, 2, 3, 4, 5]);
      setDayOfMonth(initialTask.dayOfMonth ? String(initialTask.dayOfMonth) : '1');
      setMonthOfYear(initialTask.monthOfYear ? String(initialTask.monthOfYear) : '1');
      setIntervalDays(initialTask.intervalDays ? String(initialTask.intervalDays) : '2');
      setTargetDate(initialTask.targetDate || '');
      setReminderTime(initialTask.reminderTime || '');
    } else {
      setTitle('');
      setGroupId(groups[0]?.id || 'grp_personal');
      setFlavor('checklist');
      setFrequency('daily');
      setTargetAmount('4');
      setStepAmount('1');
      setUnit('L');
      setMilestones([]);
      setMilestoneMode('all');
      setBaselineCriteria([{ id: 'crit_1', label: 'Distance', target: 2, unit: 'km', stepAmount: 0.5 }, { id: 'crit_2', label: 'Duration', target: 20, unit: 'min', stepAmount: 5 }]);
      setDaysOfWeek([1, 2, 3, 4, 5]);
      setDayOfMonth('1');
      setMonthOfYear('1');
      setIntervalDays('2');
      setTargetDate(new Date().toISOString().split('T')[0]);
      setReminderTime('');
    }
  }, [initialTask, visible, groups]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const taskData: Task = {
      id: initialTask?.id || generateUUID('tsk'),
      userId: initialTask?.userId || 'usr_friend_1',
      groupId,
      title: title.trim(),
      flavor,
      frequency,
      daysOfWeek: frequency === 'days_of_week' ? daysOfWeek : undefined,
      dayOfMonth: (frequency === 'monthly' || frequency === 'yearly') ? parseInt(dayOfMonth, 10) || 1 : undefined,
      monthOfYear: frequency === 'yearly' ? parseInt(monthOfYear, 10) || 1 : undefined,
      intervalDays: frequency === 'custom' ? parseInt(intervalDays, 10) || 2 : undefined,
      targetDate: frequency === 'one_time' ? (targetDate.trim() || undefined) : undefined,
      targetAmount: flavor === 'quantified' ? (parseFloat(targetAmount) || undefined) : undefined,
      stepAmount: flavor === 'quantified' ? (parseFloat(stepAmount) || 1) : undefined,
      unit: flavor === 'quantified' ? unit.trim() : undefined,
      milestones: flavor === 'milestone' ? milestones.filter((m) => m.label.trim().length > 0) : undefined,
      milestoneMode: flavor === 'milestone' ? milestoneMode : undefined,
      baselineCriteria: flavor === 'flexible_baseline' ? baselineCriteria : undefined,
      reminderTime: reminderTime.trim() || undefined,
      sortOrder: initialTask?.sortOrder || Date.now(),
      createdAt: initialTask?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(taskData);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>{initialTask ? 'Edit Habit' : 'Create New Habit'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.field}>
              <Text style={styles.label}>Habit Name</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Morning Water, Read 20 Pages"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Group</Text>
              <View style={styles.pillRow}>
                {groups.map((grp) => (
                  <TouchableOpacity
                    key={grp.id}
                    style={[styles.selectPill, groupId === grp.id && styles.selectPillActive]}
                    onPress={() => setGroupId(grp.id)}
                  >
                    <Text style={[styles.selectText, groupId === grp.id && styles.selectTextActive]}>{grp.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>How do you measure it? (Flavor)</Text>
              <View style={styles.pillRow}>
                {FLAVORS.map((flv) => (
                  <TouchableOpacity
                    key={flv.id}
                    style={[styles.selectPill, flavor === flv.id && styles.selectPillActive]}
                    onPress={() => setFlavor(flv.id)}
                  >
                    <Text style={[styles.selectText, flavor === flv.id && styles.selectTextActive]}>{flv.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {flavor === 'quantified' && (
              <TaskQuantifiedFields
                targetAmount={targetAmount}
                onTargetChange={setTargetAmount}
                stepAmount={stepAmount}
                onStepChange={setStepAmount}
                unit={unit}
                onUnitChange={setUnit}
              />
            )}

            {flavor === 'milestone' && (
              <MilestonesBuilder
                milestones={milestones}
                onChange={setMilestones}
                milestoneMode={milestoneMode}
                onModeChange={setMilestoneMode}
              />
            )}

            {flavor === 'flexible_baseline' && (
              <BaselineCriteriaBuilder criteria={baselineCriteria} onChange={setBaselineCriteria} />
            )}

            <TaskFrequencyFields
              frequency={frequency}
              onFrequencyChange={setFrequency}
              daysOfWeek={daysOfWeek}
              onDaysChange={setDaysOfWeek}
              dayOfMonth={dayOfMonth}
              onDayOfMonthChange={setDayOfMonth}
              monthOfYear={monthOfYear}
              onMonthOfYearChange={setMonthOfYear}
              intervalDays={intervalDays}
              onIntervalDaysChange={setIntervalDays}
              targetDate={targetDate}
              onTargetDateChange={setTargetDate}
              reminderTime={reminderTime}
              onReminderTimeChange={setReminderTime}
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
              <Text style={styles.submitText}>{initialTask ? 'Save Changes' : 'Create Habit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
