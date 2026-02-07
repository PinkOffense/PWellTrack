import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { vaccinesApi } from '../../api';
import { ScreenContainer, Input, GradientButton, DatePickerInput } from '../../components';
import { colors, fontSize, spacing } from '../../theme';

type Props = NativeStackScreenProps<any, 'VaccineForm'>;

export function VaccineFormScreen({ navigation, route }: Props) {
  const { petId } = route.params as { petId: number };
  const [name, setName] = useState('');
  const [dateAdministered, setDateAdministered] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [clinic, setClinic] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !dateAdministered) {
      Alert.alert('Oops!', 'Name and date are required / Nome e data sao obrigatorios.');
      return;
    }
    setLoading(true);
    try {
      await vaccinesApi.create(petId, {
        name,
        date_administered: dateAdministered,
        next_due_date: nextDueDate || undefined,
        clinic: clinic || undefined,
        notes: notes || undefined,
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error / Erro', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Add Vaccine / Adicionar Vacina</Text>
      <Input label="Vaccine Name / Nome *" value={name} onChangeText={setName} placeholder="Rabies, V8..." />
      <DatePickerInput label="Date Administered / Data" value={dateAdministered} onChange={setDateAdministered} required />
      <DatePickerInput label="Next Due Date / Proxima dose" value={nextDueDate} onChange={setNextDueDate} />
      <Input label="Clinic / Clinica" value={clinic} onChangeText={setClinic} placeholder="Pet Clinic..." />
      <Input label="Notes / Notas" value={notes} onChangeText={setNotes} placeholder="Any notes..." multiline />
      <GradientButton title="Save / Salvar" onPress={handleSave} loading={loading} variant="success" style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },
});
