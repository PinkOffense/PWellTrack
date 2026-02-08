import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { waterApi } from '../../api';
import { ScreenContainer, Input, GradientButton } from '../../components';
import { colors, fontSize, spacing } from '../../theme';

type Props = NativeStackScreenProps<any, 'WaterForm'>;

export function WaterFormScreen({ navigation, route }: Props) {
  const { petId } = route.params as { petId: number };
  const { t } = useTranslation();
  const [amountMl, setAmountMl] = useState('');
  const [dailyGoal, setDailyGoal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amountMl || isNaN(Number(amountMl)) || Number(amountMl) <= 0) {
      Alert.alert(t('common.error'), t('forms.invalidAmount'));
      return;
    }
    if (dailyGoal && (isNaN(Number(dailyGoal)) || Number(dailyGoal) <= 0)) {
      Alert.alert(t('common.error'), t('forms.invalidAmount'));
      return;
    }
    setLoading(true);
    try {
      await waterApi.create(petId, {
        amount_ml: parseFloat(amountMl),
        daily_goal_ml: dailyGoal ? parseFloat(dailyGoal) : undefined,
      });
      Alert.alert(t('common.success'), t('forms.waterSaved'));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('water.addWater')}</Text>
      <Input label={`${t('water.amount')} *`} value={amountMl} onChangeText={setAmountMl} placeholder="250" keyboardType="decimal-pad" />
      <Input label={t('water.dailyGoal')} value={dailyGoal} onChangeText={setDailyGoal} placeholder="500" keyboardType="decimal-pad" />
      <GradientButton title={t('common.save')} onPress={handleSave} loading={loading} style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },
});
