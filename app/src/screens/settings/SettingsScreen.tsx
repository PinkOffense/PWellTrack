import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer } from '../../components';
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
      Alert.alert(t('common.error'), t('settings.notificationsNotGranted'));
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
    <ScreenContainer>
      <Text style={styles.header}>{t('settings.title')}</Text>

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
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
              <Text style={styles.languageFlag}>EN</Text>
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
              <Text style={styles.languageFlag}>PT</Text>
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
        <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.notifRow} onPress={handleEnableNotifs} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            <Text style={styles.optionText}>{t('settings.enableNotifications')}</Text>
            <Ionicons name={notifsEnabled ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={notifsEnabled ? colors.success : colors.textMuted} />
          </TouchableOpacity>
          {notifsEnabled && (
            <Text style={styles.notifCount}>{scheduledCount} {t('settings.remindersScheduled')}</Text>
          )}
        </View>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={styles.logoutText}>{t('settings.logout')}</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
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
    backgroundColor: colors.background,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
    width: 36,
    textAlign: 'center',
  },
  languageLabel: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
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
  optionText: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  notifCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  logoutText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.danger,
    marginLeft: spacing.sm,
  },
});
