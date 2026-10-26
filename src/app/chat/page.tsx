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
      <main className="flex-1 p-2.5 sm:p-4 lg:p-6 pb-20 lg:pb-6 max-w-[1440px] w-full mx-auto">
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
