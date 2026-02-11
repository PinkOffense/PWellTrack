'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { petsApi, vaccinesApi } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { PetAvatar } from '@/components/PetAvatar';
import { EmptyState } from '@/components/EmptyState';
import { Modal } from '@/components/Modal';
import { PawPrint, Plus, Utensils, Syringe } from 'lucide-react';
import type { Pet, PetDashboard, Vaccine } from '@/lib/types';

function getFeedingBadge(d: PetDashboard | null, t: any) {
  if (!d) return null;
  const { total_actual_grams: actual, total_planned_grams: planned, entries_count } = d.feeding;
  if (entries_count === 0) return { label: t('dashboard.notFed'), cls: 'badge-red' };
  if (planned > 0 && actual < planned * 0.7) return { label: t('dashboard.underfed'), cls: 'badge-amber' };
  if (planned > 0 && actual > planned * 1.3) return { label: t('dashboard.overfed'), cls: 'badge-amber' };
  return { label: t('dashboard.wellFed'), cls: 'badge-green' };
}

function getVaccineBadge(vaccines: Vaccine[], t: any) {
  if (vaccines.length === 0) return { label: t('common.noData'), cls: 'badge-gray' };
  const now = new Date();
  const overdue = vaccines.some(v => v.next_due_date && new Date(v.next_due_date) < now);
  if (overdue) return { label: t('vaccines.overdue'), cls: 'badge-red' };
  const soon = vaccines.some(v => {
    if (!v.next_due_date) return false;
    const d = new Date(v.next_due_date);
    return d >= now && d <= new Date(now.getTime() + 30 * 86400000);
  });
  if (soon) return { label: t('vaccines.dueSoon'), cls: 'badge-amber' };
  return { label: t('vaccines.upToDate'), cls: 'badge-green' };
}

export default function PetsPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [dashboards, setDashboards] = useState<Record<number, PetDashboard | null>>({});
  const [vaccineData, setVaccineData] = useState<Record<number, Vaccine[]>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', species: 'dog', breed: '', weight_kg: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim()) { setFormError(t('auth.fillAllFields')); return; }
    setSaving(true);
    try {
      await petsApi.create({
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed.trim() || undefined,
        weight_kg: formData.weight_kg ? Number(formData.weight_kg) : undefined,
      });
      setShowForm(false);
      setFormData({ name: '', species: 'dog', breed: '', weight_kg: '' });
      loadPets();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
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
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-txt">{t('pets.myPets')}</h1>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('pets.addPet')}
          </button>
        </div>

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
          <div className="grid gap-4 sm:grid-cols-2">
            {pets.map(pet => {
              const fb = getFeedingBadge(dashboards[pet.id] ?? null, t);
              const vb = getVaccineBadge(vaccineData[pet.id] ?? [], t);
              return (
                <button
                  key={pet.id}
                  onClick={() => router.push(`/pets/${pet.id}`)}
                  className="card flex items-center gap-4 text-left hover:shadow-md transition-shadow"
                >
                  <PetAvatar name={pet.name} species={pet.species} photoUrl={pet.photo_url} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-txt truncate">{pet.name}</h3>
                    <p className="text-sm text-txt-secondary capitalize">
                      {t(`pets.${pet.species}` as any)}
                      {pet.breed && ` · ${pet.breed}`}
                      {pet.weight_kg && ` · ${pet.weight_kg} kg`}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {fb && (
                        <span className={fb.cls}>
                          <Utensils className="w-3 h-3 inline mr-1" />
                          {fb.label}
                        </span>
                      )}
                      {vb && (
                        <span className={vb.cls}>
                          <Syringe className="w-3 h-3 inline mr-1" />
                          {vb.label}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Add pet modal */}
        <Modal open={showForm} onClose={() => setShowForm(false)} title={t('pets.addPet')}>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm">{formError}</div>}
            <div>
              <label className="text-sm font-medium text-txt-secondary block mb-1">{t('pets.name')} *</label>
              <input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="text-sm font-medium text-txt-secondary block mb-1">{t('pets.species')} *</label>
              <div className="flex gap-2">
                {['dog', 'cat', 'exotic'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, species: s }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2
                      ${formData.species === s
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 text-txt-secondary hover:border-primary/30'}`}
                  >
                    {t(`pets.${s}` as any)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-txt-secondary block mb-1">{t('pets.breed')}</label>
              <input value={formData.breed} onChange={e => setFormData(f => ({ ...f, breed: e.target.value }))} className="input" placeholder="Golden Retriever..." />
            </div>
            <div>
              <label className="text-sm font-medium text-txt-secondary block mb-1">{t('pets.weight')}</label>
              <input type="number" step="0.1" value={formData.weight_kg} onChange={e => setFormData(f => ({ ...f, weight_kg: e.target.value }))} className="input" placeholder="12.5" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">{t('common.cancel')}</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </>
  );
}
