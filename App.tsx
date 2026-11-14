/**
 * Laya (లయ) Mobile — Root Application Coordinator (ADR-0001 through ADR-0015)
 * Natural Cadence, Guilt-Free Habit Engine, Retroactive Check-in & Horizon View
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import { CONFIG } from './src/config';
import { Task } from './src/core/types';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { getStyles } from './App.styles';
import { useLayaTracker } from './src/hooks/useLayaTracker';
import { UpdateService, AppUpdateManifest } from './src/services/updates';

import { HeaderBar } from './src/components/HeaderBar';
import { NavigationDrawer, AppView } from './src/components/NavigationDrawer';
import { DayNavigator, HorizonMode } from './src/components/DayNavigator';
import { GroupFilterPills } from './src/components/GroupFilterPills';
import { ConsentModal } from './src/components/ConsentModal';
import { AppModals } from './src/components/AppModals';
import { TodayTasksScreen } from './src/screens/TodayTasksScreen';
import { UpcomingTasksScreen } from './src/screens/UpcomingTasksScreen';
import { TaskChartsScreen } from './src/screens/TaskChartsScreen';
import { NotActiveScreen } from './src/screens/NotActiveScreen';
import { TrashScreen } from './src/screens/TrashScreen';
import { LoginScreen } from './src/screens/LoginScreen';

function MainApp() {
  const [activeView, setActiveView] = useState<AppView>('tasks');
  const [selectedDashboardId, setSelectedDashboardId] = useState<string | undefined>(undefined);
  const [horizonMode, setHorizonMode] = useState<HorizonMode>('day');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [profileVisible, setProfileVisible] = useState(false);
  const [guideVisible, setGuideVisible] = useState(false);
  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(true);

  // In-app updates & spotlights
  const [updateManifest, setUpdateManifest] = useState<AppUpdateManifest | null>(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [whatsNewVisible, setWhatsNewVisible] = useState(false);

  const { theme, colors } = useTheme();
  const styles = getStyles(colors);

  useEffect(() => {
    AsyncStorage.getItem('@laya:consent_agreed').then((v) => !v && setConsentAgreed(false));
    AsyncStorage.getItem('@laya:guide_seen').then((s) => !s && setGuideVisible(true));

    async function checkUpdates() {
      const manifest = await UpdateService.fetchManifest();
      if (manifest && UpdateService.isNewerVersion(manifest.latestVersion, CONFIG.APP_VERSION)) {
        setUpdateManifest(manifest);
        const dismissed = await UpdateService.getDismissedVersion();
        if (dismissed !== manifest.latestVersion) setUpdateModalVisible(true);
      } else {
        const lastSeen = await UpdateService.getLastSeenVersion();
        if (lastSeen && UpdateService.isNewerVersion(CONFIG.APP_VERSION, lastSeen)) setWhatsNewVisible(true);
        await UpdateService.setLastSeenVersion(CONFIG.APP_VERSION);
      }
    }
    checkUpdates();
  }, []);

  const tracker = useLayaTracker();

  const notActiveCount = useMemo(
    () => tracker.tasks.filter((t) => !t.deletedAt && (t.archivedAt || (t.lifecycleStatus && t.lifecycleStatus !== 'active'))).length,
    [tracker.tasks]
  );
  const trashCount = useMemo(() => tracker.tasks.filter((t) => !!t.deletedAt).length, [tracker.tasks]);

  if (tracker.loading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
    );
  }

  if (!tracker.session && !tracker.isAuthSkipped) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <LoginScreen
          onLoginSuccess={(s) => { tracker.setSession(s); if (!tracker.profile.name) setOnboardingVisible(true); }}
          onSkipOffline={() => tracker.setIsAuthSkipped(true)}
        />
        <ConsentModal visible={!consentAgreed} onAgree={() => { AsyncStorage.setItem('@laya:consent_agreed', 'true'); setConsentAgreed(true); }} />
      </SafeAreaView>
    );
  }

  const confirmDelete = (taskId: string, title: string) => {
    Alert.alert('Move to Trash', `Move "${title}" to Trash? You can restore it anytime for 30 days.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Move to Trash', style: 'destructive', onPress: () => tracker.handleDeleteTask(taskId) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <ConsentModal visible={!consentAgreed} onAgree={() => { AsyncStorage.setItem('@laya:consent_agreed', 'true'); setConsentAgreed(true); }} />
      <HeaderBar opInfo={tracker.opInfo} consistencyScore={tracker.consistencyScore} onMenuPress={() => setDrawerVisible(true)} />

      {activeView === 'tasks' && (
        <DayNavigator
          currentOffset={tracker.activeDateOffset}
          opInfo={tracker.opInfo}
          horizonMode={horizonMode}
          onSelectOffset={tracker.setActiveDateOffset}
          onToggleHorizon={setHorizonMode}
        />
      )}

      {activeView === 'charts' && (
        <TouchableOpacity style={styles.backToTasksBtn} onPress={() => setActiveView('tasks')} activeOpacity={0.7}>
          <Text style={styles.backToTasksText}>← Back to Today's Rhythm</Text>
        </TouchableOpacity>
      )}

      {activeView === 'tasks' && horizonMode === 'day' && (
        <View style={styles.filterActionRow}>
          <View style={{ flex: 1 }}>
            <GroupFilterPills groups={tracker.groups} activeGroupId={tracker.activeGroupId} onSelectGroup={tracker.setActiveGroupId} />
          </View>
          <TouchableOpacity style={styles.addHabitBtn} onPress={() => { setEditingTask(null); setModalVisible(true); }}>
            <Text style={styles.addHabitText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeView === 'tasks' && horizonMode === 'day' && (
          <TodayTasksScreen
            remainingTasks={tracker.remainingTasks}
            completedOrRestedTasks={tracker.completedOrRestedTasks}
            groups={tracker.groups}
            events={tracker.events}
            dashboards={tracker.dashboards}
            pinnedCharts={tracker.pinnedCharts}
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
          />
        )}
        {activeView === 'tasks' && horizonMode === 'upcoming' && (
          <UpcomingTasksScreen tasks={tracker.tasks} groups={tracker.groups} />
        )}
        {activeView === 'charts' && (
          <TaskChartsScreen
            pinnedCharts={tracker.pinnedCharts}
            tasks={tracker.tasks}
            events={tracker.events}
            dashboards={tracker.dashboards}
            groups={tracker.groups}
            initialDashboardId={selectedDashboardId}
            onCreateDashboard={tracker.handleCreateDashboard}
            onUpdateDashboard={tracker.handleUpdateDashboard}
            onDeleteDashboard={tracker.handleDeleteDashboard}
            onPinChart={tracker.handlePinTaskChart}
            onMoveChart={tracker.handleMoveChart}
            onRemoveChart={tracker.handleRemoveChart}
          />
        )}
        {activeView === 'not_active' && (
          <NotActiveScreen
            tasks={tracker.tasks}
            groups={tracker.groups}
            onReactivate={(id) => tracker.handleSetLifecycleStatus(id, 'active')}
            onSetStatus={(id, s) => tracker.handleSetLifecycleStatus(id, s)}
            onDeleteToTrash={tracker.handleDeleteTask}
          />
        )}
        {activeView === 'trash' && (
          <TrashScreen
            tasks={tracker.tasks}
            groups={tracker.groups}
            onRestore={tracker.handleRestoreTask}
            onPurge={tracker.handlePurgeTask}
            onEmptyTrash={tracker.handleEmptyTrash}
          />
        )}
      </ScrollView>

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
        notActiveCount={notActiveCount}
        trashCount={trashCount}
        updateAvailableVersion={updateManifest?.latestVersion || null}
        onTriggerUpdate={() => setUpdateModalVisible(true)}
        onOpenGuide={() => setGuideVisible(true)}
        onOpenProfile={() => setProfileVisible(true)}
        onOpenFeedback={() => setFeedbackVisible(true)}
        onOpenPrivacy={() => setPrivacyVisible(true)}
      />

      <AppModals
        modalVisible={modalVisible}
        groups={tracker.groups}
        editingTask={editingTask}
        onCloseCreateTask={() => { setModalVisible(false); setEditingTask(null); }}
        onSaveTask={(t) => { tracker.handleSaveNewTask(t); setEditingTask(null); }}
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
        updateModalVisible={updateModalVisible}
        updateManifest={updateManifest}
        currentVersion={CONFIG.APP_VERSION}
        onCloseUpdate={async () => {
          if (updateManifest) await UpdateService.setDismissedVersion(updateManifest.latestVersion);
          setUpdateModalVisible(false);
        }}
        onUpdateNow={() => {
          if (updateManifest?.apkUrl) Linking.openURL(updateManifest.apkUrl);
          setUpdateModalVisible(false);
        }}
        whatsNewVisible={whatsNewVisible}
        onDismissWhatsNew={() => setWhatsNewVisible(false)}
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
