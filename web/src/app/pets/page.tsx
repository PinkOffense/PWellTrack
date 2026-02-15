'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { petsApi, vaccinesApi } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { PetAvatar } from '@/components/PetAvatar';
import { EmptyState } from '@/components/EmptyState';
import { Modal } from '@/components/Modal';
import { PawPrint, Plus, Utensils, Droplets, Pill, Syringe, ChevronRight, Camera, Trash2 } from 'lucide-react';
import { useToast } from '@/components/Toast';
import type { Pet, PetDashboard, Vaccine } from '@/lib/types';

const KNOWN_SPECIES = ['dog', 'cat', 'exotic'];

function getFeedingStatus(d: PetDashboard | null) {
  if (!d) return null;
  const { total_actual_grams: actual, total_planned_grams: planned, entries_count } = d.feeding;
  if (entries_count === 0) return { key: 'notFed' as const, color: 'text-red-500', bg: 'bg-red-50' };
  if (planned > 0 && actual < planned * 0.7) return { key: 'underfed' as const, color: 'text-amber-500', bg: 'bg-amber-50' };
  if (planned > 0 && actual > planned * 1.3) return { key: 'overfed' as const, color: 'text-amber-500', bg: 'bg-amber-50' };
  return { key: 'wellFed' as const, color: 'text-emerald-500', bg: 'bg-emerald-50' };
}

function getVaccineStatus(vaccines: Vaccine[]) {
  if (vaccines.length === 0) return { key: 'noData' as const, color: 'text-gray-400', bg: 'bg-gray-50' };
  const now = new Date();
  if (vaccines.some(v => v.next_due_date && new Date(v.next_due_date) < now))
    return { key: 'overdue' as const, color: 'text-red-500', bg: 'bg-red-50' };
  if (vaccines.some(v => v.next_due_date && new Date(v.next_due_date) >= now && new Date(v.next_due_date) <= new Date(now.getTime() + 30 * 86400000)))
    return { key: 'dueSoon' as const, color: 'text-amber-500', bg: 'bg-amber-50' };
  return { key: 'upToDate' as const, color: 'text-emerald-500', bg: 'bg-emerald-50' };
}

const statusLabels: Record<string, string> = {
  notFed: 'dashboard.notFed',
  underfed: 'dashboard.underfed',
  overfed: 'dashboard.overfed',
  wellFed: 'dashboard.wellFed',
  noData: 'common.noData',
  overdue: 'vaccines.overdue',
  dueSoon: 'vaccines.dueSoon',
  upToDate: 'vaccines.upToDate',
};

export default function PetsPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [dashboards, setDashboards] = useState<Record<number, PetDashboard | null>>({});
  const [vaccineData, setVaccineData] = useState<Record<number, Vaccine[]>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', species: 'dog', customSpecies: '', breed: '', weight_kg: '', date_of_birth: '', sex: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [newPetPhoto, setNewPetPhoto] = useState<File | null>(null);
  const [newPetPhotoPreview, setNewPetPhotoPreview] = useState<string | null>(null);
  const newPetPhotoRef = useRef<HTMLInputElement>(null);
  const customSpeciesRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState('');
  const [photoMenuId, setPhotoMenuId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoTargetRef = useRef<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  // Close photo menu on outside click
  useEffect(() => {
    if (photoMenuId === null) return;
    const close = () => setPhotoMenuId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [photoMenuId]);

  const loadPets = async () => {
    try {
      const list = await petsApi.list();
      setPets(list);
      const results = await Promise.allSettled(
        list.map(async p => {
          const [dash, vax] = await Promise.all([petsApi.today(p.id), vaccinesApi.list(p.id)]);
          return { id: p.id, dash, vax };
        })
      );
      const dMap: Record<number, PetDashboard | null> = {};
      const vMap: Record<number, Vaccine[]> = {};
      results.forEach(r => {
        if (r.status === 'fulfilled') {
          dMap[r.value.id] = r.value.dash;
          vMap[r.value.id] = r.value.vax;
        }
      });
      setDashboards(dMap);
      setVaccineData(vMap);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) loadPets(); }, [user]);

  const resetForm = (keepSpeciesAndSex = false) => {
    setFormData(f => ({
      name: '',
      species: keepSpeciesAndSex ? f.species : 'dog',
      customSpecies: keepSpeciesAndSex ? f.customSpecies : '',
      breed: '',
      weight_kg: '',
      date_of_birth: '',
      sex: keepSpeciesAndSex ? f.sex : '',
    }));
    setNewPetPhoto(null);
    setNewPetPhotoPreview(null);
    setTouched({});
    setFormError('');
  };

  // Validation helpers
  const nameError = touched.name && !formData.name.trim() ? t('pets.nameRequired') : '';
  const speciesError = touched.customSpecies && formData.species === 'other' && !formData.customSpecies.trim() ? t('pets.speciesRequired') : '';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    // Mark all required fields as touched
    setTouched({ name: true, customSpecies: true });
    const finalSpecies = formData.species === 'other' ? formData.customSpecies.trim() : formData.species;
    if (!formData.name.trim()) return;
    if (!finalSpecies) return;
    setSaving(true);
    try {
      const created = await petsApi.create({
        name: formData.name.trim(),
        species: finalSpecies,
        breed: formData.breed.trim() || undefined,
        weight_kg: formData.weight_kg ? Number(formData.weight_kg) : undefined,
        date_of_birth: formData.date_of_birth || undefined,
        sex: formData.sex || undefined,
      });
      if (newPetPhoto) {
        try {
          const withPhoto = await petsApi.uploadPhoto(created.id, newPetPhoto);
          // Immediately add the pet with photo to the list
          setPets(prev => [...prev, withPhoto]);
        } catch {
          // Pet was created but photo failed - still add pet without photo
          setPets(prev => [...prev, created]);
          toast(t('common.error'), 'warning');
        }
      } else {
        setPets(prev => [...prev, created]);
      }
      setShowForm(false);
      resetForm();
      // Reload dashboards/vaccines for the new pet in background
      loadPets();
      toast(t('pets.petAdded'));
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAndAddAnother = async () => {
    setFormError('');
    setTouched({ name: true, customSpecies: true });
    const finalSpecies = formData.species === 'other' ? formData.customSpecies.trim() : formData.species;
    if (!formData.name.trim() || !finalSpecies) return;
    setSaving(true);
    try {
      const created = await petsApi.create({
        name: formData.name.trim(),
        species: finalSpecies,
        breed: formData.breed.trim() || undefined,
        weight_kg: formData.weight_kg ? Number(formData.weight_kg) : undefined,
        date_of_birth: formData.date_of_birth || undefined,
        sex: formData.sex || undefined,
      });
      if (newPetPhoto) {
        try {
          const withPhoto = await petsApi.uploadPhoto(created.id, newPetPhoto);
          setPets(prev => [...prev, withPhoto]);
        } catch {
          setPets(prev => [...prev, created]);
          toast(t('common.error'), 'warning');
        }
      } else {
        setPets(prev => [...prev, created]);
      }
      resetForm(true);
      // Reload dashboards/vaccines for the new pet in background
      loadPets();
      toast(t('pets.petAdded'));
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPhoto = (petId: number) => {
    photoTargetRef.current = petId;
    setPhotoMenuId(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const petId = photoTargetRef.current;
    if (!file || !petId) return;
    setPhotoError('');
    try {
      const updated = await petsApi.uploadPhoto(petId, file);
      setPets(prev => prev.map(p => p.id === petId ? updated : p));
      toast(t('common.saved'));
    } catch (err: any) {
      setPhotoError(err.message || t('common.error'));
      setTimeout(() => setPhotoError(''), 4000);
    }
    e.target.value = '';
    photoTargetRef.current = null;
  };

  const handleRemovePhoto = async (petId: number) => {
    setPhotoMenuId(null);
    setPhotoError('');
    try {
      const updated = await petsApi.deletePhoto(petId);
      setPets(prev => prev.map(p => p.id === petId ? updated : p));
      toast(t('common.deleted'));
    } catch (err: any) {
      setPhotoError(err.message || t('common.error'));
      setTimeout(() => setPhotoError(''), 4000);
    }
  };

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

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#9B8EC8] to-[#B4A5D6] bg-clip-text text-transparent">{t('pets.myPets')}</h1>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 !py-2.5 !px-4 text-sm">
            <Plus className="w-4 h-4" />
            {t('pets.addPet')}
          </button>
        </div>

        {photoError && (
          <div className="mb-4 bg-red-50/80 border border-red-100 text-red-500 px-3.5 py-2.5 rounded-2xl text-sm font-medium">
            {photoError}
          </div>
        )}

        {pets.length === 0 ? (
          <EmptyState
            icon={<PawPrint className="w-8 h-8" />}
            title={t('pets.noPets')}
            action={
              <button onClick={() => setShowForm(true)} className="btn-primary mt-2">
                {t('pets.addPet')}
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {pets.map((pet, i) => {
              const dash = dashboards[pet.id] ?? null;
              const vaccines = vaccineData[pet.id] ?? [];
              const feedStatus = getFeedingStatus(dash);
              const vaxStatus = getVaccineStatus(vaccines);
              const activeMeds = dash?.active_medications ?? [];
              const waterTotal = dash?.water.total_ml ?? 0;
              const waterGoal = dash?.water.daily_goal_ml ?? 0;

              return (
                <button
                  key={pet.id}
                  onClick={() => router.push(`/pets/${pet.id}`)}
                  className="card p-0 overflow-hidden text-left group transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_16px_56px_-16px_rgba(155,142,200,0.2)]"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Top: Photo + Name */}
                  <div className="flex items-center gap-4 p-5 pb-3">
                    <div
                      className="relative shrink-0"
                      onClick={(e) => { e.stopPropagation(); setPhotoMenuId(photoMenuId === pet.id ? null : pet.id); }}
                    >
                      <PetAvatar name={pet.name} species={pet.species} photoUrl={pet.photo_url} size="lg" />
                      <div className="absolute inset-0 rounded-2xl bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-200 cursor-pointer">
                        <Camera className="w-5 h-5 text-white drop-shadow" />
                      </div>
                      {photoMenuId === pet.id && (
                        <div
                          className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[150px] animate-fadeIn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleUploadPhoto(pet.id)}
                            className="w-full px-3.5 py-2 text-left text-sm text-txt hover:bg-primary/5 flex items-center gap-2.5 transition-colors"
                          >
                            <Camera className="w-3.5 h-3.5 text-primary" />
                            {t('pets.changePhoto')}
                          </button>
                          {pet.photo_url && (
                            <button
                              onClick={() => handleRemovePhoto(pet.id)}
                              className="w-full px-3.5 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {t('pets.removePhoto')}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-txt truncate">{pet.name}</h3>
                      <p className="text-sm text-txt-secondary capitalize">
                        {KNOWN_SPECIES.includes(pet.species) ? t(`pets.${pet.species}` as any) : pet.species}
                        {pet.breed && ` · ${pet.breed}`}
                        {pet.weight_kg && ` · ${pet.weight_kg}kg`}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300" />
                  </div>

                  {/* Status row: Feeding, Water, Meds, Vaccines */}
                  <div className="grid grid-cols-2 gap-px bg-gray-100/50 border-t border-gray-100/60">
                    {/* Feeding */}
                    <div className="bg-white/80 px-4 py-3 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${feedStatus?.bg ?? 'bg-gray-50'}`}>
                        <Utensils className={`w-4 h-4 ${feedStatus?.color ?? 'text-gray-400'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-txt-muted font-medium uppercase tracking-wider">{t('dashboard.feedingStatus')}</p>
                        <p className={`text-xs font-semibold ${feedStatus?.color ?? 'text-gray-400'}`}>
                          {feedStatus ? t(statusLabels[feedStatus.key]) : '—'}
                        </p>
                      </div>
                    </div>

                    {/* Water */}
                    <div className="bg-white/80 px-4 py-3 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${waterTotal > 0 ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        <Droplets className={`w-4 h-4 ${waterTotal > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-txt-muted font-medium uppercase tracking-wider">{t('dashboard.waterStatus')}</p>
                        <p className={`text-xs font-semibold ${waterTotal > 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                          {waterTotal > 0 ? `${waterTotal}ml` : '—'}
                          {waterGoal > 0 && <span className="text-txt-muted font-normal"> / {waterGoal}ml</span>}
                        </p>
                      </div>
                    </div>

                    {/* Medications */}
                    <div className="bg-white/80 px-4 py-3 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeMeds.length > 0 ? 'bg-purple-50' : 'bg-gray-50'}`}>
                        <Pill className={`w-4 h-4 ${activeMeds.length > 0 ? 'text-purple-500' : 'text-gray-400'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-txt-muted font-medium uppercase tracking-wider">{t('dashboard.medsStatus')}</p>
                        {activeMeds.length > 0 ? (
                          <p className="text-xs font-semibold text-purple-500 truncate">
                            {activeMeds.map(m => m.name).join(', ')}
                          </p>
                        ) : (
                          <p className="text-xs font-semibold text-gray-400">—</p>
                        )}
                      </div>
                    </div>

                    {/* Vaccines */}
                    <div className="bg-white/80 px-4 py-3 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${vaxStatus.bg}`}>
                        <Syringe className={`w-4 h-4 ${vaxStatus.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-txt-muted font-medium uppercase tracking-wider">{t('dashboard.vaccineStatus')}</p>
                        <p className={`text-xs font-semibold ${vaxStatus.color}`}>
                          {t(statusLabels[vaxStatus.key])}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Add pet modal */}
        <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={t('pets.addPet')}>
          <form onSubmit={handleCreate} className="space-y-5">
            {/* Intro text */}
            <p className="text-sm text-txt-muted -mt-1">{t('pets.addPetIntro')}</p>

            {formError && <div className="bg-red-50/80 border border-red-100 text-red-500 px-3.5 py-2.5 rounded-2xl text-sm font-medium">{formError}</div>}

            {/* Photo picker */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => newPetPhotoRef.current?.click()}
                className="relative w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-primary/40 flex items-center justify-center overflow-hidden transition-all group"
              >
                {newPetPhotoPreview ? (
                  <>
                    <img src={newPetPhotoPreview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Camera className="w-5 h-5 text-white drop-shadow" />
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <Camera className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                    <span className="text-[10px] text-txt-muted">{t('pets.addPhoto')}</span>
                  </div>
                )}
              </button>
              <span className="text-[11px] text-txt-muted">{t('pets.photoHint')}</span>
              <input
                ref={newPetPhotoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNewPetPhoto(file);
                    setNewPetPhotoPreview(URL.createObjectURL(file));
                  }
                  e.target.value = '';
                }}
              />
            </div>

            {/* Name - required */}
            <div>
              <label className="text-sm font-semibold text-txt block mb-1.5">{t('pets.name')} <span className="text-red-400">*</span></label>
              <input
                value={formData.name}
                onChange={e => { setFormData(f => ({ ...f, name: e.target.value })); setTouched(t => ({ ...t, name: true })); }}
                onBlur={() => setTouched(t => ({ ...t, name: true }))}
                className={`input text-[15px] ${nameError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                placeholder={t('pets.namePlaceholder')}
                autoFocus
              />
              {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
            </div>

            {/* Species - required */}
            <div>
              <label className="text-sm font-semibold text-txt block mb-1.5">{t('pets.species')} <span className="text-red-400">*</span></label>
              <div className="flex gap-2 flex-wrap">
                {['dog', 'cat', 'exotic', 'other'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setFormData(f => ({ ...f, species: s }));
                      if (s === 'other') {
                        setTimeout(() => customSpeciesRef.current?.focus(), 50);
                      }
                    }}
                    className={`flex-1 min-w-[70px] min-h-[44px] py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 border
                      ${formData.species === s
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-gray-100 text-txt-secondary hover:border-primary/30'}`}
                  >
                    {t(`pets.${s}` as any)}
                  </button>
                ))}
              </div>
              {formData.species === 'other' && (
                <div className="mt-2">
                  <input
                    ref={customSpeciesRef}
                    value={formData.customSpecies}
                    onChange={e => { setFormData(f => ({ ...f, customSpecies: e.target.value })); setTouched(t => ({ ...t, customSpecies: true })); }}
                    onBlur={() => setTouched(t => ({ ...t, customSpecies: true }))}
                    className={`input text-[15px] ${speciesError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                    placeholder={t('pets.specifySpecies')}
                  />
                  {speciesError && <p className="text-xs text-red-500 mt-1">{speciesError}</p>}
                </div>
              )}
            </div>

            {/* Breed - optional */}
            <div>
              <label className="text-sm font-semibold text-txt block mb-1.5">
                {t('pets.breed')}
                <span className="text-xs font-normal text-txt-muted ml-1.5">({t('pets.optional')})</span>
              </label>
              <input
                value={formData.breed}
                onChange={e => setFormData(f => ({ ...f, breed: e.target.value }))}
                className="input text-[15px]"
                placeholder={t('pets.breedPlaceholder')}
              />
            </div>

            {/* Weight + DOB - optional, side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-txt block mb-1.5">
                  {t('pets.weight')}
                  <span className="text-xs font-normal text-txt-muted ml-1.5">({t('pets.optional')})</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.weight_kg}
                  onChange={e => setFormData(f => ({ ...f, weight_kg: e.target.value }))}
                  className="input text-[15px]"
                  placeholder={t('pets.weightPlaceholder')}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-txt block mb-1.5">
                  {t('pets.dob')}
                  <span className="text-xs font-normal text-txt-muted ml-1.5">({t('pets.optional')})</span>
                </label>
                <input
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={formData.date_of_birth}
                  onChange={e => setFormData(f => ({ ...f, date_of_birth: e.target.value }))}
                  className="input text-[15px]"
                />
              </div>
            </div>

            {/* Sex - optional */}
            <div>
              <label className="text-sm font-semibold text-txt block mb-1.5">
                {t('pets.sex')}
                <span className="text-xs font-normal text-txt-muted ml-1.5">({t('pets.optional')})</span>
              </label>
              <div className="flex gap-2">
                {[{ value: '', label: '—' }, { value: 'male', label: t('pets.male') }, { value: 'female', label: t('pets.female') }].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, sex: opt.value }))}
                    className={`flex-1 min-h-[44px] py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 border
                      ${formData.sex === opt.value
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-gray-100 text-txt-secondary hover:border-primary/30'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <button type="submit" disabled={saving} className="btn-primary w-full min-h-[44px] text-[15px]">
                {saving ? t('common.loading') : t('pets.addPet')}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleCreateAndAddAnother}
                className="w-full min-h-[44px] py-3 rounded-2xl text-sm font-medium text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('pets.addAnother')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary w-full min-h-[44px]">
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </Modal>
      </main>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </>
  );
}
