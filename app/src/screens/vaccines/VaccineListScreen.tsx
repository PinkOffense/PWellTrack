import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { vaccinesApi, Vaccine } from '../../api';
import { ScreenContainer, Card, EmptyState } from '../../components';
import { colors, fontSize, spacing, shadows } from '../../theme';

type Props = NativeStackScreenProps<any, 'VaccineList'>;

function getDueDateColor(nextDueDate: string | null | undefined): string | undefined {
  if (!nextDueDate) return undefined;
  const now = new Date();
  const due = new Date(nextDueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return colors.danger;
  if (diffDays < 30) return colors.warning;
  return undefined;
}

export function VaccineListScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { petId, petName } = route.params as { petId: number; petName: string };
  const [items, setItems] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try { setItems(await vaccinesApi.list(petId)); } catch (e: any) { Alert.alert(t('common.error'), e.message || t('common.error')); }
    finally { setLoading(false); }
  }, [petId, t]);

  const handleDelete = (id: number) => {
    Alert.alert(
      t('common.delete'),
      t('vaccines.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await vaccinesApi.delete(id);
              fetchData();
            } catch (e: any) {
              Alert.alert(t('common.error'), e.message);
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
      <Text style={styles.title}>{t('vaccines.title')}</Text>
      <Text style={styles.subtitle}>{petName}</Text>

      {items.length === 0 ? (
        <EmptyState icon="shield-checkmark" title={t('vaccines.noVaccines')} subtitle={t('vaccines.noVaccinesHint')} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const dueColor = getDueDateColor(item.next_due_date);
            return (
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="shield-checkmark" size={22} color={colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.date}>{t('vaccines.administered')} {item.date_administered}</Text>
                    {item.next_due_date && (
                      <Text style={[styles.due, dueColor ? { color: dueColor } : undefined]}>
                        {t('vaccines.nextDueDate')}: {item.next_due_date}
                      </Text>
                    )}
                    {item.clinic && <Text style={styles.meta}>{item.clinic}</Text>}
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </Card>
            );
          }}
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
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary, paddingHorizontal: spacing.lg },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  list: { padding: spacing.lg, paddingBottom: 100 },
  card: { padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.successLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
  date: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  due: { fontSize: fontSize.sm, color: colors.warning, fontWeight: '600', marginTop: 2 },
  meta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  deleteBtn: { padding: spacing.sm, marginLeft: spacing.sm },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', ...shadows.button },
});
