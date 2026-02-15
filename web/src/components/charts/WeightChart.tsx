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

  useEffect(() => {
    weightApi.list(petId).then(logs => {
      const sorted = [...logs].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
      setData(sorted.map(l => ({
        date: new Date(l.datetime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        kg: l.weight_kg,
      })));
    }).catch(() => {});
  }, [petId]);

  if (data.length < 2) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-txt-secondary mb-2">{t('weight.weightHistory')}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={40} domain={['auto', 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="kg" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="kg" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
