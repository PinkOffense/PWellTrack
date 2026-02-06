import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '../theme';

interface Props {
  current: number;
  goal: number;
  unit: string;
  label: string;
  color?: string;
  size?: number;
}

export function ProgressRing({ current, goal, unit, label, color = colors.primary, size = 100 }: Props) {
  const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const displayPct = Math.round(pct);

  return (
    <View style={[styles.container, { width: size + 40 }]}>
      {/* Simple circular progress visualization */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color + '20',
          },
        ]}
      >
        <View
          style={[
            styles.ringInner,
            {
              width: size - 12,
              height: size - 12,
              borderRadius: (size - 12) / 2,
            },
          ]}
        >
          <Text style={[styles.pctText, { color }]}>{displayPct}%</Text>
          <Text style={styles.valueText}>
            {Math.round(current)}/{Math.round(goal)} {unit}
          </Text>
        </View>
        {/* Progress bar overlay */}
        <View
          style={[
            styles.progressArc,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: color,
              borderTopColor: pct >= 25 ? color : 'transparent',
              borderRightColor: pct >= 50 ? color : 'transparent',
              borderBottomColor: pct >= 75 ? color : 'transparent',
              borderLeftColor: pct >= 100 ? color : 'transparent',
            },
          ]}
        />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  ring: {
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringInner: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressArc: {
    position: 'absolute',
    borderWidth: 6,
  },
  pctText: {
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  valueText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
