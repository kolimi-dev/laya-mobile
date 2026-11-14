/**
 * Laya (లయ) Mobile — Root Application Coordinator (ADR-0001 through ADR-0016)
 * Natural Cadence, Guilt-Free Habit Engine, Retroactive Check-in & All Habits Catalog
 */

import React, { useState, useMemo } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { CONFIG } from './src/config';
import { Task } from './src/core/types';
import { isTaskScheduledForDate } from './src/core/recurrence';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { getStyles } from './App.styles';
import { useLayaTracker } from './src/hooks/useLayaTracker';
import { useAppUpdates } from './src/hooks/useAppUpdates';

import { HeaderBar } from './src/components/HeaderBar';
import { NavigationDrawer, AppView } from './src/components/NavigationDrawer';
import { DayNavigator, HorizonMode } from './src/components/DayNavigator';
import { GroupSelectorDropdown } from './src/components/GroupSelectorDropdown';
import { ConsentModal } from './src/components/ConsentModal';
import { AppModals } from './src/components/AppModals';
import { AppScreensView } from './src/components/AppScreensView';
import { LoginScreen } from './src/screens/LoginScreen';

function MainApp() {
  const [activeView, setActiveView] = useState<AppView>('tasks');
  const [selectedDashboardId, setSelectedDashboardId] = useState<string | undefined>(undefined);
  const [horizonMode, setHorizonMode] = useState<HorizonMode>('day');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [manageGroupsVisible, setManageGroupsVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [guideVisible, setGuideVisible] = useState(false);
  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  const { theme, colors } = useTheme();
  const styles = getStyles(colors);
  const tracker = useLayaTracker();
  const updates = useAppUpdates(() => setGuideVisible(true));

  const allHabitsCount = useMemo(
    () => tracker.tasks.filter((t) => !t.deletedAt && !t.archivedAt && (t.lifecycleStatus || 'active') === 'active').length,
    [tracker.tasks]
  );
  const notActiveCount = useMemo(
    () => tracker.tasks.filter((t) => !t.deletedAt && (t.archivedAt || (t.lifecycleStatus && t.lifecycleStatus !== 'active'))).length,
    [tracker.tasks]
  );
  const trashCount = useMemo(() => tracker.tasks.filter((t) => !!t.deletedAt).length, [tracker.tasks]);

  if (tracker.loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!tracker.session && !tracker.isAuthSkipped) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <LoginScreen
          onLoginSuccess={(s) => { tracker.setSession(s); if (!tracker.profile.name) setOnboardingVisible(true); }}
          onSkipOffline={() => tracker.setIsAuthSkipped(true)}
        />
        <ConsentModal visible={!updates.consentAgreed} onAgree={updates.handleAgreeConsent} />
      </SafeAreaView>
    );
  }

  const confirmDelete = (taskId: string, title: string) => {
    Alert.alert('Move to Trash', `Move "${title}" to Trash? You can restore it anytime for 30 days.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Move to Trash', style: 'destructive', onPress: () => tracker.handleDeleteTask(taskId) },
    ]);
  };

  const handleSaveTaskWithFeedback = async (task: Task) => {
    await tracker.handleSaveNewTask(task);
    setEditingTask(null);
    if (!isTaskScheduledForDate(task, tracker.opInfo)) {
      Alert.alert(
        'Habit Created',
        `"${task.title}" was saved successfully.\n\nSince it's not due today, you can find it in the All Habits Catalog.`,
        [
          { text: 'View All Habits', onPress: () => setActiveView('all_habits') },
          { text: 'OK', style: 'default' },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <ConsentModal visible={!updates.consentAgreed} onAgree={updates.handleAgreeConsent} />
      <HeaderBar opInfo={tracker.opInfo} consistencyScore={tracker.consistencyScore} onMenuPress={() => setDrawerVisible(true)} />

      {activeView === 'tasks' ? (
        <DayNavigator
          currentOffset={tracker.activeDateOffset}
          opInfo={tracker.opInfo}
          horizonMode={horizonMode}
          onSelectOffset={tracker.setActiveDateOffset}
          onToggleHorizon={setHorizonMode}
        />
      ) : (
        <TouchableOpacity style={styles.backToTasksBtn} onPress={() => setActiveView('tasks')} activeOpacity={0.7}>
          <Text style={styles.backToTasksText}>← Back to Today's Rhythm</Text>
        </TouchableOpacity>
      )}

      {activeView === 'tasks' && horizonMode === 'day' && (
        <View style={styles.filterActionRow}>
          <GroupSelectorDropdown
            groups={tracker.groups}
            tasks={tracker.tasks}
            activeGroupId={tracker.activeGroupId}
            onSelectGroup={tracker.setActiveGroupId}
            onManageGroups={() => setManageGroupsVisible(true)}
          />
          <TouchableOpacity style={styles.addHabitBtn} onPress={() => { setEditingTask(null); setModalVisible(true); }}>
            <Text style={styles.addHabitText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      )}

      <AppScreensView
        activeView={activeView}
        horizonMode={horizonMode}
        tasks={tracker.tasks}
        remainingTasks={tracker.remainingTasks}
        completedOrRestedTasks={tracker.completedOrRestedTasks}
        groups={tracker.groups}
        events={tracker.events}
        dashboards={tracker.dashboards}
        pinnedCharts={tracker.pinnedCharts}
        selectedDashboardId={selectedDashboardId}
        onToggleComplete={tracker.handleToggleComplete}
        onToggleMilestone={tracker.handleToggleMilestone}
        onSkipMilestone={tracker.handleSkipMilestone}
        onUpdateQuantified={tracker.handleUpdateQuantified}
        onSetQuantifiedExact={tracker.handleSetQuantifiedExact}
        onToggleIgnore={tracker.handleToggleIgnore}
        onEditTask={(t) => { setEditingTask(t); setModalVisible(true); }}
        onDeleteTask={confirmDelete}
        onNavigateToDashboard={(dashId) => { setSelectedDashboardId(dashId); setActiveView('charts'); }}
        onOpenFeedback={() => setFeedbackVisible(true)}
        onCreateDashboard={tracker.handleCreateDashboard}
        onUpdateDashboard={tracker.handleUpdateDashboard}
        onDeleteDashboard={tracker.handleDeleteDashboard}
        onPinChart={tracker.handlePinTaskChart}
        onMoveChart={tracker.handleMoveChart}
        onRemoveChart={tracker.handleRemoveChart}
        onReactivateTask={(id) => tracker.handleSetLifecycleStatus(id, 'active')}
        onSetLifecycleStatus={(id, s) => tracker.handleSetLifecycleStatus(id, s)}
        onRestoreTask={tracker.handleRestoreTask}
        onPurgeTask={tracker.handlePurgeTask}
        onEmptyTrash={tracker.handleEmptyTrash}
        onAddNewTask={() => { setEditingTask(null); setModalVisible(true); }}
      />

      <NavigationDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeView={activeView}
        onSelectView={(v) => { setHorizonMode('day'); setActiveView(v); }}
        session={tracker.session}
        profileName={tracker.profile.name}
        isOnline={tracker.isOnline}
        isSyncing={tracker.isSyncing}
        onSyncPress={tracker.triggerSync}
        remainingTasksCount={tracker.remainingTasks.length}
        pinnedChartsCount={tracker.validPinnedCharts.length}
        allHabitsCount={allHabitsCount}
        notActiveCount={notActiveCount}
        trashCount={trashCount}
        updateAvailableVersion={updates.updateManifest?.latestVersion || null}
        onTriggerUpdate={() => updates.setUpdateModalVisible(true)}
        onOpenGuide={() => setGuideVisible(true)}
        onOpenProfile={() => setProfileVisible(true)}
        onOpenFeedback={() => setFeedbackVisible(true)}
        onOpenPrivacy={() => setPrivacyVisible(true)}
        onOpenManageGroups={() => setManageGroupsVisible(true)}
      />

      <AppModals
        modalVisible={modalVisible}
        groups={tracker.groups}
        tasks={tracker.tasks}
        editingTask={editingTask}
        onCloseCreateTask={() => { setModalVisible(false); setEditingTask(null); }}
        onSaveTask={handleSaveTaskWithFeedback}
        manageGroupsVisible={manageGroupsVisible}
        onCloseManageGroups={() => setManageGroupsVisible(false)}
        onCreateGroup={tracker.handleCreateGroup}
        onUpdateGroup={tracker.handleUpdateGroup}
        onDeleteGroup={tracker.handleDeleteGroup}
        guideVisible={guideVisible}
        onCloseGuide={() => setGuideVisible(false)}
        profileVisible={profileVisible}
        session={tracker.session}
        onCloseProfile={() => setProfileVisible(false)}
        onOpenGuide={() => setGuideVisible(true)}
        onSaveProfile={tracker.handleUpdateProfile}
        onLogout={tracker.handleLogout}
        feedbackVisible={feedbackVisible}
        onCloseFeedback={() => setFeedbackVisible(false)}
        onboardingVisible={onboardingVisible}
        onCompleteOnboarding={async (name, phone) => { await tracker.handleUpdateProfile({ name, phone }); setOnboardingVisible(false); }}
        onSkipOnboarding={() => setOnboardingVisible(false)}
        updateModalVisible={updates.updateModalVisible}
        updateManifest={updates.updateManifest}
        currentVersion={CONFIG.APP_VERSION}
        isDownloading={updates.isDownloading}
        downloadProgress={updates.downloadProgress}
        onCloseUpdate={updates.handleCloseUpdate}
        onUpdateNow={updates.handleUpdateNow}
        whatsNewVisible={updates.whatsNewVisible}
        onDismissWhatsNew={() => updates.setWhatsNewVisible(false)}
        privacyVisible={privacyVisible}
        onClosePrivacy={() => setPrivacyVisible(false)}
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
