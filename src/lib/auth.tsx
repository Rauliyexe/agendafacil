'use client';

/**
 * Autenticação real via Supabase Auth.
 *
 * - O papel (cliente / prestador) vem da tabela `profiles`, nunca do localStorage.
 * - Para prestadores, a página pública (tenant) é localizada pelo `user_id`.
 *   Páginas antigas criadas antes do vínculo (user_id nulo) são localizadas pelo telefone do perfil.
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabase } from './supabase/client';

export type UserRole = 'cliente' | 'prestador';

export interface SessionInfo {
  status: 'loading' | 'anon' | 'authenticated';
  userId?: string;
  email?: string;
  name?: string;
  phone?: string;
  role?: UserRole;
  tenantSlug?: string | null;
}

const LOADING: SessionInfo = { status: 'loading' };
const ANON: SessionInfo = { status: 'anon' };

let cached: SessionInfo | null = null;
let inflight: Promise<SessionInfo> | null = null;
const listeners = new Set<(s: SessionInfo) => void>();

function publish(s: SessionInfo) {
  cached = s;
  listeners.forEach((fn) => fn(s));
}

const onlyDigits = (v?: string | null) => (v || '').replace(/\D/g, '');

async function loadSession(): Promise<SessionInfo> {
  const supabase = getSupabase();
  if (!supabase) return ANON;

  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return ANON;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, role, email')
    .eq('id', user.id)
    .maybeSingle();

  const role: UserRole =
    (profile?.role as UserRole) || (user.user_metadata?.role as UserRole) || 'cliente';

  let tenantSlug: string | null = null;
  if (role === 'prestador') {
    const { data: owned } = await supabase
      .from('tenants')
      .select('slug')
      .eq('user_id', user.id)
      .limit(1);
    tenantSlug = owned?.[0]?.slug ?? null;

    // Compatibilidade: páginas criadas antes do vínculo por user_id
    if (!tenantSlug && onlyDigits(profile?.phone)) {
      const { data: orphans } = await supabase
        .from('tenants')
        .select('slug, phone')
        .is('user_id', null);
      const match = (orphans || []).find(
        (t: any) => onlyDigits(t.phone) === onlyDigits(profile?.phone)
      );
      tenantSlug = match?.slug ?? null;
    }
  }

  return {
    status: 'authenticated',
    userId: user.id,
    email: profile?.email || user.email || '',
    name: profile?.full_name || user.user_metadata?.full_name || '',
    phone: profile?.phone || user.user_metadata?.phone || '',
    role,
    tenantSlug,
  };
}

export function refreshSession(): Promise<SessionInfo> {
  inflight = loadSession()
    .catch(() => ANON)
    .then((s) => {
      publish(s);
      inflight = null;
      return s;
    });
  return inflight;
}

let authListenerAttached = false;
function attachAuthListener() {
  if (authListenerAttached) return;
  const supabase = getSupabase();
  if (!supabase) return;
  authListenerAttached = true;
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
      refreshSession();
    }
  });
}

export function useSession(): SessionInfo {
  const [session, setSession] = useState<SessionInfo>(cached || LOADING);

  useEffect(() => {
    listeners.add(setSession);
    attachAuthListener();
    if (cached) setSession(cached);
    else if (inflight) inflight.then(setSession);
    else refreshSession();
    return () => {
      listeners.delete(setSession);
    };
  }, []);

  return session;
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) await supabase.auth.signOut();
  publish(ANON);
}

export function homeForRole(role?: UserRole): string {
  return role === 'prestador' ? '/prestador' : '/explorar';
}

/** Traduz as mensagens de erro mais comuns do Supabase Auth. */
export function translateAuthError(message?: string): string {
  const m = (message || '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed'))
    return 'Seu e-mail ainda não foi confirmado. Abra o link que enviamos para sua caixa de entrada.';
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'Já existe uma conta com este e-mail. Faça login.';
  if (m.includes('password should be at least'))
    return 'A senha precisa ter pelo menos 6 caracteres.';
  if (m.includes('rate limit')) return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
  return message || 'Não foi possível concluir. Tente novamente.';
}

/**
 * Bloqueia a página para quem não tem o papel exigido.
 * - Sem login: vai para /login com o papel pré-selecionado e volta depois.
 * - Papel errado: vai para a área correta do usuário.
 */
export function RequireRole({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = session.status === 'authenticated' && session.role === role;

  useEffect(() => {
    if (session.status === 'anon') {
      router.replace(`/login?role=${role}&next=${encodeURIComponent(pathname || '/')}`);
    } else if (session.status === 'authenticated' && session.role !== role) {
      router.replace(homeForRole(session.role));
    }
  }, [session, role, router, pathname]);

  if (!allowed) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center text-sm text-slate-500">
        {session.status === 'loading' ? 'Verificando acesso...' : 'Redirecionando...'}
      </div>
    );
  }

  return <>{children}</>;
}

