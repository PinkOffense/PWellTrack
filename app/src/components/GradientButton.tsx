import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, borderRadius, fontSize, spacing } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'accent' | 'success' | 'danger';
  style?: ViewStyle;
  disabled?: boolean;
}

const gradients: Record<string, readonly [string, string]> = {
  primary: colors.primaryGradient,
  accent: colors.accentGradient,
  success: ['#34D399', '#6EE7B7'] as const,
  danger: ['#F87171', '#FCA5A5'] as const,
};

export function GradientButton({ title, onPress, loading, variant = 'primary', style, disabled }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.85}
      style={[styles.wrapper, style]}
    >
      <LinearGradient
        colors={[...gradients[variant]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, (loading || disabled) && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...shadows.button,
  },
  gradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  disabled: {
    opacity: 0.6,
  },
});
