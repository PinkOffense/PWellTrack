'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { vaccinesApi } from '@/lib/api';
import { RecordPage } from '@/components/RecordPage';
import { Syringe } from 'lucide-react';
import type { Vaccine } from '@/lib/types';

function VaccineForm({ petId, t, onSave, editingItem }: { petId: number; t: any; onSave: () => void; editingItem?: Vaccine }) {
  const [name, setName] = useState(editingItem?.name ?? '');
  const [dateAdmin, setDateAdmin] = useState(editingItem?.date_administered ?? new Date().toISOString().slice(0, 10));
  const [nextDue, setNextDue] = useState(editingItem?.next_due_date ?? '');
  const [clinic, setClinic] = useState(editingItem?.clinic ?? '');
  const [notes, setNotes] = useState(editingItem?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !dateAdmin) { setError(t('common.fillAllFields')); return; }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        date_administered: dateAdmin,
        next_due_date: nextDue || undefined,
        clinic: clinic.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      if (editingItem) await vaccinesApi.update(editingItem.id, payload);
      else await vaccinesApi.create(petId, payload);
      onSave();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm">{error}</div>}
      <div>
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('vaccines.name')} *</label>
        <input value={name} onChange={e => setName(e.target.value)} className="input" placeholder={t('vaccines.namePlaceholder')} />
      </div>
      <div>
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('vaccines.dateAdministered')} *</label>
        <input type="date" max={new Date().toISOString().slice(0, 10)} value={dateAdmin} onChange={e => setDateAdmin(e.target.value)} className="input" />
      </div>
      <div>
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('vaccines.nextDue')}</label>
        <input type="date" min={dateAdmin || undefined} value={nextDue} onChange={e => setNextDue(e.target.value)} className="input" />
      </div>
      <div>
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('vaccines.clinic')}</label>
        <input value={clinic} onChange={e => setClinic(e.target.value)} className="input" />
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

export default function VaccinesPage() {
  const { t } = useTranslation();
  return (
    <RecordPage<Vaccine>
      title={t('vaccines.title')}
      emptyText={t('vaccines.noRecords')}
      addLabel={t('vaccines.addVaccine')}
      icon={<Syringe className="w-8 h-8" />}
      listFn={vaccinesApi.list}
      deleteFn={vaccinesApi.delete}
      updateFn={vaccinesApi.update}
      supportsDateFilter
      renderItem={(item, t) => {
        // BUG-10: Compute `now` inside render to avoid stale closure
        const now = new Date();
        const overdue = item.next_due_date && new Date(item.next_due_date) < now;
        return (
          <>
            <p className="font-semibold text-txt">{item.name}</p>
            <p className="text-xs text-txt-muted">
              {t('vaccines.dateAdministered')}: {new Date(item.date_administered).toLocaleDateString()}
            </p>
            {item.next_due_date && (
              <p className={`text-xs font-medium mt-0.5 ${overdue ? 'text-red-600' : 'text-emerald-600'}`}>
                {t('vaccines.nextDue')}: {new Date(item.next_due_date).toLocaleDateString()}
                {overdue && ` (${t('vaccines.overdue')})`}
              </p>
            )}
            {item.clinic && <p className="text-xs text-txt-muted mt-0.5">{item.clinic}</p>}
          </>
        );
      }}
      renderForm={({ petId, t, onSave, editingItem }) => (
        <VaccineForm key={editingItem?.id ?? 'new'} petId={petId} t={t} onSave={onSave} editingItem={editingItem} />
      )}
    />
  );
}
