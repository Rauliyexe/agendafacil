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
} from 'lucide-react';
import AppSidebar from '@/components/layout/AppSidebar';
import { getSupabase } from '@/lib/supabase/client';
import {
  refreshSession,
  translateAuthError,
  homeForRole,
  UserRole,
} from '@/lib/auth';

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

      // Autenticação real no Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (authError || !authData.user) {
        setErrorMessage(translateAuthError(authError?.message));
        setIsLoading(false);
        return;
      }

      // Atualiza a sessão central
      const session = await refreshSession();

      const userRole = session.role || role;
      const targetNext = searchParams.get('next');
      const destination = targetNext || homeForRole(userRole);

      setSuccessMessage(
        userRole === 'prestador'
          ? 'Login de prestador realizado com sucesso! Abrindo seu painel...'
          : 'Login realizado com sucesso! Abrindo sua área...'
      );

      setTimeout(() => {
        router.push(destination);
      }, 700);
    } catch (err: any) {
      setErrorMessage(translateAuthError(err?.message));
      setIsLoading(false);
    }
  };

  return (
    <AppSidebar
      activePage="login"
      headerTitle="Entrar na Plataforma"
      headerSubtitle="Acesse seu painel profissional de prestador ou sua área de cliente"
    >
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-3.5 sm:p-6 lg:p-8 pb-28 lg:pb-8 flex items-center">
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
                  <span className="inline-block px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-xs font-extrabold uppercase tracking-wider">
                    Acesso Seguro
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  Entrar no Agenda<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500">Fácil</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Selecione como deseja acessar sua conta:
                </p>
              </div>

              {/* SELETOR CLARO: SOU PRESTADOR VS SOU CLIENTE */}
              <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectRole('prestador')}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition ${
                    role === 'prestador'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <span>Sou Prestador</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('cliente')}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition ${
                    role === 'cliente'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <User className="w-4 h-4 text-white" />
                  <span>Sou Cliente</span>
                </button>
              </div>

              {/* Badge indicativo do perfil selecionado */}
              <div
                className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 ${
                  role === 'prestador'
                    ? 'bg-slate-900 text-white border-slate-800'
                    : 'bg-blue-50 text-blue-900 border-blue-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    role === 'prestador' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-600 text-white'
                  }`}
                >
                  {role === 'prestador' ? <Briefcase className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold">
                    {role === 'prestador'
                      ? 'Acesso ao Painel do Prestador'
                      : 'Acesso à Área do Cliente'}
                  </p>
                  <p className={role === 'prestador' ? 'text-slate-400 text-[11px]' : 'text-blue-700 text-[11px]'}>
                    {role === 'prestador'
                      ? 'Gerencie quem agendou, seus horários, serviços cadastrados e recebimentos Pix.'
                      : 'Consulte seus horários marcados com profissionais e converse no chat.'}
                  </p>
                </div>
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
                          ? 'seu-email-profissional@exemplo.com'
                          : 'seu-email@exemplo.com'
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 bg-slate-50 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Senha de Acesso</label>
                    <button
                      type="button"
                      onClick={() => alert('Para redefinir sua senha, solicite suporte ou use o e-mail cadastrado.')}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
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
                      ? 'bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50'
                      : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50'
                  }`}
                >
                  <span>
                    {isLoading
                      ? 'Verificando credenciais...'
                      : role === 'prestador'
                      ? 'Entrar no Painel do Prestador'
                      : 'Entrar como Cliente'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Ainda não tem conta?</span>
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
          <div className="lg:col-span-6 bg-[#0B132B] text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-extrabold">
                <Wrench className="w-3.5 h-3.5" />
                <span>Agendamento Facilitado de Trabalhos & Serviços</span>
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
                {role === 'prestador'
                  ? 'Sua agenda organizada, clientes no horário e Pix direto na sua conta.'
                  : 'Encontre profissionais de confiança e marque seu horário em 30 segundos.'}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                {role === 'prestador'
                  ? 'Cada prestador possui seu próprio link de agendamento e seu painel exclusivo para gerenciar serviços, horários e pagamentos.'
                  : 'Acompanhe seus horários marcados, consulte os dados do profissional e confirme detalhes no chat direto.'}
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      Áreas Totalmente Separadas
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Prestadores gerenciam sua própria página em <code className="text-cyan-300 font-bold">/prestador</code> com total sigilo dos agendamentos de clientes.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      Pix Direto sem Intermediários
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      O pagamento cai direto na sua conta cadastrada com 0% de comissão retida.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold text-white">
                  Quer cadastrar seus serviços profissionais?
                </p>
                <p className="text-[11px] text-slate-400">
                  Leva menos de 1 minuto para criar sua conta.
                </p>
              </div>
              <NextLink
                href="/cadastro?role=prestador"
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center gap-2 shrink-0 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Criar Conta de Prestador</span>
              </NextLink>
            </div>
          </div>
        </div>
      </div>
    </AppSidebar>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center text-sm text-slate-500">Carregando login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
