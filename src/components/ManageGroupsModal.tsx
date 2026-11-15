/**
 * Laya (లయ) Mobile — Manage Groups Modal (ADR-0005, ADR-0016)
 * Full CRUD for habit groups with confirmation on deletion and task remapping
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { UserGroup, Task } from '../core/types';
import { getStyles } from './ManageGroupsModal.styles';

const PALETTE = ['#94A3B8', '#38BDF8', '#34D399', '#F472B6', '#FBBF24', '#A78BFA'];

interface Props {
  visible: boolean;
  groups: UserGroup[];
  tasks: Task[];
  onClose: () => void;
  onCreateGroup: (name: string, color: string) => Promise<void>;
  onUpdateGroup: (group: UserGroup) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;
}

export const ManageGroupsModal: React.FC<Props> = ({
  visible,
  groups,
  tasks,
  onClose,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(PALETTE[0]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PALETTE[1]);

  const startEdit = (g: UserGroup) => {
    setIsAddingNew(false);
    setEditingGroupId(g.id);
    setEditName(g.name);
    setEditColor(g.color || PALETTE[0]);
  };

  const cancelEdit = () => {
    setEditingGroupId(null);
    setEditName('');
  };

  const handleSaveEdit = async (g: UserGroup) => {
    if (!editName.trim()) {
      Alert.alert('Validation Error', 'Group name cannot be blank.');
      return;
    }
    await onUpdateGroup({ ...g, name: editName.trim(), color: editColor });
    setEditingGroupId(null);
  };

  const handleTogglePause = async (g: UserGroup) => {
    await onUpdateGroup({ ...g, lifecycleStatus: g.lifecycleStatus === 'paused' ? 'active' : 'paused' });
  };

  const handleToggleComplete = async (g: UserGroup) => {
    await onUpdateGroup({ ...g, lifecycleStatus: g.lifecycleStatus === 'completed' ? 'active' : 'completed' });
  };

  const handleDeleteWithConfirm = (g: UserGroup) => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${g.name}"?\n\nAny habits in this group will safely be reassigned to another active group.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Group',
          style: 'destructive',
          onPress: async () => {
            await onDeleteGroup(g.id);
            setEditingGroupId(null);
          },
        },
      ]
    );
  };

  const handleCreateNew = async () => {
    if (!newName.trim()) {
      Alert.alert('Validation Error', 'Please enter a group name.');
      return;
    }
    await onCreateGroup(newName.trim(), newColor);
    setNewName('');
    setIsAddingNew(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Manage Groups</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Organize your rhythms into life dimensions</Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {groups.map((g) => {
              const isEditing = editingGroupId === g.id;
              const taskCount = tasks.filter((t) => !t.deletedAt && t.groupId === g.id).length;

              if (isEditing) {
                return (
                  <View key={g.id} style={styles.editBox}>
                    <TextInput
                      style={styles.input}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Group name"
                      placeholderTextColor={colors.textTertiary}
                      autoFocus
                    />
                    <View style={styles.paletteRow}>
                      {PALETTE.map((c) => (
                        <TouchableOpacity
                          key={c}
                          style={[styles.colorCircle, { backgroundColor: c }, editColor === c && styles.colorCircleSelected]}
                          onPress={() => setEditColor(c)}
                        />
                      ))}
                    </View>
                    <View style={styles.lifecycleRow}>
                      <TouchableOpacity
                        style={[styles.lifecycleBtn, g.lifecycleStatus === 'paused' && styles.lifecycleBtnActive]}
                        onPress={() => handleTogglePause(g)}
                      >
                        <Text style={[styles.lifecycleBtnText, g.lifecycleStatus === 'paused' && styles.lifecycleBtnTextActive]}>
                          {g.lifecycleStatus === 'paused' ? '▶️ Resume' : '⏸️ Pause'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.lifecycleBtn, g.lifecycleStatus === 'completed' && styles.lifecycleBtnActive]}
                        onPress={() => handleToggleComplete(g)}
                      >
                        <Text style={[styles.lifecycleBtnText, g.lifecycleStatus === 'completed' && styles.lifecycleBtnTextActive]}>
                          {g.lifecycleStatus === 'completed' ? '✓ Mark Active' : '🏁 Complete'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.actionsRow}>
                      <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={cancelEdit}>
                        <Text style={styles.cancelBtnText}>✕ Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDeleteWithConfirm(g)}>
                        <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={() => handleSaveEdit(g)}>
                        <Text style={styles.saveBtnText}>✓ Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }

              return (
                <View key={g.id} style={styles.groupRow}>
                  <View style={styles.groupInfo}>
                    <View style={[styles.colorDot, { backgroundColor: g.color || colors.primary }]} />
                    <Text style={styles.groupName}>{g.name}</Text>
                    {g.lifecycleStatus === 'paused' && <Text style={styles.statusBadge}>⏸️ Paused</Text>}
                    {g.lifecycleStatus === 'completed' && <Text style={[styles.statusBadge, styles.statusBadgeDone]}>🏁 Done</Text>}
                    <Text style={styles.countBadge}>{taskCount} {taskCount === 1 ? 'habit' : 'habits'}</Text>
                  </View>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => startEdit(g)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Text style={styles.iconBtnText}>✏️</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {isAddingNew ? (
              <View style={styles.editBox}>
                <TextInput
                  style={styles.input}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="New group name (e.g. Finance)"
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                />
                <View style={styles.paletteRow}>
                  {PALETTE.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.colorCircle, { backgroundColor: c }, newColor === c && styles.colorCircleSelected]}
                      onPress={() => setNewColor(c)}
                    />
                  ))}
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => setIsAddingNew(false)}>
                    <Text style={styles.cancelBtnText}>✕ Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={handleCreateNew}>
                    <Text style={styles.saveBtnText}>✓ Create Group</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.addTriggerBtn} onPress={() => { cancelEdit(); setIsAddingNew(true); }}>
                <Text style={styles.addTriggerText}>+ New Group</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
