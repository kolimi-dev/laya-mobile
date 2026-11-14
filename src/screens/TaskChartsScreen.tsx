/**
 * Laya (లయ) Mobile — Task Charts & Custom Dashboards Screen (ADR-0004, ADR-0012, ADR-0015)
 * Dashboard Dropdown Selector, Pinning Default Dashboard, Time-Window Cache
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { PinnedChart, Task, CompletionEvent, UserDashboard, UserGroup, TimeWindow, ChartVisualizerStyle } from '../core/types';
import { filterEventsByTimeWindow } from '../core/recurrence';
import { ChartBlock } from '../components/ChartBlock';
import { TimeWindowSelector } from '../components/TimeWindowSelector';
import { CreateDashboardModal } from '../components/CreateDashboardModal';
import { AddChartModal } from '../components/AddChartModal';
import { DashboardPickerModal } from '../components/DashboardPickerModal';
import { EditDashboardModal } from '../components/EditDashboardModal';
import { getStyles } from './TaskChartsScreen.styles';

interface Props {
  pinnedCharts: PinnedChart[];
  tasks: Task[];
  events: CompletionEvent[];
  dashboards: UserDashboard[];
  groups: UserGroup[];
  initialDashboardId?: string;
  onCreateDashboard: (dash: UserDashboard) => void;
  onUpdateDashboard?: (dash: UserDashboard) => void;
  onDeleteDashboard?: (dashboardId: string) => void;
  onPinChart: (taskId: string, style?: ChartVisualizerStyle, dashboardId?: string) => void;
  onMoveChart: (chartId: string, direction: 'up' | 'down') => void;
  onRemoveChart: (chartId: string) => void;
}

export const TaskChartsScreen: React.FC<Props> = ({
  pinnedCharts,
  tasks,
  events,
  dashboards,
  initialDashboardId,
  onCreateDashboard,
  onUpdateDashboard,
  onDeleteDashboard,
  onPinChart,
  onMoveChart,
  onRemoveChart,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [activeDashId, setActiveDashId] = useState<string>(initialDashboardId || dashboards[0]?.id || 'dash_default');
  const [defaultDashId, setDefaultDashId] = useState<string>(dashboards[0]?.id || 'dash_default');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('7d');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [createDashOpen, setCreateDashOpen] = useState(false);
  const [editDashOpen, setEditDashOpen] = useState(false);
  const [addChartOpen, setAddChartOpen] = useState(false);
  const [isRearrangeMode, setIsRearrangeMode] = useState(false);

  useEffect(() => {
    if (initialDashboardId) setActiveDashId(initialDashboardId);
  }, [initialDashboardId]);

  useEffect(() => {
    AsyncStorage.getItem('@laya:default_dashboard_id').then((id) => {
      if (id && dashboards.some((d) => d.id === id)) {
        setDefaultDashId(id);
        if (!initialDashboardId) setActiveDashId(id);
      }
    });
    AsyncStorage.getItem('@laya:selected_timewindow').then((tw) => {
      if (tw) setTimeWindow(tw as TimeWindow);
    });
  }, [dashboards, initialDashboardId]);

  const handleSetTimeWindow = (tw: TimeWindow) => {
    setTimeWindow(tw);
    AsyncStorage.setItem('@laya:selected_timewindow', tw);
  };

  const handleSetDefaultDashboard = (id: string) => {
    setDefaultDashId(id);
    AsyncStorage.setItem('@laya:default_dashboard_id', id);
  };

  const activeDashboard = dashboards.find((d) => d.id === activeDashId) || dashboards[0] || {
    id: 'dash_default',
    title: 'Overview',
    icon: '📊',
    sortOrder: 1,
    createdAt: '',
    userId: '',
  };

  const dashboardCharts = useMemo(() => {
    return pinnedCharts.filter((c) => {
      const taskExists = tasks.some((t) => t.id === c.taskId && !t.deletedAt);
      if (!taskExists) return false;
      return !c.dashboardId || c.dashboardId === activeDashId;
    });
  }, [pinnedCharts, tasks, activeDashId]);

  const windowEvents = useMemo(() => filterEventsByTimeWindow(events, timeWindow), [events, timeWindow]);

  return (
    <View style={styles.container}>
      {/* Top Dashboard Dropdown Selector, ✏️ Edit, & + New Button */}
      <View style={styles.topSelectorRow}>
        <TouchableOpacity style={styles.dropdownBtn} onPress={() => setPickerOpen(true)} activeOpacity={0.7}>
          <Text style={styles.dropdownIcon}>{activeDashboard.icon || '📊'}</Text>
          <Text style={styles.dropdownTitle}>{activeDashboard.title}</Text>
          {activeDashId === defaultDashId && <Text style={styles.defaultBadge}>📌</Text>}
          <Text style={styles.dropdownChevron}>▾</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editDashBtn} onPress={() => setEditDashOpen(true)} activeOpacity={0.7}>
          <Text style={styles.editDashText}>✏️</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.newDashBtn} onPress={() => setCreateDashOpen(true)} activeOpacity={0.7}>
          <Text style={styles.newDashText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <TimeWindowSelector selected={timeWindow} onChange={handleSetTimeWindow} />

      <View style={styles.dashHeaderBar}>
        <View style={styles.dashTitleWrap}>
          <Text style={styles.dashCount}>{dashboardCharts.length} Charts in this view</Text>
        </View>
        <View style={styles.dashActionsRow}>
          {dashboardCharts.length > 0 && (
            <TouchableOpacity
              style={[styles.rearrangeBtn, isRearrangeMode && styles.rearrangeBtnActive]}
              onPress={() => setIsRearrangeMode(!isRearrangeMode)}
              activeOpacity={0.7}
            >
              <Text style={styles.rearrangeBtnText}>{isRearrangeMode ? '✓ Done' : '⚙️ Rearrange'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.addChartBtn} onPress={() => setAddChartOpen(true)} activeOpacity={0.7}>
            <Text style={styles.addChartText}>+ Add Chart</Text>
          </TouchableOpacity>
        </View>
      </View>

      {dashboardCharts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>0 Charts in this Dashboard</Text>
          <Text style={styles.emptySubtext}>Select any recurring habit to visualize volume bars, streak dials, heatmaps, or progression.</Text>
          <TouchableOpacity style={styles.addFirstBtn} onPress={() => setAddChartOpen(true)} activeOpacity={0.8}>
            <Text style={styles.addFirstText}>+ Add Your First Chart</Text>
          </TouchableOpacity>
        </View>
      ) : (
        dashboardCharts.map((chart, idx) => {
          const task = tasks.find((t) => t.id === chart.taskId);
          if (!task) return null;
          return (
            <ChartBlock
              key={chart.id}
              chart={chart}
              task={task}
              events={windowEvents.filter((e) => e.taskId === task.id)}
              timeWindow={timeWindow}
              isFirst={idx === 0}
              isLast={idx === dashboardCharts.length - 1}
              isEditMode={isRearrangeMode}
              onMoveUp={(id) => onMoveChart(id, 'up')}
              onMoveDown={(id) => onMoveChart(id, 'down')}
              onRemove={onRemoveChart}
            />
          );
        })
      )}

      <DashboardPickerModal
        visible={pickerOpen}
        dashboards={dashboards}
        activeDashboardId={activeDashId}
        defaultDashboardId={defaultDashId}
        onSelectDashboard={setActiveDashId}
        onSetDefaultDashboard={handleSetDefaultDashboard}
        onOpenCreateDashboard={() => setCreateDashOpen(true)}
        onClose={() => setPickerOpen(false)}
      />

      <EditDashboardModal
        visible={editDashOpen}
        dashboard={activeDashboard}
        onClose={() => setEditDashOpen(false)}
        onSave={(updated) => onUpdateDashboard?.(updated)}
        onDelete={(id) => {
          onDeleteDashboard?.(id);
          const fallback = dashboards.find((d) => d.id !== id)?.id || 'dash_default';
          setActiveDashId(fallback);
        }}
      />

      <CreateDashboardModal
        visible={createDashOpen}
        onClose={() => setCreateDashOpen(false)}
        onSave={(newDash) => {
          onCreateDashboard(newDash);
          setActiveDashId(newDash.id);
        }}
      />

      <AddChartModal
        visible={addChartOpen}
        dashboardTitle={activeDashboard.title}
        tasks={tasks}
        onClose={() => setAddChartOpen(false)}
        onAddChart={(taskId, style) => onPinChart(taskId, style, activeDashId)}
      />
    </View>
  );
};
