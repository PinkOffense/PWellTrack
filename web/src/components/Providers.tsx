'use client';

import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/components/Toast';
import { ConfirmProvider } from '@/components/ConfirmDialog';
import { HtmlLangUpdater } from '@/components/HtmlLangUpdater';
import '@/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <HtmlLangUpdater />
          {children}
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
