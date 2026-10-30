'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NextLink from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  Wrench,
  UserPlus,
  User,
  Briefcase,
  AlertCircle,
  Calendar,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { getSupabase } from '@/lib/supabase/client';
import {
  refreshSession,
  translateAuthError,
  homeForRole,
  UserRole,
} from '@/lib/auth';
import {
  saveStoredUserRole,
  saveStoredLoggedUser,
  saveActiveTenantSlug,
} from '@/lib/store';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<UserRole>('prestador');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'prestador' || roleParam === 'cliente') {
      setRole(roleParam);
    }
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSelectRole = (newRole: UserRole) => {
    setRole(newRole);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMessage('Informe seu e-mail e senha.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabase();
      if (!supabase) {
        setErrorMessage('Serviço de autenticação indisponível no momento.');
        setIsLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (authError || !authData.user) {
        setErrorMessage(translateAuthError(authError?.message));
        setIsLoading(false);
        return;
      }

      // 1. Atualiza explicitamente o papel ativo no perfil do Supabase
      try {
        await supabase
          .from('profiles')
          .update({ role })
          .eq('id', authData.user.id);
      } catch (err) {
        console.warn('Supabase profile role update notice:', err);
      }

      // 2. Salva localmente a escolha de perfil do usuário
      saveStoredUserRole(role);
      saveStoredLoggedUser({
        email: cleanEmail,
        name: authData.user.user_metadata?.full_name || cleanEmail,
        role,
      });

      // 3. Se logou como prestador, garante vínculo do tenant
      if (role === 'prestador') {
        try {
          const { data: owned } = await supabase
            .from('tenants')
            .select('slug')
            .eq('user_id', authData.user.id)
            .limit(1);

          if (!owned || owned.length === 0) {
            const cleanPhone = (authData.user.user_metadata?.phone || '').replace(/\D/g, '');
            if (cleanPhone) {
              const { data: orphans } = await supabase
                .from('tenants')
                .select('slug, phone')
                .is('user_id', null);
              const match = (orphans || []).find(
                (t: any) => (t.phone || '').replace(/\D/g, '') === cleanPhone
              );
              if (match?.slug) {
                await supabase
                  .from('tenants')
                  .update({ user_id: authData.user.id })
                  .eq('slug', match.slug);
                saveActiveTenantSlug(match.slug);
              }
            }
          } else if (owned[0]?.slug) {
            saveActiveTenantSlug(owned[0].slug);
          }
        } catch (err) {
          console.warn('Erro ao checar tenant do prestador:', err);
        }
      }

      // 4. Atualiza a sessão da aplicação com o papel escolhido
      await refreshSession();

      const targetNext = searchParams.get('next');
      const destination = targetNext || homeForRole(role);

      setSuccessMessage(
        role === 'prestador'
          ? 'Login de Prestador confirmado! Abrindo seu painel...'
          : 'Login de Cliente confirmado! Abrindo seus agendamentos...'
      );

      setTimeout(() => {
        router.push(destination);
      }, 500);
    } catch (err: any) {
      setErrorMessage(translateAuthError(err?.message));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* =================================================================
              LEFT 6 COLUMNS: LOGIN FORM
             ================================================================= */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-2xs flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative w-8 h-8 shrink-0">
                    <Image
                      src="/logo.png"
                      alt="AgendaFácil"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold uppercase tracking-wider">
                    {role === 'prestador' ? 'Portal do Prestador' : 'Área do Cliente'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {role === 'prestador' ? 'Login do Prestador' : 'Login do Cliente'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {role === 'prestador'
                    ? 'Acesse seu painel profissional, gestão de horários e Pix direto.'
                    : 'Acesse seus agendamentos marcados e converse com profissionais.'}
                </p>
              </div>

              {/* SELETOR CLARO: SOU PRESTADOR VS SOU CLIENTE */}
              <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectRole('prestador')}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                    role === 'prestador'
                      ? 'bg-[#0B132B] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Briefcase className={`w-4 h-4 ${role === 'prestador' ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>Sou Prestador</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('cliente')}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                    role === 'cliente'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <User className={`w-4 h-4 ${role === 'cliente' ? 'text-white' : 'text-slate-500'}`} />
                  <span>Sou Cliente</span>
                </button>
              </div>

              {/* Context Banner */}
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center gap-3 ${
                  role === 'prestador'
                    ? 'bg-[#0B132B] text-white border-slate-800'
                    : 'bg-blue-50 text-blue-900 border-blue-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    role === 'prestador' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-600 text-white'
                  }`}
                >
                  {role === 'prestador' ? <Briefcase className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold">
                    {role === 'prestador' ? 'Painel de Gestão do Prestador' : 'Área do Cliente'}
                  </p>
                  <p className={role === 'prestador' ? 'text-slate-300 text-[11px]' : 'text-blue-700 text-[11px]'}>
                    {role === 'prestador'
                      ? 'Gerencie agendamentos, horários disponíveis, catálogo de preços e Pix.'
                      : 'Acompanhe seus serviços agendados e converse direto com o profissional.'}
                  </p>
                </div>
              </div>

              {/* Aviso explicativo de mesma conta */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Mesmo e-mail e senha:</strong> Você pode usar as mesmas credenciais para acessar como <strong>Cliente</strong> ou como <strong>Prestador</strong>. Basta alternar na aba acima para entrar no modo desejado.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* FORMULÁRIO */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    E-mail Cadastrado
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        role === 'prestador'
                          ? 'voce@profissional.com.br'
                          : 'seu-email@exemplo.com'
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 bg-slate-50 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Senha de Acesso</label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 bg-slate-50 focus:bg-white transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-xs ${
                    role === 'prestador'
                      ? 'bg-[#0B132B] hover:bg-slate-800 text-white disabled:opacity-50'
                      : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                  }`}
                >
                  <span>
                    {isLoading
                      ? 'Verificando credenciais...'
                      : role === 'prestador'
                      ? 'Acessar Painel do Prestador'
                      : 'Entrar na Área do Cliente'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Ainda não possui uma conta?</span>
              <NextLink
                href={`/cadastro?role=${role}`}
                className="font-extrabold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Criar Conta {role === 'prestador' ? 'de Prestador' : 'de Cliente'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NextLink>
            </div>
          </div>

          {/* =================================================================
              RIGHT 6 COLUMNS: SOLID NAVY EXPLANATION PANEL
             ================================================================= */}
          <div className="lg:col-span-6 bg-[#0B132B] text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between space-y-8 border border-slate-800">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 text-cyan-400 text-xs font-extrabold">
                <Wrench className="w-3.5 h-3.5" />
                <span>Plataforma de Agendamento e Gestão</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                {role === 'prestador'
                  ? 'Sua agenda organizada, clientes confirmados e Pix direto na sua conta.'
                  : 'Encontre profissionais qualificados e agende seu horário em segundos.'}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                {role === 'prestador'
                  ? 'Cada profissional conta com seu próprio link público de agendamento e um painel exclusivo para gerenciar catálogo, expediente e recebimentos.'
                  : 'Consulte preços transparentes antes de contratar, escolha o melhor dia e horário e acompanhe tudo pela sua conta gratuita.'}
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      Ambientes Independentes para Prestador e Cliente
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      O painel de gestão é restrito ao profissional responsável, garantindo privacidade total dos clientes e horários.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      Recebimento Pix com 0% de Taxa
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      O pagamento com QR Code é gerado direto para a chave Pix do prestador, sem intermediação.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold text-white">
                  {role === 'prestador'
                    ? 'Deseja divulgar seus serviços no AgendaFácil?'
                    : 'Primeira vez agendando pela plataforma?'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Crie sua conta em menos de 1 minuto.
                </p>
              </div>
              <NextLink
                href={`/cadastro?role=${role}`}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shrink-0 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Criar Conta Agora</span>
              </NextLink>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center text-sm text-slate-500">
          Carregando login...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
