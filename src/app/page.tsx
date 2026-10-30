'use client';

import NextLink from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import { SAAS_PLANS } from '@/lib/data';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  QrCode,
  Compass,
  Check,
  Zap,
  Briefcase,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function LandingPage() {
  const prestadorPlans = SAAS_PLANS.filter((p) => p.audience === 'prestador');

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col text-slate-900 selection:bg-violet-600 selection:text-white">
      <Navbar />

      {/* =====================================================================
          1. HERO SECTION
         ===================================================================== */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-18 lg:pb-22">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Agendamento Online • Preço Tabelado • Pix Direto</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
              O jeito mais profissional de agendar e gerenciar{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500">
                serviços.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Sem trocas infinitas de mensagens para combinar horários. O cliente escolhe o serviço e agenda em segundos; o prestador gerencia tudo no painel exclusivo com Pix direto na conta.
            </p>

            {/* TWO PRIMARY PATHS: CLIENTE VS PRESTADOR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-3 text-left">
              <NextLink
                href="/login?role=cliente"
                className="p-5 rounded-2xl bg-white hover:border-blue-600 border-2 border-slate-200 shadow-sm hover:shadow-md transition group flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                    <User className="w-3 h-3" />
                    <span>Para Clientes</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-slate-900">Sou Cliente</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Encontrar profissionais, consultar preços e agendar horário
                  </p>
                </div>
              </NextLink>

              <NextLink
                href="/login?role=prestador"
                className="p-5 rounded-2xl bg-[#0B132B] hover:bg-slate-900 text-white shadow-md transition group flex flex-col justify-between gap-3 border border-slate-800"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-cyan-400 bg-slate-800/90 px-2.5 py-1 rounded-full">
                    <Briefcase className="w-3 h-3" />
                    <span>Para Profissionais</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-white">Sou Prestador</p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Acessar painel de gestão, agenda própria e chave Pix
                  </p>
                </div>
              </NextLink>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                100% gratuito para clientes
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                Pix direto com 0% de comissão
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <NextLink
                href="/explorar"
                className="text-blue-600 hover:underline font-extrabold inline-flex items-center gap-1"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explorar profissionais cadastrados</span>
              </NextLink>
            </div>
          </div>

          {/* ===================================================================
              CLEAN PRODUCT OVERVIEW (CLIENT vs PROVIDER SEPARATION)
             =================================================================== */}
          <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Left Side: Client Experience */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full">
                      Experiência do Cliente
                    </span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Horário Confirmado
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      Página Pública de Agendamento
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      O cliente acessa o link exclusivo do profissional, vê os serviços com valores fechados e escolhe o dia e horário disponível.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-3 border-t border-slate-200/80">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Escolha em 3 passos
                  </span>
                  <span className="text-emerald-700 font-extrabold">Taxa R$ 0</span>
                </div>
              </div>

              {/* Right Side: Provider Experience */}
              <div className="p-5 rounded-2xl bg-[#0B132B] text-white flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-cyan-400 bg-slate-800 px-2.5 py-1 rounded-full">
                      Painel do Prestador
                    </span>
                    <span className="text-[11px] font-bold text-slate-300">
                      Gestão Completa
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-white">
                      Controle de Clientes, Horários e Pix
                    </p>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Visualize quem agendou, confirme atendimentos com 1 clique e gere QR Code Pix com o valor exato do serviço.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300 pt-3 border-t border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> Agenda em tempo real
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
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              Fluxo Simples e Transparente
            </h2>
            <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-slate-900">
              Como funciona o AgendaFácil
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center font-black text-base shadow-xs">
                1
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Catálogo com Preço Fechado
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                O profissional cadastra seus serviços, durações e valores. O cliente consulta tudo com clareza antes de agendar.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center font-black text-base shadow-xs">
                2
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Horários Sincronizados
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A agenda mostra apenas os horários realmente livres do prestador, evitando conflitos ou marcações duplicadas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center font-black text-base shadow-xs">
                3
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Confirmação e Pix na Hora
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                O pedido chega imediatamente no painel do prestador, com QR Code Pix oficial gerado direto para a conta do profissional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. PLANOS & PREÇOS
         ===================================================================== */}
      <section className="py-16 bg-[#F4F7FB] border-t border-slate-200/80" id="planos">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              Valores Transparentes
            </h2>
            <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-slate-900">
              Planos para Prestadores e Profissionais
            </p>
          </div>

          {/* Banner Claro: 100% Gratuito para Clientes */}
          <div className="max-w-5xl mx-auto mb-8 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-emerald-950">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                    Para Clientes
                  </span>
                  <span className="text-sm font-extrabold text-emerald-900">
                    100% Gratuito para Sempre
                  </span>
                </div>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Quem contrata e agenda serviços não paga nenhuma taxa pelo uso da plataforma.
                </p>
              </div>
            </div>
            <NextLink
              href="/explorar"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shrink-0 text-center shadow-xs"
            >
              Ver Profissionais
            </NextLink>
          </div>

          {/* 3 Planos para Prestadores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {prestadorPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-6 flex flex-col justify-between transition ${
                  plan.recommended
                    ? 'border-2 border-blue-600 shadow-lg ring-4 ring-blue-500/10'
                    : 'border border-slate-200 shadow-2xs'
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
                        Mais Escolhido
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
                    href={
                      plan.price === 0
                        ? '/cadastro?role=prestador'
                        : `/planos?plano=${plan.id}`
                    }
                    className={`w-full py-3 px-4 rounded-xl font-extrabold text-center block text-xs transition ${
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
          4. FOOTER
         ===================================================================== */}
      <footer className="py-8 bg-white border-t border-slate-200 text-slate-500 text-xs mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 shrink-0">
              <Image
                src="/logo.png"
                alt="AgendaFácil"
                width={24}
                height={24}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-extrabold text-slate-900">
              Agenda
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-500">
                Fácil
              </span>
            </span>
            <span>• Plataforma de Agendamentos e Gestão de Serviços</span>
          </div>

          <div className="flex items-center gap-5 font-semibold">
            <NextLink href="/explorar" className="hover:text-blue-600 transition">
              Profissionais
            </NextLink>
            <NextLink href="/planos" className="hover:text-blue-600 transition">
              Planos
            </NextLink>
            <NextLink href="/login" className="hover:text-blue-600 transition">
              Entrar
            </NextLink>
            <NextLink href="/cadastro" className="hover:text-blue-600 transition">
              Criar Conta
            </NextLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
