/**
 * Laya (లయ) Mobile — Not Active Habits Screen (ADR-0011, Phase 4)
 * Lifecycle Machine for Completed, Paused & Retired Routines with 1-Tap Reactivate
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Task, UserGroup } from '../core/types';
import { ColorPalette, darkColors, radiuses, spacing, typography } from '../theme/tokens';

type LifecycleFilter = 'all' | 'completed' | 'paused' | 'retired';

interface Props {
  tasks: Task[];
  groups: UserGroup[];
  onReactivate: (taskId: string) => void;
  onSetStatus: (taskId: string, status: 'completed' | 'paused' | 'retired') => void;
  onDeleteToTrash: (taskId: string) => void;
}

export const NotActiveScreen: React.FC<Props> = ({
  tasks,
  groups,
  onReactivate,
  onSetStatus,
  onDeleteToTrash,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [filter, setFilter] = useState<LifecycleFilter>('all');

  const notActiveTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.deletedAt) return false;
      const isNotActive = t.lifecycleStatus && t.lifecycleStatus !== 'active';
      const isArchived = !!t.archivedAt;
      if (!isNotActive && !isArchived) return false;

      const effectiveStatus = t.lifecycleStatus || 'paused';
      if (filter === 'all') return true;
      return effectiveStatus === filter;
    });
  }, [tasks, filter]);

  const getStatusColor = (status?: string) => {
    if (status === 'completed') return colors.done;
    if (status === 'paused') return colors.warning;
    return colors.textTertiary;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗄️ Not Active Habits</Text>
        <Text style={styles.subtitle}>
          Preserves completion histories for finished courses and paused routines.
        </Text>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(['all', 'completed', 'paused', 'retired'] as LifecycleFilter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {notActiveTasks.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Inactive Habits</Text>
          <Text style={styles.emptySubtext}>
            {filter === 'all'
              ? 'When a routine completes, pauses, or retires, it lives here with 100% data intact.'
              : `No habits with status "${filter}".`}
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {notActiveTasks.map((task) => {
            const group = groups.find((g) => g.id === task.groupId);
            const status = task.lifecycleStatus || 'paused';

            return (
              <View key={task.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View style={styles.badgeRow}>
                      {group && (
                        <View style={styles.groupBadge}>
                          <View style={[styles.groupDot, { backgroundColor: group.color }]} />
                          <Text style={styles.groupBadgeText}>{group.name}</Text>
                        </View>
                      )}
                      <View style={[styles.statusBadge, { borderColor: getStatusColor(status) }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                          {status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.reactivateBtn} onPress={() => onReactivate(task.id)}>
                    <Text style={styles.reactivateText}>⚡ Reactivate</Text>
                  </TouchableOpacity>
                </View>

                {/* Sub-actions */}
                <View style={styles.cardBottom}>
                  <View style={styles.statusSwitchRow}>
                    <TouchableOpacity onPress={() => onSetStatus(task.id, 'paused')}>
                      <Text style={[styles.switchLink, status === 'paused' && styles.switchLinkActive]}>
                        Pause
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.sep}>•</Text>
                    <TouchableOpacity onPress={() => onSetStatus(task.id, 'completed')}>
                      <Text style={[styles.switchLink, status === 'completed' && styles.switchLinkActive]}>
                        Complete
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.sep}>•</Text>
                    <TouchableOpacity onPress={() => onSetStatus(task.id, 'retired')}>
                      <Text style={[styles.switchLink, status === 'retired' && styles.switchLinkActive]}>
                        Retire
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity onPress={() => onDeleteToTrash(task.id)}>
                    <Text style={styles.trashLink}>🗑️ Trash</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    container: { flex: 1, paddingBottom: spacing.xxl },
    header: { marginBottom: spacing.md },
    title: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700' },
    subtitle: { color: colors.textSecondary, fontSize: typography.caption, marginTop: 2 },
    filterRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
    filterChip: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
    },
    filterChipActive: { backgroundColor: colors.bgActive, borderColor: colors.borderStrong },
    filterText: { color: colors.textSecondary, fontSize: typography.caption, fontWeight: '500' },
    filterTextActive: { color: colors.textPrimary, fontWeight: '700' },
    list: { gap: spacing.sm },
    card: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.lg,
      padding: spacing.md,
      gap: spacing.sm,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    taskTitle: { color: colors.textPrimary, fontSize: typography.subheading, fontWeight: '600' },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 4 },
    groupBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    groupDot: { width: 6, height: 6, borderRadius: radiuses.full },
    groupBadgeText: { color: colors.textSecondary, fontSize: typography.caption },
    statusBadge: { borderWidth: 1, borderRadius: radiuses.full, paddingHorizontal: 6, paddingVertical: 1 },
    statusText: { fontSize: 9, fontWeight: '700' },
    reactivateBtn: {
      backgroundColor: colors.primary,
      borderRadius: radiuses.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
    },
    reactivateText: { color: '#FFFFFF', fontSize: typography.caption, fontWeight: '700' },
    cardBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      paddingTop: spacing.xs,
    },
    statusSwitchRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    switchLink: { color: colors.textTertiary, fontSize: 11 },
    switchLinkActive: { color: colors.textPrimary, fontWeight: '600' },
    sep: { color: colors.borderSubtle, fontSize: 10 },
    trashLink: { color: colors.danger, fontSize: 11 },
    emptyCard: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.lg,
      padding: spacing.xl,
      alignItems: 'center',
      gap: 4,
    },
    emptyTitle: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '600' },
    emptySubtext: { color: colors.textTertiary, fontSize: typography.body, textAlign: 'center' },
  });
