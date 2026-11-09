/**
 * Laya (లయ) Mobile — Root Application Coordinator
 * Natural Cadence, Guilt-Free Habit Engine (ADR-0001 through ADR-0008)
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { colors } from './src/theme/tokens';
import { styles } from './App.styles';
import { useLayaTracker } from './src/hooks/useLayaTracker';

import { HeaderBar } from './src/components/HeaderBar';
import { GroupFilterPills } from './src/components/GroupFilterPills';
import { CreateTaskModal } from './src/components/CreateTaskModal';
import { TodayTasksScreen } from './src/screens/TodayTasksScreen';
import { TaskChartsScreen } from './src/screens/TaskChartsScreen';
import { LoginScreen } from './src/screens/LoginScreen';

type ActiveView = 'tasks' | 'charts';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('tasks');
  const [modalVisible, setModalVisible] = useState(false);

  const {
    loading,
    session,
    setSession,
    isAuthSkipped,
    setIsAuthSkipped,
    isOnline,
    opInfo,
    activeGroupId,
    setActiveGroupId,
    groups,
    tasks,
    events,
    pinnedCharts,
    remainingTasks,
    completedOrRestedTasks,
    consistencyScore,
    chartRecommendations,
    handleToggleComplete,
    handleToggleMilestone,
    handleUpdateQuantified,
    handleToggleIgnore,
    handlePinRecommendation,
    handleMoveChart,
    handleRemoveChart,
    handleSaveNewTask,
  } = useLayaTracker();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If not logged in and didn't skip, show LoginScreen
  if (!session && !isAuthSkipped) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <LoginScreen
          onLoginSuccess={(newSession) => setSession(newSession)}
          onSkipOffline={() => setIsAuthSkipped(true)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header Bar */}
      <HeaderBar
        opInfo={opInfo}
        consistencyScore={consistencyScore}
        isOnline={isOnline}
      />

      {/* Navigation Switcher: Today's Tasks vs Task Charts */}
      <View style={styles.viewSwitchBar}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeView === 'tasks' && styles.segmentBtnActive]}
            onPress={() => setActiveView('tasks')}
          >
            <Text style={[styles.segmentText, activeView === 'tasks' && styles.segmentTextActive]}>
              Today's Tasks ({remainingTasks.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeView === 'charts' && styles.segmentBtnActive]}
            onPress={() => setActiveView('charts')}
          >
            <Text style={[styles.segmentText, activeView === 'charts' && styles.segmentTextActive]}>
              Task Charts ({pinnedCharts.length})
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Group Filter Bar */}
      {activeView === 'tasks' && (
        <GroupFilterPills
          groups={groups}
          activeGroupId={activeGroupId}
          onSelectGroup={setActiveGroupId}
        />
      )}

      {/* Main Body */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeView === 'tasks' ? (
          <TodayTasksScreen
            remainingTasks={remainingTasks}
            completedOrRestedTasks={completedOrRestedTasks}
            groups={groups}
            onToggleComplete={handleToggleComplete}
            onToggleMilestone={handleToggleMilestone}
            onUpdateQuantified={handleUpdateQuantified}
            onToggleIgnore={handleToggleIgnore}
          />
        ) : (
          <TaskChartsScreen
            pinnedCharts={pinnedCharts}
            tasks={tasks}
            events={events}
            recommendations={chartRecommendations}
            onPinRecommendation={handlePinRecommendation}
            onMoveChart={handleMoveChart}
            onRemoveChart={handleRemoveChart}
          />
        )}
      </ScrollView>

      {/* Create Task Modal */}
      <CreateTaskModal
        visible={modalVisible}
        groups={groups}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveNewTask}
      />
    </SafeAreaView>
  );
}
