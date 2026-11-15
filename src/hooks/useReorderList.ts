/**
 * Laya (లయ) Mobile — Reorder List Hook (ADR-0016, ADR-0017)
 * Provides 60fps LayoutAnimation reordering, tactile deep-press triggers, and sort order persistence.
 */

import { useState, useCallback } from 'react';
import { LayoutAnimation, Platform, UIManager, Vibration } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface UseReorderListOptions<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  onCommitOrder: (orderedKeys: string[]) => void | Promise<void>;
}

export function useReorderList<T>({ items, keyExtractor, onCommitOrder }: UseReorderListOptions<T>) {
  const [isRearrangeMode, setIsRearrangeMode] = useState(false);

  const triggerHaptic = () => {
    try {
      Vibration.vibrate(35);
    } catch {
      // Non-fatal if vibration is unavailable
    }
  };

  const moveItem = useCallback(
    (key: string, direction: 'up' | 'down') => {
      const currentKeys = items.map(keyExtractor);
      const idx = currentKeys.indexOf(key);
      if (idx < 0) return;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= currentKeys.length) return;

      triggerHaptic();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      const nextKeys = [...currentKeys];
      const [moved] = nextKeys.splice(idx, 1);
      nextKeys.splice(targetIdx, 0, moved);

      onCommitOrder(nextKeys);
    },
    [items, keyExtractor, onCommitOrder]
  );

  const handleDeepPressLift = useCallback(
    (key: string) => {
      triggerHaptic();
      setIsRearrangeMode(true);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    },
    []
  );

  return {
    isRearrangeMode,
    setIsRearrangeMode,
    toggleRearrangeMode: () => {
      triggerHaptic();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsRearrangeMode((prev) => !prev);
    },
    moveUp: (key: string) => moveItem(key, 'up'),
    moveDown: (key: string) => moveItem(key, 'down'),
    handleDeepPressLift,
  };
}

