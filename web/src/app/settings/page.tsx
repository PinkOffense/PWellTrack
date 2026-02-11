'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Globe, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('pwelltrack_lang', lang);
  };

  const handleLogout = () => {
    if (confirm(t('settings.logoutConfirm'))) {
      logout();
      router.replace('/login');
    }
  };

  if (loading) return null;

  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-txt mb-6">{t('settings.title')}</h1>

        {/* Language */}
        <div className="card mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-txt">{t('settings.language')}</h2>
          </div>
          <div className="flex gap-2">
            {[
              { code: 'en', label: t('settings.english') },
              { code: 'pt', label: t('settings.portuguese') },
            ].map(({ code, label }) => (
              <button
                key={code}
                onClick={() => changeLang(code)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border-2
                  ${i18n.language === code
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 text-txt-secondary hover:border-primary/30'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* User info */}
        {user && (
          <div className="card mb-4">
            <p className="font-semibold text-txt">{user.name}</p>
            <p className="text-sm text-txt-secondary">{user.email}</p>
          </div>
        )}

        {/* Logout */}
        <button onClick={handleLogout} className="card w-full flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">{t('settings.logout')}</span>
        </button>
      </main>
    </>
  );
}
