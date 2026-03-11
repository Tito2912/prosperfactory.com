import type { Metadata } from 'next';
import './globals.css';
import { AnalyticsClient } from '@/components/AnalyticsClient';
import { LangHtmlUpdater } from '@/components/LangHtmlUpdater';

export const metadata: Metadata = {
  title: {
    default: 'Prosper Factory',
    template: '%s | Prosper Factory',
  },
  description: 'Educational content about markets and tools to build long-term financial autonomy.',
  metadataBase: new URL('https://prosperfactory.com'),
  alternates: { canonical: '/' },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/assets/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/assets/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    title: 'Prosper Factory',
    description: 'Educational content about markets and tools to build long-term financial autonomy.',
    url: 'https://prosperfactory.com',
    images: [{ url: '/assets/og-image-1200x630.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prosper Factory',
    description: 'Educational content about markets and tools to build long-term financial autonomy.',
    images: ['/assets/og-image-1200x630.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LangHtmlUpdater />
        {children}
        <AnalyticsClient />
      </body>
    </html>
  );
}
