'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register, loginWithGoogle, googleAvailable, backendReachable } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }
    if (password.length < 8) {
      setError(t('auth.passwordMin'));
      return;
    }
    setLoading(true);
    try {
      await register(name, email.trim().toLowerCase(), password);
      router.replace('/pets');
    } catch (err: any) {
      setError(err.message || t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[380px]">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f5f0ff] to-[#ece5ff] flex items-center justify-center mx-auto mb-3 shadow-[0_8px_32px_-8px_rgba(155,142,200,0.2)]">
            <Image src="/ferret-sleeping.png" alt="PWellTrack" width={64} height={64} className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#9B8EC8] via-[#B4A5D6] to-[#9B8EC8] bg-clip-text text-transparent">
            {t('auth.register')}
          </h1>
          <p className="text-[13px] text-gray-400/80 mt-1.5 font-medium tracking-widest uppercase">{t('auth.createAccount')}</p>
        </div>

        {/* Offline banner */}
        {!backendReachable && (
          <div className="flex items-center gap-2 bg-amber-50/80 backdrop-blur-sm border border-amber-100 text-amber-600 px-3.5 py-2.5 rounded-2xl mb-4 text-sm font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {t('auth.offlineMsg')}
          </div>
        )}

        <div className="card p-7 animate-slideUp">
          {error && (
            <div className="bg-red-50/80 border border-red-100 text-red-500 px-3.5 py-2.5 rounded-2xl text-sm font-medium mb-5 animate-fadeIn">
              {error}
            </div>
          )}

          {/* Google Sign-In */}
          {googleAvailable && (
            <>
              <button
                type="button"
                onClick={async () => {
                  try { await loginWithGoogle(); } catch (err: any) { setError(err.message); }
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl border border-gray-100/80 bg-white/60 hover:bg-white hover:border-gray-200/80 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 font-medium text-sm text-gray-500 active:scale-[0.98]"
              >
                <GoogleIcon />
                {t('auth.googleSignIn')}
              </button>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent" />
                <span className="text-[11px] text-gray-300/80 uppercase tracking-[0.2em] font-medium">{t('common.or')}</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-300/80 group-focus-within:text-[#B4A5D6] transition-colors duration-300" />
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('auth.name')} className="input pl-12" autoComplete="name" />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-300/80 group-focus-within:text-[#B4A5D6] transition-colors duration-300" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.email')} className="input pl-12" autoComplete="email" />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-300/80 group-focus-within:text-[#B4A5D6] transition-colors duration-300" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('auth.password')} className="input pl-12" autoComplete="new-password" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t('common.loading') : t('auth.register')}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-400/70">
          {t('auth.hasAccount')}{' '}
          <Link href="/login" className="text-[#9B8EC8] font-semibold hover:text-[#8D80BB] hover:underline transition-colors duration-300">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
