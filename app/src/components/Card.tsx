import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, shadows, borderRadius, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
    marginBottom: spacing.md,
  },
});
