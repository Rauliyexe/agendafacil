import type { Metadata, Viewport } from 'next';
import './globals.css';
import InstallPwaPrompt from '@/components/pwa/InstallPwaPrompt';

export const metadata: Metadata = {
  title: 'AgendaFácil - SaaS de Agendamentos Online para Profissionais e Salões',
  description: 'Sistema completo de agendamento online, lembretes automáticos no WhatsApp e gestão de clientes. Tenha seu link na bio e zere as faltas.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AgendaFácil',
  },
  icons: {
    icon: '/logo-64.png',
    apple: '/logo-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-brand-500 selection:text-white">
        {children}
        <InstallPwaPrompt />
      </body>
    </html>
  );
}
