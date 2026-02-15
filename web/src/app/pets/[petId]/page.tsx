'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { petsApi, vaccinesApi, weightApi } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { PetAvatar } from '@/components/PetAvatar';
import { Modal } from '@/components/Modal';
import {
  ArrowLeft, Utensils, Droplets, Syringe, Pill, Calendar, Activity, Trash2, Pencil, Plus, Camera,
} from 'lucide-react';
import { FeedingChart } from '@/components/charts/FeedingChart';
import { WaterChart } from '@/components/charts/WaterChart';
import { WeightChart } from '@/components/charts/WeightChart';
import type { Pet, PetCreate, PetDashboard, Vaccine } from '@/lib/types';

const QUICK_ACTIONS = [
  { key: 'feeding', icon: Utensils, color: 'from-orange-400 to-amber-300', href: 'feeding' },
  { key: 'water', icon: Droplets, color: 'from-blue-400 to-cyan-300', href: 'water' },
  { key: 'vaccines', icon: Syringe, color: 'from-emerald-400 to-green-300', href: 'vaccines' },
  { key: 'medications', icon: Pill, color: 'from-purple-400 to-violet-300', href: 'medications' },
  { key: 'events', icon: Calendar, color: 'from-pink-400 to-rose-300', href: 'events' },
  { key: 'symptoms', icon: Activity, color: 'from-red-400 to-orange-300', href: 'symptoms' },
];

function petAge(dob?: string): string | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  if (years > 0) return `${years}a ${months}m`;
  if (months > 0) return `${months}m`;
  const days = Math.floor((now.getTime() - birth.getTime()) / 86400000);
  return `${days}d`;
}

export default function PetDashboardPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = Number(params.petId);

  const [pet, setPet] = useState<Pet | null>(null);
  const [dash, setDash] = useState<PetDashboard | null>(null);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Edit pet state
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({ name: '', species: 'dog', breed: '', weight_kg: '', date_of_birth: '', sex: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Weight log state
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [weightKg, setWeightKg] = useState('');
  const [weightNotes, setWeightNotes] = useState('');
  const [weightSaving, setWeightSaving] = useState(false);
  const [weightError, setWeightError] = useState('');
  const [weightKey, setWeightKey] = useState(0);

  // Photo state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);

  useEffect(() => {
    if (!photoMenuOpen) return;
    const close = () => setPhotoMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [photoMenuOpen]);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      const [p, d, v] = await Promise.all([
        petsApi.get(petId),
        petsApi.today(petId),
        vaccinesApi.list(petId),
      ]);
      setPet(p);
      setDash(d);
      setVaccines(v);
    } catch {
      router.replace('/pets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !petId) return;
    loadData();
  }, [user, petId]);

  const openEdit = () => {
    if (!pet) return;
    setEditData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      weight_kg: pet.weight_kg ? String(pet.weight_kg) : '',
      date_of_birth: pet.date_of_birth || '',
      sex: pet.sex || '',
    });
    setEditError('');
    setShowEdit(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    if (!editData.name.trim()) { setEditError(t('auth.fillAllFields')); return; }
    setEditSaving(true);
    try {
      const payload: Partial<PetCreate> = {
        name: editData.name.trim(),
        species: editData.species,
        breed: editData.breed.trim() || undefined,
        weight_kg: editData.weight_kg ? Number(editData.weight_kg) : undefined,
        date_of_birth: editData.date_of_birth || undefined,
        sex: editData.sex || undefined,
      };
      const updated = await petsApi.update(petId, payload);
      setPet(updated);
      setShowEdit(false);
    } catch (err: any) {
      setEditError(err.message || t('common.error'));
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('common.confirmDelete'))) return;
    setDeleting(true);
    try {
      await petsApi.delete(petId);
      router.replace('/pets');
    } catch {
      setDeleting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const updated = await petsApi.uploadPhoto(petId, file);
      setPet(updated);
    } catch {
      setEditError(t('common.error'));
    }
    e.target.value = '';
  };

  const handlePhotoRemove = async () => {
    setPhotoMenuOpen(false);
    try {
      const updated = await petsApi.deletePhoto(petId);
      setPet(updated);
    } catch {
      setEditError(t('common.error'));
    }
  };

  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWeightError('');
    if (!weightKg) { setWeightError(t('auth.fillAllFields')); return; }
    setWeightSaving(true);
    try {
      await weightApi.create(petId, {
        weight_kg: Number(weightKg),
        notes: weightNotes.trim() || undefined,
      });
      setShowWeightForm(false);
      setWeightKg('');
      setWeightNotes('');
      setWeightKey(k => k + 1);
    } catch (err: any) {
      setWeightError(err.message);
    } finally {
      setWeightSaving(false);
    }
  };

  const feedingStatus = () => {
    if (!dash) return null;
    const { total_actual_grams: actual, total_planned_grams: planned, entries_count } = dash.feeding;
    if (entries_count === 0) return { label: t('dashboard.notFed'), cls: 'text-red-600 bg-red-50' };
    if (planned > 0 && actual < planned * 0.7) return { label: t('dashboard.underfed'), cls: 'text-amber-600 bg-amber-50' };
    if (planned > 0 && actual > planned * 1.3) return { label: t('dashboard.overfed'), cls: 'text-amber-600 bg-amber-50' };
    return { label: t('dashboard.wellFed'), cls: 'text-emerald-600 bg-emerald-50' };
  };

  const overdueVaccines = vaccines.filter(v => v.next_due_date && new Date(v.next_due_date) < new Date());

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!pet) return null;
  const fs = feedingStatus();
  const age = petAge(pet.date_of_birth);

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <button onClick={() => router.push('/pets')} className="flex items-center gap-1 text-sm text-txt-secondary hover:text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> {t('pets.myPets')}
        </button>

        <div className="card flex items-center gap-4 mb-6">
          <div
            className="relative shrink-0 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setPhotoMenuOpen(v => !v); }}
          >
            <PetAvatar name={pet.name} species={pet.species} photoUrl={pet.photo_url} size="lg" />
            <div className="absolute inset-0 rounded-2xl bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-200">
              <Camera className="w-5 h-5 text-white drop-shadow" />
            </div>
            {photoMenuOpen && (
              <div
                className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[150px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { setPhotoMenuOpen(false); fileInputRef.current?.click(); }}
                  className="w-full px-3.5 py-2 text-left text-sm text-txt hover:bg-primary/5 flex items-center gap-2.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-primary" />
                  {t('pets.changePhoto')}
                </button>
                {pet.photo_url && (
                  <button
                    onClick={handlePhotoRemove}
                    className="w-full px-3.5 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('pets.removePhoto')}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-txt">{pet.name}</h1>
            <p className="text-txt-secondary capitalize">
              {t(`pets.${pet.species}` as any)}
              {pet.breed && ` · ${pet.breed}`}
              {pet.sex && ` · ${t(`pets.${pet.sex}` as any)}`}
              {pet.weight_kg && ` · ${pet.weight_kg} kg`}
              {age && ` · ${age}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={openEdit} className="btn-secondary p-2" title={t('common.edit')}>
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger" title={t('common.delete')}>
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Today's overview */}
        <h2 className="text-lg font-bold text-txt mb-3">{t('dashboard.todayOverview')}</h2>
        {dash && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Feeding card */}
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-txt-secondary">{t('dashboard.feedingStatus')}</span>
              </div>
              <p className="text-2xl font-bold text-txt">{dash.feeding.total_actual_grams}g</p>
              {dash.feeding.total_planned_grams > 0 && (
                <p className="text-xs text-txt-muted">/ {dash.feeding.total_planned_grams}g</p>
              )}
              {fs && <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${fs.cls}`}>{fs.label}</span>}
            </div>
            {/* Water card */}
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-txt-secondary">{t('dashboard.waterStatus')}</span>
              </div>
              <p className="text-2xl font-bold text-txt">{dash.water.total_ml} ml</p>
              {dash.water.daily_goal_ml > 0 && (
                <p className="text-xs text-txt-muted">/ {dash.water.daily_goal_ml} ml</p>
              )}
              <p className="text-xs text-txt-muted mt-1">{dash.water.entries_count} {t('dashboard.entries')}</p>
            </div>
            {/* Vaccine card */}
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <Syringe className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-txt-secondary">{t('dashboard.vaccineStatus')}</span>
              </div>
              {overdueVaccines.length > 0 ? (
                <p className="text-sm font-semibold text-red-600">{overdueVaccines.length} {t('vaccines.overdue').toLowerCase()}</p>
              ) : (
                <p className="text-sm font-semibold text-emerald-600">{t('vaccines.upToDate')}</p>
              )}
              <p className="text-xs text-txt-muted mt-1">{vaccines.length} {t('dashboard.entries')}</p>
            </div>
            {/* Meds card */}
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold text-txt-secondary">{t('dashboard.medsStatus')}</span>
              </div>
              <p className="text-2xl font-bold text-txt">{dash.active_medications.length}</p>
              <p className="text-xs text-txt-muted">{t('dashboard.activeMeds').toLowerCase()}</p>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <h2 className="text-lg font-bold text-txt mb-3">{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {QUICK_ACTIONS.map(({ key, icon: Icon, color, href }) => (
            <Link
              key={key}
              href={`/pets/${petId}/${href}`}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white hover:shadow-md transition-shadow"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-txt-secondary">{t(`${key}.title` as any)}</span>
            </Link>
          ))}
        </div>

        {/* Trends */}
        <h2 className="text-lg font-bold text-txt mb-3">{t('dashboard.trends')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="card"><FeedingChart petId={petId} /></div>
          <div className="card"><WaterChart petId={petId} /></div>
        </div>

        {/* Weight history */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-txt">{t('weight.weightHistory')}</h2>
          <button onClick={() => setShowWeightForm(true)} className="btn-primary flex items-center gap-1.5 text-sm">
            <Plus className="w-4 h-4" />
            {t('weight.logWeight')}
          </button>
        </div>
        <div className="card mb-6">
          <WeightChart key={weightKey} petId={petId} />
        </div>

        <Modal open={showWeightForm} onClose={() => setShowWeightForm(false)} title={t('weight.logWeight')}>
          <form onSubmit={handleWeightSubmit} className="space-y-4">
            {weightError && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm">{weightError}</div>}
            <div>
              <label className="text-sm font-medium text-txt-secondary block mb-1">{t('weight.weightKg')} *</label>
              <input type="number" step="0.1" value={weightKg} onChange={e => setWeightKg(e.target.value)} className="input" placeholder="12.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-txt-secondary block mb-1">{t('common.notes')}</label>
              <textarea value={weightNotes} onChange={e => setWeightNotes(e.target.value)} className="input" rows={2} />
            </div>
            <button type="submit" disabled={weightSaving} className="btn-primary w-full">
              {weightSaving ? t('common.loading') : t('common.save')}
            </button>
          </form>
        </Modal>

        {/* Upcoming events */}
        {dash && dash.upcoming_events.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-txt mb-3">{t('dashboard.upcomingEvents')}</h2>
            <div className="space-y-2">
              {dash.upcoming_events.map(ev => (
                <div key={ev.id} className="card flex items-center gap-3 !p-3">
                  <Calendar className="w-5 h-5 text-pink-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-txt truncate">{ev.title}</p>
                    <p className="text-xs text-txt-muted">{new Date(ev.datetime_start).toLocaleDateString()}</p>
                  </div>
                  <span className="badge bg-pink-50 text-pink-600">{t(`events.${ev.type}` as any) || ev.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active medications */}
        {dash && dash.active_medications.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-txt mb-3">{t('dashboard.activeMeds')}</h2>
            <div className="space-y-2">
              {dash.active_medications.map(med => (
                <div key={med.id} className="card flex items-center gap-3 !p-3">
                  <Pill className="w-5 h-5 text-purple-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-txt truncate">{med.name}</p>
                    <p className="text-xs text-txt-muted">{med.dosage} · {med.frequency_per_day}x/{t('dashboard.entries')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit pet modal */}
        <Modal open={showEdit} onClose={() => setShowEdit(false)} title={t('pets.editPet')}>
          <form onSubmit={handleEdit} className="space-y-4">
            {editError && <div className="bg-red-50/80 border border-red-100 text-red-500 px-3.5 py-2.5 rounded-2xl text-sm font-medium">{editError}</div>}
            <div>
              <label className="text-sm font-medium text-txt-secondary block mb-1.5">{t('pets.name')} *</label>
              <input value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="text-sm font-medium text-txt-secondary block mb-1.5">{t('pets.species')} *</label>
              <div className="flex gap-2">
                {['dog', 'cat', 'exotic'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setEditData(d => ({ ...d, species: s }))}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 border
                      ${editData.species === s
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-gray-100 text-txt-secondary hover:border-primary/30'}`}
                  >
                    {t(`pets.${s}` as any)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-txt-secondary block mb-1.5">{t('pets.breed')}</label>
              <input value={editData.breed} onChange={e => setEditData(d => ({ ...d, breed: e.target.value }))} className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-txt-secondary block mb-1.5">{t('pets.weight')}</label>
                <input type="number" step="0.1" value={editData.weight_kg} onChange={e => setEditData(d => ({ ...d, weight_kg: e.target.value }))} className="input" placeholder="12.5" />
              </div>
              <div>
                <label className="text-sm font-medium text-txt-secondary block mb-1.5">{t('pets.dob')}</label>
                <input type="date" value={editData.date_of_birth} onChange={e => setEditData(d => ({ ...d, date_of_birth: e.target.value }))} className="input" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-txt-secondary block mb-1.5">{t('pets.sex')}</label>
              <div className="flex gap-2">
                {[{ value: '', label: '—' }, { value: 'male', label: t('pets.male') }, { value: 'female', label: t('pets.female') }].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEditData(d => ({ ...d, sex: opt.value }))}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 border
                      ${editData.sex === opt.value
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-gray-100 text-txt-secondary hover:border-primary/30'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowEdit(false)} className="btn-secondary flex-1">{t('common.cancel')}</button>
              <button type="submit" disabled={editSaving} className="btn-primary flex-1">
                {editSaving ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>
        </Modal>
      </main>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
    </>
  );
}
