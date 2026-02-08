import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { waterApi, WaterLog } from '../../api';
import { ScreenContainer, Card, EmptyState } from '../../components';
import { colors, fontSize, spacing, borderRadius, shadows } from '../../theme';

type Props = NativeStackScreenProps<any, 'WaterList'>;

export function WaterListScreen({ navigation, route }: Props) {
  const { petId, petName } = route.params as { petId: number; petName: string };
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const data = await waterApi.list(petId);
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete / Apagar',
      'Delete this water log? / Apagar este registo de agua?',
      [
        { text: 'Cancel / Cancelar', style: 'cancel' },
        {
          text: 'Delete / Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await waterApi.delete(id);
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

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.info} /></View>;
  }

  const todayTotal = logs
    .filter((l) => {
      const d = new Date(l.datetime);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    })
    .reduce((sum, l) => sum + l.amount_ml, 0);

  const latestGoal = logs.find((l) => l.daily_goal_ml)?.daily_goal_ml;

  const header = (
    <View style={styles.headerWrap}>
      <LinearGradient
        colors={['#60A5FA', '#93C5FD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroRow}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="water" size={26} color="#60A5FA" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Water / Agua</Text>
            <Text style={styles.heroSub}>{petName}</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeNum}>{logs.length}</Text>
            <Text style={styles.heroBadgeLabel}>logs</Text>
          </View>
        </View>
        {(todayTotal > 0 || latestGoal) && (
          <View style={styles.heroStat}>
            <Ionicons name="water" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroStatText}>
              Today: {todayTotal} ml{latestGoal ? ` / ${latestGoal} ml goal` : ''}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );

  return (
    <ScreenContainer scroll={false}>
      {logs.length === 0 ? (
        <>
          {header}
          <EmptyState
            icon="water"
            title="No water logs yet / Nenhum registro de agua"
            subtitle="Tap + to add a water log.\nToque + para adicionar."
          />
        </>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(i) => String(i.id)}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.85} onLongPress={() => handleDelete(item.id)}>
              <Card style={styles.card}>
                <View style={styles.accentBar} />
                <View style={styles.cardContent}>
                  <View style={styles.row}>
                    <View style={styles.iconCircle}>
                      <Ionicons name="water" size={22} color={colors.info} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.amount}>{item.amount_ml} ml</Text>
                      <Text style={styles.date}>
                        {new Date(item.datetime).toLocaleDateString()} -{' '}
                        {new Date(item.datetime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    {item.daily_goal_ml != null && item.daily_goal_ml > 0 && (
                      <View style={styles.goalBadge}>
                        <Text style={styles.goalText}>Goal: {item.daily_goal_ml} ml</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('WaterForm', { petId, petName })}
      >
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
    backgroundColor: colors.info,
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.infoLight,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  amount: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
  date: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  goalBadge: {
    backgroundColor: colors.infoLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  goalText: { fontSize: fontSize.xs, color: colors.info, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: spacing.xl, right: spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.info,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.button,
  },
});
