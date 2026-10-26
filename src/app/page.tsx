'use client';

import NextLink from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { SAAS_PLANS } from '@/lib/data';
import {
  Calendar,
  Clock,
  MessageCircle,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Bell,
  Home,
  Wrench,
  UserCheck,
  Users,
  Settings,
  Plus,
  Flame
} from 'lucide-react';

export default function LandingPage() {
  const prestadorPlans = SAAS_PLANS.filter((p) => p.audience === 'prestador');

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col text-slate-900">
      <Navbar />

      {/* =====================================================================
          HERO SECTION (Matching Top-Middle of the Design Board)
         ===================================================================== */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 bg-[#F4F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline & CTAs (5 cols) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Agende serviços com terceiros de forma simples e{' '}
                <span className="text-blue-600">sem complicação.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                O AgendaFácil conecta você aos seus prestadores de serviço, facilita o agendamento e mantém tudo organizado em um só lugar.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <NextLink
                  href="/explorar"
                  className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-100">
                      Para Contratar
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold">Entrar como Cliente</p>
                    <p className="text-xs text-blue-100 mt-0.5">
                      Tela simples para ver preços e agendar
                    </p>
                  </div>
                </NextLink>

                <NextLink
                  href="/dashboard"
                  className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-md transition flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400">
                      Para Profissionais
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold">Entrar como Prestador</p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Dashboard de quem agendou e horários
                    </p>
                  </div>
                </NextLink>
              </div>

              {/* Quick Pricing Note */}
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Grátis para clientes • Planos Grátis (R$ 0) e Pro (R$ 19,90) para prestadores
              </p>
            </div>

            {/* Right Column: Interactive Desktop + Mobile App Mockup (7 cols) */}
            <div className="lg:col-span-7 relative">
              {/* Desktop Window Mockup */}
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden lg:mr-10">
                <div className="grid grid-cols-12 min-h-[360px]">
                  {/* Mini Sidebar inside Mockup */}
                  <div className="hidden sm:flex col-span-3 bg-slate-50/80 border-r border-slate-100 p-3.5 flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 px-1">
                        <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-extrabold text-slate-900">
                          Agenda<span className="text-blue-600">Fácil</span>
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] font-semibold text-slate-500">
                        <NextLink href="/dashboard" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100">
                          <Home className="w-3.5 h-3.5" /> Início
                        </NextLink>
                        <NextLink href="/dashboard" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold">
                          <Calendar className="w-3.5 h-3.5" /> Agenda
                        </NextLink>
                        <NextLink href="/dashboard" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100">
                          <Wrench className="w-3.5 h-3.5" /> Serviços
                        </NextLink>
                        <NextLink href="/dashboard" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100">
                          <UserCheck className="w-3.5 h-3.5" /> Prestadores
                        </NextLink>
                        <NextLink href="/dashboard" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100">
                          <Users className="w-3.5 h-3.5" /> Clientes
                        </NextLink>
                        <NextLink href="/dashboard" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100">
                          <Bell className="w-3.5 h-3.5" /> Notificações
                        </NextLink>
                        <NextLink href="/dashboard" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100">
                          <Settings className="w-3.5 h-3.5" /> Configurações
                        </NextLink>
                      </div>
                    </div>
                  </div>

                  {/* Mini Calendar Content inside Mockup */}
                  <div className="col-span-12 sm:col-span-9 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">Agenda</p>
                        <p className="text-xs font-bold text-slate-700 mt-1">Outubro 2026</p>
                      </div>
                      <NextLink
                        href="/dashboard"
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Novo agendamento
                      </NextLink>
                    </div>

                    {/* Mini Week Grid */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[10px]">
                      <div className="space-y-2">
                        <span className="font-bold text-blue-600 block">Seg 26</span>
                        <div className="p-2 rounded-lg bg-amber-50 border-l-2 border-amber-500 text-amber-950">
                          <p className="font-bold truncate">Aula Beach Tennis</p>
                          <p className="text-[9px] text-amber-700">Prof. Lucas</p>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50 border-l-2 border-blue-600 text-blue-950">
                          <p className="font-bold truncate">Instalação de ar</p>
                          <p className="text-[9px] text-blue-700">Carlos Mendes</p>
                        </div>
                        <div className="p-2 rounded-lg bg-purple-50 border-l-2 border-purple-500 text-purple-950">
                          <p className="font-bold truncate">Manutenção piscina</p>
                          <p className="text-[9px] text-purple-700">Equipe Aqua</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="font-semibold text-slate-400 block">Ter 27</span>
                        <div className="mt-8 p-2 rounded-lg bg-emerald-50 border-l-2 border-emerald-500 text-emerald-950">
                          <p className="font-bold truncate">Limpeza técnica</p>
                          <p className="text-[9px] text-emerald-700">Lara Santos</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="font-semibold text-slate-400 block">Qua 28</span>
                        <div className="mt-4 p-2 rounded-lg bg-blue-50 border-l-2 border-blue-500 text-blue-950">
                          <p className="font-bold truncate">Revisão elétrica</p>
                          <p className="text-[9px] text-blue-700">João Silva</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="font-semibold text-slate-400 block">Qui 29</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlapping iPhone PWA Mockup (Bottom-Right of Hero) */}
              <div className="hidden md:block absolute -bottom-6 right-0 w-60 bg-white rounded-[32px] p-3.5 shadow-2xl border-4 border-slate-900">
                <div className="w-16 h-1.5 bg-slate-900 rounded-full mx-auto mb-2.5"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-slate-900">
                    Agenda<span className="text-blue-600">Fácil</span>
                  </span>
                  <span className="text-[10px] font-bold text-blue-600">Outubro 2026</span>
                </div>

                {/* Mini day pills */}
                <div className="grid grid-cols-6 gap-1 text-center text-[9px] mb-3">
                  <div className="py-1 text-slate-400">25</div>
                  <div className="py-1 rounded-full bg-blue-600 text-white font-bold">26</div>
                  <div className="py-1 text-slate-600">27</div>
                  <div className="py-1 text-slate-600">28</div>
                  <div className="py-1 text-slate-600">29</div>
                  <div className="py-1 text-slate-600">30</div>
                </div>

                <div className="space-y-2 text-[10px]">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>09:00</span>
                      <span className="text-[8px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Confirmado
                      </span>
                    </div>
                    <p className="font-extrabold text-slate-900 truncate mt-0.5">
                      Instalação de ar-condicionado
                    </p>
                    <p className="text-[9px] text-slate-400">Carlos Mendes</p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>11:30</span>
                      <span className="text-[8px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Confirmado
                      </span>
                    </div>
                    <p className="font-extrabold text-slate-900 truncate mt-0.5">
                      Serviço de elétrica
                    </p>
                    <p className="text-[9px] text-slate-400">João Silva</p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>14:00</span>
                      <span className="text-[8px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        Pendente
                      </span>
                    </div>
                    <p className="font-extrabold text-slate-900 truncate mt-0.5">
                      Manutenção de piscina
                    </p>
                    <p className="text-[9px] text-slate-400">Equipe Aqua</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom 3 Feature Strip from Hero Image */}
          <div className="mt-16 pt-8 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-700">
                Mais controle nos seus serviços
              </span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-700">
                Menos ligações e mensagens
              </span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-700">
                Tudo no seu celular ou computador
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          DARK NAVY SECTION ("Do agendamento ao resultado." + Brand Identity)
         ===================================================================== */}
      <section className="py-20 bg-[#0B132B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Brand Identity Card (Top-Left of Design Board) */}
            <div className="lg:col-span-5 bg-[#111C38] rounded-3xl p-10 text-center border border-white/10 shadow-2xl">
              <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/30">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight">
                Agenda<span className="text-blue-400">Fácil</span>
              </h2>
              <p className="mt-3 text-xs font-bold tracking-[0.25em] text-slate-400 uppercase">
                • Serviços • Pessoas • Resultados
              </p>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
                <NextLink
                  href="/dashboard"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
                >
                  Abrir Painel com Abas (Olá, Raul!)
                </NextLink>
                <NextLink
                  href="/lucas-beachtennis"
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs transition"
                >
                  Testar 1ª Conta (Prof. Lucas Beach Tennis)
                </NextLink>
              </div>
            </div>

            {/* Value Proposition ("Do agendamento ao resultado." - Top-Right of Board) */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Do <span className="text-blue-400">agendamento</span> ao resultado.
                </h2>
                <p className="mt-3 text-base text-slate-300 max-w-xl leading-relaxed">
                  Tudo o que você precisa para organizar serviços, acompanhar e ter mais eficiência.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">Agende</h3>
                    <p className="text-sm text-slate-300 mt-0.5">
                      Marque serviços com seus terceiros ou receba alunos em poucos cliques.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">Acompanhe</h3>
                    <p className="text-sm text-slate-300 mt-0.5">
                      Receba confirmações e atualizações em tempo real pelo celular ou computador.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">Organize</h3>
                    <p className="text-sm text-slate-300 mt-0.5">
                      Tenha todo o histórico de clientes, prestadores e notificações no seu painel.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          PRICING SECTION (Cliente R$ 0 | Prestador Normal R$ 0 | Pro R$ 19,90)
         ===================================================================== */}
      <section className="py-20 bg-white border-t border-slate-200" id="planos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Planos & Preços</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Gratuito para Clientes e Acessível para Prestadores
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {prestadorPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition hover:shadow-xl ${
                  plan.recommended
                    ? 'bg-white border-2 border-blue-600 shadow-xl ring-4 ring-blue-500/10'
                    : 'bg-slate-50/70 border border-slate-200 shadow-2xs'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    Mais Popular (R$ 19,90)
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="mt-2 text-xs text-slate-500">{plan.tagline}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-slate-500">R$</span>
                    <span className="text-4xl font-extrabold text-slate-900">
                      {plan.price === 0 ? '0' : plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs font-medium text-slate-500">/{plan.period}</span>
                  </div>

                  <div className="mt-8 space-y-3 border-t border-slate-200/70 pt-6">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200/70">
                  <NextLink
                    href={plan.price === 0 ? '/dashboard' : `/planos?plano=${plan.id}`}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-center block text-sm transition ${
                      plan.recommended
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {plan.ctaText}
                  </NextLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
