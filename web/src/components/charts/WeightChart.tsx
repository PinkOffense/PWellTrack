'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { weightApi } from '@/lib/api';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

interface Props {
  petId: number;
}

export function WeightChart({ petId }: Props) {
  const { t } = useTranslation();
  const [data, setData] = useState<{ date: string; kg: number }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    weightApi.list(petId).then(logs => {
      const sorted = [...logs].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
      setData(sorted.map(l => ({
        date: new Date(l.datetime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        kg: l.weight_kg,
      })));
      setLoaded(true);
    }).catch(() => { setLoaded(true); });
  }, [petId]);

  // UX-05/06: Show message when not enough data instead of disappearing
  if (loaded && data.length < 2) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-txt-secondary mb-2">{t('weight.weightHistory')}</h3>
        <p className="text-sm text-txt-muted py-8 text-center">{t('charts.noData')}</p>
      </div>
    );
  }

  if (!loaded) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-txt-secondary mb-2">{t('weight.weightHistory')}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={40} domain={['auto', 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="kg" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name={t('charts.weight')} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
