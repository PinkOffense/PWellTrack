'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { symptomsApi } from '@/lib/api';
import { RecordPage } from '@/components/RecordPage';
import { Activity } from 'lucide-react';
import type { Symptom } from '@/lib/types';

const SEVERITIES = ['mild', 'moderate', 'severe'] as const;
const SEV_COLORS: Record<string, string> = {
  mild: 'badge-green',
  moderate: 'badge-amber',
  severe: 'badge-red',
};

function SymptomForm({ petId, t, onSave }: { petId: number; t: any; onSave: () => void }) {
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState<string>('mild');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!type.trim()) { setError(t('auth.fillAllFields')); return; }
    setSaving(true);
    try {
      await symptomsApi.create(petId, {
        type: type.trim(),
        severity,
        notes: notes.trim() || undefined,
      });
      onSave();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm">{error}</div>}
      <div>
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('symptoms.type')} *</label>
        <input value={type} onChange={e => setType(e.target.value)} className="input" placeholder="Vomitos, diarreia..." />
      </div>
      <div>
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('symptoms.severity')} *</label>
        <div className="flex gap-2">
          {SEVERITIES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2
                ${severity === s
                  ? s === 'mild' ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : s === 'moderate' ? 'border-amber-400 bg-amber-50 text-amber-700'
                  : 'border-red-400 bg-red-50 text-red-700'
                  : 'border-gray-200 text-txt-secondary hover:border-gray-300'}`}
            >
              {t(`symptoms.${s}`)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('common.notes')}</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input" rows={2} />
      </div>
      <button type="submit" disabled={saving} className="btn-primary w-full">
        {saving ? t('common.loading') : t('common.save')}
      </button>
    </form>
  );
}

export default function SymptomsPage() {
  const { t } = useTranslation();
  return (
    <RecordPage<Symptom>
      title={t('symptoms.title')}
      emptyText={t('symptoms.noRecords')}
      addLabel={t('symptoms.addSymptom')}
      icon={<Activity className="w-8 h-8" />}
      listFn={symptomsApi.list}
      deleteFn={symptomsApi.delete}
      renderItem={(item, t) => (
        <>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-txt">{item.type}</span>
            <span className={SEV_COLORS[item.severity] || 'badge-gray'}>
              {t(`symptoms.${item.severity}` as any)}
            </span>
          </div>
          <p className="text-xs text-txt-muted">{new Date(item.datetime).toLocaleString()}</p>
          {item.notes && <p className="text-sm text-txt-secondary mt-1">{item.notes}</p>}
        </>
      )}
      renderForm={({ petId, t, onSave }) => <SymptomForm petId={petId} t={t} onSave={onSave} />}
    />
  );
}
