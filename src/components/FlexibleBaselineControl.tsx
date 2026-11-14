/**
 * Laya (లయ) Mobile — Flexible Baseline Control (ADR-0016, V2.2)
 * Multi-criterion baseline tabs with incremental exceedable logging
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Task, BaselineCriterion } from '../core/types';
import { getStyles } from './FlexibleBaselineControl.styles';

interface Props {
  task: Task;
  criterionValues?: Record<string, number>;
  percentage: number;
  isCompleted: boolean;
  onUpdateQuantified: (taskId: string, delta: number, criterionId?: string) => void;
}

export const FlexibleBaselineControl: React.FC<Props> = ({
  task,
  criterionValues = {},
  percentage,
  isCompleted,
  onUpdateQuantified,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const criteria: BaselineCriterion[] = task.baselineCriteria && task.baselineCriteria.length > 0
    ? task.baselineCriteria
    : [{ id: 'crit_default', label: 'Primary', target: task.targetAmount || 1, unit: task.unit || '', stepAmount: task.stepAmount || 1 }];

  const [activeCritId, setActiveCritId] = useState<string>(criteria[0]?.id || 'crit_default');

  const activeCriterion = criteria.find((c) => c.id === activeCritId) || criteria[0];
  const activeVal = criterionValues[activeCriterion.id] || 0;
  const target = Math.max(0.001, activeCriterion.target);
  const step = activeCriterion.stepAmount || 1;
  const critPct = Math.round((activeVal / target) * 100);
  const isCritDone = activeVal >= target;

  return (
    <View style={styles.container}>
      {/* Criteria Tabs */}
      {criteria.length > 1 && (
        <View style={styles.criteriaTabs}>
          {criteria.map((c) => {
            const val = criterionValues[c.id] || 0;
            const done = val >= c.target;
            const isTabActive = c.id === activeCritId;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.criterionTab, isTabActive && styles.criterionTabActive]}
                onPress={() => setActiveCritId(c.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.criterionTabText, isTabActive && styles.criterionTabTextActive]}>
                  {c.label}: {c.target} {c.unit}
                </Text>
                {done && <Text style={styles.tabDoneDot}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Incremental Exceedable Control */}
      <View style={styles.controlRow}>
        <View style={styles.progressWrap}>
          <Text style={styles.mainValText}>
            {activeVal} / {activeCriterion.target} {activeCriterion.unit}{' '}
            <Text style={[styles.pctBadge, { color: isCritDone ? colors.done : colors.progress }]}>
              ({critPct}%{critPct > 100 ? ' 🚀' : ''})
            </Text>
          </Text>
          <View style={styles.trackWrap}>
            <View
              style={[
                styles.fillBar,
                { width: `${Math.min(100, Math.max(8, critPct))}%` },
                isCritDone && styles.fillBarDone,
              ]}
            />
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => onUpdateQuantified(task.id, -step, activeCriterion.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.stepBtnText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => onUpdateQuantified(task.id, step, activeCriterion.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
