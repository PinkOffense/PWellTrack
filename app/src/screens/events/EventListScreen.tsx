import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { eventsApi, PetEvent } from '../../api';
import { ScreenContainer, Card, EmptyState } from '../../components';
import { colors, fontSize, spacing, borderRadius, shadows } from '../../theme';

type Props = NativeStackScreenProps<any, 'EventList'>;

const typeIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  vet_visit: 'medical',
  vaccine: 'shield-checkmark',
  grooming: 'cut',
  other: 'calendar',
};

const typeColor: Record<string, string> = {
  vet_visit: colors.danger,
  vaccine: colors.success,
  grooming: colors.info,
  other: colors.accent,
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

  const upcomingCount = items.filter((ev) => new Date(ev.datetime_start) > new Date()).length;

  const header = (
    <View style={styles.headerWrap}>
      <LinearGradient
        colors={['#F472B6', '#FBCFE8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroRow}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="calendar" size={26} color="#F472B6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Events / Eventos</Text>
            <Text style={styles.heroSub}>{petName}</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeNum}>{items.length}</Text>
            <Text style={styles.heroBadgeLabel}>total</Text>
          </View>
        </View>
        {upcomingCount > 0 && (
          <View style={styles.heroStat}>
            <Ionicons name="time" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroStatText}>
              {upcomingCount} upcoming / proximo{upcomingCount > 1 ? 's' : ''}
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
          <EmptyState icon="calendar" title="No events / Nenhum evento" subtitle="Tap + to add an event.\nToque + para adicionar." />
        </>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const tc = typeColor[item.type] ?? colors.accent;
            const isFuture = new Date(item.datetime_start) > new Date();
            return (
              <TouchableOpacity activeOpacity={0.85} onLongPress={() => handleDelete(item.id)}>
                <Card style={styles.card}>
                  <View style={[styles.accentBar, { backgroundColor: tc }]} />
                  <View style={styles.cardContent}>
                    <View style={styles.row}>
                      <View style={[styles.iconCircle, { backgroundColor: tc + '20' }]}>
                        <Ionicons name={typeIcon[item.type] ?? 'calendar'} size={22} color={tc} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.name}>{item.title}</Text>
                        <Text style={styles.date}>
                          {new Date(item.datetime_start).toLocaleDateString()} -{' '}
                          {new Date(item.datetime_start).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        <Text style={styles.meta}>
                          {item.type.replace('_', ' ')}{item.location ? ` @ ${item.location}` : ''}
                        </Text>
                      </View>
                      {isFuture && (
                        <View style={[styles.typeBadge, { backgroundColor: tc + '20' }]}>
                          <Text style={[styles.typeBadgeText, { color: tc }]}>Upcoming</Text>
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
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('EventForm', { petId, petName })}>
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
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary },
  date: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  meta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', ...shadows.button },
});
