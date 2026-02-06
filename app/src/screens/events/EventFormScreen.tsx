import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { eventsApi } from '../../api';
import { ScreenContainer, Input, GradientButton } from '../../components';
import { colors, fontSize, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<any, 'EventForm'>;

const EVENT_TYPES = ['vet_visit', 'vaccine', 'grooming', 'other'];

export function EventFormScreen({ navigation, route }: Props) {
  const { petId } = route.params as { petId: number };
  const [title, setTitle] = useState('');
  const [type, setType] = useState('vet_visit');
  const [datetimeStart, setDatetimeStart] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title || !datetimeStart) {
      Alert.alert('Oops!', 'Title and date are required / Titulo e data sao obrigatorios.');
      return;
    }
    setLoading(true);
    try {
      await eventsApi.create(petId, {
        title,
        type,
        datetime_start: datetimeStart,
        duration_minutes: duration ? parseInt(duration, 10) : undefined,
        location: location || undefined,
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
      <Text style={styles.title}>Add Event / Adicionar Evento</Text>
      <Input label="Title / Titulo *" value={title} onChangeText={setTitle} placeholder="Vet checkup..." />

      <Text style={styles.sectionLabel}>Type / Tipo</Text>
      <View style={styles.typeRow}>
        {EVENT_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeChip, type === t && styles.typeChipActive]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.typeLabel, type === t && styles.typeLabelActive]}>
              {t.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input label="Date & Time / Data e Hora *" value={datetimeStart} onChangeText={setDatetimeStart} placeholder="YYYY-MM-DDTHH:MM" />
      <Input label="Duration (min) / Duracao (min)" value={duration} onChangeText={setDuration} placeholder="30" keyboardType="number-pad" />
      <Input label="Location / Local" value={location} onChangeText={setLocation} placeholder="Pet Clinic..." />
      <Input label="Notes / Notas" value={notes} onChangeText={setNotes} placeholder="Any notes..." multiline />
      <GradientButton title="Save / Salvar" onPress={handleSave} loading={loading} variant="accent" style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },
  sectionLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm, marginLeft: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.8 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  typeChip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white },
  typeChipActive: { backgroundColor: colors.accent + '20', borderColor: colors.accent },
  typeLabel: { fontSize: fontSize.sm, color: colors.textMuted, textTransform: 'capitalize' },
  typeLabelActive: { color: colors.accent, fontWeight: '700' },
});
