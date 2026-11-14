/**
 * Laya (లయ) Mobile — Progressive Disclosure TaskCard Drawer
 * Displays secondary actions, 7-day dot trail history, and meta badges on demand.
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Task, UserGroup, CompletionEvent, UserDashboard, PinnedChart } from '../core/types';
import { speakReminder } from '../services/voice';
import { WeeklyDotTrail } from './WeeklyDotTrail';
import { getStyles } from './TaskCard.styles';

export interface TaskCardDrawerProps {
  task: Task;
  isIgnored: boolean;
  notes?: string;
  group?: UserGroup;
  events?: CompletionEvent[];
  dashboards?: UserDashboard[];
  pinnedCharts?: PinnedChart[];
  onOpenRestModal: () => void;
  onEditTask?: (task: Task) => void;
  onNavigateToDashboard?: (dashboardId: string) => void;
}

export const TaskCardDrawer: React.FC<TaskCardDrawerProps> = ({
  task,
  isIgnored,
  notes,
  group,
  events = [],
  dashboards = [],
  pinnedCharts = [],
  onOpenRestModal,
  onEditTask,
  onNavigateToDashboard,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const taskDashboards = useMemo(() => {
    if (!dashboards.length || !pinnedCharts.length) return [];
    const chartDashIds = new Set(
      pinnedCharts.filter((c) => c.taskId === task.id).map((c) => c.dashboardId || dashboards[0]?.id || 'dash_default')
    );
    return dashboards.filter((d) => chartDashIds.has(d.id));
  }, [dashboards, pinnedCharts, task.id]);

  return (
    <View style={styles.drawerContainer}>
      {/* 7-Day Rhythm Dot Trail */}
      <View style={styles.drawerSection}>
        <Text style={styles.drawerSectionLabel}>7-Day Rhythm</Text>
        <WeeklyDotTrail taskId={task.id} events={events} />
      </View>

      {/* Meta Badges */}
      <View style={styles.drawerBadgesRow}>
        {group && (
          <View style={styles.groupBadge}>
            <View style={[styles.groupDot, { backgroundColor: group.color }]} />
            <Text style={styles.groupBadgeText}>{group.name}</Text>
          </View>
        )}
        <Text style={styles.flavorBadge}>{task.flavor.replace('_', ' ')}</Text>
        {task.reminderTime ? <View style={styles.metaPill}><Text style={styles.metaPillText}>⏰ {task.reminderTime}</Text></View> : null}
        {taskDashboards.length > 0 && (
          <TouchableOpacity
            style={styles.metaPill}
            onPress={() => onNavigateToDashboard?.(taskDashboards[0].id)}
            activeOpacity={0.7}
          >
            <Text style={styles.metaPillText}>📊 {taskDashboards.length === 1 ? taskDashboards[0].title : `${taskDashboards.length} Dashboards`}</Text>
          </TouchableOpacity>
        )}
        {(task.frequency === 'one_time' || task.flavor === 'one_time') && task.targetDate && (
          <View style={styles.metaPill}><Text style={styles.metaPillText}>📅 {task.targetDate}</Text></View>
        )}
        {task.frequency === 'monthly' && <View style={styles.metaPill}><Text style={styles.metaPillText}>🗓️ Day {task.dayOfMonth || 1}</Text></View>}
        {task.frequency === 'yearly' && <View style={styles.metaPill}><Text style={styles.metaPillText}>🗓️ {task.monthOfYear || 1}/{task.dayOfMonth || 1}</Text></View>}
        {notes ? <View style={styles.metaPill}><Text style={styles.metaPillText}>💬 {notes}</Text></View> : null}
      </View>

      {/* Action Buttons Row */}
      <View style={styles.drawerActionsRow}>
        <TouchableOpacity
          style={[styles.drawerActionBtn, isIgnored && styles.drawerActionBtnActive]}
          onPress={onOpenRestModal}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.drawerActionBtnText, isIgnored && styles.drawerActionBtnTextActive]}>
            {isIgnored ? `🌙 Rested (${notes || 'Guilt-Free'})` : '🌙 Rest Day'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerActionBtn}
          onPress={() => speakReminder(task.title, group)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.drawerActionBtnText}>🔊 Voice</Text>
        </TouchableOpacity>

        {onEditTask && (
          <TouchableOpacity
            style={styles.drawerActionBtn}
            onPress={() => onEditTask(task)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.drawerActionBtnText}>✏️ Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
