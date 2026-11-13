/**
 * Laya (లయ) Mobile — App Modals Coordinator Component
 * Isolates modal rendering tree to preserve strict modularity & clean line limits
 */

import React from 'react';
import { Task, UserGroup } from '../core/types';
import { AuthSession, UserProfile } from '../services/auth';
import { AppUpdateManifest } from '../services/updates';
import { CreateTaskModal } from './CreateTaskModal';
import { GuideModal } from './GuideModal';
import { ProfileModal } from './ProfileModal';
import { FeedbackModal } from './FeedbackModal';
import { OnboardingProfileModal } from './OnboardingProfileModal';
import { UpdateModal } from './UpdateModal';
import { WhatsNewModal } from './WhatsNewModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

export interface AppModalsProps {
  modalVisible: boolean;
  groups: UserGroup[];
  editingTask: Task | null;
  onCloseCreateTask: () => void;
  onSaveTask: (task: Task) => void;
  guideVisible: boolean;
  onCloseGuide: () => void;
  profileVisible: boolean;
  session: AuthSession | null;
  onCloseProfile: () => void;
  onOpenGuide: () => void;
  onSaveProfile: (p: UserProfile) => void;
  onLogout: () => void;
  feedbackVisible: boolean;
  onCloseFeedback: () => void;
  onboardingVisible: boolean;
  onCompleteOnboarding: (name: string, phone: string) => void;
  onSkipOnboarding: () => void;
  updateModalVisible: boolean;
  updateManifest: AppUpdateManifest | null;
  currentVersion: string;
  onCloseUpdate: () => void;
  onUpdateNow: () => void;
  whatsNewVisible: boolean;
  onDismissWhatsNew: () => void;
  privacyVisible: boolean;
  onClosePrivacy: () => void;
}

export const AppModals: React.FC<AppModalsProps> = (props) => {
  return (
    <>
      <CreateTaskModal
        visible={props.modalVisible}
        groups={props.groups}
        initialTask={props.editingTask}
        onClose={props.onCloseCreateTask}
        onSave={props.onSaveTask}
      />
      <GuideModal visible={props.guideVisible} onClose={props.onCloseGuide} />
      <ProfileModal
        visible={props.profileVisible}
        session={props.session}
        onClose={props.onCloseProfile}
        onOpenGuide={props.onOpenGuide}
        onSaveProfile={props.onSaveProfile}
        onLogout={props.onLogout}
      />
      <FeedbackModal
        visible={props.feedbackVisible}
        session={props.session}
        onClose={props.onCloseFeedback}
      />
      <OnboardingProfileModal
        visible={props.onboardingVisible}
        initialEmail={props.session?.email}
        onComplete={props.onCompleteOnboarding}
        onSkip={props.onSkipOnboarding}
      />
      <UpdateModal
        visible={props.updateModalVisible}
        manifest={props.updateManifest}
        currentVersion={props.currentVersion}
        onClose={props.onCloseUpdate}
        onUpdateNow={props.onUpdateNow}
      />
      <WhatsNewModal
        visible={props.whatsNewVisible}
        version={props.currentVersion}
        onDismiss={props.onDismissWhatsNew}
      />
      <PrivacyPolicyModal
        visible={props.privacyVisible}
        onClose={props.onClosePrivacy}
      />
    </>
  );
};
