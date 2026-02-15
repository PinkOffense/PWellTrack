'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/useNotifications';
import { NotificationToast } from '@/components/NotificationToast';
import { useConfirm } from '@/components/ConfirmDialog';
import { PawPrint, Settings, Bell, LogOut, X, Pill, Utensils } from 'lucide-react';

export function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { notifications, dismiss } = useNotifications(!!user);
  const { confirm } = useConfirm();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!bellOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [bellOpen]);

  if (!user) return null;

  const links = [
    { href: '/pets', label: t('pets.myPets'), icon: PawPrint },
    { href: '/settings', label: t('settings.title'), icon: Settings },
  ];

  const handleLogout = async () => {
    const ok = await confirm({
      title: t('settings.logoutTitle'),
      message: t('settings.logoutConfirm'),
      confirmLabel: t('settings.logout'),
      cancelLabel: t('common.cancel'),
    });
    if (ok) {
      logout();
      router.replace('/login');
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="sticky top-0 z-50 border-b border-[#f0ecff]"
      style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 4px 20px rgba(155,142,200,0.06)' }}
    >
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/pets" className="flex items-center gap-2.5" aria-label="PWellTrack Home">
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#f5f0ff] to-[#ece5ff]">
            <Image
              src="/ferret-sleeping.png"
              alt="PWellTrack logo"
              width={36}
              height={36}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-[#9B8EC8] to-[#B4A5D6] bg-clip-text text-transparent hidden sm:block">PWellTrack</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                aria-label={label}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300
                  ${active ? 'bg-primary/10 text-primary shadow-sm' : 'text-txt-secondary hover:bg-primary/5 hover:text-primary'}`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
          {/* Notification bell with dropdown */}
          <div ref={bellRef} className="relative">
            <button
              onClick={() => setBellOpen(v => !v)}
              className="relative p-2 rounded-xl text-txt-muted hover:bg-primary/5 hover:text-primary transition-all duration-300"
              aria-label={`${t('settings.notifications')}${notifications.length > 0 ? ` (${notifications.length})` : ''}`}
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              {notifications.length > 0 && (
                <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-fadeIn">
                  {notifications.length}
                </span>
              )}
            </button>
            {bellOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm text-txt">{t('settings.notifications')}</div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-txt-muted">{t('settings.noNotifications')}</div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="flex items-start gap-2.5 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${n.type === 'medication_reminder' ? 'bg-purple-50' : 'bg-orange-50'}`}>
                          {n.type === 'medication_reminder'
                            ? <Pill className="w-3.5 h-3.5 text-purple-500" />
                            : <Utensils className="w-3.5 h-3.5 text-orange-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-txt">{n.pet_name}</p>
                          <p className="text-xs text-txt-muted truncate">
                            {n.type === 'medication_reminder'
                              ? `${n.medication_name} (${n.dosage})`
                              : t('notifications.feedingReminder')}
                          </p>
                        </div>
                        <button onClick={() => dismiss(n.id)} className="p-0.5 rounded-md hover:bg-gray-100 transition-colors shrink-0">
                          <X className="w-3.5 h-3.5 text-txt-muted" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="ml-1 p-2 rounded-xl text-txt-muted hover:bg-red-50 hover:text-red-500 transition-all duration-300"
            aria-label={t('settings.logout')}
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <NotificationToast notifications={notifications} onDismiss={dismiss} />
    </nav>
  );
}
