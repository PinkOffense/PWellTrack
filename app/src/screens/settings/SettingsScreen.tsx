import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { requestNotificationPermissions, getScheduledNotifications, cancelAllNotifications } from '../../utils/notifications';

const LANGUAGE_STORAGE_KEY = '@pwelltrack_language';

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [notifsEnabled, setNotifsEnabled] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && (stored === 'en' || stored === 'pt')) {
        setSelectedLanguage(stored);
        if (i18n.language !== stored) {
          i18n.changeLanguage(stored);
        }
      }
    })();
  }, [i18n]);

  useEffect(() => {
    (async () => {
      const scheduled = await getScheduledNotifications();
      if (scheduled.length > 0) {
        setNotifsEnabled(true);
        setScheduledCount(scheduled.length);
      }
    })();
  }, []);

  const handleEnableNotifs = async () => {
    if (notifsEnabled) {
      await cancelAllNotifications();
      setNotifsEnabled(false);
      setScheduledCount(0);
      return;
    }
    const granted = await requestNotificationPermissions();
    if (granted) {
      setNotifsEnabled(true);
      const scheduled = await getScheduledNotifications();
      setScheduledCount(scheduled.length);
    } else {
      Alert.alert(t('common.error'), 'Notification permissions not granted.');
    }
  };

  const changeLanguage = async (lang: string) => {
    setSelectedLanguage(lang);
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.logout'),
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Gradient header */}
      <LinearGradient
        colors={[...colors.primaryGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroRow}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="settings" size={26} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.heroTitle}>{t('settings.title')}</Text>
            <Text style={styles.heroSub}>PWellTrack v1.0</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Language Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="language" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        </View>
        <View style={styles.card}>
          <TouchableOpacity
            style={[
              styles.languageOption,
              selectedLanguage === 'en' && styles.languageOptionActive,
            ]}
            onPress={() => changeLanguage('en')}
            activeOpacity={0.7}
          >
            <View style={styles.languageRow}>
              <View style={[styles.flagCircle, selectedLanguage === 'en' && styles.flagCircleActive]}>
                <Text style={styles.languageFlag}>EN</Text>
              </View>
              <Text
                style={[
                  styles.languageLabel,
                  selectedLanguage === 'en' && styles.languageLabelActive,
                ]}
              >
                {t('settings.english')}
              </Text>
            </View>
            {selectedLanguage === 'en' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[
              styles.languageOption,
              selectedLanguage === 'pt' && styles.languageOptionActive,
            ]}
            onPress={() => changeLanguage('pt')}
            activeOpacity={0.7}
          >
            <View style={styles.languageRow}>
              <View style={[styles.flagCircle, selectedLanguage === 'pt' && styles.flagCircleActive]}>
                <Text style={styles.languageFlag}>PT</Text>
              </View>
              <Text
                style={[
                  styles.languageLabel,
                  selectedLanguage === 'pt' && styles.languageLabelActive,
                ]}
              >
                {t('settings.portuguese')}
              </Text>
            </View>
            {selectedLanguage === 'pt' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications" size={18} color={colors.warning} />
          <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
        </View>
        <View style={styles.card}>
          <TouchableOpacity style={styles.notifRow} onPress={handleEnableNotifs} activeOpacity={0.7}>
            <View style={[styles.notifIconCircle, notifsEnabled && styles.notifIconCircleActive]}>
              <Ionicons
                name={notifsEnabled ? 'notifications' : 'notifications-outline'}
                size={20}
                color={notifsEnabled ? colors.warning : colors.textMuted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionText}>{t('settings.enableNotifications')}</Text>
              {notifsEnabled && (
                <Text style={styles.notifCount}>{scheduledCount} {t('settings.remindersScheduled')}</Text>
              )}
            </View>
            <View style={[styles.toggleCircle, notifsEnabled && styles.toggleCircleActive]}>
              <Ionicons
                name={notifsEnabled ? 'checkmark' : 'close'}
                size={14}
                color={notifsEnabled ? colors.white : colors.textMuted}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person" size={18} color={colors.danger} />
          <Text style={styles.sectionTitle}>Account / Conta</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={styles.logoutText}>{t('settings.logout')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.danger + '60'} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  heroTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.white,
  },
  heroSub: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  languageOptionActive: {
    backgroundColor: colors.primary + '08',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  flagCircleActive: {
    backgroundColor: colors.primary + '20',
  },
  languageFlag: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  languageLabel: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  languageLabelActive: {
    fontWeight: '600',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  notifIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.textMuted + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  notifIconCircleActive: {
    backgroundColor: colors.warningLight,
  },
  optionText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  notifCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toggleCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.textMuted + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCircleActive: {
    backgroundColor: colors.success,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  logoutText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.danger,
    marginLeft: spacing.sm,
  },
});
