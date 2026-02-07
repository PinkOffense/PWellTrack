import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { feedingApi, FeedingLog } from '../../api';
import { ScreenContainer, Card, EmptyState } from '../../components';
import { colors, fontSize, spacing, borderRadius, shadows } from '../../theme';

type Props = NativeStackScreenProps<any, 'FeedingList'>;

export function FeedingListScreen({ navigation, route }: Props) {
  const { petId, petName } = route.params as { petId: number; petName: string };
  const [logs, setLogs] = useState<FeedingLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await feedingApi.list(petId);
      setLogs(data);
    } catch (e: any) {
      Alert.alert('Error / Erro', e.message);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete / Apagar',
      'Delete this feeding log? / Apagar este registo?',
      [
        { text: 'Cancel / Cancelar', style: 'cancel' },
        {
          text: 'Delete / Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await feedingApi.delete(id);
              fetchLogs();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchLogs();
    }, [fetchLogs]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <Text style={styles.title}>Feeding / Alimentacao</Text>
      <Text style={styles.subtitle}>{petName}</Text>

      {logs.length === 0 ? (
        <EmptyState
          icon="restaurant"
          title="No feeding logs yet! / Nenhum registro ainda!"
          subtitle="Tap + to add a feeding log.\nToque + para adicionar um registro."
        />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.85} onLongPress={() => handleDelete(item.id)}>
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="restaurant" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.foodType}>{item.food_type}</Text>
                    <Text style={styles.meta}>
                      {item.actual_amount_grams}g
                      {item.planned_amount_grams
                        ? ` / ${item.planned_amount_grams}g planned`
                        : ''}
                    </Text>
                    <Text style={styles.date}>
                      {new Date(item.datetime).toLocaleDateString()} -{' '}
                      {new Date(item.datetime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
                {item.notes ? (
                  <Text style={styles.notes}>{item.notes}</Text>
                ) : null}
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('FeedingForm', { petId, petName })}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  foodType: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  notes: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
});
