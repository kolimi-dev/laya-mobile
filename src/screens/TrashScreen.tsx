/**
 * Laya (లయ) Mobile — Trash & Recycle Bin Screen (ADR-0011, Phase 4)
 * Soft-Deleted Habits with 30-Day Purge Countdown and 1-Tap Restore
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Task, UserGroup } from '../core/types';
import { ColorPalette, darkColors, radiuses, spacing, typography } from '../theme/tokens';

interface Props {
  tasks: Task[];
  groups: UserGroup[];
  onRestore: (taskId: string) => void;
  onPurge: (taskId: string) => void;
  onEmptyTrash: () => void;
}

export const TrashScreen: React.FC<Props> = ({
  tasks,
  groups,
  onRestore,
  onPurge,
  onEmptyTrash,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const deletedTasks = useMemo(() => {
    return tasks.filter((t) => !!t.deletedAt);
  }, [tasks]);

  const confirmPurge = (task: Task) => {
    Alert.alert(
      'Permanent Deletion',
      `Permanently delete "${task.title}" and its history? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Forever', style: 'destructive', onPress: () => onPurge(task.id) },
      ]
    );
  };

  const confirmEmpty = () => {
    Alert.alert(
      'Empty Recycle Bin',
      `Permanently delete all ${deletedTasks.length} habits in the trash?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Empty Trash', style: 'destructive', onPress: onEmptyTrash },
      ]
    );
  };

  const getDaysLeft = (deletedAt: string) => {
    const elapsedMs = Date.now() - new Date(deletedAt).getTime();
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    return Math.max(1, 30 - elapsedDays);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>🗑️ Trash & Recycle Bin</Text>
          <Text style={styles.subtitle}>
            Soft-deleted habits stay safe here for 30 days before auto-purging.
          </Text>
        </View>

        {deletedTasks.length > 0 && (
          <TouchableOpacity style={styles.emptyBtn} onPress={confirmEmpty}>
            <Text style={styles.emptyBtnText}>Empty All</Text>
          </TouchableOpacity>
        )}
      </View>

      {deletedTasks.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Trash is Empty</Text>
          <Text style={styles.emptySubtext}>
            Accidentally deleted a habit? It will safely rest here for 30 days with 1-tap restore.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {deletedTasks.map((task) => {
            const group = groups.find((g) => g.id === task.groupId);
            const daysLeft = getDaysLeft(task.deletedAt!);

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
                      <Text style={styles.countdownText}>
                        Auto-purges in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.restoreBtn} onPress={() => onRestore(task.id)}>
                    <Text style={styles.restoreText}>↺ Restore</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.deletedDateText}>
                    Deleted on {new Date(task.deletedAt!).toLocaleDateString()}
                  </Text>
                  <TouchableOpacity onPress={() => confirmPurge(task)}>
                    <Text style={styles.purgeText}>Delete Forever</Text>
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
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    title: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700' },
    subtitle: { color: colors.textSecondary, fontSize: typography.caption, marginTop: 2 },
    emptyBtn: {
      backgroundColor: colors.bgInput,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radiuses.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 5,
    },
    emptyBtnText: { color: colors.danger, fontSize: 11, fontWeight: '600' },
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
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
    groupBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    groupDot: { width: 6, height: 6, borderRadius: radiuses.full },
    groupBadgeText: { color: colors.textSecondary, fontSize: typography.caption },
    countdownText: { color: colors.warning, fontSize: typography.caption, fontWeight: '500' },
    restoreBtn: {
      backgroundColor: colors.done,
      borderRadius: radiuses.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
    },
    restoreText: { color: '#FFFFFF', fontSize: typography.caption, fontWeight: '700' },
    cardBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      paddingTop: spacing.xs,
    },
    deletedDateText: { color: colors.textTertiary, fontSize: 11 },
    purgeText: { color: colors.danger, fontSize: 11, fontWeight: '600' },
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
