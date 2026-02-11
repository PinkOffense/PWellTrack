'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import FarmScene from '@/components/FarmScene';
import FerretMascot from '@/components/FerretMascot';

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

export default function LoginPage() {
  const { t } = useTranslation();
  const { user, login, loginWithGoogle, backendReachable, googleAvailable } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace('/pets');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError(t('auth.fillAllFields')); return; }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/pets');
    } catch (err: any) {
      setError(err.message || t('auth.loginFailed'));
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    try { await loginWithGoogle(); } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#f5f0ff] via-white to-[#f0ecff]/40 flex items-center justify-center overflow-hidden">
      {/* Animated canvas background */}
      <FarmScene />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Mascot + Logo */}
        <div className="text-center mb-4">
          <div className="flex justify-center mb-1">
            <FerretMascot size={150} animate={true} />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#9B8EC8] via-[#B4A5D6] to-[#9B8EC8] bg-clip-text text-transparent">
            PWellTrack
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-medium tracking-wide">{t('auth.signInContinue')}</p>
        </div>

        {/* Offline banner */}
        {!backendReachable && (
          <div className="flex items-center gap-2 bg-amber-50/90 backdrop-blur-sm border border-amber-200 text-amber-700 px-3 py-2.5 rounded-xl mb-3 text-sm font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {t('auth.offlineMsg')}
          </div>
        )}

        {/* Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-[#B4A5D6]/[0.06] border border-white/80 p-6 animate-slideUp">
          {error && (
            <div className="bg-red-50/90 border border-red-100 text-red-600 px-3 py-2.5 rounded-xl text-sm font-medium mb-4 animate-fadeIn">
              {error}
            </div>
          )}

          {/* Email/Password */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#B4A5D6] transition-colors" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('auth.email')}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/60 focus:border-[#C9B8E8] focus:bg-white focus:ring-4 focus:ring-[#f0ecff] outline-none transition-all text-sm placeholder:text-gray-300"
                autoComplete="email"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#B4A5D6] transition-colors" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('auth.password')}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/60 focus:border-[#C9B8E8] focus:bg-white focus:ring-4 focus:ring-[#f0ecff] outline-none transition-all text-sm placeholder:text-gray-300"
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B4A5D6] to-[#9B8EC8] text-white font-semibold text-sm hover:from-[#A596C9] hover:to-[#8D80BB] transition-all shadow-lg shadow-[#B4A5D6]/20 hover:shadow-xl hover:shadow-[#B4A5D6]/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? t('common.loading') : t('auth.login')}
            </button>
          </form>

          {/* Divider + Google */}
          {googleAvailable && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                <span className="text-xs text-gray-300 uppercase tracking-widest font-medium">{t('common.or')}</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              </div>
              <button
                type="button"
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-gray-100 bg-white/80 hover:bg-white hover:border-gray-200 hover:shadow-md transition-all font-medium text-sm text-gray-600 active:scale-[0.98]"
              >
                <GoogleIcon />
                {t('auth.googleSignIn')}
              </button>
            </>
          )}
        </div>

        <p className="text-center mt-5 text-sm text-gray-400">
          {t('auth.noAccount')}{' '}
          <Link href="/register" className="text-[#9B8EC8] font-semibold hover:text-[#8D80BB] hover:underline transition-colors">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
