'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { medicationsApi } from '@/lib/api';
import { RecordPage } from '@/components/RecordPage';
import { Pill } from 'lucide-react';
import type { Medication } from '@/lib/types';

function MedicationForm({ petId, t, onSave }: { petId: number; t: any; onSave: () => void }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !dosage.trim() || !frequency || !startDate) { setError(t('auth.fillAllFields')); return; }
    setSaving(true);
    try {
      await medicationsApi.create(petId, {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency_per_day: Number(frequency),
        start_date: startDate,
        end_date: endDate || undefined,
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
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('medications.name')} *</label>
        <input value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Amoxicilina..." />
      </div>
      <div>
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('medications.dosage')} *</label>
        <input value={dosage} onChange={e => setDosage(e.target.value)} className="input" placeholder="500mg" />
      </div>
      <div>
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('medications.frequency')} *</label>
        <input type="number" value={frequency} onChange={e => setFrequency(e.target.value)} className="input" placeholder="2" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-txt-secondary block mb-1">{t('medications.startDate')} *</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input" />
        </div>
        <div>
          <label className="text-sm font-medium text-txt-secondary block mb-1">{t('medications.endDate')}</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input" />
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

export default function MedicationsPage() {
  const { t } = useTranslation();
  return (
    <RecordPage<Medication>
      title={t('medications.title')}
      emptyText={t('medications.noRecords')}
      addLabel={t('medications.addMedication')}
      icon={<Pill className="w-8 h-8" />}
      listFn={medicationsApi.list}
      deleteFn={medicationsApi.delete}
      renderItem={(item, t) => {
        const ongoing = !item.end_date || new Date(item.end_date) >= new Date();
        return (
          <>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-txt">{item.name}</span>
              {ongoing && <span className="badge-green">{t('medications.ongoing')}</span>}
            </div>
            <p className="text-sm text-txt-secondary">{item.dosage} · {item.frequency_per_day}x/dia</p>
            <p className="text-xs text-txt-muted">
              {new Date(item.start_date).toLocaleDateString()}
              {item.end_date && ` → ${new Date(item.end_date).toLocaleDateString()}`}
            </p>
          </>
        );
      }}
      renderForm={({ petId, t, onSave }) => <MedicationForm petId={petId} t={t} onSave={onSave} />}
    />
  );
}
