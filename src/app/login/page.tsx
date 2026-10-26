'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import {
  Calendar,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  Wrench,
  Trophy,
  Wind,
  LayoutDashboard,
  MessageSquare,
  UserPlus,
  ShieldCheck,
  User,
} from 'lucide-react';
import AppSidebar from '@/components/layout/AppSidebar';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('raul@empresa.com');
  const [password, setPassword] = useState('12345678');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <AppSidebar
      activePage="login"
      headerTitle="Entrar na Plataforma"
      headerSubtitle="Acesse seus agendamentos de trabalhos, sua agenda profissional ou o chat ao vivo"
    >
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-3.5 sm:p-6 lg:p-8 pb-28 lg:pb-8 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* =================================================================
              LEFT 6 COLUMNS: LOGIN FORM & 1-CLICK DEMO PROFILES
             ================================================================= */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-2xs flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold uppercase tracking-wider">
                  Acesso à Plataforma
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  Entrar no AgendaFácil
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Acesse seus agendamentos de trabalhos, sua agenda profissional ou o chat ao vivo.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    E-mail ou WhatsApp Cadastrado
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com ou (11) 99999-9999"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Senha</label>
                    <button
                      type="button"
                      onClick={() => alert('Link de recuperação enviado para seu e-mail/WhatsApp!')}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition"
                >
                  <span>Entrar no Painel</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Demo Profiles */}
              <div className="pt-5 border-t border-slate-100 space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Acesso Rápido de Demonstração (1 Clique):
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <NextLink
                    href="/dashboard"
                    className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 flex items-center gap-3 transition"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate">
                        Painel Prestador
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Acessar Gestão
                      </p>
                    </div>
                  </NextLink>

                  <NextLink
                    href="/explorar"
                    className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 flex items-center gap-3 transition"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate">
                        Área do Cliente
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Ver e Agendar
                      </p>
                    </div>
                  </NextLink>

                  <NextLink
                    href="/chat"
                    className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 flex items-center gap-3 transition"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate">
                        Central de Chat
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Mensagens
                      </p>
                    </div>
                  </NextLink>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Ainda não tem conta no AgendaFácil?</span>
              <NextLink
                href="/cadastro"
                className="font-extrabold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Criar Conta Agora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NextLink>
            </div>
          </div>

          {/* =================================================================
              RIGHT 6 COLUMNS: SOLID NAVY EXPLANATION PANEL (NO GRADIENTS)
             ================================================================= */}
          <div className="lg:col-span-6 bg-[#0B132B] text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-extrabold">
                <Wrench className="w-3.5 h-3.5" />
                <span>Agendamento Facilitado de Trabalhos & Serviços</span>
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
                Chega de perder horas esperando orçamento no WhatsApp.
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                O <strong>AgendaFácil</strong> organiza a contratação de técnicos, autônomos e professores em um fluxo único de 3 passos com preço fechado e confirmação imediata.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      Para Clientes (100% Grátis — R$ 0)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Escolha o trabalho tabelado, marque dia e hora livre e combine detalhes pelo Chat integrado.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      Para Prestadores (Plano Normal R$ 0 ou Pro R$ 19,90)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Receba ordens de serviço prontas na sua agenda com lembretes automáticos no WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold text-white">
                  Quer cadastrar seus serviços ou contratar um profissional?
                </p>
                <p className="text-[11px] text-slate-400">
                  Leva menos de 1 minuto para criar sua conta.
                </p>
              </div>
              <NextLink
                href="/cadastro"
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center gap-2 shrink-0 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Criar Conta</span>
              </NextLink>
            </div>
          </div>
        </div>
      </div>
    </AppSidebar>
  );
}
