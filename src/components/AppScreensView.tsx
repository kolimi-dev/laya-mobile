/**
 * Laya (లయ) Mobile — App Screens View Switcher Component
 * Delegates active screen rendering to preserve modularity & file line budgets
 */

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Task, UserGroup, CompletionEvent, UserDashboard, PinnedChart, ChartVisualizerStyle } from '../core/types';
import { AppView } from './NavigationDrawer';
import { HorizonMode } from './DayNavigator';
import { TodayTasksScreen } from '../screens/TodayTasksScreen';
import { UpcomingTasksScreen } from '../screens/UpcomingTasksScreen';
import { TaskChartsScreen } from '../screens/TaskChartsScreen';
import { AllHabitsScreen } from '../screens/AllHabitsScreen';
import { NotActiveScreen } from '../screens/NotActiveScreen';
import { TrashScreen } from '../screens/TrashScreen';
import { EvaluatedTask } from '../core/types';

interface Props {
  activeView: AppView;
  horizonMode: HorizonMode;
  tasks: Task[];
  remainingTasks: EvaluatedTask[];
  completedOrRestedTasks: EvaluatedTask[];
  groups: UserGroup[];
  events: CompletionEvent[];
  dashboards: UserDashboard[];
  pinnedCharts: PinnedChart[];
  selectedDashboardId?: string;
  onToggleComplete: (taskId: string) => Promise<void>;
  onToggleMilestone: (taskId: string, mId: string) => Promise<void>;
  onSkipMilestone: (taskId: string, mId: string, reason?: string) => Promise<void>;
  onUpdateQuantified: (taskId: string, delta: number) => Promise<void>;
  onSetQuantifiedExact: (taskId: string, val: number) => Promise<void>;
  onToggleIgnore: (taskId: string, notes?: string) => Promise<void>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string, title: string) => void;
  onNavigateToDashboard: (dashId: string) => void;
  onOpenFeedback: () => void;
  onCreateDashboard: (dash: UserDashboard) => Promise<void>;
  onUpdateDashboard: (dash: UserDashboard) => Promise<void>;
  onDeleteDashboard: (id: string) => Promise<void>;
  onPinChart: (taskId: string, chartType?: ChartVisualizerStyle, dashId?: string) => Promise<void>;
  onMoveChart: (chartId: string, dir: 'up' | 'down') => Promise<void>;
  onRemoveChart: (chartId: string) => Promise<void>;
  onReactivateTask: (taskId: string) => Promise<void>;
  onSetLifecycleStatus: (taskId: string, status: 'active' | 'completed' | 'paused' | 'retired') => Promise<void>;
  onRestoreTask: (taskId: string) => Promise<void>;
  onPurgeTask: (taskId: string) => Promise<void>;
  onEmptyTrash: () => Promise<void>;
  onAddNewTask: () => void;
  onReorderTasks?: (ids: string[]) => void;
}

export const AppScreensView: React.FC<Props> = (props) => {
  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {props.activeView === 'tasks' && props.horizonMode === 'day' && (
        <TodayTasksScreen
          remainingTasks={props.remainingTasks}
          completedOrRestedTasks={props.completedOrRestedTasks}
          groups={props.groups}
          events={props.events}
          dashboards={props.dashboards}
          pinnedCharts={props.pinnedCharts}
          onToggleComplete={props.onToggleComplete}
          onToggleMilestone={props.onToggleMilestone}
          onSkipMilestone={props.onSkipMilestone}
          onUpdateQuantified={props.onUpdateQuantified}
          onSetQuantifiedExact={props.onSetQuantifiedExact}
          onToggleIgnore={props.onToggleIgnore}
          onEditTask={props.onEditTask}
          onDeleteTask={props.onDeleteTask}
          onNavigateToDashboard={props.onNavigateToDashboard}
          onOpenFeedback={props.onOpenFeedback}
          onReorderTasks={props.onReorderTasks}
        />
      )}
      {props.activeView === 'tasks' && props.horizonMode === 'upcoming' && (
        <UpcomingTasksScreen tasks={props.tasks} groups={props.groups} />
      )}
      {props.activeView === 'charts' && (
        <TaskChartsScreen
          pinnedCharts={props.pinnedCharts}
          tasks={props.tasks}
          events={props.events}
          dashboards={props.dashboards}
          groups={props.groups}
          initialDashboardId={props.selectedDashboardId}
          onCreateDashboard={props.onCreateDashboard}
          onUpdateDashboard={props.onUpdateDashboard}
          onDeleteDashboard={props.onDeleteDashboard}
          onPinChart={props.onPinChart}
          onMoveChart={props.onMoveChart}
          onRemoveChart={props.onRemoveChart}
        />
      )}
      {props.activeView === 'all_habits' && (
        <AllHabitsScreen
          tasks={props.tasks}
          groups={props.groups}
          onEditTask={props.onEditTask}
          onDeleteTask={props.onDeleteTask}
          onAddNew={props.onAddNewTask}
          onPinChart={(id) => props.onPinChart(id)}
        />
      )}
      {props.activeView === 'not_active' && (
        <NotActiveScreen
          tasks={props.tasks}
          groups={props.groups}
          onReactivate={props.onReactivateTask}
          onSetStatus={props.onSetLifecycleStatus}
          onDeleteToTrash={(id, title) => props.onDeleteTask(id, title || 'Habit')}
        />
      )}
      {props.activeView === 'trash' && (
        <TrashScreen
          tasks={props.tasks}
          groups={props.groups}
          onRestore={props.onRestoreTask}
          onPurge={props.onPurgeTask}
          onEmptyTrash={props.onEmptyTrash}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
