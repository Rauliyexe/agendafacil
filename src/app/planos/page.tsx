'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  QrCode,
  X,
  Flame,
  UserCheck,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { SAAS_PLANS } from '@/lib/data';
import { SubscriptionPlan } from '@/lib/types';
import { useSession } from '@/lib/auth';

export default function PlanosPage() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const session = useSession();

  const prestadorPlans = SAAS_PLANS.filter((p) => p.audience === 'prestador');
  const isProvider = session.status === 'authenticated' && session.role === 'prestador';

  const handleOpenCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsSubscribed(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="relative w-7 h-7 shrink-0">
              <Image
                src="/logo.png"
                alt="AgendaFácil"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Planos e Preços
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Valores Transparentes no Agenda
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500">
              Fácil
            </span>
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            100% gratuito para clientes agendarem e planos acessíveis para profissionais organizarem sua rotina sem comissões por serviço.
          </p>
        </div>

        {/* 1. CARD DO CLIENTE */}
        <div className="mb-12 max-w-5xl mx-auto">
          <div className="bg-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-500">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                <UserCheck className="w-3.5 h-3.5" />
                Para Clientes
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">100% Gratuito para Agendar</h2>
              <p className="text-emerald-50 text-xs sm:text-sm max-w-lg leading-relaxed">
                Os clientes acessam o link do profissional, consultam a tabela de preços e reservam seu horário gratuitamente.
              </p>
            </div>

            <NextLink
              href="/explorar"
              className="shrink-0 px-6 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs sm:text-sm shadow-xs transition"
            >
              Explorar Profissionais
            </NextLink>
          </div>
        </div>

        {/* 2. PLANOS DO PRESTADOR */}
        <div className="mb-8 text-center">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs">
            Para Prestadores de Serviços, Técnicos, Consultores e Professores
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch mb-16">
          {prestadorPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-7 flex flex-col justify-between transition ${
                plan.recommended
                  ? 'bg-white border-2 border-blue-600 shadow-lg ring-4 ring-blue-500/10'
                  : 'bg-white border border-slate-200 shadow-2xs'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-blue-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  Mais Escolhido
                </div>
              )}

              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{plan.tagline}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-slate-500">R$</span>
                  <span className="text-4xl font-black text-slate-900">
                    {plan.price === 0 ? '0' : plan.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">/{plan.period}</span>
                </div>

                <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100">
                {plan.price === 0 ? (
                  <NextLink
                    href={isProvider ? '/prestador' : '/cadastro?role=prestador'}
                    className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs transition shadow-2xs text-center block bg-[#0B132B] hover:bg-slate-800 text-white"
                  >
                    {isProvider ? 'Ir para Meu Painel' : 'Começar no Plano Gratuito'}
                  </NextLink>
                ) : (
                  <button
                    onClick={() => handleOpenCheckout(plan)}
                    className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs transition shadow-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Assinar por R$ {plan.price.toFixed(2).replace('.', ',')}/mês
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ SECTION */}
        <div className="max-w-3xl mx-auto border-t border-slate-200 pt-14">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-8">
            Dúvidas Frequentes sobre os Planos
          </h2>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <h3 className="text-sm font-extrabold text-slate-900">
                Qual a diferença entre o Plano Gratuito e o Plano Pro de R$ 19,90?
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                O Plano Gratuito permite criar sua página pública de agendamento e gerenciar horários no painel. O Plano Pro inclui lembretes automáticos via WhatsApp antes do atendimento, confirmação rápida de presença e destaque nas buscas.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <h3 className="text-sm font-extrabold text-slate-900">
                A plataforma cobra alguma porcentagem sobre os meus serviços?
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Não. Todos os pagamentos via Pix são gerados com a chave cadastrada pelo próprio profissional e caem integralmente na sua conta bancária, com 0% de taxa de intermediação.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <h3 className="text-sm font-extrabold text-slate-900">
                Posso começar no Plano Gratuito e migrar para o Pro depois?
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Sim! Você pode criar sua conta gratuitamente agora mesmo, divulgar seu link para seus clientes e fazer o upgrade quando desejar.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* CHECKOUT MODAL */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Assinatura {selectedPlan.name}</h3>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isSubscribed ? (
              <div className="mt-4 space-y-4">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-blue-700 font-extrabold uppercase tracking-wider">
                      Plano Selecionado
                    </p>
                    <p className="text-base font-extrabold text-slate-900">{selectedPlan.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-blue-700">
                      R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs text-slate-500">/mês</span>
                  </div>
                </div>

                {/* Payment toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition ${
                      paymentMethod === 'pix'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    Pix Imediato
                  </button>

                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition ${
                      paymentMethod === 'card'
                        ? 'bg-blue-50 border-blue-600 text-blue-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Cartão de Crédito
                  </button>
                </div>

                {paymentMethod === 'pix' ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                    <p className="text-xs font-semibold text-slate-700">
                      Escaneie o QR Code abaixo para ativar via Pix:
                    </p>
                    <div className="w-36 h-36 bg-white border border-slate-200 rounded-xl mx-auto flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-slate-800" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Número do Cartão"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-600"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Validade (MM/AA)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-600"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setIsSubscribed(true)}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Confirmar Assinatura (R$ {selectedPlan.price.toFixed(2).replace('.', ',')})
                </button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">Assinatura Confirmada!</h4>
                <p className="text-xs text-slate-500">
                  Seu plano profissional está ativo.
                </p>
                <div className="pt-2">
                  <NextLink
                    href={isProvider ? '/prestador' : '/cadastro?role=prestador'}
                    className="w-full py-3 bg-[#0B132B] hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl block text-center"
                  >
                    {isProvider ? 'Ir para Meu Painel' : 'Concluir Cadastro de Prestador'}
                  </NextLink>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
