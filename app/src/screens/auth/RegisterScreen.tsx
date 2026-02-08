import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, Animated, TextInput,
  ScrollView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { GradientButton } from '../../components';
import { colors, fontSize, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<any, 'Register'>;

const { width: SCREEN_W } = Dimensions.get('window');

// ── Floating heart decoration ──
function FloatingHeart({ delay, x, y, size, rotation }: {
  delay: number; x: number; y: number; size: number; rotation: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 3000, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 3000, useNativeDriver: true }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.12, 0.28, 0.12] });

  return (
    <Animated.View style={[
      styles.floatingHeart,
      { left: x, top: y, transform: [{ translateY }, { rotate: `${rotation}deg` }], opacity },
    ]}>
      <Ionicons name="heart" size={size} color={colors.accentLight} />
    </Animated.View>
  );
}

// ── Styled input with icon ──
function StyledInput({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize }: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[
      styles.inputContainer,
      focused && styles.inputContainerFocused,
    ]}>
      <Ionicons
        name={icon}
        size={20}
        color={focused ? colors.accent : colors.textMuted}
        style={styles.inputIcon}
      />
      <TextInput
        style={styles.inputField}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showPassword}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {secureTextEntry && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

export function RegisterScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { register, loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert(t('common.oops'), t('auth.fillAllFields'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('common.oops'), t('auth.passwordMin'));
      return;
    }
    setLoading(true);
    try {
      await register(name, email.trim().toLowerCase(), password);
    } catch (e: any) {
      Alert.alert(t('auth.registerFailed'), e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FFF0F5', '#FFFFFF', '#F0E6FF']}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      {/* Floating heart decorations */}
      <FloatingHeart delay={0} x={SCREEN_W * 0.1} y={70} size={28} rotation={-15} />
      <FloatingHeart delay={500} x={SCREEN_W * 0.78} y={100} size={22} rotation={20} />
      <FloatingHeart delay={200} x={SCREEN_W * 0.55} y={55} size={18} rotation={-30} />
      <FloatingHeart delay={700} x={SCREEN_W * 0.25} y={140} size={16} rotation={10} />
      <FloatingHeart delay={350} x={SCREEN_W * 0.88} y={180} size={24} rotation={-5} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}>
            {/* Hero illustration */}
            <View style={styles.heroContainer}>
              <View style={styles.heroCircleOuter}>
                <LinearGradient
                  colors={[colors.accentLight + '30', colors.primaryLight + '30']}
                  style={styles.heroCircleInner}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name="heart" size={48} color={colors.accent} />
                  </View>
                  {/* Small floating paws around the heart */}
                  <View style={[styles.miniIcon, { top: 6, right: 10 }]}>
                    <Ionicons name="paw" size={14} color={colors.primary} />
                  </View>
                  <View style={[styles.miniIcon, { bottom: 12, left: 6 }]}>
                    <Ionicons name="paw" size={11} color={colors.primaryLight} />
                  </View>
                  <View style={[styles.miniIcon, { top: 22, left: 2 }]}>
                    <Ionicons name="star" size={10} color={colors.accentLight} />
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>{t('auth.joinTitle')}</Text>
            <Text style={styles.subtitle}>
              {t('auth.createYourAccount')}
            </Text>

            {/* Form card */}
            <View style={styles.formCard}>
              <View style={styles.headerRow}>
                <Ionicons name="sparkles" size={20} color={colors.accent} />
                <Text style={styles.headerText}>{t('auth.getStarted')}</Text>
              </View>
              <Text style={styles.headerSub}>
                {t('auth.trackJourney')}
              </Text>

              <StyledInput
                icon="person"
                placeholder={t('auth.name')}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <StyledInput
                icon="mail"
                placeholder={t('auth.email')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <StyledInput
                icon="lock-closed"
                placeholder={t('auth.password')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <GradientButton
                title={t('auth.register')}
                onPress={handleRegister}
                loading={loading}
                variant="accent"
              />

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('common.or')}</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign-In button */}
              <TouchableOpacity
                style={styles.googleBtn}
                onPress={() => {
                  loginWithGoogle().catch((e: any) =>
                    Alert.alert(t('auth.googleFailed'), e.message)
                  );
                }}
              >
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={styles.googleBtnText}>
                  {t('auth.googleSignUp')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login link */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.loginText}>
                {t('auth.hasAccount')}{' '}
                <Text style={styles.loginBold}>{t('auth.login')}</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  floatingHeart: {
    position: 'absolute',
    zIndex: 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  content: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },

  // Hero
  heroContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroCircleOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.accentLight + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCircleInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  miniIcon: {
    position: 'absolute',
  },

  // Title
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.accent,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },

  // Form card
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    shadowColor: colors.accentLight,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },

  // Styled inputs
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight + '12',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    height: 56,
  },
  inputContainerFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight + '08',
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    height: '100%',
  },
  eyeBtn: {
    padding: spacing.xs,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },

  // Google button
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: colors.white,
  },
  googleBtnText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  // Login link
  loginLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  loginText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  loginBold: {
    color: colors.accent,
    fontWeight: '700',
  },
});
