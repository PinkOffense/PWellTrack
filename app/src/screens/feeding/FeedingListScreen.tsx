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
import { LinearGradient } from 'expo-linear-gradient';
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

  const todayTotal = logs
    .filter((l) => {
      const d = new Date(l.datetime);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    })
    .reduce((sum, l) => sum + l.actual_amount_grams, 0);

  const header = (
    <View style={styles.headerWrap}>
      <LinearGradient
        colors={['#FF9F43', '#FFBE76']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroRow}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="restaurant" size={26} color="#FF9F43" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Feeding / Alimentacao</Text>
            <Text style={styles.heroSub}>{petName}</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeNum}>{logs.length}</Text>
            <Text style={styles.heroBadgeLabel}>logs</Text>
          </View>
        </View>
        {todayTotal > 0 && (
          <View style={styles.heroStat}>
            <Ionicons name="today" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroStatText}>Today: {todayTotal}g</Text>
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
            icon="restaurant"
            title="No feeding logs yet! / Nenhum registro ainda!"
            subtitle="Tap + to add a feeding log.\nToque + para adicionar um registro."
          />
        </>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => String(item.id)}
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
                      <Ionicons name="restaurant" size={20} color="#FF9F43" />
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
                </View>
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
  list: {
    paddingBottom: spacing.xxl + 40,
  },
  card: {
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    backgroundColor: '#FF9F43',
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
  },
  cardContent: {
    flex: 1,
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
    backgroundColor: '#FF9F43' + '15',
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
    backgroundColor: '#FF9F43',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
});
