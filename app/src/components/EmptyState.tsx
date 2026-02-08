import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '../theme';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconOuter}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={44} color={colors.primary} />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl + 16,
    paddingHorizontal: spacing.xl,
  },
  iconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '08',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
