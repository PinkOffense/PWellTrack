import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { symptomsApi, Symptom } from '../../api';
import { ScreenContainer, Card, EmptyState } from '../../components';
import { colors, fontSize, spacing, borderRadius, shadows } from '../../theme';

type Props = NativeStackScreenProps<any, 'SymptomList'>;

const severityColor: Record<string, string> = {
  mild: colors.success,
  moderate: colors.warning,
  severe: colors.danger,
};

export function SymptomListScreen({ navigation, route }: Props) {
  const { petId, petName } = route.params as { petId: number; petName: string };
  const [items, setItems] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try { setItems(await symptomsApi.list(petId)); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [petId]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete / Apagar',
      'Delete this symptom record? / Apagar este registo de sintoma?',
      [
        { text: 'Cancel / Cancelar', style: 'cancel' },
        {
          text: 'Delete / Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await symptomsApi.delete(id);
              fetchData();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ],
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.danger} /></View>;

  return (
    <ScreenContainer scroll={false}>
      {items.length === 0 ? (
        <EmptyState icon="pulse" title="No symptoms / Nenhum sintoma" subtitle="Tap + to record a symptom.\nToque + para registrar." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const sColor = severityColor[item.severity] ?? colors.textMuted;
            return (
              <TouchableOpacity onLongPress={() => handleDelete(item.id)}>
                <Card style={styles.card}>
                  <View style={styles.row}>
                    <View style={[styles.iconCircle, { backgroundColor: sColor + '20' }]}>
                      <Ionicons name="pulse" size={22} color={sColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{item.type}</Text>
                      <Text style={styles.date}>{new Date(item.datetime).toLocaleString()}</Text>
                      {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
                    </View>
                    <View style={[styles.badge, { backgroundColor: sColor + '20' }]}>
                      <Text style={[styles.badgeText, { color: sColor }]}>{item.severity}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('SymptomForm', { petId, petName })}>
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
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, textTransform: 'capitalize' },
  date: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  notes: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  badgeText: { fontSize: fontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', ...shadows.button },
});
