import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { vaccinesApi } from '../../api';
import { ScreenContainer, Input, GradientButton, DatePickerInput } from '../../components';
import { scheduleVaccineReminder } from '../../utils/notifications';
import { colors, fontSize, spacing } from '../../theme';

type Props = NativeStackScreenProps<any, 'VaccineForm'>;

export function VaccineFormScreen({ navigation, route }: Props) {
  const { petId, petName } = route.params as { petId: number; petName?: string };
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [dateAdministered, setDateAdministered] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [clinic, setClinic] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !dateAdministered) {
      Alert.alert(t('common.error'), t('forms.vaccineRequired'));
      return;
    }
    if (nextDueDate && dateAdministered && nextDueDate < dateAdministered) {
      Alert.alert(t('common.error'), t('forms.nextDueDateBeforeAdministered'));
      return;
    }
    setLoading(true);
    try {
      const created = await vaccinesApi.create(petId, {
        name,
        date_administered: dateAdministered,
        next_due_date: nextDueDate || undefined,
        clinic: clinic || undefined,
        notes: notes || undefined,
      });

      // Schedule a vaccine reminder if next due date is set
      if (nextDueDate) {
        try {
          await scheduleVaccineReminder(
            created.id,
            petName || 'Pet',
            name,
            new Date(nextDueDate),
          );
        } catch (notifErr) {
          console.warn('Failed to schedule vaccine reminder:', notifErr);
        }
      }

      Alert.alert(t('common.success'), t('forms.vaccineSaved'));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('vaccines.addVaccine')}</Text>
      <Input label={`${t('vaccines.name')} *`} value={name} onChangeText={setName} placeholder="Rabies, V8..." />
      <DatePickerInput label={t('vaccines.dateAdministered')} value={dateAdministered} onChange={setDateAdministered} required />
      <DatePickerInput label={t('vaccines.nextDueDate')} value={nextDueDate} onChange={setNextDueDate} />
      <Input label={t('vaccines.clinic')} value={clinic} onChangeText={setClinic} placeholder="Pet Clinic..." />
      <Input label={t('common.notes')} value={notes} onChangeText={setNotes} placeholder="..." multiline />
      <GradientButton title={t('common.save')} onPress={handleSave} loading={loading} variant="success" style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },
});
