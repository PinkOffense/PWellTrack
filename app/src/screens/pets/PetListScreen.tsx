import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { petsApi, Pet } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer, Card, PetAvatar, EmptyState, GradientButton } from '../../components';
import { colors, fontSize, spacing, borderRadius, shadows } from '../../theme';

type Props = NativeStackScreenProps<any, 'PetList'>;

export function PetListScreen({ navigation }: Props) {
  const { demoMode } = useAuth();
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
      scroll={false}
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

      <View style={styles.header}>
        <Text style={styles.title}>My Pets / Meus Pets</Text>
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
          renderItem={({ item }) => (
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
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
                </View>
              </Card>
            </TouchableOpacity>
          )}
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
