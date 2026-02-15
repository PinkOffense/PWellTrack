import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: {
    default: 'PWellTrack - Pet Wellness Tracker',
    template: '%s | PWellTrack',
  },
  description: 'Track your pet\'s health, feeding, water intake, medications, vaccines, and vet appointments — all in one place.',
  keywords: ['pet health', 'pet tracker', 'feeding log', 'medication reminder', 'vet appointments', 'pet wellness'],
  authors: [{ name: 'PWellTrack' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'pt_PT',
    siteName: 'PWellTrack',
    title: 'PWellTrack - Pet Wellness Tracker',
    description: 'Track your pet\'s health, feeding, medications and more.',
    url: 'https://p-well-track.vercel.app',
  },
  twitter: {
    card: 'summary',
    title: 'PWellTrack - Pet Wellness Tracker',
    description: 'Track your pet\'s health, feeding, medications and more.',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  metadataBase: new URL('https://p-well-track.vercel.app'),
};

export const viewport: Viewport = {
  themeColor: '#9B8EC8',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
