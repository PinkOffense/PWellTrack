'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f8f4ff] to-white px-4">
      <div className="card max-w-md w-full text-center py-10">
        <Image
          src="/ferret-sleeping.png"
          alt="Sleeping ferret"
          width={120}
          height={120}
          className="mx-auto mb-4 opacity-80"
        />
        <h1 className="text-5xl font-bold bg-gradient-to-r from-[#9B8EC8] to-[#B4A5D6] bg-clip-text text-transparent mb-2">
          404
        </h1>
        <p className="text-sm text-txt-secondary mb-6">
          {t('errors.pageNotFoundDesc')}
        </p>
        <Link href="/pets" className="btn-primary inline-block px-8">
          {t('errors.goHome')}
        </Link>
      </div>
    </div>
  );
}
