/**
 * Laya (లయ) Mobile — Group Edit Studio Form (ADR-0005, ADR-0016, ADR-0017)
 * Live group card preview, 8-color palette, and lifecycle state toggles.
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { UserGroup } from '../core/types';
import { getStyles } from './ManageGroupsModal.styles';

export const GROUP_PALETTE = [
  '#94A3B8', '#38BDF8', '#34D399', '#F472B6',
  '#FBBF24', '#A78BFA', '#FB7185', '#2DD4BF',
];

interface Props {
  group?: UserGroup;
  name: string;
  color: string;
  isNew?: boolean;
  onChangeName: (val: string) => void;
  onChangeColor: (val: string) => void;
  onTogglePause?: () => void;
  onToggleComplete?: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const GroupEditForm: React.FC<Props> = ({
  group,
  name,
  color,
  isNew = false,
  onChangeName,
  onChangeColor,
  onTogglePause,
  onToggleComplete,
  onSave,
  onCancel,
  onDelete,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.editBox}>
      {/* Live Card Preview */}
      <View style={styles.previewCard}>
        <View style={[styles.previewDot, { backgroundColor: color }]} />
        <Text style={styles.previewTitle} numberOfLines={1}>
          {name.trim() || (isNew ? 'New Category' : 'Category Name')}
        </Text>
        <View style={[styles.previewPill, { borderColor: color }]}>
          <Text style={[styles.previewPillText, { color }]}>Preview</Text>
        </View>
      </View>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={onChangeName}
        placeholder={isNew ? 'Category name (e.g. Finance)' : 'Category name'}
        placeholderTextColor={colors.textTertiary}
        autoFocus
      />

      <View style={styles.paletteRow}>
        {GROUP_PALETTE.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.colorCircleSelected]}
            onPress={() => onChangeColor(c)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          />
        ))}
      </View>

      {!isNew && group && (
        <View style={styles.lifecycleRow}>
          <TouchableOpacity
            style={[styles.lifecycleBtn, group.lifecycleStatus === 'paused' && styles.lifecycleBtnActive]}
            onPress={onTogglePause}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={[styles.lifecycleBtnText, group.lifecycleStatus === 'paused' && styles.lifecycleBtnTextActive]}>
              {group.lifecycleStatus === 'paused' ? '▶️ Resume' : '⏸️ Pause'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.lifecycleBtn, group.lifecycleStatus === 'completed' && styles.lifecycleBtnActive]}
            onPress={onToggleComplete}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={[styles.lifecycleBtnText, group.lifecycleStatus === 'completed' && styles.lifecycleBtnTextActive]}>
              {group.lifecycleStatus === 'completed' ? '✓ Active' : '🏁 Complete'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={onCancel} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.cancelBtnText}>✕ Cancel</Text>
        </TouchableOpacity>
        {!isNew && onDelete && (
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={onSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.saveBtnText}>{isNew ? '+ Create' : '✓ Save'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

