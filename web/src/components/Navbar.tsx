'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { PawPrint, Settings, LogOut } from 'lucide-react';

export function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const links = [
    { href: '/pets', label: t('pets.myPets'), icon: PawPrint },
    { href: '/settings', label: t('settings.title'), icon: Settings },
  ];

  return (
    <nav className="bg-white border-b border-primary/10 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/pets" className="flex items-center gap-2">
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
                  ${active ? 'bg-primary/10 text-primary' : 'text-txt-secondary hover:bg-primary/5'}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="ml-2 p-2 rounded-xl text-txt-muted hover:bg-red-50 hover:text-red-500 transition-colors"
            title={t('settings.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
