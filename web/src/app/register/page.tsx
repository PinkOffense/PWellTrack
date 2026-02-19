'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { User, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import dynamic from 'next/dynamic';
import { GoogleIcon } from '@/components/GoogleIcon';

const FarmScene = dynamic(() => import('@/components/FarmScene'), { ssr: false });
const FerretMascot = dynamic(() => import('@/components/FerretMascot'), { ssr: false });

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register, loginWithGoogle, googleAvailable, backendReachable } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError(t('common.fillAllFields'));
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
    <div className="relative min-h-screen bg-gradient-to-b from-[#f8f4ff] via-[#faf8ff] to-white flex flex-col items-center overflow-hidden">
      {/* Animated canvas background */}
      <FarmScene />

      {/* Banner header — same video as login */}
      <div className="relative z-10 w-full">
        <FerretMascot animate={true} />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#f8f4ff] to-transparent pointer-events-none" />
      </div>

      {/* Title */}
      <div className="relative z-10 text-center -mt-2">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#9B8EC8] via-[#B4A5D6] to-[#9B8EC8] bg-clip-text text-transparent drop-shadow-sm">
          PWellTrack
        </h1>
        <p className="text-[13px] text-gray-400/80 mt-1.5 font-medium tracking-widest uppercase">{t('auth.createAccount')}</p>
      </div>

      {/* Register form */}
      <div className="relative z-10 w-full max-w-[380px] px-5 mt-5 pb-10">
        {/* Offline banner */}
        {!backendReachable && (
          <div className="flex items-center gap-2 bg-amber-50/80 backdrop-blur-sm border border-amber-100 text-amber-600 px-3.5 py-2.5 rounded-2xl mb-4 text-sm font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {t('auth.offlineMsg')}
          </div>
        )}

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] shadow-[0_8px_40px_-12px_rgba(155,142,200,0.12)] border border-white/90 p-7 animate-slideUp">
          {error && (
            <div className="bg-red-50/80 border border-red-100 text-red-500 px-3.5 py-2.5 rounded-2xl text-sm font-medium mb-5 animate-fadeIn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-300/80 group-focus-within:text-[#B4A5D6] transition-colors duration-300" />
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('auth.name')} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100/80 bg-[#faf8ff]/60 focus:border-[#C9B8E8] focus:bg-white focus:ring-4 focus:ring-[#f0ecff]/60 outline-none transition-all duration-300 text-sm placeholder:text-gray-300/70" autoComplete="name" />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-300/80 group-focus-within:text-[#B4A5D6] transition-colors duration-300" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.email')} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100/80 bg-[#faf8ff]/60 focus:border-[#C9B8E8] focus:bg-white focus:ring-4 focus:ring-[#f0ecff]/60 outline-none transition-all duration-300 text-sm placeholder:text-gray-300/70" autoComplete="email" />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-300/80 group-focus-within:text-[#B4A5D6] transition-colors duration-300" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={t('auth.password')} className="w-full pl-12 pr-11 py-3.5 rounded-2xl border border-gray-100/80 bg-[#faf8ff]/60 focus:border-[#C9B8E8] focus:bg-white focus:ring-4 focus:ring-[#f0ecff]/60 outline-none transition-all duration-300 text-sm placeholder:text-gray-300/70" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300/80 hover:text-[#B4A5D6] transition-colors duration-300" aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}>
                {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>
            <p className="text-[11px] text-gray-300/80 -mt-2 ml-1">{t('auth.passwordMin')}</p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#B4A5D6] via-[#A99ACD] to-[#9B8EC8] text-white font-semibold text-sm tracking-wide hover:shadow-[0_6px_24px_-4px_rgba(155,142,200,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? t('common.loading') : t('auth.register')}
            </button>
          </form>

          {/* Divider + Google */}
          {googleAvailable && (
            <>
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent" />
                <span className="text-[11px] text-gray-300/80 uppercase tracking-[0.2em] font-medium">{t('common.or')}</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent" />
              </div>
              <button
                type="button"
                disabled={googleLoading}
                onClick={async () => {
                  setGoogleLoading(true);
                  try { await loginWithGoogle(); } catch (err: any) { setError(err.message); } finally { setGoogleLoading(false); }
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl border border-gray-100/80 bg-white/60 hover:bg-white hover:border-gray-200/80 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 font-medium text-sm text-gray-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" /> : <GoogleIcon />}
                {googleLoading ? t('common.loading') : t('auth.googleSignIn')}
              </button>
            </>
          )}
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
