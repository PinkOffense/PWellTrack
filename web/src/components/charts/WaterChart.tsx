'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { waterApi } from '@/lib/api';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
} from 'recharts';

interface Props {
  petId: number;
}

export function WaterChart({ petId }: Props) {
  const { t } = useTranslation();
  const [data, setData] = useState<{ day: string; ml: number }[]>([]);
  const [goal, setGoal] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);

    waterApi.list(petId, from.toISOString(), now.toISOString()).then(logs => {
      const days: Record<string, number> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(from);
        d.setDate(d.getDate() + i);
        const key = d.toLocaleDateString(undefined, { weekday: 'short' });
        days[key] = 0;
      }
      let latestGoal: number | null = null;
      for (const log of logs) {
        const d = new Date(log.datetime);
        const key = d.toLocaleDateString(undefined, { weekday: 'short' });
        if (days[key] !== undefined) days[key] += log.amount_ml;
        if (log.daily_goal_ml && !latestGoal) latestGoal = log.daily_goal_ml;
      }
      setGoal(latestGoal);
      setData(Object.entries(days).map(([day, ml]) => ({ day, ml })));
    }).catch(() => {});
  }, [petId]);

  if (data.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-txt-secondary mb-2">{t('dashboard.waterTrend')}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={35} />
          <Tooltip />
          <Bar dataKey="ml" fill="#3b82f6" radius={[4, 4, 0, 0]} name="ml" />
          {goal && <ReferenceLine y={goal} stroke="#10b981" strokeDasharray="5 5" label={{ value: `${goal}ml`, fontSize: 10 }} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
