'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatWorkspace from '@/components/chat/ChatWorkspace';
import Navbar from '@/components/layout/Navbar';
import { RequireRole } from '@/lib/auth';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const prestadorSlug = searchParams.get('prestador') || undefined;

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col text-slate-900">
      <Navbar />
      <main className="flex-1 p-3 sm:p-6 max-w-6xl w-full mx-auto">
        <ChatWorkspace
          forcedRole="cliente"
          initialTenantSlug={prestadorSlug}
        />
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <RequireRole role="cliente">
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center text-sm text-slate-500">
            Carregando conversas...
          </div>
        }
      >
        <ChatPageContent />
      </Suspense>
    </RequireRole>
  );
}
