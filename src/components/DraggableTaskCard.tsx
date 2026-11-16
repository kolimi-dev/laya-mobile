/**
 * Laya (లయ) Mobile — Draggable Task Card Wrapper (ADR-0018)
 * Native PanResponder drag-to-reorder with haptic feedback, elevation, and accessibility nudges.
 */

import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, radiuses, spacing, typography } from '../theme/tokens';

interface Props {
  id: string;
  index: number;
  total: number;
  isRearrangeMode: boolean;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onLongPressLift?: (id: string) => void;
  children: React.ReactNode;
}

export const DraggableTaskCard: React.FC<Props> = ({
  id,
  index,
  total,
  isRearrangeMode,
  onMoveUp,
  onMoveDown,
  onLongPressLift,
  children,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const panY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lastMoveY = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
      onPanResponderGrant: () => {
        lastMoveY.current = 0;
        Animated.spring(scaleAnim, { toValue: 1.03, useNativeDriver: true }).start();
      },
      onPanResponderMove: (_, gesture) => {
        panY.setValue(gesture.dy);
        const delta = gesture.dy - lastMoveY.current;
        const SWAP_THRESHOLD = 55;
        if (delta > SWAP_THRESHOLD && index < total - 1) {
          lastMoveY.current = gesture.dy;
          onMoveDown(id);
        } else if (delta < -SWAP_THRESHOLD && index > 0) {
          lastMoveY.current = gesture.dy;
          onMoveUp(id);
        }
      },
      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.spring(panY, { toValue: 0, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        ]).start();
        lastMoveY.current = 0;
      },
      onPanResponderTerminate: () => {
        Animated.parallel([
          Animated.spring(panY, { toValue: 0, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        ]).start();
        lastMoveY.current = 0;
      },
    })
  ).current;

  if (!isRearrangeMode) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        delayLongPress={350}
        onLongPress={() => onLongPressLift?.(id)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ translateY: panY }, { scale: scaleAnim }],
          zIndex: isRearrangeMode ? 10 : 1,
        },
      ]}
    >
      <View style={styles.reorderBar}>
        <View style={styles.reorderControls}>
          {index > 0 && (
            <TouchableOpacity
              style={styles.nudgeBtn}
              onPress={() => onMoveUp(id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.nudgeText}>▲</Text>
            </TouchableOpacity>
          )}
          {index < total - 1 && (
            <TouchableOpacity
              style={styles.nudgeBtn}
              onPress={() => onMoveDown(id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.nudgeText}>▼</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.dragHandle} {...panResponder.panHandlers}>
          <Text style={styles.dragIcon}>≡</Text>
          <Text style={styles.dragLabel}>Hold & Drag</Text>
        </View>
      </View>

      <View style={styles.cardContent}>{children}</View>
    </Animated.View>
  );
};

const getStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    wrapper: {
      position: 'relative',
      borderRadius: radiuses.lg,
      borderWidth: 1.5,
      borderColor: colors.primary,
      backgroundColor: colors.bgCard,
      overflow: 'hidden',
    },
    reorderBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: 5,
      backgroundColor: colors.bgActive,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    reorderControls: {
      flexDirection: 'row',
      gap: 6,
    },
    nudgeBtn: {
      backgroundColor: colors.bgInput,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radiuses.sm,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    nudgeText: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: '700',
    },
    dragHandle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radiuses.sm,
      backgroundColor: colors.primary,
    },
    dragIcon: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '900',
    },
    dragLabel: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    cardContent: {
      opacity: 0.96,
    },
  });
