import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { symptomsApi } from '../../api';
import { ScreenContainer, Input, GradientButton } from '../../components';
import { colors, fontSize, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<any, 'SymptomForm'>;

export function SymptomFormScreen({ navigation, route }: Props) {
  const { petId } = route.params as { petId: number };
  const { t } = useTranslation();
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const SEVERITIES = [
    { key: 'mild', label: t('symptoms.mild'), color: colors.success },
    { key: 'moderate', label: t('symptoms.moderate'), color: colors.warning },
    { key: 'severe', label: t('symptoms.severe'), color: colors.danger },
  ];

  const handleSave = async () => {
    if (!type) {
      Alert.alert(t('common.oops'), t('forms.symptomRequired'));
      return;
    }
    setLoading(true);
    try {
      await symptomsApi.create(petId, { type, severity, notes: notes || undefined });
      Alert.alert('', t('forms.symptomSaved'));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('symptoms.addSymptom')}</Text>
      <Input label={`${t('symptoms.symptomType')} *`} value={type} onChangeText={setType} placeholder="vomiting, diarrhea, lethargy..." />

      <Text style={styles.sectionLabel}>{t('symptoms.severity')}</Text>
      <View style={styles.severityRow}>
        {SEVERITIES.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.severityChip, severity === s.key && { backgroundColor: s.color + '20', borderColor: s.color }]}
            onPress={() => setSeverity(s.key)}
          >
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <Text style={[styles.severityLabel, severity === s.key && { color: s.color, fontWeight: '700' }]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input label={t('common.notes')} value={notes} onChangeText={setNotes} placeholder="..." multiline />
      <GradientButton title={t('common.save')} onPress={handleSave} loading={loading} variant="danger" style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },
  sectionLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm, marginLeft: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.8 },
  severityRow: { gap: spacing.sm, marginBottom: spacing.md },
  severityChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  severityLabel: { fontSize: fontSize.md, color: colors.textMuted },
});
