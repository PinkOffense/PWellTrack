import React, { useState } from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { feedingApi, FeedingCreate } from '../../api';
import { ScreenContainer, Input, GradientButton } from '../../components';
import { colors, fontSize, spacing } from '../../theme';

type Props = NativeStackScreenProps<any, 'FeedingForm'>;

export function FeedingFormScreen({ navigation, route }: Props) {
  const { petId } = route.params as { petId: number; petName: string };
  const { t } = useTranslation();
  const [foodType, setFoodType] = useState('');
  const [actualGrams, setActualGrams] = useState('');
  const [plannedGrams, setPlannedGrams] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!foodType.trim()) {
      Alert.alert(t('common.oops'), t('forms.foodTypeRequired'));
      return;
    }
    if (!actualGrams.trim() || isNaN(Number(actualGrams))) {
      Alert.alert(t('common.oops'), t('forms.invalidAmount'));
      return;
    }
    setLoading(true);
    try {
      const data: FeedingCreate = {
        food_type: foodType.trim(),
        actual_amount_grams: parseFloat(actualGrams),
        planned_amount_grams: plannedGrams ? parseFloat(plannedGrams) : undefined,
        notes: notes.trim() || undefined,
      };
      await feedingApi.create(petId, data);
      Alert.alert('', t('forms.feedingSaved'));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('feeding.addFeeding')}</Text>
      <Input label={`${t('feeding.foodType')} *`} value={foodType} onChangeText={setFoodType} placeholder="Dry food, Wet food..." />
      <Input label={`${t('feeding.actualAmount')} *`} value={actualGrams} onChangeText={setActualGrams} placeholder="150" keyboardType="decimal-pad" />
      <Input label={t('feeding.plannedAmount')} value={plannedGrams} onChangeText={setPlannedGrams} placeholder="200" keyboardType="decimal-pad" />
      <Input label={t('common.notes')} value={notes} onChangeText={setNotes} placeholder="..." multiline />
      <GradientButton title={t('common.save')} onPress={handleSave} loading={loading} style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },
});
