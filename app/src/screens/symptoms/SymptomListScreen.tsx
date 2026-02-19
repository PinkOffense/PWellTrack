import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { symptomsApi, Symptom } from '../../api';
import { ScreenContainer, Card, EmptyState } from '../../components';
import { colors, fontSize, spacing, borderRadius, shadows } from '../../theme';

type Props = NativeStackScreenProps<any, 'SymptomList'>;

const severityColor: Record<string, string> = {
  mild: colors.success,
  moderate: colors.warning,
  severe: colors.danger,
};

const severityI18nKey: Record<string, string> = {
  mild: 'symptoms.mild',
  moderate: 'symptoms.moderate',
  severe: 'symptoms.severe',
};

export function SymptomListScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { petId, petName } = route.params as { petId: number; petName: string };
  const [items, setItems] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try { setItems(await symptomsApi.list(petId)); } catch (e: any) { Alert.alert(t('common.error'), e.message || t('common.error')); }
    finally { setLoading(false); }
  }, [petId, t]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handleDelete = (id: number) => {
    Alert.alert(
      t('common.delete'),
      t('symptoms.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await symptomsApi.delete(id);
              fetchData();
            } catch (e: any) {
              Alert.alert(t('common.error'), e.message);
            }
          },
        },
      ],
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.danger} /></View>;

  return (
    <ScreenContainer scroll={false}>
      <Text style={styles.title}>{t('symptoms.title')}</Text>
      <Text style={styles.subtitle}>{petName}</Text>

      {items.length === 0 ? (
        <EmptyState icon="pulse" title={t('symptoms.noSymptoms')} subtitle={t('symptoms.noSymptomsHint')} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const sColor = severityColor[item.severity] ?? colors.textMuted;
            return (
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
                    <Text style={[styles.badgeText, { color: sColor }]}>
                      {t(severityI18nKey[item.severity] ?? 'symptoms.mild')}
                    </Text>
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
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('SymptomForm', { petId, petName })}>
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
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, textTransform: 'capitalize' },
  date: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  notes: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  badgeText: { fontSize: fontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
  deleteBtn: { padding: spacing.sm, marginLeft: spacing.sm },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', ...shadows.button },
});
