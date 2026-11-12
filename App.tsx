/**
 * Laya (లయ) Mobile — Root Application Coordinator
 * Natural Cadence, Guilt-Free Habit Engine (ADR-0001 through ADR-0012)
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import { colors } from './src/theme/tokens';
import { Task } from './src/core/types';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { styles } from './App.styles';
import { useLayaTracker } from './src/hooks/useLayaTracker';

import { HeaderBar } from './src/components/HeaderBar';
import { NavigationDrawer } from './src/components/NavigationDrawer';
import { GroupFilterPills } from './src/components/GroupFilterPills';
import { CreateTaskModal } from './src/components/CreateTaskModal';
import { ConsentModal } from './src/components/ConsentModal';
import { ProfileModal } from './src/components/ProfileModal';
import { GuideModal } from './src/components/GuideModal';
import { TodayTasksScreen } from './src/screens/TodayTasksScreen';
import { TaskChartsScreen } from './src/screens/TaskChartsScreen';
import { LoginScreen } from './src/screens/LoginScreen';

type ActiveView = 'tasks' | 'charts';

function MainApp() {
  const [activeView, setActiveView] = useState<ActiveView>('tasks');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [profileVisible, setProfileVisible] = useState(false);
  const [guideVisible, setGuideVisible] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    AsyncStorage.getItem('@laya:consent_agreed').then((val) => {
      if (!val) setConsentAgreed(false);
    });
    AsyncStorage.getItem('@laya:guide_seen').then((seen) => {
      if (!seen) setGuideVisible(true);
    });
  }, []);

  const handleAgreeConsent = async () => {
    await AsyncStorage.setItem('@laya:consent_agreed', 'true');
    setConsentAgreed(true);
  };

  const tracker = useLayaTracker();

  if (tracker.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!tracker.session && !tracker.isAuthSkipped) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <LoginScreen
          onLoginSuccess={(newSession) => tracker.setSession(newSession)}
          onSkipOffline={() => tracker.setIsAuthSkipped(true)}
        />
        <ConsentModal visible={!consentAgreed} onAgree={handleAgreeConsent} />
      </SafeAreaView>
    );
  }

  const confirmDelete = (taskId: string, title: string) => {
    Alert.alert('Delete Habit', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => tracker.handleDeleteTask(taskId) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      <HeaderBar
        opInfo={tracker.opInfo}
        consistencyScore={tracker.consistencyScore}
        onMenuPress={() => setDrawerVisible(true)}
      />

      <View style={styles.viewSwitchBar}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeView === 'tasks' && styles.segmentBtnActive]}
            onPress={() => setActiveView('tasks')}
          >
            <Text style={[styles.segmentText, activeView === 'tasks' && styles.segmentTextActive]}>
              Today's Tasks ({tracker.remainingTasks.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeView === 'charts' && styles.segmentBtnActive]}
            onPress={() => setActiveView('charts')}
          >
            <Text style={[styles.segmentText, activeView === 'charts' && styles.segmentTextActive]}>
              Task Charts ({tracker.pinnedCharts.length})
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setEditingTask(null);
            setModalVisible(true);
          }}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {activeView === 'tasks' && (
        <GroupFilterPills
          groups={tracker.groups}
          activeGroupId={tracker.activeGroupId}
          onSelectGroup={tracker.setActiveGroupId}
        />
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeView === 'tasks' ? (
          <TodayTasksScreen
            remainingTasks={tracker.remainingTasks}
            completedOrRestedTasks={tracker.completedOrRestedTasks}
            groups={tracker.groups}
            onToggleComplete={tracker.handleToggleComplete}
            onToggleMilestone={tracker.handleToggleMilestone}
            onUpdateQuantified={tracker.handleUpdateQuantified}
            onToggleIgnore={tracker.handleToggleIgnore}
            onEditTask={(task) => {
              setEditingTask(task);
              setModalVisible(true);
            }}
            onDeleteTask={confirmDelete}
          />
        ) : (
          <TaskChartsScreen
            pinnedCharts={tracker.pinnedCharts}
            tasks={tracker.tasks}
            events={tracker.events}
            recommendations={tracker.chartRecommendations}
            onPinRecommendation={tracker.handlePinRecommendation}
            onMoveChart={tracker.handleMoveChart}
            onRemoveChart={tracker.handleRemoveChart}
          />
        )}
      </ScrollView>

      <NavigationDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeView={activeView}
        onSelectView={(v) => setActiveView(v)}
        session={tracker.session}
        isOnline={tracker.isOnline}
        isSyncing={tracker.isSyncing}
        onSyncPress={tracker.triggerSync}
        remainingTasksCount={tracker.remainingTasks.length}
        pinnedChartsCount={tracker.pinnedCharts.length}
        onOpenGuide={() => setGuideVisible(true)}
        onOpenProfile={() => setProfileVisible(true)}
      />

      <CreateTaskModal
        visible={modalVisible}
        groups={tracker.groups}
        initialTask={editingTask}
        onClose={() => {
          setModalVisible(false);
          setEditingTask(null);
        }}
        onSave={(task) => {
          tracker.handleSaveNewTask(task);
          setEditingTask(null);
        }}
      />

      <GuideModal
        visible={guideVisible}
        onClose={() => setGuideVisible(false)}
      />

      <ConsentModal
        visible={!consentAgreed}
        onAgree={handleAgreeConsent}
      />

      <ProfileModal
        visible={profileVisible}
        session={tracker.session}
        onClose={() => setProfileVisible(false)}
        onOpenGuide={() => setGuideVisible(true)}
        onLogout={tracker.handleLogout}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
