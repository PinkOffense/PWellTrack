import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { petsApi, feedingApi, PetDashboard, FeedingLog } from '../../api';
import { ScreenContainer, Card, ProgressRing, EmptyState } from '../../components';
import { colors, fontSize, spacing, borderRadius, shadows } from '../../theme';

type Props = NativeStackScreenProps<any, 'PetDashboard'>;

const chartWidth = Dimensions.get('window').width - 64;

const chartConfig = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(138, 107, 190, ${opacity})`,
  labelColor: () => '#7B7394',
  barPercentage: 0.6,
  propsForBackgrounds: { rx: 6 },
};

interface QuickAction {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: string;
  gradient: readonly [string, string];
}

export function PetDashboardScreen({ navigation, route }: Props) {
  const { petId, petName } = route.params as { petId: number; petName: string };
  const [dashboard, setDashboard] = useState<PetDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>([]);

  const fetch = useCallback(async () => {
    try {
      const [data, logs] = await Promise.all([
        petsApi.today(petId),
        feedingApi.list(petId),
      ]);
      setDashboard(data);
      setFeedingLogs(logs.slice(-7));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [petId]);

  useFocusEffect(useCallback(() => { fetch(); }, [fetch]));

  const quickActions: QuickAction[] = [
    { label: 'Feeding\nAlimentacao', icon: 'restaurant', screen: 'FeedingList', gradient: ['#FF9F43', '#FFBE76'] },
    { label: 'Water\nAgua', icon: 'water', screen: 'WaterList', gradient: ['#60A5FA', '#93C5FD'] },
    { label: 'Vaccines\nVacinas', icon: 'shield-checkmark', screen: 'VaccineList', gradient: ['#34D399', '#6EE7B7'] },
    { label: 'Meds\nRemedios', icon: 'medkit', screen: 'MedicationList', gradient: ['#A78BFA', '#C4B5FD'] },
    { label: 'Events\nEventos', icon: 'calendar', screen: 'EventList', gradient: ['#F472B6', '#FBCFE8'] },
    { label: 'Symptoms\nSintomas', icon: 'pulse', screen: 'SymptomList', gradient: ['#F87171', '#FCA5A5'] },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }}>
      {/* Pet header */}
      <LinearGradient
        colors={[...colors.primaryGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <Text style={styles.heroName}>{petName}</Text>
        <Text style={styles.heroSub}>Today's Overview / Resumo de Hoje</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('PetForm', { petId })}
        >
          <Ionicons name="create-outline" size={20} color={colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Progress rings */}
      {dashboard && (
        <Card style={styles.progressCard}>
          <View style={styles.progressRow}>
            <ProgressRing
              current={dashboard.feeding.total_actual_grams}
              goal={dashboard.feeding.total_planned_grams ?? 0}
              unit="g"
              label="Food / Comida"
              color={colors.dog}
            />
            <ProgressRing
              current={dashboard.water.total_ml}
              goal={dashboard.water.daily_goal_ml ?? 0}
              unit="ml"
              label="Water / Agua"
              color={colors.info}
            />
          </View>
        </Card>
      )}

      {/* Feeding chart */}
      {dashboard && feedingLogs.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Feeding Chart / Grafico Alimentacao</Text>
          <Card style={styles.chartCard}>
            <Text style={styles.chartSubtitle}>
              Actual intake (g) — last {feedingLogs.length} entries
            </Text>
            <BarChart
              data={{
                labels: feedingLogs.map((l) => {
                  const d = new Date(l.datetime);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }),
                datasets: [{ data: feedingLogs.map((l) => l.actual_amount_grams) }],
              }}
              width={chartWidth}
              height={180}
              yAxisSuffix="g"
              yAxisLabel=""
              chartConfig={chartConfig}
              style={styles.chart}
              fromZero
            />
            {dashboard.feeding.total_planned_grams != null &&
              dashboard.feeding.total_planned_grams > 0 && (
                <Text style={styles.chartFooter}>
                  Planned today: {dashboard.feeding.total_planned_grams}g | Actual:{' '}
                  {dashboard.feeding.total_actual_grams}g
                </Text>
              )}
          </Card>
        </>
      )}

      {/* Water progress */}
      {dashboard && dashboard.water.daily_goal_ml != null && dashboard.water.daily_goal_ml > 0 && (
        <>
          <Text style={styles.sectionTitle}>Water Goal / Meta de Agua</Text>
          <Card style={styles.chartCard}>
            <View style={styles.waterHeader}>
              <Text style={styles.waterLabel}>
                {dashboard.water.total_ml} ml / {dashboard.water.daily_goal_ml} ml
              </Text>
              <Text style={styles.waterPercent}>
                {Math.min(
                  Math.round(
                    (dashboard.water.total_ml / dashboard.water.daily_goal_ml!) * 100,
                  ),
                  100,
                )}
                %
              </Text>
            </View>
            <View style={styles.waterBarBg}>
              <View
                style={[
                  styles.waterBarFill,
                  {
                    width: `${Math.min(
                      (dashboard.water.total_ml / dashboard.water.daily_goal_ml!) * 100,
                      100,
                    )}%`,
                  },
                ]}
              />
            </View>
            {dashboard.water.total_ml >= (dashboard.water.daily_goal_ml ?? 0) && (
              <Text style={styles.waterGoalReached}>Goal reached!</Text>
            )}
          </Card>
        </>
      )}

      {/* Quick actions grid */}
      <Text style={styles.sectionTitle}>Quick Actions / Acoes Rapidas</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((a) => (
          <TouchableOpacity
            key={a.screen}
            activeOpacity={0.85}
            style={styles.actionWrapper}
            onPress={() => navigation.navigate(a.screen, { petId, petName })}
          >
            <LinearGradient
              colors={[...a.gradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionCard}
            >
              <Ionicons name={a.icon} size={28} color={colors.white} />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upcoming events */}
      {dashboard && dashboard.upcoming_events.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Upcoming / Proximos</Text>
          {dashboard.upcoming_events.map((ev) => (
            <Card key={ev.id} style={styles.eventCard}>
              <View style={styles.eventRow}>
                <View style={[styles.eventDot, { backgroundColor: colors.accent }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{ev.title}</Text>
                  <Text style={styles.eventMeta}>
                    {new Date(ev.datetime_start).toLocaleDateString()} -{' '}
                    {ev.type.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </>
      )}

      {/* Active medications */}
      {dashboard && dashboard.active_medications.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Active Meds / Remedios Ativos</Text>
          {dashboard.active_medications.map((m) => (
            <Card key={m.id} style={styles.eventCard}>
              <View style={styles.eventRow}>
                <Ionicons name="medkit" size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{m.name} - {m.dosage}</Text>
                  <Text style={styles.eventMeta}>{m.frequency_per_day}x/day</Text>
                </View>
              </View>
            </Card>
          ))}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  heroName: {
    fontSize: fontSize.hero,
    fontWeight: '800',
    color: colors.white,
  },
  heroSub: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  editBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    padding: spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionWrapper: {
    width: '31%',
    aspectRatio: 1,
  },
  actionCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  actionLabel: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  chartCard: {
    padding: spacing.md,
  },
  chartSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chart: {
    borderRadius: borderRadius.sm,
    marginLeft: -spacing.md,
  },
  chartFooter: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  waterLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  waterPercent: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.info,
  },
  waterBarBg: {
    height: 14,
    backgroundColor: colors.infoLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  waterBarFill: {
    height: '100%',
    backgroundColor: colors.info,
    borderRadius: borderRadius.full,
  },
  waterGoalReached: {
    fontSize: fontSize.xs,
    color: colors.success,
    fontWeight: '600',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  eventCard: {
    padding: spacing.md,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  eventTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  eventMeta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
