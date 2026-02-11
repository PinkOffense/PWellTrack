'use client';

import { AuthProvider } from '@/lib/auth';
import '@/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
