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

  // Use 12 tick segments to represent progress visually
  const totalTicks = 12;
  const filledTicks = Math.round((pct / 100) * totalTicks);
  const radius = size / 2;

  return (
    <View style={[styles.container, { width: size + 40 }]}>
      <View style={[styles.outerRing, { width: size, height: size, borderRadius: radius }]}>
        {/* Background circle */}
        <View style={[
          styles.bgCircle,
          { width: size, height: size, borderRadius: radius, borderColor: color + '15' },
        ]} />
        {/* Tick marks around the ring */}
        {Array.from({ length: totalTicks }).map((_, i) => {
          const angle = (i * (360 / totalTicks)) - 90; // start from top
          const isFilled = i < filledTicks;
          const tickH = size * 0.18;
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                width: 6,
                height: tickH,
                borderRadius: 3,
                backgroundColor: isFilled ? color : color + '18',
                left: radius - 3,
                top: radius - tickH / 2,
                transform: [
                  { rotate: `${angle}deg` },
                  { translateY: -(radius - tickH / 2 - 2) },
                ],
              }}
            />
          );
        })}
        {/* Inner white circle with percentage */}
        <View style={[
          styles.inner,
          { width: size - 24, height: size - 24, borderRadius: (size - 24) / 2 },
        ]}>
          <Text style={[styles.pctText, { color }]}>{displayPct}%</Text>
          <Text style={styles.valueText}>
            {Math.round(current)}/{Math.round(goal)} {unit}
          </Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  outerRing: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bgCircle: {
    position: 'absolute',
    borderWidth: 6,
  },
  inner: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
