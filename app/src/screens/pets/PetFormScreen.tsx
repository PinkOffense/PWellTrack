import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { petsApi, PetCreate } from '../../api';
import { ScreenContainer, Input, GradientButton, DatePickerInput } from '../../components';
import { colors, fontSize, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const PHOTO_MAX_PX = 512;
const PHOTO_JPEG_QUALITY = 0.7;

type Props = NativeStackScreenProps<any, 'PetForm'>;

export function PetFormScreen({ navigation, route }: Props) {
  const petId = route.params?.petId;
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(null);

  const SPECIES_OPTIONS = [
    { key: 'dog', label: t('pets.dog'), icon: 'paw' as const, color: colors.dog },
    { key: 'cat', label: t('pets.cat'), icon: 'paw' as const, color: colors.cat },
    { key: 'exotic', label: t('pets.exotic'), icon: 'leaf' as const, color: colors.exotic },
  ];

  useEffect(() => {
    if (petId) {
      petsApi.get(petId).then((pet) => {
        setName(pet.name);
        setSpecies(pet.species);
        setBreed(pet.breed ?? '');
        setDateOfBirth(pet.date_of_birth ?? '');
        setSex(pet.sex ?? '');
        setWeightKg(pet.weight_kg ? String(pet.weight_kg) : '');
        setNotes(pet.notes ?? '');
        if (pet.photo_url) {
          setPhotoUri(pet.photo_url);
          setOriginalPhotoUrl(pet.photo_url);
        }
      }).catch((e: any) => {
        Alert.alert(t('common.error'), e.message);
      });
    }
  }, [petId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      // Check file size before proceeding
      try {
        const info = await FileSystem.getInfoAsync(asset.uri);
        if (info.exists && info.size && info.size > MAX_PHOTO_SIZE_BYTES) {
          Alert.alert(
            t('common.error'),
            t('pets.photoTooLarge', { maxMB: 5 }),
          );
          return;
        }
      } catch {
        // If we can't check size, proceed anyway
      }
      setPhotoUri(asset.uri);
    }
  };

  /**
   * Compress and resize a local image to a base64 data URI.
   * Resizes to max 512px and converts to JPEG at 0.7 quality (~30-60KB).
   */
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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('forms.nameRequired'));
      return;
    }
    if (weightKg && (isNaN(Number(weightKg)) || Number(weightKg) <= 0)) {
      Alert.alert(t('common.error'), t('forms.invalidWeight'));
      return;
    }
    setLoading(true);
    try {
      const data: PetCreate = {
        name: name.trim(),
        species,
        breed: breed || undefined,
        date_of_birth: dateOfBirth || undefined,
        sex: sex || undefined,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        notes: notes || undefined,
      };
      // If we have a new photo, compress and convert to base64
      if (photoUri && photoUri !== originalPhotoUrl) {
        if (photoUri.startsWith('data:')) {
          (data as any).photo_url = photoUri;
        } else {
          (data as any).photo_url = await compressToBase64(photoUri);
        }
      }

      if (petId) {
        await petsApi.update(petId, data);
      } else {
        await petsApi.create(data);
      }
      Alert.alert(t('common.success'), t('forms.petSaved'));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{petId ? t('pets.editPet') : t('pets.addPet')}</Text>

      <TouchableOpacity style={styles.photoPickerContainer} onPress={pickImage}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera" size={32} color={colors.textMuted} />
            <Text style={styles.photoPlaceholderText}>{t('pets.addPhoto')}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Input label={`${t('pets.name')} *`} value={name} onChangeText={setName} placeholder="Rex, Luna..." />

      <Text style={styles.sectionLabel}>{t('pets.species')}</Text>
      <View style={styles.speciesRow}>
        {SPECIES_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.speciesChip,
              species === opt.key && { backgroundColor: opt.color + '20', borderColor: opt.color },
            ]}
            onPress={() => setSpecies(opt.key)}
          >
            <Ionicons name={opt.icon} size={20} color={species === opt.key ? opt.color : colors.textMuted} />
            <Text style={[styles.speciesLabel, species === opt.key && { color: opt.color, fontWeight: '700' }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input label={t('pets.breed')} value={breed} onChangeText={setBreed} placeholder="Golden Retriever..." />
      <DatePickerInput label={t('pets.dob')} value={dateOfBirth} onChange={setDateOfBirth} />
      <Input label={t('pets.sex')} value={sex} onChangeText={setSex} placeholder={`${t('pets.male')}, ${t('pets.female')}`} />
      <Input label={t('pets.weight')} value={weightKg} onChangeText={setWeightKg} placeholder="12.5" keyboardType="decimal-pad" />
      <Input label={t('common.notes')} value={notes} onChangeText={setNotes} placeholder="..." multiline />

      <GradientButton title={t('common.save')} onPress={handleSave} loading={loading} style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },
  sectionLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm, marginLeft: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.8 },
  speciesRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  speciesChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.sm + 2, borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white },
  speciesLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  photoPickerContainer: { alignSelf: 'center', marginBottom: spacing.lg },
  photoPreview: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.border + '40', borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  photoPlaceholderText: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.xs },
});
