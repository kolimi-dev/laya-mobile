/**
 * Laya (లయ) Mobile — Edit & Delete Dashboard Modal (ADR-0016)
 * CRUD symmetry: rename title, change icon, cancel (✕), delete (🗑️) with confirmation, and save (✓).
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { UserDashboard } from '../core/types';
import { getStyles } from './EditDashboardModal.styles';

const DASHBOARD_ICONS = ['📊', '⚡', '💧', '🏃', '📚', '🎯', '🧘', '🌱'];

interface Props {
  visible: boolean;
  dashboard: UserDashboard;
  onClose: () => void;
  onSave: (updated: UserDashboard) => void;
  onDelete: (dashboardId: string) => void;
}

export const EditDashboardModal: React.FC<Props> = ({
  visible,
  dashboard,
  onClose,
  onSave,
  onDelete,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [title, setTitle] = useState(dashboard.title);
  const [icon, setIcon] = useState(dashboard.icon || '📊');

  useEffect(() => {
    setTitle(dashboard.title);
    setIcon(dashboard.icon || '📊');
  }, [dashboard, visible]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      ...dashboard,
      title: title.trim(),
      icon,
    });
    onClose();
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Dashboard',
      `Are you sure you want to delete "${dashboard.title}"? Your habits and charts will not be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(dashboard.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.card} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Dashboard</Text>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Text style={styles.cancelText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Dashboard Name</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Health & Strength"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Choose Icon</Text>
            <View style={styles.iconRow}>
              {DASHBOARD_ICONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.emojiBtn, icon === emoji && styles.emojiBtnActive]}
                  onPress={() => setIcon(emoji)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 3 Explicit Action Buttons: Cancel (✕), Delete (🗑️), Save (✓) */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} activeOpacity={0.7}>
              <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
            </TouchableOpacity>

            <View style={styles.rightActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.secondaryBtnText}>✕ Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, !title.trim() && styles.primaryBtnDisabled]}
                onPress={handleSave}
                disabled={!title.trim()}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryBtnText}>✓ Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
