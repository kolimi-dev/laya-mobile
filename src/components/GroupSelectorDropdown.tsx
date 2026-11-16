/**
 * Laya (లయ) Mobile — Group Selector Dropdown (ADR-0016, V2.2)
 * Clean dropdown selector showing active habit counts per group and inline Manage Groups trigger
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Task, UserGroup, EvaluatedTask } from '../core/types';
import { getStyles } from './GroupSelectorDropdown.styles';

export interface GroupSelectorDropdownProps {
  groups: UserGroup[];
  tasks: Task[];
  remainingTasks?: EvaluatedTask[];
  activeGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onManageGroups?: () => void;
}

export const GroupSelectorDropdown: React.FC<GroupSelectorDropdownProps> = ({
  groups,
  tasks,
  remainingTasks,
  activeGroupId,
  onSelectGroup,
  onManageGroups,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeHabits = useMemo(() => {
    return tasks.filter((t) => !t.deletedAt && !t.archivedAt && (t.lifecycleStatus || 'active') === 'active');
  }, [tasks]);

  const groupCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of activeHabits) {
      if (t.groupId) map[t.groupId] = (map[t.groupId] || 0) + 1;
    }
    return map;
  }, [activeHabits]);

  const remainingCounts = useMemo(() => {
    if (!remainingTasks) return null;
    const map: Record<string, number> = {};
    for (const rt of remainingTasks) {
      if (rt.task.groupId) map[rt.task.groupId] = (map[rt.task.groupId] || 0) + 1;
    }
    return map;
  }, [remainingTasks]);

  const selectedGroup = useMemo(() => {
    return groups.find((g) => g.id === activeGroupId) || null;
  }, [groups, activeGroupId]);

  const activeCount = selectedGroup
    ? (remainingCounts ? (remainingCounts[selectedGroup.id] || 0) : (groupCounts[selectedGroup.id] || 0))
    : (remainingTasks ? remainingTasks.length : activeHabits.length);

  return (
    <>
      <TouchableOpacity
        style={styles.triggerBtn}
        onPress={() => setDropdownOpen(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Filter by group: ${selectedGroup ? selectedGroup.name : 'All Groups'}`}
      >
        <View style={styles.triggerLeft}>
          {selectedGroup ? (
            <View style={[styles.colorDot, { backgroundColor: selectedGroup.color }]} />
          ) : (
            <Text style={styles.folderIcon}>📁</Text>
          )}
          <Text style={styles.triggerText} numberOfLines={1}>
            {selectedGroup ? selectedGroup.name : 'All Groups'}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{activeCount}</Text>
          </View>
        </View>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <View style={styles.backdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setDropdownOpen(false)}
          />
          <View style={styles.card}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Habit Groups</Text>
                <Text style={styles.subtitle}>Filter rhythm by category</Text>
              </View>
              <TouchableOpacity
                onPress={() => setDropdownOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.itemRow, activeGroupId === null && styles.itemRowActive]}
                onPress={() => {
                  onSelectGroup(null);
                  setDropdownOpen(false);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.itemMain}>
                  <Text style={styles.itemIcon}>📁</Text>
                  <View style={styles.itemTextWrap}>
                    <Text style={[styles.itemTitle, activeGroupId === null && styles.itemTitleActive]}>
                      All Groups
                    </Text>
                    <Text style={styles.itemSubtitle}>
                      {remainingTasks ? `${remainingTasks.length} remaining today` : `${activeHabits.length} ${activeHabits.length === 1 ? 'habit' : 'habits'}`}
                    </Text>
                  </View>
                </View>
                {activeGroupId === null && <Text style={styles.activeCheck}>✓</Text>}
              </TouchableOpacity>

              {groups.map((grp) => {
                const isActive = activeGroupId === grp.id;
                const count = remainingCounts ? (remainingCounts[grp.id] || 0) : (groupCounts[grp.id] || 0);
                return (
                  <TouchableOpacity
                    key={grp.id}
                    style={[styles.itemRow, isActive && styles.itemRowActive]}
                    onPress={() => {
                      onSelectGroup(grp.id);
                      setDropdownOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemMain}>
                      <View style={[styles.colorDotLg, { backgroundColor: grp.color }]} />
                      <View style={styles.itemTextWrap}>
                        <Text style={[styles.itemTitle, isActive && styles.itemTitleActive]}>
                          {grp.name}
                        </Text>
                        <Text style={styles.itemSubtitle}>
                          {remainingCounts ? `${count} remaining today` : `${count} ${count === 1 ? 'habit' : 'habits'}`}
                        </Text>
                      </View>
                    </View>
                    {isActive && <Text style={styles.activeCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {onManageGroups && (
              <TouchableOpacity
                style={styles.manageBtn}
                onPress={() => {
                  setDropdownOpen(false);
                  onManageGroups();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.manageBtnText}>⚙️ Manage Groups</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

