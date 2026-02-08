import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { petsApi, PetCreate } from '../../api';
import { ScreenContainer, Input, GradientButton, DatePickerInput } from '../../components';
import { colors, fontSize, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

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
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.oops'), t('forms.nameRequired'));
      return;
    }
    if (weightKg && (isNaN(Number(weightKg)) || Number(weightKg) <= 0)) {
      Alert.alert(t('common.oops'), t('forms.invalidWeight'));
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
      let savedPet;
      if (petId) {
        savedPet = await petsApi.update(petId, data);
      } else {
        savedPet = await petsApi.create(data);
      }
      if (photoUri && savedPet?.id && photoUri !== originalPhotoUrl) {
        await petsApi.uploadPhoto(savedPet.id, photoUri);
      }
      Alert.alert('', t('forms.petSaved'));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{petId ? t('pets.editPet') : t('pets.newPet')}</Text>

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
      <Input label={t('pets.sex')} value={sex} onChangeText={setSex} placeholder={t('pets.sexPlaceholder')} />
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
