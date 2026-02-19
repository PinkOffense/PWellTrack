import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { medicationsApi } from '../../api';
import { ScreenContainer, Input, GradientButton, DatePickerInput } from '../../components';
import { scheduleMedicationReminder } from '../../utils/notifications';
import { colors, fontSize, spacing } from '../../theme';

type Props = NativeStackScreenProps<any, 'MedicationForm'>;

export function MedicationFormScreen({ navigation, route }: Props) {
  const { petId, petName } = route.params as { petId: number; petName?: string };
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
      Alert.alert(t('common.error'), t('forms.requiredFields'));
      return;
    }
    if (isNaN(Number(frequency)) || Number(frequency) <= 0) {
      Alert.alert(t('common.error'), t('forms.invalidFrequency'));
      return;
    }
    if (!Number.isInteger(Number(frequency))) {
      Alert.alert(t('common.error'), t('forms.frequencyMustBeInteger'));
      return;
    }
    if (endDate && startDate && endDate < startDate) {
      Alert.alert(t('common.error'), t('forms.endDateBeforeStart'));
      return;
    }
    setLoading(true);
    try {
      const created = await medicationsApi.create(petId, {
        name,
        dosage,
        frequency_per_day: parseInt(frequency, 10),
        start_date: startDate,
        end_date: endDate || undefined,
        notes: notes || undefined,
      });

      // Schedule a daily medication reminder
      try {
        await scheduleMedicationReminder(
          created.id,
          petName || 'Pet',
          name,
          dosage,
        );
      } catch (notifErr) {
        console.warn('Failed to schedule medication reminder:', notifErr);
      }

      Alert.alert(t('common.success'), t('forms.medicationSaved'));
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
