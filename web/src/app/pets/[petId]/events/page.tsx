'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '@/lib/api';
import { RecordPage } from '@/components/RecordPage';
import { Calendar } from 'lucide-react';
import type { PetEvent } from '@/lib/types';

const EVENT_TYPES = ['vet_visit', 'vaccine', 'grooming', 'other'] as const;

function EventForm({ petId, t, onSave }: { petId: number; t: any; onSave: () => void }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('vet_visit');
  const [dateTime, setDateTime] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !dateTime) { setError(t('auth.fillAllFields')); return; }
    setSaving(true);
    try {
      await eventsApi.create(petId, {
        title: title.trim(),
        type,
        datetime_start: new Date(dateTime).toISOString(),
        duration_minutes: duration ? Number(duration) : undefined,
        location: location.trim() || undefined,
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
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('events.eventTitle')} *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="input" />
      </div>
      <div>
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('events.type')} *</label>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map(et => (
            <button
              key={et}
              type="button"
              onClick={() => setType(et)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all
                ${type === et ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-txt-secondary'}`}
            >
              {t(`events.${et}` as any)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('events.dateTime')} *</label>
        <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} className="input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-txt-secondary block mb-1">{t('events.duration')}</label>
          <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="input" placeholder="30" />
        </div>
        <div>
          <label className="text-sm font-medium text-txt-secondary block mb-1">{t('events.location')}</label>
          <input value={location} onChange={e => setLocation(e.target.value)} className="input" />
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

export default function EventsPage() {
  const { t } = useTranslation();
  return (
    <RecordPage<PetEvent>
      title={t('events.title')}
      emptyText={t('events.noRecords')}
      addLabel={t('events.addEvent')}
      icon={<Calendar className="w-8 h-8" />}
      listFn={eventsApi.list}
      deleteFn={eventsApi.delete}
      renderItem={(item, t) => (
        <>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-txt">{item.title}</span>
            <span className="badge bg-pink-50 text-pink-600">{t(`events.${item.type}` as any) || item.type}</span>
          </div>
          <p className="text-sm text-txt-secondary">{new Date(item.datetime_start).toLocaleString()}</p>
          {item.location && <p className="text-xs text-txt-muted">{item.location}</p>}
          {item.duration_minutes && <p className="text-xs text-txt-muted">{item.duration_minutes} min</p>}
        </>
      )}
      renderForm={({ petId, t, onSave }) => <EventForm petId={petId} t={t} onSave={onSave} />}
    />
  );
}
