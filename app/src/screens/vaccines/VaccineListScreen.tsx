import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { vaccinesApi, Vaccine } from '../../api';
import { ScreenContainer, Card, EmptyState } from '../../components';
import { colors, fontSize, spacing, shadows } from '../../theme';

type Props = NativeStackScreenProps<any, 'VaccineList'>;

export function VaccineListScreen({ navigation, route }: Props) {
  const { petId, petName } = route.params as { petId: number; petName: string };
  const [items, setItems] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try { setItems(await vaccinesApi.list(petId)); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [petId]);

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete / Apagar',
      'Delete this vaccine record? / Apagar este registo de vacina?',
      [
        { text: 'Cancel / Cancelar', style: 'cancel' },
        {
          text: 'Delete / Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await vaccinesApi.delete(id);
              fetchData();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ],
    );
  };

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.success} /></View>;

  return (
    <ScreenContainer scroll={false}>
      {items.length === 0 ? (
        <EmptyState icon="shield-checkmark" title="No vaccines yet / Nenhuma vacina" subtitle="Tap + to add a vaccine record.\nToque + para adicionar." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.85} onLongPress={() => handleDelete(item.id)}>
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="shield-checkmark" size={22} color={colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.date}>Administered: {item.date_administered}</Text>
                    {item.next_due_date && <Text style={styles.due}>Next: {item.next_due_date}</Text>}
                    {item.clinic && <Text style={styles.meta}>{item.clinic}</Text>}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('VaccineForm', { petId, petName })}>
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
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.successLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
  date: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  due: { fontSize: fontSize.sm, color: colors.warning, fontWeight: '600', marginTop: 2 },
  meta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', ...shadows.button },
});
