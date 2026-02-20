import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api';
import { ScreenContainer } from '../../components';
import { requestNotificationPermissions, getScheduledNotifications, cancelAllNotifications } from '../../utils/notifications';

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const PHOTO_MAX_PX = 512;
const PHOTO_JPEG_QUALITY = 0.7;

const LANGUAGE_STORAGE_KEY = '@pwelltrack_language';

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { user, logout, refreshUser } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [notifsEnabled, setNotifsEnabled] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  const compressToBase64 = async (uri: string): Promise<string> => {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: PHOTO_MAX_PX, height: PHOTO_MAX_PX } }],
      { compress: PHOTO_JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
    );
    const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  };

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    try {
      const info = await FileSystem.getInfoAsync(asset.uri);
      if (info.exists && info.size && info.size > MAX_PHOTO_SIZE_BYTES) {
        Alert.alert(t('common.error'), t('pets.photoTooLarge', { maxMB: 5 }));
        return;
      }
    } catch { /* proceed anyway */ }

    setPhotoUploading(true);
    try {
      const photoData = await compressToBase64(asset.uri);
      await authApi.uploadPhoto(photoData);
      await refreshUser();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoUploading(true);
    try {
      await authApi.deletePhoto();
      await refreshUser();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    } finally {
      setPhotoUploading(false);
    }
  };

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

      {/* Profile Section */}
      {user && (
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <TouchableOpacity onPress={handlePickPhoto} disabled={photoUploading} activeOpacity={0.7}>
                <View style={styles.avatarContainer}>
                  {user.photo_url && !photoError ? (
                    <Image
                      source={{ uri: user.photo_url }}
                      style={styles.avatar}
                      onError={() => setPhotoError(true)}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarInitials}>
                        {user.name.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {photoUploading ? (
                    <View style={styles.avatarOverlay}>
                      <ActivityIndicator size="small" color={colors.white} />
                    </View>
                  ) : (
                    <View style={styles.avatarBadge}>
                      <Ionicons name="camera" size={14} color={colors.white} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
                <View style={styles.photoActions}>
                  <TouchableOpacity onPress={handlePickPhoto} disabled={photoUploading}>
                    <Text style={styles.photoActionText}>{t('profile.changePhoto')}</Text>
                  </TouchableOpacity>
                  {user.photo_url && (
                    <>
                      <Text style={styles.photoActionDot}> · </Text>
                      <TouchableOpacity onPress={handleRemovePhoto} disabled={photoUploading}>
                        <Text style={styles.photoRemoveText}>{t('profile.removePhoto')}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.white,
  },
  avatarOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  photoActionText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  photoActionDot: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  photoRemoveText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.danger,
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
