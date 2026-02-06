import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { waterApi } from '../../api';
import { ScreenContainer, Input, GradientButton } from '../../components';
import { colors, fontSize, spacing } from '../../theme';
import { Text } from 'react-native';

type Props = NativeStackScreenProps<any, 'WaterForm'>;

export function WaterFormScreen({ navigation, route }: Props) {
  const { petId } = route.params as { petId: number };
  const [amountMl, setAmountMl] = useState('');
  const [dailyGoal, setDailyGoal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amountMl) {
      Alert.alert('Oops!', 'Enter amount / Digite a quantidade.');
      return;
    }
    setLoading(true);
    try {
      await waterApi.create(petId, {
        amount_ml: parseFloat(amountMl),
        daily_goal_ml: dailyGoal ? parseFloat(dailyGoal) : undefined,
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
      <Text style={styles.title}>Add Water / Adicionar Agua</Text>
      <Input label="Amount (ml) / Quantidade (ml) *" value={amountMl} onChangeText={setAmountMl} placeholder="250" keyboardType="decimal-pad" />
      <Input label="Daily Goal (ml) / Meta Diaria (ml)" value={dailyGoal} onChangeText={setDailyGoal} placeholder="500" keyboardType="decimal-pad" />
      <GradientButton title="Save / Salvar" onPress={handleSave} loading={loading} variant="primary" style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },
});
