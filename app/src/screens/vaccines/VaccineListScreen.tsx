import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { vaccinesApi, Vaccine } from '../../api';
import { ScreenContainer, Card, EmptyState } from '../../components';
import { colors, fontSize, spacing, borderRadius, shadows } from '../../theme';

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

  const dueCount = items.filter((v) => {
    if (!v.next_due_date) return false;
    return new Date(v.next_due_date) <= new Date();
  }).length;

  const header = (
    <View style={styles.headerWrap}>
      <LinearGradient
        colors={['#34D399', '#6EE7B7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroRow}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="shield-checkmark" size={26} color="#34D399" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Vaccines / Vacinas</Text>
            <Text style={styles.heroSub}>{petName}</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeNum}>{items.length}</Text>
            <Text style={styles.heroBadgeLabel}>records</Text>
          </View>
        </View>
        {dueCount > 0 && (
          <View style={styles.heroStat}>
            <Ionicons name="alert-circle" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.heroStatText}>
              {dueCount} vaccine{dueCount > 1 ? 's' : ''} due / pendente{dueCount > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );

  return (
    <ScreenContainer scroll={false}>
      {items.length === 0 ? (
        <>
          {header}
          <EmptyState icon="shield-checkmark" title="No vaccines yet / Nenhuma vacina" subtitle="Tap + to add a vaccine record.\nToque + para adicionar." />
        </>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isDue = item.next_due_date != null && new Date(item.next_due_date) <= new Date();
            return (
              <TouchableOpacity activeOpacity={0.85} onLongPress={() => handleDelete(item.id)}>
                <Card style={styles.card}>
                  <View style={[styles.accentBar, isDue && styles.accentBarDue]} />
                  <View style={styles.cardContent}>
                    <View style={styles.row}>
                      <View style={styles.iconCircle}>
                        <Ionicons name="shield-checkmark" size={22} color={colors.success} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.date}>Administered: {item.date_administered}</Text>
                        {item.next_due_date && (
                          <Text style={[styles.due, isDue && styles.dueOverdue]}>
                            Next: {item.next_due_date}
                            {isDue ? ' (overdue!)' : ''}
                          </Text>
                        )}
                        {item.clinic && <Text style={styles.meta}>{item.clinic}</Text>}
                      </View>
                      {isDue && (
                        <View style={styles.dueBadge}>
                          <Ionicons name="alert-circle" size={16} color={colors.warning} />
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
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
  headerWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  heroTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.white,
  },
  heroSub: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  heroBadgeNum: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.white,
  },
  heroBadgeLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  heroStatText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  list: { paddingBottom: 100 },
  card: {
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    backgroundColor: colors.success,
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
  },
  accentBarDue: {
    backgroundColor: colors.warning,
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.successLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary },
  date: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  due: { fontSize: fontSize.sm, color: colors.success, fontWeight: '600', marginTop: 2 },
  dueOverdue: { color: colors.warning },
  meta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  dueBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', ...shadows.button },
});
