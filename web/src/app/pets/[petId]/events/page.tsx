'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '@/lib/api';
import { RecordPage } from '@/components/RecordPage';
import { Calendar } from 'lucide-react';
import type { PetEvent } from '@/lib/types';

const EVENT_TYPES = ['vet_visit', 'vaccine', 'grooming', 'other'] as const;

function EventForm({ petId, t, onSave, editingItem }: { petId: number; t: any; onSave: () => void; editingItem?: PetEvent }) {
  const [title, setTitle] = useState(editingItem?.title ?? '');
  const [type, setType] = useState(editingItem?.type ?? 'vet_visit');
  const [dateTime, setDateTime] = useState(editingItem?.datetime_start ? editingItem.datetime_start.slice(0, 16) : '');
  const [duration, setDuration] = useState(editingItem?.duration_minutes ? String(editingItem.duration_minutes) : '');
  const [location, setLocation] = useState(editingItem?.location ?? '');
  const [reminder, setReminder] = useState(editingItem?.reminder_minutes_before ? String(editingItem.reminder_minutes_before) : '');
  const [notes, setNotes] = useState(editingItem?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !dateTime) { setError(t('auth.fillAllFields')); return; }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        type,
        datetime_start: new Date(dateTime).toISOString(),
        duration_minutes: duration ? Number(duration) : undefined,
        location: location.trim() || undefined,
        reminder_minutes_before: reminder ? Number(reminder) : undefined,
        notes: notes.trim() || undefined,
      };
      if (editingItem) await eventsApi.update(editingItem.id, payload);
      else await eventsApi.create(petId, payload);
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
            <button key={et} type="button" onClick={() => setType(et)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all
                ${type === et ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-txt-secondary'}`}>
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
        <label className="text-sm font-medium text-txt-secondary block mb-1">{t('events.reminder')}</label>
        <select value={reminder} onChange={e => setReminder(e.target.value)} className="input">
          <option value="">{t('events.noReminder')}</option>
          <option value="15">{t('events.reminder15min')}</option>
          <option value="30">{t('events.reminder30min')}</option>
          <option value="60">{t('events.reminder1h')}</option>
          <option value="120">{t('events.reminder2h')}</option>
          <option value="1440">{t('events.reminder1day')}</option>
        </select>
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
      updateFn={eventsApi.update}
      supportsDateFilter
      renderItem={(item, t) => (
        <>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-txt">{item.title}</span>
            <span className="badge bg-pink-50 text-pink-600">{t(`events.${item.type}` as any) || item.type}</span>
          </div>
          <p className="text-sm text-txt-secondary">{new Date(item.datetime_start).toLocaleString()}</p>
          {item.location && <p className="text-xs text-txt-muted">{item.location}</p>}
          {item.duration_minutes && <p className="text-xs text-txt-muted">{item.duration_minutes} min</p>}
          {item.reminder_minutes_before && (
            <p className="text-xs text-purple-600 mt-0.5">
              {item.reminder_minutes_before >= 1440 ? t('events.reminder1day')
                : item.reminder_minutes_before >= 60 ? `${item.reminder_minutes_before / 60}h antes`
                : `${item.reminder_minutes_before} min antes`}
            </p>
          )}
        </>
      )}
      renderForm={({ petId, t, onSave, editingItem }) => (
        <EventForm key={editingItem?.id ?? 'new'} petId={petId} t={t} onSave={onSave} editingItem={editingItem} />
      )}
    />
  );
}
