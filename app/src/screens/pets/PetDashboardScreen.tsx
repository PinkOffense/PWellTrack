import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { petsApi, feedingApi, vaccinesApi, PetDashboard, FeedingLog, Vaccine } from '../../api';
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

type FeedingStatus = 'not_fed' | 'underfed' | 'well_fed' | 'overfed';
type VaccineStatus = 'up_to_date' | 'due_soon' | 'overdue' | 'no_records';

function getFeedingStatus(dashboard: PetDashboard): FeedingStatus {
  const { total_actual_grams, total_planned_grams, entries_count } = dashboard.feeding;
  if (entries_count === 0) return 'not_fed';
  if (total_planned_grams == null || total_planned_grams === 0) {
    return total_actual_grams > 0 ? 'well_fed' : 'not_fed';
  }
  const ratio = total_actual_grams / total_planned_grams;
  if (ratio < 0.5) return 'underfed';
  if (ratio > 1.3) return 'overfed';
  return 'well_fed';
}

function getVaccineStatus(vaccines: Vaccine[]): { status: VaccineStatus; overdueVaccines: Vaccine[]; dueSoonVaccines: Vaccine[] } {
  if (vaccines.length === 0) return { status: 'no_records', overdueVaccines: [], dueSoonVaccines: [] };

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const overdueVaccines: Vaccine[] = [];
  const dueSoonVaccines: Vaccine[] = [];

  for (const v of vaccines) {
    if (!v.next_due_date) continue;
    const dueDate = new Date(v.next_due_date);
    if (dueDate < now) {
      overdueVaccines.push(v);
    } else if (dueDate <= thirtyDaysFromNow) {
      dueSoonVaccines.push(v);
    }
  }

  if (overdueVaccines.length > 0) return { status: 'overdue', overdueVaccines, dueSoonVaccines };
  if (dueSoonVaccines.length > 0) return { status: 'due_soon', overdueVaccines, dueSoonVaccines };
  return { status: 'up_to_date', overdueVaccines, dueSoonVaccines };
}

const FEEDING_STATUS_CONFIG: Record<FeedingStatus, { icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }> = {
  not_fed: { icon: 'alert-circle', color: colors.danger, bgColor: colors.dangerLight },
  underfed: { icon: 'warning', color: '#D97706', bgColor: colors.warningLight },
  well_fed: { icon: 'checkmark-circle', color: '#059669', bgColor: colors.successLight },
  overfed: { icon: 'warning', color: '#D97706', bgColor: colors.warningLight },
};

const VACCINE_STATUS_CONFIG: Record<VaccineStatus, { icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }> = {
  up_to_date: { icon: 'shield-checkmark', color: '#059669', bgColor: colors.successLight },
  due_soon: { icon: 'time', color: '#D97706', bgColor: colors.warningLight },
  overdue: { icon: 'alert-circle', color: colors.danger, bgColor: colors.dangerLight },
  no_records: { icon: 'help-circle', color: colors.textMuted, bgColor: colors.border },
};

export function PetDashboardScreen({ navigation, route }: Props) {
  const { petId, petName } = route.params as { petId: number; petName: string };
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState<PetDashboard | null>(null);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>([]);

  const fetch = useCallback(async () => {
    try {
      const [data, logs, vaxes] = await Promise.all([
        petsApi.today(petId),
        feedingApi.list(petId),
        vaccinesApi.list(petId),
      ]);
      setDashboard(data);
      setFeedingLogs(logs.slice(-7));
      setVaccines(vaxes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [petId]);

  useFocusEffect(useCallback(() => { fetch(); }, [fetch]));

  const quickActions: QuickAction[] = [
    { label: t('dashboard.feeding'), icon: 'restaurant', screen: 'FeedingList', gradient: ['#FF9F43', '#FFBE76'] },
    { label: t('dashboard.water'), icon: 'water', screen: 'WaterList', gradient: ['#60A5FA', '#93C5FD'] },
    { label: t('dashboard.vaccines'), icon: 'shield-checkmark', screen: 'VaccineList', gradient: ['#34D399', '#6EE7B7'] },
    { label: t('dashboard.meds'), icon: 'medkit', screen: 'MedicationList', gradient: ['#A78BFA', '#C4B5FD'] },
    { label: t('dashboard.events'), icon: 'calendar', screen: 'EventList', gradient: ['#F472B6', '#FBCFE8'] },
    { label: t('dashboard.symptoms'), icon: 'pulse', screen: 'SymptomList', gradient: ['#F87171', '#FCA5A5'] },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const feedingStatus = dashboard ? getFeedingStatus(dashboard) : 'not_fed';
  const vaccineInfo = getVaccineStatus(vaccines);
  const feedingCfg = FEEDING_STATUS_CONFIG[feedingStatus];
  const vaccineCfg = VACCINE_STATUS_CONFIG[vaccineInfo.status];

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
        <Text style={styles.heroSub}>{t('dashboard.todayOverview')}</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('PetForm', { petId })}
        >
          <Ionicons name="create-outline" size={20} color={colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* ── STATUS OVERVIEW ── */}
      <Text style={styles.sectionTitle}>{t('dashboard.statusOverview')}</Text>

      {/* Feeding Status Card */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('FeedingList', { petId, petName })}
      >
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIconBg, { backgroundColor: feedingCfg.bgColor }]}>
              <Ionicons name={feedingCfg.icon} size={28} color={feedingCfg.color} />
            </View>
            <View style={styles.statusTextBlock}>
              <Text style={styles.statusLabel}>{t('dashboard.feedingStatus')}</Text>
              <Text style={[styles.statusValue, { color: feedingCfg.color }]}>
                {t(`dashboard.feedingState.${feedingStatus}`)}
              </Text>
              {dashboard && dashboard.feeding.total_planned_grams != null && dashboard.feeding.total_planned_grams > 0 && (
                <Text style={styles.statusDetail}>
                  {dashboard.feeding.total_actual_grams}g / {dashboard.feeding.total_planned_grams}g
                </Text>
              )}
              {dashboard && dashboard.feeding.entries_count > 0 && (
                <Text style={styles.statusMeta}>
                  {dashboard.feeding.entries_count} {t('dashboard.mealsToday')}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
        </Card>
      </TouchableOpacity>

      {/* Vaccine Status Card */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('VaccineList', { petId, petName })}
      >
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIconBg, { backgroundColor: vaccineCfg.bgColor }]}>
              <Ionicons name={vaccineCfg.icon} size={28} color={vaccineCfg.color} />
            </View>
            <View style={styles.statusTextBlock}>
              <Text style={styles.statusLabel}>{t('dashboard.vaccineStatus')}</Text>
              <Text style={[styles.statusValue, { color: vaccineCfg.color }]}>
                {t(`dashboard.vaccineState.${vaccineInfo.status}`)}
              </Text>
              {vaccineInfo.overdueVaccines.length > 0 && (
                <Text style={[styles.statusDetail, { color: colors.danger }]}>
                  {vaccineInfo.overdueVaccines.map(v => v.name).join(', ')}
                </Text>
              )}
              {vaccineInfo.dueSoonVaccines.length > 0 && (
                <Text style={styles.statusDetail}>
                  {t('dashboard.dueSoon')}: {vaccineInfo.dueSoonVaccines.map(v => v.name).join(', ')}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
        </Card>
      </TouchableOpacity>

      {/* Overdue vaccine alert */}
      {vaccineInfo.overdueVaccines.length > 0 && (
        <Card style={[styles.alertCard, { borderLeftColor: colors.danger }]}>
          <View style={styles.alertRow}>
            <Ionicons name="alert-circle" size={22} color={colors.danger} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.alertTitle}>{t('dashboard.overdueAlert')}</Text>
              {vaccineInfo.overdueVaccines.map(v => {
                const daysOverdue = Math.floor((Date.now() - new Date(v.next_due_date!).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <Text key={v.id} style={styles.alertDetail}>
                    {v.name} - {daysOverdue} {t('dashboard.daysOverdue')}
                  </Text>
                );
              })}
            </View>
          </View>
        </Card>
      )}

      {/* Not fed today alert */}
      {feedingStatus === 'not_fed' && (
        <Card style={[styles.alertCard, { borderLeftColor: colors.danger }]}>
          <View style={styles.alertRow}>
            <Ionicons name="restaurant" size={22} color={colors.danger} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.alertTitle}>{t('dashboard.notFedAlert')}</Text>
              <Text style={styles.alertDetail}>{t('dashboard.notFedDetail')}</Text>
            </View>
            <TouchableOpacity
              style={styles.alertAction}
              onPress={() => navigation.navigate('FeedingForm', { petId, petName })}
            >
              <Text style={styles.alertActionText}>{t('dashboard.logNow')}</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Progress rings */}
      {dashboard && (
        <Card style={styles.progressCard}>
          <View style={styles.progressRow}>
            <ProgressRing
              current={dashboard.feeding.total_actual_grams}
              goal={dashboard.feeding.total_planned_grams ?? 0}
              unit="g"
              label={t('dashboard.food')}
              color={colors.dog}
            />
            <ProgressRing
              current={dashboard.water.total_ml}
              goal={dashboard.water.daily_goal_ml ?? 0}
              unit="ml"
              label={t('dashboard.water')}
              color={colors.info}
            />
          </View>
        </Card>
      )}

      {/* Feeding chart */}
      {dashboard && feedingLogs.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>{t('dashboard.feedingChart')}</Text>
          <Card style={styles.chartCard}>
            <Text style={styles.chartSubtitle}>
              {t('dashboard.actualIntake')} - {feedingLogs.length} {t('dashboard.entries')}
            </Text>
            <BarChart
              data={{
                labels: feedingLogs.map((l) => {
                  const d = new Date(l.datetime);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
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
                  {t('dashboard.plannedToday')}: {dashboard.feeding.total_planned_grams}g | {t('dashboard.actual')}: {dashboard.feeding.total_actual_grams}g
                </Text>
              )}
          </Card>
        </>
      )}

      {/* Vaccine history */}
      {vaccines.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>{t('dashboard.vaccineHistory')}</Text>
          {vaccines.slice(0, 5).map((v) => {
            const isOverdue = v.next_due_date ? new Date(v.next_due_date) < new Date() : false;
            const isDueSoon = v.next_due_date
              ? new Date(v.next_due_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && !isOverdue
              : false;
            return (
              <Card key={v.id} style={styles.vaccineCard}>
                <View style={styles.eventRow}>
                  <View style={[
                    styles.vaccineDot,
                    { backgroundColor: isOverdue ? colors.danger : isDueSoon ? colors.warning : colors.success },
                  ]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle}>{v.name}</Text>
                    <Text style={styles.eventMeta}>
                      {t('dashboard.administered')}: {new Date(v.date_administered).toLocaleDateString()}
                    </Text>
                    {v.next_due_date && (
                      <Text style={[
                        styles.eventMeta,
                        isOverdue && { color: colors.danger, fontWeight: '600' },
                        isDueSoon && { color: '#D97706', fontWeight: '600' },
                      ]}>
                        {isOverdue ? t('dashboard.overdueExcl') : t('dashboard.nextDue')}: {new Date(v.next_due_date).toLocaleDateString()}
                      </Text>
                    )}
                    {v.clinic && (
                      <Text style={styles.eventMeta}>{v.clinic}</Text>
                    )}
                  </View>
                  <Ionicons
                    name={isOverdue ? 'alert-circle' : isDueSoon ? 'time' : 'checkmark-circle'}
                    size={22}
                    color={isOverdue ? colors.danger : isDueSoon ? colors.warning : colors.success}
                  />
                </View>
              </Card>
            );
          })}
          {vaccines.length > 5 && (
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => navigation.navigate('VaccineList', { petId, petName })}
            >
              <Text style={styles.seeAllText}>{t('dashboard.seeAll')} ({vaccines.length})</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Water progress */}
      {dashboard && dashboard.water.daily_goal_ml != null && dashboard.water.daily_goal_ml > 0 && (
        <>
          <Text style={styles.sectionTitle}>{t('dashboard.waterGoal')}</Text>
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
              <Text style={styles.waterGoalReached}>{t('dashboard.goalReached')}</Text>
            )}
          </Card>
        </>
      )}

      {/* Quick actions grid */}
      <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
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
          <Text style={styles.sectionTitle}>{t('dashboard.upcomingEvents')}</Text>
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
          <Text style={styles.sectionTitle}>{t('dashboard.activeMedications')}</Text>
          {dashboard.active_medications.map((m) => (
            <Card key={m.id} style={styles.eventCard}>
              <View style={styles.eventRow}>
                <Ionicons name="medkit" size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{m.name} - {m.dosage}</Text>
                  <Text style={styles.eventMeta}>{m.frequency_per_day}x/{t('dashboard.day')}</Text>
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
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  // ── Status cards ──
  statusCard: {
    padding: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextBlock: {
    flex: 1,
    marginLeft: spacing.md,
  },
  statusLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: 2,
  },
  statusDetail: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  // ── Alerts ──
  alertCard: {
    padding: spacing.md,
    borderLeftWidth: 4,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  alertDetail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  alertAction: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  alertActionText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  // ── Progress ──
  progressCard: {
    padding: spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  // ── Actions ──
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
  // ── Charts ──
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
  // ── Water ──
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
  // ── Vaccines ──
  vaccineCard: {
    padding: spacing.md,
  },
  vaccineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
    marginTop: 4,
  },
  seeAllBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  // ── Events / Meds ──
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
