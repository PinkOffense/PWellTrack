import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { medicationsApi, Medication } from '../../api';
import { ScreenContainer, Card, EmptyState } from '../../components';
import { colors, fontSize, spacing, borderRadius, shadows } from '../../theme';

type Props = NativeStackScreenProps<any, 'MedicationList'>;

export function MedicationListScreen({ navigation, route }: Props) {
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
      'Delete / Apagar',
      'Delete this medication? / Apagar este medicamento?',
      [
        { text: 'Cancel / Cancelar', style: 'cancel' },
        {
          text: 'Delete / Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await medicationsApi.delete(id);
              fetchData();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ],
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primaryLight} /></View>;

  const activeCount = items.filter((m) => {
    if (!m.end_date) return true;
    return new Date(m.end_date) >= new Date();
  }).length;

  const header = (
    <View style={styles.headerWrap}>
      <LinearGradient
        colors={['#A78BFA', '#C4B5FD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroRow}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="medkit" size={26} color="#A78BFA" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Meds / Remedios</Text>
            <Text style={styles.heroSub}>{petName}</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeNum}>{items.length}</Text>
            <Text style={styles.heroBadgeLabel}>total</Text>
          </View>
        </View>
        {activeCount > 0 && (
          <View style={styles.heroStat}>
            <Ionicons name="checkmark-circle" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroStatText}>
              {activeCount} active / ativo{activeCount > 1 ? 's' : ''}
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
          <EmptyState icon="medkit" title="No medications / Nenhum remedio" subtitle="Tap + to add a medication.\nToque + para adicionar." />
        </>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = !item.end_date || new Date(item.end_date) >= new Date();
            return (
              <TouchableOpacity activeOpacity={0.85} onLongPress={() => handleDelete(item.id)}>
                <Card style={styles.card}>
                  <View style={[styles.accentBar, !isActive && styles.accentBarInactive]} />
                  <View style={styles.cardContent}>
                    <View style={styles.row}>
                      <View style={[styles.iconCircle, !isActive && styles.iconCircleInactive]}>
                        <Ionicons name="medkit" size={22} color={isActive ? '#A78BFA' : colors.textMuted} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.dosage}>{item.dosage} - {item.frequency_per_day}x/day</Text>
                        <Text style={styles.date}>
                          {item.start_date}{item.end_date ? ` to ${item.end_date}` : ' (ongoing)'}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
                        <Text style={[styles.statusText, isActive ? styles.activeText : styles.inactiveText]}>
                          {isActive ? 'Active' : 'Ended'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
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
    backgroundColor: '#A78BFA',
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
  },
  accentBarInactive: {
    backgroundColor: colors.textMuted,
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#A78BFA' + '20',
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconCircleInactive: {
    backgroundColor: colors.textMuted + '15',
  },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary },
  dosage: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  date: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  activeBadge: {
    backgroundColor: colors.successLight,
  },
  inactiveBadge: {
    backgroundColor: colors.textMuted + '20',
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  activeText: {
    color: colors.success,
  },
  inactiveText: {
    color: colors.textMuted,
  },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: '#A78BFA', alignItems: 'center', justifyContent: 'center', ...shadows.button },
});
