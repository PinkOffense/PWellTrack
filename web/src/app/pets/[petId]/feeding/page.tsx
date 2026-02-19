'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { feedingApi } from '@/lib/api';
import { RecordPage } from '@/components/RecordPage';
import { Utensils } from 'lucide-react';
import type { FeedingLog } from '@/lib/types';

function FeedingForm({ petId, t, onSave, editingItem }: { petId: number; t: any; onSave: () => void; editingItem?: FeedingLog }) {
  const [foodType, setFoodType] = useState(editingItem?.food_type ?? '');
  const [actual, setActual] = useState(editingItem ? String(editingItem.actual_amount_grams) : '');
  const [planned, setPlanned] = useState(editingItem?.planned_amount_grams ? String(editingItem.planned_amount_grams) : '');
  const [notes, setNotes] = useState(editingItem?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!foodType.trim() || !actual.trim()) { setError(t('common.fillAllFields')); return; }
    // VAL-07: NaN check before submitting numeric values
    if (isNaN(Number(actual)) || (planned && isNaN(Number(planned)))) { setError(t('common.fillAllFields')); return; }
    setSaving(true);
    try {
      const payload = {
        food_type: foodType.trim(),
        actual_amount_grams: Number(actual),
        planned_amount_grams: planned ? Number(planned) : undefined,
        notes: notes.trim() || undefined,
      };
      if (editingItem) await feedingApi.update(editingItem.id, payload);
      else await feedingApi.create(petId, payload);
      onSave();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm">{error}</div>}
      <div>
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('feeding.foodType')} *</label>
        <input value={foodType} onChange={e => setFoodType(e.target.value)} className="input" placeholder="Racao, frango..." />
      </div>
      <div>
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('feeding.actualGrams')} *</label>
        <input type="number" min="0" step="1" value={actual} onChange={e => setActual(e.target.value)} className="input" placeholder="200" />
      </div>
      <div>
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('feeding.plannedGrams')}</label>
        <input type="number" min="0" step="1" value={planned} onChange={e => setPlanned(e.target.value)} className="input" placeholder="250" />
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

export default function FeedingPage() {
  const { t } = useTranslation();
  return (
    <RecordPage<FeedingLog>
      title={t('feeding.title')}
      emptyText={t('feeding.noLogs')}
      addLabel={t('feeding.addFeeding')}
      icon={<Utensils className="w-8 h-8" />}
      listFn={feedingApi.list}
      deleteFn={feedingApi.delete}
      updateFn={feedingApi.update}
      supportsDateFilter
      renderItem={(item, t) => (
        <>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-txt">{item.food_type}</span>
            <span className="text-sm font-bold text-orange-600">{item.actual_amount_grams}g</span>
            {item.planned_amount_grams && (
              <span className="text-xs text-txt-muted">/ {item.planned_amount_grams}g</span>
            )}
          </div>
          <p className="text-xs text-txt-muted">{new Date(item.datetime).toLocaleString()}</p>
          {item.notes && <p className="text-sm text-txt-secondary mt-1">{item.notes}</p>}
        </>
      )}
      renderForm={({ petId, t, onSave, editingItem }) => (
        <FeedingForm key={editingItem?.id ?? 'new'} petId={petId} t={t} onSave={onSave} editingItem={editingItem} />
      )}
    />
  );
}
