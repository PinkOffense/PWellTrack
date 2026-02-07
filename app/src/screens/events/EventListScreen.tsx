import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
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

export function EventListScreen({ navigation, route }: Props) {
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
      'Delete / Apagar',
      'Delete this event? / Apagar este evento?',
      [
        { text: 'Cancel / Cancelar', style: 'cancel' },
        {
          text: 'Delete / Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eventsApi.delete(id);
              fetchData();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ],
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>;

  return (
    <ScreenContainer scroll={false}>
      {items.length === 0 ? (
        <EmptyState icon="calendar" title="No events / Nenhum evento" subtitle="Tap + to add an event.\nToque + para adicionar." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity onLongPress={() => handleDelete(item.id)}>
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.iconCircle}>
                    <Ionicons name={typeIcon[item.type] ?? 'calendar'} size={22} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.title}</Text>
                    <Text style={styles.date}>{new Date(item.datetime_start).toLocaleString()}</Text>
                    <Text style={styles.meta}>{item.type.replace('_', ' ')}{item.location ? ` @ ${item.location}` : ''}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
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
  list: { padding: spacing.lg, paddingBottom: 100 },
  card: { padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
  date: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  meta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', ...shadows.button },
});
