import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { petsApi, feedingApi, vaccinesApi, Pet, PetDashboard, Vaccine } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer, Card, PetAvatar, EmptyState, GradientButton } from '../../components';
import { colors, fontSize, spacing, borderRadius, shadows } from '../../theme';

type Props = NativeStackScreenProps<any, 'PetList'>;

interface PetWithStatus extends Pet {
  feedingStatus?: 'not_fed' | 'underfed' | 'well_fed' | 'overfed';
  vaccineStatus?: 'up_to_date' | 'due_soon' | 'overdue' | 'no_records';
  overdueVaccineCount?: number;
}

function computeFeedingStatus(dashboard: PetDashboard): PetWithStatus['feedingStatus'] {
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

function computeVaccineStatus(vaccines: Vaccine[]): { status: PetWithStatus['vaccineStatus']; overdueCount: number } {
  if (vaccines.length === 0) return { status: 'no_records', overdueCount: 0 };
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  let overdueCount = 0;
  let dueSoonCount = 0;
  for (const v of vaccines) {
    if (!v.next_due_date) continue;
    const d = new Date(v.next_due_date);
    if (d < now) overdueCount++;
    else if (d <= thirtyDays) dueSoonCount++;
  }
  if (overdueCount > 0) return { status: 'overdue', overdueCount };
  if (dueSoonCount > 0) return { status: 'due_soon', overdueCount: 0 };
  return { status: 'up_to_date', overdueCount: 0 };
}

const FEEDING_BADGE: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  not_fed: { icon: 'alert-circle', color: colors.danger, bg: colors.dangerLight },
  underfed: { icon: 'warning', color: '#D97706', bg: colors.warningLight },
  well_fed: { icon: 'checkmark-circle', color: '#059669', bg: colors.successLight },
  overfed: { icon: 'warning', color: '#D97706', bg: colors.warningLight },
};

const VACCINE_BADGE: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  up_to_date: { icon: 'shield-checkmark', color: '#059669', bg: colors.successLight },
  due_soon: { icon: 'time', color: '#D97706', bg: colors.warningLight },
  overdue: { icon: 'alert-circle', color: colors.danger, bg: colors.dangerLight },
  no_records: { icon: 'help-circle', color: colors.textMuted, bg: colors.border },
};

export function PetListScreen({ navigation }: Props) {
  const { demoMode } = useAuth();
  const { t } = useTranslation();
  const [pets, setPets] = useState<PetWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPets = useCallback(async () => {
    try {
      const data = await petsApi.list();
      setPets(data);

      // Fetch status for each pet in parallel
      const statusPromises = data.map(async (pet) => {
        try {
          const [dashboard, vaccines] = await Promise.all([
            petsApi.today(pet.id),
            vaccinesApi.list(pet.id),
          ]);
          const feedingStatus = computeFeedingStatus(dashboard);
          const { status: vaccineStatus, overdueCount } = computeVaccineStatus(vaccines);
          return { id: pet.id, feedingStatus, vaccineStatus, overdueVaccineCount: overdueCount };
        } catch {
          return { id: pet.id, feedingStatus: undefined, vaccineStatus: undefined, overdueVaccineCount: 0 };
        }
      });

      const statuses = await Promise.all(statusPromises);
      setPets(prev => prev.map(pet => {
        const s = statuses.find(x => x.id === pet.id);
        return s ? { ...pet, feedingStatus: s.feedingStatus, vaccineStatus: s.vaccineStatus, overdueVaccineCount: s.overdueVaccineCount } : pet;
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [fetchPets])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPets();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer
      scroll={pets.length === 0}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      {demoMode && (
        <View style={styles.demoBanner}>
          <Ionicons name="information-circle" size={16} color={colors.white} />
          <Text style={styles.demoText}>{t('pets.demoMode')}</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>{t('pets.myPets')}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('PetForm')}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

      {pets.length === 0 ? (
        <EmptyState
          icon="paw"
          title={t('pets.noPetsTitle')}
          subtitle={t('pets.noPetsSubtitle')}
        />
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const fb = item.feedingStatus ? FEEDING_BADGE[item.feedingStatus] : null;
            const vb = item.vaccineStatus ? VACCINE_BADGE[item.vaccineStatus] : null;

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PetDashboard', { petId: item.id, petName: item.name })}
              >
                <Card style={styles.petCard}>
                  <View style={styles.petRow}>
                    <PetAvatar name={item.name} species={item.species} size={60} />
                    <View style={styles.petInfo}>
                      <Text style={styles.petName}>{item.name}</Text>
                      <Text style={styles.petSpecies}>
                        {item.species.charAt(0).toUpperCase() + item.species.slice(1)}
                        {item.breed ? ` - ${item.breed}` : ''}
                      </Text>
                      {item.weight_kg && (
                        <Text style={styles.petWeight}>{item.weight_kg} kg</Text>
                      )}
                      {/* Status badges */}
                      <View style={styles.badgeRow}>
                        {fb && (
                          <View style={[styles.badge, { backgroundColor: fb.bg }]}>
                            <Ionicons name={fb.icon} size={12} color={fb.color} />
                            <Text style={[styles.badgeText, { color: fb.color }]}>
                              {t(`petList.feedingBadge.${item.feedingStatus}`)}
                            </Text>
                          </View>
                        )}
                        {vb && (
                          <View style={[styles.badge, { backgroundColor: vb.bg }]}>
                            <Ionicons name={vb.icon} size={12} color={vb.color} />
                            <Text style={[styles.badgeText, { color: vb.color }]}>
                              {t(`petList.vaccineBadge.${item.vaccineStatus}`)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
        />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  petCard: {
    padding: spacing.md,
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  petName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  petSpecies: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  petWeight: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
  },
  demoText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
