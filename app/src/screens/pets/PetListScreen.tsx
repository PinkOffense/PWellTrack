import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { petsApi, Pet } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer, Card, PetAvatar, EmptyState, GradientButton } from '../../components';
import { colors, fontSize, spacing, borderRadius, shadows } from '../../theme';

type Props = NativeStackScreenProps<any, 'PetList'>;

const speciesColor: Record<string, string> = {
  dog: colors.dog,
  cat: colors.cat,
  exotic: colors.exotic,
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning / Bom dia';
  if (h < 18) return 'Good afternoon / Boa tarde';
  return 'Good evening / Boa noite';
}

export function PetListScreen({ navigation }: Props) {
  const { demoMode, user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPets = useCallback(async () => {
    try {
      const data = await petsApi.list();
      setPets(data);
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
          <Text style={styles.demoText}>
            Demo mode — no backend connected / Modo demo — sem backend
          </Text>
        </View>
      )}

      {/* Greeting header */}
      <LinearGradient
        colors={[...colors.primaryGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.greetingCard}
      >
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.greetingName}>
            {user?.name ? user.name.split(' ')[0] : 'Pet Lover'}
          </Text>
        </View>
        <View style={styles.greetingIconWrap}>
          <Ionicons name="paw" size={32} color="rgba(255,255,255,0.3)" />
        </View>
      </LinearGradient>

      <View style={styles.header}>
        <Text style={styles.title}>
          My Pets / Meus Pets
          {pets.length > 0 && (
            <Text style={styles.petCount}> ({pets.length})</Text>
          )}
        </Text>
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
          title="No pets yet! / Nenhum pet ainda!"
          subtitle="Add your first pet to start tracking their health.\nAdicione seu primeiro pet para comecar."
        />
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const accent = speciesColor[item.species] ?? colors.primary;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PetDashboard', { petId: item.id, petName: item.name })}
              >
                <Card style={styles.petCard}>
                  <View style={[styles.petAccent, { backgroundColor: accent }]} />
                  <View style={styles.petRow}>
                    <PetAvatar name={item.name} species={item.species} size={60} />
                    <View style={styles.petInfo}>
                      <Text style={styles.petName}>{item.name}</Text>
                      <Text style={styles.petSpecies}>
                        {item.species.charAt(0).toUpperCase() + item.species.slice(1)}
                        {item.breed ? ` \u2022 ${item.breed}` : ''}
                      </Text>
                      {item.weight_kg != null && (
                        <View style={styles.weightBadge}>
                          <Ionicons name="fitness-outline" size={12} color={colors.textMuted} />
                          <Text style={styles.petWeight}>{item.weight_kg} kg</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.chevronCircle}>
                      <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                    </View>
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
  greetingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  greeting: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  greetingName: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.white,
    marginTop: spacing.xs,
  },
  greetingIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  petCount: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textMuted,
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
    padding: 0,
    overflow: 'hidden',
  },
  petAccent: {
    height: 4,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
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
  weightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: colors.primary + '08',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  petWeight: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
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
