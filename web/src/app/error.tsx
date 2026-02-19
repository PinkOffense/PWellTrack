'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f8f4ff] to-white px-4">
      <div className="card max-w-md w-full text-center py-10">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-txt mb-2">{t('errors.somethingWrong')}</h1>
        <p className="text-sm text-txt-secondary mb-6">
          {t('errors.tryAgain')}
        </p>
        <button onClick={reset} className="btn-primary px-8">
          {t('errors.tryAgain')}
        </button>
      </div>
    </div>
  );
}
