/**
 * Laya (లయ) Mobile — Manage Groups Modal (ADR-0005, ADR-0016, ADR-0017)
 * Studio manager for habit categories with live preview, reordering, and lifecycle controls.
 */

import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { UserGroup, Task } from '../core/types';
import { GroupEditForm, GROUP_PALETTE } from './GroupEditForm';
import { getStyles } from './ManageGroupsModal.styles';

interface Props {
  visible: boolean;
  groups: UserGroup[];
  tasks: Task[];
  onClose: () => void;
  onCreateGroup: (name: string, color: string) => Promise<void>;
  onUpdateGroup: (group: UserGroup) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;
  onReorderGroups?: (groupIds: string[]) => Promise<void>;
}

export const ManageGroupsModal: React.FC<Props> = ({
  visible,
  groups,
  tasks,
  onClose,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onReorderGroups,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [groups]);

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(GROUP_PALETTE[0]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(GROUP_PALETTE[1]);

  const startEdit = (g: UserGroup) => {
    setIsAddingNew(false);
    setEditingGroupId(g.id);
    setEditName(g.name);
    setEditColor(g.color || GROUP_PALETTE[0]);
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
    const taskCount = tasks.filter((t) => !t.deletedAt && t.groupId === g.id).length;
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${g.name}"?\n\nAny habits in this group (${taskCount}) will safely be reassigned to another active group.`,
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

  const handleMoveGroup = async (groupId: string, direction: 'up' | 'down') => {
    const idx = sortedGroups.findIndex((g) => g.id === groupId);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (idx < 0 || targetIdx < 0 || targetIdx >= sortedGroups.length) return;
    const reordered = [...sortedGroups];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);
    if (onReorderGroups) {
      await onReorderGroups(reordered.map((g) => g.id));
    }
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
            {sortedGroups.map((g, idx) => {
              const isEditing = editingGroupId === g.id;
              const taskCount = tasks.filter((t) => !t.deletedAt && t.groupId === g.id).length;

              if (isEditing) {
                return (
                  <GroupEditForm
                    key={g.id}
                    group={g}
                    name={editName}
                    color={editColor}
                    onChangeName={setEditName}
                    onChangeColor={setEditColor}
                    onTogglePause={() => handleTogglePause(g)}
                    onToggleComplete={() => handleToggleComplete(g)}
                    onSave={() => handleSaveEdit(g)}
                    onCancel={cancelEdit}
                    onDelete={() => handleDeleteWithConfirm(g)}
                  />
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
                  <View style={styles.reorderActions}>
                    {idx > 0 && (
                      <TouchableOpacity style={styles.reorderArrowBtn} onPress={() => handleMoveGroup(g.id, 'up')} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
                        <Text style={styles.reorderArrowText}>▲</Text>
                      </TouchableOpacity>
                    )}
                    {idx < sortedGroups.length - 1 && (
                      <TouchableOpacity style={styles.reorderArrowBtn} onPress={() => handleMoveGroup(g.id, 'down')} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
                        <Text style={styles.reorderArrowText}>▼</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.iconBtn} onPress={() => startEdit(g)} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
                      <Text style={styles.iconBtnText}>✏️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {isAddingNew ? (
              <GroupEditForm
                isNew
                name={newName}
                color={newColor}
                onChangeName={setNewName}
                onChangeColor={setNewColor}
                onSave={handleCreateNew}
                onCancel={() => setIsAddingNew(false)}
              />
            ) : (
              <TouchableOpacity style={styles.addTriggerBtn} onPress={() => { cancelEdit(); setIsAddingNew(true); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.addTriggerText}>+ New Group</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

