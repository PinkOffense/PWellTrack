import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { medicationsApi, Medication } from '../../api';
import { ScreenContainer, Card, EmptyState } from '../../components';
import { colors, fontSize, spacing, shadows } from '../../theme';

type Props = NativeStackScreenProps<any, 'MedicationList'>;

export function MedicationListScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { petId, petName } = route.params as { petId: number; petName: string };
  const [items, setItems] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try { setItems(await medicationsApi.list(petId)); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [petId]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handleDelete = (id: number) => {
    Alert.alert(
      t('common.delete'),
      t('medications.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await medicationsApi.delete(id);
              fetchData();
            } catch (e: any) {
              Alert.alert(t('common.error'), e.message);
            }
          },
        },
      ],
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primaryLight} /></View>;

  return (
    <ScreenContainer scroll={false}>
      <Text style={styles.title}>{t('medications.title')}</Text>
      <Text style={styles.subtitle}>{petName}</Text>

      {items.length === 0 ? (
        <EmptyState icon="medkit" title={t('medications.noMeds')} subtitle={t('medications.noMedsHint')} />
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
                  <Ionicons name="medkit" size={22} color={colors.primaryLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.dosage}>{item.dosage} - {item.frequency_per_day}x/day</Text>
                  <Text style={styles.date}>
                    {item.start_date}
                    {item.end_date ? ` to ${item.end_date}` : ` (${t('medications.ongoing')})`}
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
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('MedicationForm', { petId, petName })}>
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
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryLight + '20', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
  dosage: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  date: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  deleteBtn: { padding: spacing.sm, marginLeft: spacing.sm },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', ...shadows.button },
});
