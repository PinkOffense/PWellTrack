import React, { useState } from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { feedingApi, FeedingCreate } from '../../api';
import { ScreenContainer, Input, GradientButton } from '../../components';
import { colors, fontSize, spacing } from '../../theme';

type Props = NativeStackScreenProps<any, 'FeedingForm'>;

export function FeedingFormScreen({ navigation, route }: Props) {
  const { petId } = route.params as { petId: number; petName: string };
  const [foodType, setFoodType] = useState('');
  const [actualGrams, setActualGrams] = useState('');
  const [plannedGrams, setPlannedGrams] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!foodType.trim()) {
      Alert.alert('Oops!', 'Please enter the food type / Informe o tipo de alimento.');
      return;
    }
    if (!actualGrams.trim() || isNaN(Number(actualGrams))) {
      Alert.alert('Oops!', 'Please enter a valid amount in grams / Informe uma quantidade valida em gramas.');
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
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error / Erro', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>New Feeding / Nova Alimentacao</Text>

      <Input
        label="Food Type / Tipo de Alimento *"
        value={foodType}
        onChangeText={setFoodType}
        placeholder="Dry food, Wet food / Racao, Sachê..."
      />

      <Input
        label="Amount (g) / Quantidade (g) *"
        value={actualGrams}
        onChangeText={setActualGrams}
        placeholder="150"
        keyboardType="decimal-pad"
      />

      <Input
        label="Planned Amount (g) / Qtd. Planejada (g)"
        value={plannedGrams}
        onChangeText={setPlannedGrams}
        placeholder="200"
        keyboardType="decimal-pad"
      />

      <Input
        label="Notes / Notas"
        value={notes}
        onChangeText={setNotes}
        placeholder="Any observations... / Observacoes..."
        multiline
      />

      <GradientButton
        title="Save / Salvar"
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
});
