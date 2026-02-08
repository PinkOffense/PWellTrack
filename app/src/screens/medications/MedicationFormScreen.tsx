import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { medicationsApi } from '../../api';
import { ScreenContainer, Input, GradientButton, DatePickerInput } from '../../components';
import { colors, fontSize, spacing } from '../../theme';

type Props = NativeStackScreenProps<any, 'MedicationForm'>;

export function MedicationFormScreen({ navigation, route }: Props) {
  const { petId } = route.params as { petId: number };
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !dosage || !frequency || !startDate) {
      Alert.alert(t('common.oops'), t('forms.requiredFields'));
      return;
    }
    if (isNaN(Number(frequency)) || Number(frequency) <= 0) {
      Alert.alert(t('common.oops'), t('forms.invalidFrequency'));
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
      Alert.alert('', t('forms.medicationSaved'));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('medications.addMedication')}</Text>
      <Input label={`${t('medications.name')} *`} value={name} onChangeText={setName} placeholder="Amoxicillin..." />
      <Input label={`${t('medications.dosage')} *`} value={dosage} onChangeText={setDosage} placeholder="5 mg" />
      <Input label={`${t('medications.frequency')} *`} value={frequency} onChangeText={setFrequency} placeholder="2" keyboardType="number-pad" />
      <DatePickerInput label={`${t('medications.startDate')} *`} value={startDate} onChange={setStartDate} required />
      <DatePickerInput label={t('medications.endDate')} value={endDate} onChange={setEndDate} />
      <Input label={t('common.notes')} value={notes} onChangeText={setNotes} placeholder="..." multiline />
      <GradientButton title={t('common.save')} onPress={handleSave} loading={loading} style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },
});
