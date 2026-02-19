import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { waterApi, WaterLog } from '../../api';
import { ScreenContainer, Card, EmptyState } from '../../components';
import { colors, fontSize, spacing, borderRadius, shadows } from '../../theme';

type Props = NativeStackScreenProps<any, 'WaterList'>;

export function WaterListScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { petId, petName } = route.params as { petId: number; petName: string };
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const data = await waterApi.list(petId);
      setLogs(data);
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [petId, t]);

  const handleDelete = (id: number) => {
    Alert.alert(
      t('common.delete'),
      t('water.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await waterApi.delete(id);
              fetchData();
            } catch (e: any) {
              Alert.alert(t('common.error'), e.message);
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

  return (
    <ScreenContainer scroll={false}>
      <Text style={styles.title}>{t('water.title')}</Text>
      <Text style={styles.subtitle}>{petName}</Text>

      {logs.length === 0 ? (
        <EmptyState
          icon="water"
          title={t('water.noLogs')}
          subtitle={t('water.noLogsHint')}
        />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconCircle}>
                  <Ionicons name="water" size={22} color={colors.info} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.amount}>{item.amount_ml} ml</Text>
                  <Text style={styles.date}>
                    {new Date(item.datetime).toLocaleString()}
                  </Text>
                </View>
                {item.daily_goal_ml && (
                  <Text style={styles.goal}>{t('water.dailyGoal')} {item.daily_goal_ml} ml</Text>
                )}
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </Card>
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
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary, paddingHorizontal: spacing.lg },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  list: { padding: spacing.lg, paddingBottom: 100 },
  card: { padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.infoLight,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  amount: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
  date: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  goal: { fontSize: fontSize.xs, color: colors.textMuted },
  deleteBtn: { padding: spacing.sm, marginLeft: spacing.sm },
  fab: {
    position: 'absolute', bottom: spacing.xl, right: spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.info,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.button,
  },
});
