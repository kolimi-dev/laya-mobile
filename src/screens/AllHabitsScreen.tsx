/**
 * Laya (లయ) Mobile — All Habits Catalog Screen (ADR-0016)
 * Complete inventory of all active habits across all cadences (daily, monthly, custom).
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, spacing, radiuses, typography } from '../theme/tokens';
import { Task, UserGroup } from '../core/types';

interface Props {
  tasks: Task[];
  groups: UserGroup[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string, title: string) => void;
  onAddNew: () => void;
  onPinChart?: (taskId: string) => void;
  onSetLifecycleStatus?: (taskId: string, status: 'active' | 'completed' | 'paused' | 'retired') => void;
}

export const AllHabitsScreen: React.FC<Props> = ({
  tasks,
  groups,
  onEditTask,
  onDeleteTask,
  onAddNew,
  onPinChart,
  onSetLifecycleStatus,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const activeHabits = useMemo(() => {
    return tasks.filter((t) => {
      if (t.deletedAt || t.archivedAt) return false;
      if (t.lifecycleStatus && t.lifecycleStatus !== 'active') return false;
      return true;
    });
  }, [tasks]);

  const filtered = useMemo(() => {
    if (!selectedGroupId) return activeHabits;
    return activeHabits.filter((t) => t.groupId === selectedGroupId);
  }, [activeHabits, selectedGroupId]);

  const getCadenceLabel = (t: Task): string => {
    switch (t.frequency) {
      case 'daily': return 'Daily';
      case 'days_of_week': return 'Specific Days';
      case 'weekly': return 'Weekly';
      case 'monthly': return `Monthly (Day ${t.dayOfMonth || 1})`;
      case 'yearly': return `Yearly (${t.monthOfYear || 1}/${t.dayOfMonth || 1})`;
      case 'custom': return `Every ${t.intervalDays || 2} days`;
      case 'one_time': return `One-time (${t.targetDate || 'Today'})`;
      case 'anytime': return 'Anytime Backlog';
      default: return 'Active';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>All Habits Catalog</Text>
          <Text style={styles.subtitle}>{activeHabits.length} total habits across all rhythms</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={onAddNew} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Group Filter Pills */}
      <View style={styles.groupPillsRow}>
        <TouchableOpacity
          style={[styles.groupPill, !selectedGroupId && styles.groupPillActive]}
          onPress={() => setSelectedGroupId(null)}
        >
          <Text style={[styles.groupPillText, !selectedGroupId && styles.groupPillTextActive]}>All ({activeHabits.length})</Text>
        </TouchableOpacity>
        {groups.map((g) => {
          const count = activeHabits.filter((t) => t.groupId === g.id).length;
          const isSel = selectedGroupId === g.id;
          return (
            <TouchableOpacity
              key={g.id}
              style={[styles.groupPill, isSel && styles.groupPillActive]}
              onPress={() => setSelectedGroupId(isSel ? null : g.id)}
            >
              <View style={[styles.dot, { backgroundColor: g.color || colors.primary }]} />
              <Text style={[styles.groupPillText, isSel && styles.groupPillTextActive]}>{g.name} ({count})</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No habits found</Text>
          <Text style={styles.emptySubtext}>Tap "+ Add" to create habits with daily, weekly, or monthly cadences.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filtered.map((t) => {
            const grp = groups.find((g) => g.id === t.groupId);
            return (
              <View key={t.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.cardTitle}>{t.title}</Text>
                    <View style={styles.badgesRow}>
                      {grp && (
                        <View style={styles.groupBadge}>
                          <View style={[styles.dot, { backgroundColor: grp.color }]} />
                          <Text style={styles.groupBadgeText}>{grp.name}</Text>
                        </View>
                      )}
                      <Text style={styles.cadenceBadge}>{getCadenceLabel(t)}</Text>
                      <Text style={styles.flavorBadge}>
                        {t.flavor === 'quantified'
                          ? `Target: ${t.targetAmount || 1} ${t.unit || ''}`
                          : t.flavor === 'flexible_baseline'
                          ? `Baseline: ${(t.baselineCriteria || []).map((c) => `${c.target} ${c.unit}`).join(' OR ')}`
                          : t.flavor}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
                    {onPinChart && (
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => {
                          onPinChart(t.id);
                          Alert.alert('Chart Pinned', `Pinned "${t.title}" to your active dashboard!`);
                        }}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.actionBtnText}>📊</Text>
                      </TouchableOpacity>
                    )}
                    {onSetLifecycleStatus && (
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => {
                          Alert.alert('Pause Habit', `Pause "${t.title}"? It will move to Inactive Habits.`, [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Pause', style: 'destructive', onPress: () => onSetLifecycleStatus(t.id, 'paused') },
                          ]);
                        }}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.actionBtnText}>⏸️</Text>
                      </TouchableOpacity>
                    )}
                    {onSetLifecycleStatus && (
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => {
                          Alert.alert('Complete Routine', `Mark "${t.title}" as completed? It will move to Inactive Habits.`, [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Complete', onPress: () => onSetLifecycleStatus(t.id, 'completed') },
                          ]);
                        }}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.actionBtnText}>🏁</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.actionBtn} onPress={() => onEditTask(t)} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.actionBtnText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => onDeleteTask(t.id, t.title)} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.actionBtnText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const getStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: { paddingBottom: spacing.xxl },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    title: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700' },
    subtitle: { color: colors.textSecondary, fontSize: typography.caption },
    addBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radiuses.md },
    addBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    groupPillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md },
    groupPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radiuses.full, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderSubtle },
    groupPillActive: { borderColor: colors.primary, backgroundColor: colors.badgeBg },
    groupPillText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
    groupPillTextActive: { color: colors.primary },
    dot: { width: 6, height: 6, borderRadius: 3 },
    list: { gap: spacing.sm },
    card: { backgroundColor: colors.bgCard, borderRadius: radiuses.lg, borderWidth: 1, borderColor: colors.borderSubtle, padding: spacing.md },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
    cardTitleWrap: { flex: 1, gap: 4 },
    cardTitle: { color: colors.textPrimary, fontSize: typography.subheading, fontWeight: '700' },
    badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, alignItems: 'center' },
    groupBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.bgInput, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radiuses.sm },
    groupBadgeText: { color: colors.textSecondary, fontSize: 10, fontWeight: '600' },
    cadenceBadge: { color: colors.primary, backgroundColor: colors.badgeBg, fontSize: 10, fontWeight: '600', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radiuses.sm },
    flavorBadge: { color: colors.textSecondary, backgroundColor: colors.bgInput, fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radiuses.sm },
    actionsRow: { flexDirection: 'row', gap: 6 },
    actionBtn: { width: 32, height: 32, borderRadius: radiuses.md, backgroundColor: colors.bgInput, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.borderSubtle },
    actionBtnText: { fontSize: 14 },
    emptyCard: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radiuses.lg, padding: spacing.xl, alignItems: 'center', gap: 6 },
    emptyTitle: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '600' },
    emptySubtext: { color: colors.textTertiary, fontSize: typography.caption, textAlign: 'center' },
  });
