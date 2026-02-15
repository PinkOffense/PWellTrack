'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { medicationsApi } from '@/lib/api';
import { RecordPage } from '@/components/RecordPage';
import { Pill, Plus, X } from 'lucide-react';
import type { Medication } from '@/lib/types';

function MedicationForm({ petId, t, onSave, editingItem }: { petId: number; t: any; onSave: () => void; editingItem?: Medication }) {
  const [name, setName] = useState(editingItem?.name ?? '');
  const [dosage, setDosage] = useState(editingItem?.dosage ?? '');
  const [frequency, setFrequency] = useState(editingItem ? String(editingItem.frequency_per_day) : '');
  const [startDate, setStartDate] = useState(editingItem?.start_date ?? new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(editingItem?.end_date ?? '');
  const [timesOfDay, setTimesOfDay] = useState<string[]>(editingItem?.times_of_day ?? []);
  const [newTime, setNewTime] = useState('');
  const [notes, setNotes] = useState(editingItem?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addTimeSlot = () => {
    if (newTime && !timesOfDay.includes(newTime)) {
      setTimesOfDay(prev => [...prev, newTime].sort());
      setNewTime('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !dosage.trim() || !frequency || !startDate) { setError(t('auth.fillAllFields')); return; }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency_per_day: Number(frequency),
        start_date: startDate,
        end_date: endDate || undefined,
        times_of_day: timesOfDay.length > 0 ? timesOfDay : undefined,
        notes: notes.trim() || undefined,
      };
      if (editingItem) await medicationsApi.update(editingItem.id, payload);
      else await medicationsApi.create(petId, payload);
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
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('medications.timesOfDay')}</label>
        <div className="flex gap-2 mb-2">
          <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="input flex-1" />
          <button type="button" onClick={addTimeSlot} className="btn-secondary px-3">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {timesOfDay.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {timesOfDay.map(time => (
              <span key={time} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                {time}
                <button type="button" onClick={() => setTimesOfDay(prev => prev.filter(t => t !== time))} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
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
      updateFn={medicationsApi.update}
      supportsDateFilter
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
            {item.times_of_day && item.times_of_day.length > 0 && (
              <div className="flex gap-1 mt-1">
                {item.times_of_day.map(time => (
                  <span key={time} className="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 font-medium">{time}</span>
                ))}
              </div>
            )}
          </>
        );
      }}
      renderForm={({ petId, t, onSave, editingItem }) => (
        <MedicationForm key={editingItem?.id ?? 'new'} petId={petId} t={t} onSave={onSave} editingItem={editingItem} />
      )}
    />
  );
}
