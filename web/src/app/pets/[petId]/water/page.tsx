'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { waterApi } from '@/lib/api';
import { RecordPage } from '@/components/RecordPage';
import { Droplets } from 'lucide-react';
import type { WaterLog } from '@/lib/types';

function WaterForm({ petId, t, onSave }: { petId: number; t: any; onSave: () => void }) {
  const [amount, setAmount] = useState('');
  const [goal, setGoal] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!amount.trim()) { setError(t('auth.fillAllFields')); return; }
    setSaving(true);
    try {
      await waterApi.create(petId, {
        amount_ml: Number(amount),
        daily_goal_ml: goal ? Number(goal) : undefined,
      });
      onSave();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm">{error}</div>}
      <div>
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('water.amountMl')} *</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input" placeholder="250" />
      </div>
      <div>
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('water.dailyGoal')}</label>
        <input type="number" value={goal} onChange={e => setGoal(e.target.value)} className="input" placeholder="800" />
      </div>
      <button type="submit" disabled={saving} className="btn-primary w-full">
        {saving ? t('common.loading') : t('common.save')}
      </button>
    </form>
  );
}

export default function WaterPage() {
  const { t } = useTranslation();
  return (
    <RecordPage<WaterLog>
      title={t('water.title')}
      emptyText={t('water.noLogs')}
      addLabel={t('water.addWater')}
      icon={<Droplets className="w-8 h-8" />}
      listFn={waterApi.list}
      deleteFn={waterApi.delete}
      renderItem={(item) => (
        <>
          <p className="font-semibold text-txt text-blue-600">{item.amount_ml} ml</p>
          {item.daily_goal_ml && <p className="text-xs text-txt-muted">Meta: {item.daily_goal_ml} ml</p>}
          <p className="text-xs text-txt-muted">{new Date(item.datetime).toLocaleString()}</p>
        </>
      )}
      renderForm={({ petId, t, onSave }) => <WaterForm petId={petId} t={t} onSave={onSave} />}
    />
  );
}
