'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { petsApi } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { EmptyState } from '@/components/EmptyState';
import { Modal } from '@/components/Modal';
import { ArrowLeft, Plus, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import type { Pet } from '@/lib/types';

interface Props<T> {
  title: string;
  emptyText: string;
  addLabel: string;
  icon: ReactNode;
  listFn: (petId: number) => Promise<T[]>;
  deleteFn: (id: number) => Promise<void>;
  renderItem: (item: T, t: any) => ReactNode;
  renderForm: (opts: {
    onSave: () => void;
    petId: number;
    t: any;
  }) => ReactNode;
}

export function RecordPage<T extends { id: number }>({
  title, emptyText, addLabel, icon, listFn, deleteFn, renderItem, renderForm,
}: Props<T>) {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = Number(params.petId);

  const [pet, setPet] = useState<Pet | null>(null);
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const [p, list] = await Promise.all([petsApi.get(petId), listFn(petId)]);
      setPet(p);
      setItems(list);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user && petId) load(); }, [user, petId]);

  const handleDelete = async (id: number) => {
    if (!confirm(t('common.confirmDelete'))) return;
    try {
      await deleteFn(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      setError(err.message || t('common.error'));
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

  if (error && !pet) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-6">
          <button onClick={() => router.push('/pets')} className="flex items-center gap-1 text-sm text-txt-secondary hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4" /> {t('pets.myPets')}
          </button>
          <div className="card text-center py-10">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-txt-secondary mb-4">{error}</p>
            <button onClick={load} className="btn-primary inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {t('common.error') === 'Error' ? 'Retry' : 'Tentar novamente'}
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <button onClick={() => router.push(`/pets/${petId}`)} className="flex items-center gap-1 text-sm text-txt-secondary hover:text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> {pet?.name || '...'}
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-txt">{title}</h1>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {addLabel}
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50/80 border border-red-100 text-red-500 px-3.5 py-2.5 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <EmptyState icon={icon} title={emptyText} />
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="card flex items-start gap-3">
                <div className="flex-1">{renderItem(item, t)}</div>
                <button onClick={() => handleDelete(item.id)} className="btn-danger shrink-0 mt-0.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Modal open={showForm} onClose={() => setShowForm(false)} title={addLabel}>
          {renderForm({
            petId,
            t,
            onSave: () => { setShowForm(false); load(); },
          })}
        </Modal>
      </main>
    </>
  );
}
