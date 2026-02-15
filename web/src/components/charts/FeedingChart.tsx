'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { feedingApi } from '@/lib/api';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

interface Props {
  petId: number;
}

export function FeedingChart({ petId }: Props) {
  const { t } = useTranslation();
  const [data, setData] = useState<{ day: string; actual: number; planned: number }[]>([]);

  useEffect(() => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);

    feedingApi.list(petId, from.toISOString(), now.toISOString()).then(logs => {
      const days: Record<string, { actual: number; planned: number }> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(from);
        d.setDate(d.getDate() + i);
        const key = d.toLocaleDateString(undefined, { weekday: 'short' });
        days[key] = { actual: 0, planned: 0 };
      }
      for (const log of logs) {
        const d = new Date(log.datetime);
        const key = d.toLocaleDateString(undefined, { weekday: 'short' });
        if (days[key]) {
          days[key].actual += log.actual_amount_grams || 0;
          days[key].planned += log.planned_amount_grams || 0;
        }
      }
      setData(Object.entries(days).map(([day, v]) => ({ day, ...v })));
    }).catch(() => {});
  }, [petId]);

  if (data.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-txt-secondary mb-2">{t('dashboard.feedingTrend')}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={35} />
          <Tooltip />
          <Bar dataKey="actual" fill="#f97316" radius={[4, 4, 0, 0]} name="Actual (g)" />
          <Bar dataKey="planned" fill="#fcd34d" radius={[4, 4, 0, 0]} name="Planned (g)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
