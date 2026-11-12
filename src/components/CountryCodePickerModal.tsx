/**
 * Laya (లయ) Mobile — Searchable Country Code Picker Modal (Phase 6)
 * Instant filter by country name, ISO code or dial code (e.g. India, +91, US)
 */

import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, darkColors, spacing, radiuses, typography } from '../theme/tokens';
import { CountryCode, COUNTRY_CODES, filterCountryCodes } from '../data/countryCodes';

interface Props {
  visible: boolean;
  selectedDialCode?: string;
  onSelect: (country: CountryCode) => void;
  onClose: () => void;
}

export const CountryCodePickerModal: React.FC<Props> = ({
  visible,
  selectedDialCode = '+91',
  onSelect,
  onClose,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => filterCountryCodes(search), [search]);

  const handleSelect = (item: CountryCode) => {
    onSelect(item);
    setSearch('');
    onClose();
  };

  const handleDismiss = () => {
    setSearch('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleDismiss}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Country Code</Text>
            <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search country or code (e.g. India, +91)"
              placeholderTextColor={colors.textTertiary}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => `${item.code}-${item.dialCode}`}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = item.dialCode === selectedDialCode;
              return (
                <TouchableOpacity
                  style={[styles.row, isSelected && styles.rowSelected]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.dialCode}>{item.dialCode}</Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No country found matching "{search}"</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: ColorPalette = darkColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: colors.bgCard,
      borderTopLeftRadius: radiuses.lg,
      borderTopRightRadius: radiuses.lg,
      maxHeight: '80%',
      paddingBottom: spacing.xxl,
      borderTopWidth: 1,
      borderColor: colors.borderSubtle,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },
    title: {
      fontSize: typography.heading,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    closeBtn: {
      fontSize: 18,
      color: colors.textTertiary,
      padding: spacing.xs,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgInput,
      marginHorizontal: spacing.lg,
      marginVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radiuses.md,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    searchIcon: {
      marginRight: spacing.sm,
      fontSize: 14,
    },
    searchInput: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: typography.body,
      paddingVertical: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    rowSelected: {
      backgroundColor: colors.bgActive,
    },
    flag: {
      fontSize: 22,
      marginRight: spacing.md,
    },
    name: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: typography.body,
    },
    dialCode: {
      color: colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '600',
    },
    emptyContainer: {
      padding: spacing.xxl,
      alignItems: 'center',
    },
    emptyText: {
      color: colors.textTertiary,
      fontSize: typography.body,
    },
  });
