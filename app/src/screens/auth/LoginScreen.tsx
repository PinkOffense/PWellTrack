import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, Animated, TextInput,
  ScrollView, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { GradientButton } from '../../components';
import { colors, fontSize, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<any, 'Login'>;

// ── Floating paw decoration ──
function FloatingPaw({ delay, x, y, size, rotation }: {
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

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 0.3, 0.15] });

  return (
    <Animated.View style={[
      styles.floatingPaw,
      { left: x, top: y, transform: [{ translateY }, { rotate: `${rotation}deg` }], opacity },
    ]}>
      <Ionicons name="paw" size={size} color={colors.primaryLight} />
    </Animated.View>
  );
}

// ── Styled input with icon (inspired by hckegg_lite) ──
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
        color={focused ? colors.primary : colors.textMuted}
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

export function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { login, loginWithGoogle, enterDemoMode, backendReachable, googleAvailable } = useAuth();
  const { width: SCREEN_W } = useWindowDimensions();
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.oops'), t('auth.fillAllFields'));
      return;
    }
    if (!email.includes('@')) {
      Alert.alert(t('common.oops'), t('auth.invalidEmail'));
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e: any) {
      Alert.alert(t('auth.loginFailed'), e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#F0E6FF', '#FFFFFF', '#FFF0F5']}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      {/* Floating paw decorations */}
      <FloatingPaw delay={0} x={SCREEN_W * 0.08} y={80} size={32} rotation={-20} />
      <FloatingPaw delay={400} x={SCREEN_W * 0.75} y={120} size={24} rotation={15} />
      <FloatingPaw delay={200} x={SCREEN_W * 0.6} y={60} size={20} rotation={-35} />
      <FloatingPaw delay={600} x={SCREEN_W * 0.2} y={160} size={18} rotation={25} />
      <FloatingPaw delay={300} x={SCREEN_W * 0.85} y={200} size={28} rotation={-10} />

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
                  colors={[colors.primaryLight + '30', colors.accentLight + '30']}
                  style={styles.heroCircleInner}
                >
                  <View style={styles.pawCircle}>
                    <Ionicons name="paw" size={52} color={colors.primary} />
                  </View>
                  {/* Small floating hearts around the paw */}
                  <View style={[styles.miniHeart, { top: 8, right: 12 }]}>
                    <Ionicons name="heart" size={16} color={colors.accent} />
                  </View>
                  <View style={[styles.miniHeart, { bottom: 15, left: 8 }]}>
                    <Ionicons name="heart" size={12} color={colors.accentLight} />
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Title with gradient feel */}
            <Text style={styles.title}>PWellTrack</Text>
            <Text style={styles.subtitle}>
              {t('auth.petCompanion')}
            </Text>

            {/* Offline banner */}
            {!backendReachable && (
              <View style={styles.offlineBanner}>
                <Ionicons name="cloud-offline" size={16} color="#F59E0B" />
                <Text style={styles.offlineBannerText}>
                  {t('auth.offlineMsg')}
                </Text>
              </View>
            )}

            {/* Form card */}
            <View style={styles.formCard}>
              <View style={styles.welcomeRow}>
                <Ionicons name="sparkles" size={20} color={colors.primary} />
                <Text style={styles.welcomeText}>{t('auth.welcomeBack')}</Text>
              </View>
              <Text style={styles.welcomeSub}>
                {t('auth.signInContinue')}
              </Text>

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

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => Alert.alert(
                  t('auth.forgotPassword'),
                  t('auth.forgotPasswordMsg')
                )}
              >
                <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
              </TouchableOpacity>

              <GradientButton
                title={t('auth.login')}
                onPress={handleLogin}
                loading={loading}
              />

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('common.or')}</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign-In button */}
              <TouchableOpacity
                style={[styles.googleBtn, !googleAvailable && styles.googleBtnDisabled]}
                onPress={() => {
                  if (!googleAvailable) {
                    Alert.alert(
                      t('auth.googleSignIn'),
                      t('auth.googleNotConfigured'),
                    );
                    return;
                  }
                  loginWithGoogle().catch((e: any) =>
                    Alert.alert(t('auth.googleFailed'), e.message)
                  );
                }}
              >
                <Ionicons name="logo-google" size={20} color={googleAvailable ? '#DB4437' : colors.textMuted} />
                <Text style={[styles.googleBtnText, !googleAvailable && styles.googleBtnTextDisabled]}>
                  {t('auth.googleSignIn')}
                </Text>
              </TouchableOpacity>

              {/* Demo mode button */}
              <TouchableOpacity
                style={styles.demoBtn}
                onPress={enterDemoMode}
              >
                <Ionicons name="play-circle" size={20} color={colors.primary} />
                <Text style={styles.demoBtnText}>{t('auth.tryDemo')}</Text>
              </TouchableOpacity>
            </View>

            {/* Sign up link */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerText}>
                {t('auth.noAccount')}{' '}
                <Text style={styles.registerBold}>{t('auth.register')}</Text>
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
  floatingPaw: {
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
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primaryLight + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCircleInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pawCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  miniHeart: {
    position: 'absolute',
  },

  // Title
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 1,
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
    // Double shadow like hckegg_lite
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  welcomeText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  welcomeSub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },

  // Styled inputs
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight + '12',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    height: 56,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '08',
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

  // Forgot password
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
  forgotText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
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
    marginBottom: spacing.sm,
  },
  googleBtnText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  googleBtnDisabled: {
    opacity: 0.5,
    borderColor: colors.border,
  },
  googleBtnTextDisabled: {
    color: colors.textMuted,
  },

  // Demo button
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    backgroundColor: colors.primaryLight + '08',
  },
  demoBtnText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },

  // Offline banner
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  offlineBannerText: {
    fontSize: fontSize.sm,
    color: '#92400E',
    fontWeight: '500',
  },

  // Register link
  registerLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  registerText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  registerBold: {
    color: colors.primary,
    fontWeight: '700',
  },
});
