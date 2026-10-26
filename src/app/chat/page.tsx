'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatWorkspace from '@/components/chat/ChatWorkspace';
import AppSidebar from '@/components/layout/AppSidebar';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const prestadorSlug = searchParams.get('prestador') || undefined;
  const [unreadCount, setUnreadCount] = useState(2);

  return (
    <AppSidebar activeDashboardTab="chat" chatUnreadCount={unreadCount}>
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-28 lg:pb-8 max-w-[1440px] w-full mx-auto space-y-4 sm:space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Central de Mensagens & Chat ao Vivo
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Converse em tempo real com prestadores, professores e clientes
            </p>
          </div>
        </div>

        <ChatWorkspace
          initialTenantSlug={prestadorSlug}
          onUnreadChange={(count) => setUnreadCount(count)}
        />
      </main>
    </AppSidebar>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-500">Carregando chat...</div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
