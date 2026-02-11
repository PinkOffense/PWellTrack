'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { petsApi, vaccinesApi } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { PetAvatar } from '@/components/PetAvatar';
import {
  ArrowLeft, Utensils, Droplets, Syringe, Pill, Calendar, Activity, Trash2,
} from 'lucide-react';
import type { Pet, PetDashboard, Vaccine } from '@/lib/types';

const QUICK_ACTIONS = [
  { key: 'feeding', icon: Utensils, color: 'from-orange-400 to-amber-300', href: 'feeding' },
  { key: 'water', icon: Droplets, color: 'from-blue-400 to-cyan-300', href: 'water' },
  { key: 'vaccines', icon: Syringe, color: 'from-emerald-400 to-green-300', href: 'vaccines' },
  { key: 'medications', icon: Pill, color: 'from-purple-400 to-violet-300', href: 'medications' },
  { key: 'events', icon: Calendar, color: 'from-pink-400 to-rose-300', href: 'events' },
  { key: 'symptoms', icon: Activity, color: 'from-red-400 to-orange-300', href: 'symptoms' },
];

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

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !petId) return;
    (async () => {
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
    })();
  }, [user, petId]);

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

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <button onClick={() => router.push('/pets')} className="flex items-center gap-1 text-sm text-txt-secondary hover:text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> {t('pets.myPets')}
        </button>

        <div className="card flex items-center gap-4 mb-6">
          <PetAvatar name={pet.name} species={pet.species} photoUrl={pet.photo_url} size="lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-txt">{pet.name}</h1>
            <p className="text-txt-secondary capitalize">
              {t(`pets.${pet.species}` as any)}
              {pet.breed && ` · ${pet.breed}`}
              {pet.weight_kg && ` · ${pet.weight_kg} kg`}
            </p>
          </div>
          <button onClick={handleDelete} disabled={deleting} className="btn-danger" title={t('common.delete')}>
            <Trash2 className="w-5 h-5" />
          </button>
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
      </main>
    </>
  );
}
