import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { medicationsApi } from '../../api';
import { ScreenContainer, Input, GradientButton, DatePickerInput } from '../../components';
import { colors, fontSize, spacing } from '../../theme';

type Props = NativeStackScreenProps<any, 'MedicationForm'>;

export function MedicationFormScreen({ navigation, route }: Props) {
  const { petId } = route.params as { petId: number };
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !dosage || !frequency || !startDate) {
      Alert.alert('Oops!', 'Fill required fields / Preencha os campos obrigatorios.');
      return;
    }
    if (isNaN(Number(frequency)) || Number(frequency) <= 0) {
      Alert.alert('Oops!', 'Enter a valid frequency / Digite uma frequencia valida.');
      return;
    }
    setLoading(true);
    try {
      await medicationsApi.create(petId, {
        name,
        dosage,
        frequency_per_day: parseInt(frequency, 10),
        start_date: startDate,
        end_date: endDate || undefined,
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
      <Text style={styles.title}>Add Medication / Adicionar Remedio</Text>
      <Input label="Name / Nome *" value={name} onChangeText={setName} placeholder="Amoxicillin..." />
      <Input label="Dosage / Dosagem *" value={dosage} onChangeText={setDosage} placeholder="5 mg" />
      <Input label="Frequency per day / Vezes ao dia *" value={frequency} onChangeText={setFrequency} placeholder="2" keyboardType="number-pad" />
      <DatePickerInput label="Start Date / Data Inicio" value={startDate} onChange={setStartDate} required />
      <DatePickerInput label="End Date / Data Fim" value={endDate} onChange={setEndDate} />
      <Input label="Notes / Notas" value={notes} onChangeText={setNotes} placeholder="Any notes..." multiline />
      <GradientButton title="Save / Salvar" onPress={handleSave} loading={loading} style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },
});
