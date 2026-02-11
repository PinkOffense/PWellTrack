'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/useNotifications';
import { NotificationToast } from '@/components/NotificationToast';
import { PawPrint, Settings, Bell, LogOut } from 'lucide-react';

export function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { notifications, dismiss } = useNotifications(!!user);

  if (!user) return null;

  const links = [
    { href: '/pets', label: t('pets.myPets'), icon: PawPrint },
    { href: '/settings', label: t('settings.title'), icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-[#f0ecff]" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 4px 20px rgba(155,142,200,0.06)' }}>
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/pets" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#f5f0ff] to-[#ece5ff]">
            <Image
              src="/ferret-sleeping.png"
              alt="PWellTrack"
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
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300
                  ${active ? 'bg-primary/10 text-primary shadow-sm' : 'text-txt-secondary hover:bg-primary/5 hover:text-primary'}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
          <button
            className="relative p-2 rounded-xl text-txt-muted hover:bg-primary/5 hover:text-primary transition-all duration-300"
            title={t('notifications.feedingReminder')}
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-fadeIn">
                {notifications.length}
              </span>
            )}
          </button>
          <button
            onClick={logout}
            className="ml-1 p-2 rounded-xl text-txt-muted hover:bg-red-50 hover:text-red-500 transition-all duration-300"
            title={t('settings.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
      <NotificationToast notifications={notifications} onDismiss={dismiss} />
    </nav>
  );
}
