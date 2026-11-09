/**
 * Laya (లయ) Mobile — Create Task Modal
 * Strict Form Field Isolation & Human Frequencies (ADR-0005)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/tokens';
import { Task, TaskFlavor, FrequencyType, UserGroup, MilestoneItem } from '../core/types';
import { generateUUID } from '../services/storage';
import { styles } from './CreateTaskModal.styles';

interface Props {
  visible: boolean;
  groups: UserGroup[];
  onClose: () => void;
  onSave: (task: Task) => void;
}

export const CreateTaskModal: React.FC<Props> = ({
  visible,
  groups,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [groupId, setGroupId] = useState(groups[0]?.id || 'grp_personal');
  const [flavor, setFlavor] = useState<TaskFlavor>('checklist');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [targetAmount, setTargetAmount] = useState('4');
  const [unit, setUnit] = useState('L');
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    { id: '1', label: 'Step 1', points: 1 },
    { id: '2', label: 'Step 2', points: 1 },
  ]);

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { id: Date.now().toString(), label: `Step ${milestones.length + 1}`, points: 1 },
    ]);
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleUpdateMilestone = (id: string, text: string) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, label: text } : m))
    );
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const newTask: Task = {
      id: generateUUID('tsk'),
      userId: 'usr_friend_1',
      groupId,
      title: title.trim(),
      flavor,
      frequency,
      targetAmount: flavor === 'checklist' && targetAmount ? parseFloat(targetAmount) : undefined,
      unit: flavor === 'checklist' ? unit : undefined,
      milestones: flavor === 'milestone' ? milestones : undefined,
      sortOrder: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newTask);
    setTitle('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Add New Habit</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.field}>
              <Text style={styles.label}>Habit Name</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Read Philosophy, Drink Water"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            {/* Group Selection */}
            <View style={styles.field}>
              <Text style={styles.label}>Group</Text>
              <View style={styles.pillRow}>
                {groups.map((grp) => (
                  <TouchableOpacity
                    key={grp.id}
                    style={[styles.selectPill, groupId === grp.id && styles.selectPillActive]}
                    onPress={() => setGroupId(grp.id)}
                  >
                    <Text style={[styles.selectText, groupId === grp.id && styles.selectTextActive]}>
                      {grp.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Flavor / Type */}
            <View style={styles.field}>
              <Text style={styles.label}>Habit Type</Text>
              <View style={styles.pillRow}>
                <TouchableOpacity
                  style={[styles.selectPill, flavor === 'checklist' && styles.selectPillActive]}
                  onPress={() => setFlavor('checklist')}
                >
                  <Text style={[styles.selectText, flavor === 'checklist' && styles.selectTextActive]}>
                    Standard / Quantified
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.selectPill, flavor === 'milestone' && styles.selectPillActive]}
                  onPress={() => setFlavor('milestone')}
                >
                  <Text style={[styles.selectText, flavor === 'milestone' && styles.selectTextActive]}>
                    Milestones
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Strict Field Isolation (ADR-0005) */}
            {flavor === 'checklist' && (
              <View style={styles.rowField}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Target Amount (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={targetAmount}
                    onChangeText={setTargetAmount}
                    keyboardType="numeric"
                    placeholder="e.g. 4"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Unit Label</Text>
                  <TextInput
                    style={styles.input}
                    value={unit}
                    onChangeText={setUnit}
                    placeholder="e.g. L, pages, mins"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              </View>
            )}

            {flavor === 'milestone' && (
              <View style={styles.field}>
                <Text style={styles.label}>Milestone Checkpoints</Text>
                {milestones.map((m) => (
                  <View key={m.id} style={styles.milestoneRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={m.label}
                      onChangeText={(t) => handleUpdateMilestone(m.id, t)}
                    />
                    <TouchableOpacity
                      onPress={() => handleRemoveMilestone(m.id)}
                      style={styles.delBtn}
                    >
                      <Text style={styles.delText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity onPress={handleAddMilestone} style={styles.addBtn}>
                  <Text style={styles.addText}>+ Add Checkpoint</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Repeat Frequency */}
            <View style={styles.field}>
              <Text style={styles.label}>Repeat Frequency</Text>
              <View style={styles.pillRow}>
                {[
                  { id: 'daily', label: 'Every Day' },
                  { id: 'days_of_week', label: 'Weekdays' },
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'anytime', label: 'Flexible / Anytime' },
                ].map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.selectPill, frequency === f.id && styles.selectPillActive]}
                    onPress={() => setFrequency(f.id as FrequencyType)}
                  >
                    <Text style={[styles.selectText, frequency === f.id && styles.selectTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
              <Text style={styles.submitText}>Save Habit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
