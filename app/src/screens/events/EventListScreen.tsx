import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { eventsApi, PetEvent } from '../../api';
import { ScreenContainer, Card, EmptyState } from '../../components';
import { colors, fontSize, spacing, shadows } from '../../theme';

type Props = NativeStackScreenProps<any, 'EventList'>;

const typeIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  vet_visit: 'medical',
  vaccine: 'shield-checkmark',
  grooming: 'cut',
  other: 'calendar',
};

const typeI18nKey: Record<string, string> = {
  vet_visit: 'events.vetVisit',
  vaccine: 'events.vaccine',
  grooming: 'events.grooming',
  other: 'events.other',
};

export function EventListScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { petId, petName } = route.params as { petId: number; petName: string };
  const [items, setItems] = useState<PetEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try { setItems(await eventsApi.list(petId)); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [petId]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handleDelete = (id: number) => {
    Alert.alert(
      t('common.delete'),
      t('events.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await eventsApi.delete(id);
              fetchData();
            } catch (e: any) {
              Alert.alert(t('common.error'), e.message);
            }
          },
        },
      ],
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>;

  return (
    <ScreenContainer scroll={false}>
      <Text style={styles.title}>{t('events.title')}</Text>
      <Text style={styles.subtitle}>{petName}</Text>

      {items.length === 0 ? (
        <EmptyState icon="calendar" title={t('events.noEvents')} subtitle={t('events.noEventsHint')} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconCircle}>
                  <Ionicons name={typeIcon[item.type] ?? 'calendar'} size={22} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.title}</Text>
                  <Text style={styles.date}>{new Date(item.datetime_start).toLocaleString()}</Text>
                  <Text style={styles.meta}>
                    {t(typeI18nKey[item.type] ?? 'events.other')}
                    {item.location ? ` @ ${item.location}` : ''}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('EventForm', { petId, petName })}>
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary, paddingHorizontal: spacing.lg },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  list: { padding: spacing.lg, paddingBottom: 100 },
  card: { padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
  date: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  meta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  deleteBtn: { padding: spacing.sm, marginLeft: spacing.sm },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', ...shadows.button },
});
