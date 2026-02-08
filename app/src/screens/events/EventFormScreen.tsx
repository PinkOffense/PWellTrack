import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '../../api';
import { ScreenContainer, Input, GradientButton, DatePickerInput } from '../../components';
import { colors, fontSize, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<any, 'EventForm'>;

const EVENT_TYPE_KEYS = ['vet_visit', 'vaccine', 'grooming', 'other'] as const;
const EVENT_TYPE_I18N: Record<string, string> = {
  vet_visit: 'events.vetVisit',
  vaccine: 'events.vaccine',
  grooming: 'events.grooming',
  other: 'events.other',
};

export function EventFormScreen({ navigation, route }: Props) {
  const { petId } = route.params as { petId: number };
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('vet_visit');
  const [datetimeStart, setDatetimeStart] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title || !datetimeStart) {
      Alert.alert(t('common.oops'), t('forms.eventRequired'));
      return;
    }
    if (duration && (isNaN(Number(duration)) || Number(duration) <= 0)) {
      Alert.alert(t('common.oops'), t('forms.invalidDuration'));
      return;
    }
    setLoading(true);
    try {
      const datetimeValue = datetimeStart.length === 10 ? `${datetimeStart}T00:00:00` : datetimeStart;
      await eventsApi.create(petId, {
        title,
        type,
        datetime_start: datetimeValue,
        duration_minutes: duration ? parseInt(duration, 10) : undefined,
        location: location || undefined,
        notes: notes || undefined,
      });
      Alert.alert('', t('forms.eventSaved'));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('events.addEvent')}</Text>
      <Input label={`${t('events.eventTitle')} *`} value={title} onChangeText={setTitle} placeholder="Vet checkup..." />

      <Text style={styles.sectionLabel}>{t('events.type')}</Text>
      <View style={styles.typeRow}>
        {EVENT_TYPE_KEYS.map((k) => (
          <TouchableOpacity
            key={k}
            style={[styles.typeChip, type === k && styles.typeChipActive]}
            onPress={() => setType(k)}
          >
            <Text style={[styles.typeLabel, type === k && styles.typeLabelActive]}>
              {t(EVENT_TYPE_I18N[k])}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <DatePickerInput label={t('events.datetime')} value={datetimeStart} onChange={setDatetimeStart} mode="datetime" required />
      <Input label={t('events.duration')} value={duration} onChangeText={setDuration} placeholder="30" keyboardType="number-pad" />
      <Input label={t('events.location')} value={location} onChangeText={setLocation} placeholder="Pet Clinic..." />
      <Input label={t('common.notes')} value={notes} onChangeText={setNotes} placeholder="..." multiline />
      <GradientButton title={t('common.save')} onPress={handleSave} loading={loading} variant="accent" style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },
  sectionLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm, marginLeft: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.8 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  typeChip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white },
  typeChipActive: { backgroundColor: colors.accent + '20', borderColor: colors.accent },
  typeLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  typeLabelActive: { color: colors.accent, fontWeight: '700' },
});
