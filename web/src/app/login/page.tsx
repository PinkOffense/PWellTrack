'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { PawPrint, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, backendReachable } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/pets');
    } catch (err: any) {
      setError(err.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-white to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <PawPrint className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary">PWellTrack</h1>
          <p className="text-txt-secondary mt-1">{t('auth.signInContinue')}</p>
        </div>

        {/* Offline banner */}
        {!backendReachable && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {t('auth.offlineMsg')}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <h2 className="text-xl font-bold text-txt">{t('auth.welcomeBack')}</h2>
            <p className="text-sm text-txt-muted">{t('auth.signInContinue')}</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('auth.email')}
              className="input pl-10"
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('auth.password')}
              className="input pl-10"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t('common.loading') : t('auth.login')}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-txt-secondary">
          {t('auth.noAccount')}{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
