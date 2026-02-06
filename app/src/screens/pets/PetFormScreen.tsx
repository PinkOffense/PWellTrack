import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { petsApi, PetCreate } from '../../api';
import { ScreenContainer, Input, GradientButton, Card } from '../../components';
import { colors, fontSize, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<any, 'PetForm'>;

const SPECIES_OPTIONS = [
  { key: 'dog', label: 'Dog / Cachorro', icon: 'paw' as const, color: colors.dog },
  { key: 'cat', label: 'Cat / Gato', icon: 'logo-octocat' as const, color: colors.cat },
  { key: 'exotic', label: 'Exotic / Exotico', icon: 'leaf' as const, color: colors.exotic },
];

export function PetFormScreen({ navigation, route }: Props) {
  const petId = route.params?.petId;
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

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
      });
    }
  }, [petId]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Oops!', 'Please enter a name / Digite um nome.');
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
      if (petId) {
        await petsApi.update(petId, data);
      } else {
        await petsApi.create(data);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error / Erro', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>
        {petId ? 'Edit Pet / Editar Pet' : 'New Pet / Novo Pet'}
      </Text>

      <Input label="Name / Nome *" value={name} onChangeText={setName} placeholder="Rex, Luna..." />

      <Text style={styles.sectionLabel}>Species / Especie</Text>
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
            <Text
              style={[
                styles.speciesLabel,
                species === opt.key && { color: opt.color, fontWeight: '700' },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input label="Breed / Raca" value={breed} onChangeText={setBreed} placeholder="Golden Retriever..." />
      <Input
        label="Date of Birth / Nascimento"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
        placeholder="YYYY-MM-DD"
      />
      <Input label="Sex / Sexo" value={sex} onChangeText={setSex} placeholder="Male, Female / Macho, Femea" />
      <Input
        label="Weight (kg) / Peso (kg)"
        value={weightKg}
        onChangeText={setWeightKg}
        placeholder="12.5"
        keyboardType="decimal-pad"
      />
      <Input label="Notes / Notas" value={notes} onChangeText={setNotes} placeholder="Any notes..." multiline />

      <GradientButton
        title={petId ? 'Save Changes / Salvar' : 'Add Pet / Adicionar Pet'}
        onPress={handleSave}
        loading={loading}
        style={{ marginTop: spacing.md }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  speciesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  speciesChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  speciesLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
