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
  QrCode,
  Users,
  Compass,
  Check,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  const prestadorPlans = SAAS_PLANS.filter((p) => p.audience === 'prestador');

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col text-slate-900 selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* =====================================================================
          1. HERO SECTION (ENXUTO, MODERNO E DIRETO)
         ===================================================================== */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Simples • Sem burocracia • Direto ao ponto</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              O jeito mais fácil de agendar e gerenciar{' '}
              <span className="text-blue-600">serviços.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Sem mensagens infinitas para marcar um horário. O cliente escolhe e agenda em 30 segundos; o profissional recebe na hora e organiza a agenda com Pix direto.
            </p>

            {/* TWO PRIMARY PATHS: CLIENTE VS PRESTADOR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-4 text-left">
              <NextLink
                href="/explorar"
                className="p-5 rounded-2xl bg-white hover:border-blue-500 border-2 border-blue-600 shadow-md transition group flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    Para Clientes
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-slate-900">Sou Cliente</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ver profissionais, preços fixos e agendar horário
                  </p>
                </div>
              </NextLink>

              <NextLink
                href="/dashboard"
                className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-md transition group flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
                    Para Prestadores
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-white">Sou Prestador</p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Ver quem agendou, controlar horários e Pix
                  </p>
                </div>
              </NextLink>
            </div>

            <p className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1.5 pt-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              100% grátis para clientes • Pix direto na sua conta bancária com 0% de taxa
            </p>
          </div>

          {/* ===================================================================
              CLEAN PREVIEW CARD (DUAL INTERFACE)
             =================================================================== */}
          <div className="mt-12 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-lg max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left Side: Client Experience */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                    Visão do Cliente
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Confirmado
                  </span>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    Aula de Beach Tennis — 1h
                  </p>
                  <p className="text-xs text-slate-500">Com Prof. Lucas Becker</p>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-2 border-t border-slate-200/70">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Seg, 26 Out às 09:00
                  </span>
                  <span className="text-slate-900 font-extrabold">R$ 90,00</span>
                </div>
              </div>

              {/* Right Side: Provider Experience */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
                    Visão do Prestador
                  </span>
                  <span className="text-[11px] font-bold text-blue-300">
                    Hoje: 4 agendamentos
                  </span>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white">
                    Raul Freitas • R$ 90,00
                  </p>
                  <p className="text-xs text-slate-400">Pix com QR Code gerado na hora</p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> Próximo: 09:00 - 10:00
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5" /> Pix Direto
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. COMO FUNCIONA (3 PASSOS ENXUTOS)
         ===================================================================== */}
      <section className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              Direto e Eficiente
            </h2>
            <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-slate-900">
              Como funciona o AgendaFácil
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base">
                1
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Escolha o serviço e valor
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                O cliente vê os serviços com preços transparentes e escolhe sem precisar ligar ou esperar resposta de orçamento.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base">
                2
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Marque dia e horário
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A agenda do prestador sincroniza em tempo real, evitando horários duplicados ou conflitos.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base">
                3
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Pix com QR Code na hora
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gere cobranças com QR Code e Pix Copia e Cola no valor exato. O dinheiro cai direto na conta bancária do profissional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. PLANOS & PREÇOS (CLARO E ENXUTO)
         ===================================================================== */}
      <section className="py-14 bg-[#F4F7FB] border-t border-slate-200" id="planos">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              Valores Transparentes
            </h2>
            <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-slate-900">
              Planos para Prestadores e Profissionais
            </p>
          </div>

          {/* Banner Claro: 100% Gratuito para Clientes */}
          <div className="max-w-5xl mx-auto mb-8 p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-emerald-950 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Para Clientes
                  </span>
                  <span className="text-sm font-extrabold text-emerald-900">100% Gratuito para Sempre</span>
                </div>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Quem agenda serviços não paga nenhuma taxa de uso da plataforma.
                </p>
              </div>
            </div>
            <NextLink
              href="/explorar"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shrink-0 text-center shadow-xs"
            >
              Explorar e Agendar
            </NextLink>
          </div>

          {/* 3 Planos para Prestadores (Grade 3 Colunas Perfeita: R$ 0, R$ 19,90, R$ 39,90) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {prestadorPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-6 flex flex-col justify-between transition ${
                  plan.recommended
                    ? 'border-2 border-blue-600 shadow-lg ring-4 ring-blue-500/10'
                    : 'border border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        plan.recommended
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {plan.name}
                    </span>
                    {plan.recommended && (
                      <span className="text-[11px] font-extrabold text-blue-600">
                        Mais Popular
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 mt-3">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.tagline}</p>

                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-xs font-semibold text-slate-500">R$</span>
                    <span className="text-3xl font-black text-slate-900">
                      {plan.price === 0 ? '0' : plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/{plan.period}</span>
                  </div>

                  <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 text-xs text-slate-700">
                    {plan.features.slice(0, 4).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100">
                  <NextLink
                    href={plan.price === 0 ? '/dashboard' : `/planos?plano=${plan.id}`}
                    className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-center block text-xs transition ${
                      plan.recommended
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
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

      {/* =====================================================================
          4. FOOTER ENXUTO
         ===================================================================== */}
      <footer className="py-8 bg-white border-t border-slate-200 text-slate-500 text-xs text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-[11px]">
              A
            </div>
            <span className="font-extrabold text-slate-900">AgendaFácil</span>
            <span>• Plataforma de Agendamentos e Gestão de Serviços</span>
          </div>

          <div className="flex items-center gap-4 font-semibold">
            <NextLink href="/explorar" className="hover:text-blue-600 transition">
              Clientes
            </NextLink>
            <NextLink href="/dashboard" className="hover:text-blue-600 transition">
              Prestadores
            </NextLink>
            <NextLink href="/chat" className="hover:text-blue-600 transition">
              Chat
            </NextLink>
            <NextLink href="/planos" className="hover:text-blue-600 transition">
              Planos
            </NextLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
