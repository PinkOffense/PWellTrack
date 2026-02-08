import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

  const severeCount = items.filter((s) => s.severity === 'severe').length;
  const moderateCount = items.filter((s) => s.severity === 'moderate').length;

  const header = (
    <View style={styles.headerWrap}>
      <LinearGradient
        colors={['#F87171', '#FCA5A5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroRow}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="pulse" size={26} color="#F87171" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Symptoms / Sintomas</Text>
            <Text style={styles.heroSub}>{petName}</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeNum}>{items.length}</Text>
            <Text style={styles.heroBadgeLabel}>records</Text>
          </View>
        </View>
        {(severeCount > 0 || moderateCount > 0) && (
          <View style={styles.heroStat}>
            <Ionicons name="alert-circle" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroStatText}>
              {severeCount > 0 ? `${severeCount} severe` : ''}
              {severeCount > 0 && moderateCount > 0 ? ' / ' : ''}
              {moderateCount > 0 ? `${moderateCount} moderate` : ''}
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
          <EmptyState icon="pulse" title="No symptoms / Nenhum sintoma" subtitle="Tap + to record a symptom.\nToque + para registrar." />
        </>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const sColor = severityColor[item.severity] ?? colors.textMuted;
            return (
              <TouchableOpacity activeOpacity={0.85} onLongPress={() => handleDelete(item.id)}>
                <Card style={styles.card}>
                  <View style={[styles.accentBar, { backgroundColor: sColor }]} />
                  <View style={styles.cardContent}>
                    <View style={styles.row}>
                      <View style={[styles.iconCircle, { backgroundColor: sColor + '20' }]}>
                        <Ionicons name="pulse" size={22} color={sColor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.name}>{item.type}</Text>
                        <Text style={styles.date}>
                          {new Date(item.datetime).toLocaleDateString()} -{' '}
                          {new Date(item.datetime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
                      </View>
                      <View style={[styles.severityBadge, { backgroundColor: sColor + '20' }]}>
                        <Text style={[styles.severityText, { color: sColor }]}>{item.severity}</Text>
                      </View>
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
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, textTransform: 'capitalize' },
  date: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  notes: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  severityBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  severityText: { fontSize: fontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', ...shadows.button },
});
