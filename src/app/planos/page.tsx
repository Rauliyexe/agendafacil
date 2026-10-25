'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import {
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  QrCode,
  ArrowRight,
  X,
  MessageCircle,
  Trophy,
  Flame,
  UserCheck
} from 'lucide-react';
import AppSidebar from '@/components/layout/AppSidebar';
import { SAAS_PLANS } from '@/lib/data';
import { SubscriptionPlan } from '@/lib/types';

export default function PlanosPage() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const clientePlan = SAAS_PLANS.find((p) => p.audience === 'cliente');
  const prestadorPlans = SAAS_PLANS.filter((p) => p.audience === 'prestador');

  const handleOpenCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsSubscribed(false);
  };

  return (
    <AppSidebar>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 lg:pb-12">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Preços Populares & Acessíveis
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Valores Claros para Clientes e Prestadores
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Gratuito para seus clientes agendarem e planos super econômicos para você nunca mais ter horários ociosos ou faltas.
          </p>
        </div>

        {/* 1. CARD DO CLIENTE */}
        <div className="mb-14 max-w-4xl mx-auto">
          <div className="bg-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-500">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                <UserCheck className="w-3.5 h-3.5" />
                Para o Cliente
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">100% Gratuito para Agendar</h2>
              <p className="text-emerald-100 text-xs sm:text-sm max-w-lg">
                Seus clientes entram pelo link da sua bio do Instagram, escolhem o serviço e o horário e recebem o lembrete no WhatsApp sem pagar nada pelo aplicativo.
              </p>
            </div>

            <NextLink
              href="/lucas-beachtennis"
              className="shrink-0 px-6 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-sm shadow-md transition"
            >
              Testar Agendamento de Exemplo
            </NextLink>
          </div>
        </div>

        {/* 2. PLANOS DO PRESTADOR */}
        <div className="mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
            Para Qualquer Prestador de Serviços, Professor, Salão ou Clínica
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
          {prestadorPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition hover:shadow-2xl ${
                plan.recommended
                  ? 'bg-white border-2 border-brand-600 shadow-xl ring-4 ring-brand-500/10'
                  : 'bg-white border border-slate-200 shadow-sm'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-600 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  Mais Popular (R$ 19,90)
                </div>
              )}

              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{plan.tagline}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-slate-500">R$</span>
                  <span className="text-4xl font-black text-slate-900">
                    {plan.price === 0 ? '0' : plan.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">/{plan.period}</span>
                </div>

                <div className="mt-8 space-y-3 border-t border-slate-100 pt-6">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                {plan.price === 0 ? (
                  <NextLink
                    href="/onboarding"
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm transition shadow-sm text-center block bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    Começar no Plano Gratuito
                  </NextLink>
                ) : (
                  <button
                    onClick={() => handleOpenCheckout(plan)}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm transition shadow-sm bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/30"
                  >
                    Assinar por R$ {plan.price.toFixed(2).replace('.', ',')}/mês
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ SECTION */}
        <div className="max-w-3xl mx-auto border-t border-slate-200 pt-16">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-8">
            Dúvidas Frequentes sobre os Planos
          </h2>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                O que o Plano Pro de R$ 19,90 tem de diferente do Plano Grátis?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                O Plano Pro inclui o robô de WhatsApp que manda a confirmação na hora do agendamento e o lembrete 2 horas antes da aula com botão de confirmação. Se o aluno não puder ir, ele avisa com antecedência e você libera a vaga para outro aluno ou aluga a quadra, evitando perder dinheiro.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Como funciona a cobrança de Sinal / Pix antecipado?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Você pode optar por exigir um sinal (por exemplo, 30% ou 50% do valor da aula) via Pix no momento em que o aluno agenda. Assim, a quadra só fica reservada após o comprovante, acabando com as desistências de última hora.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Posso começar no Grátis e depois mudar para o Pro de R$ 19,90?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Com certeza! Você pode criar sua conta no plano gratuito agora mesmo, testar com seus alunos e ativar o WhatsApp Pro quando quiser dar um upgrade na sua rotina.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* CHECKOUT MODAL */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Assinatura do Plano Pro</h3>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isSubscribed ? (
              <div className="mt-4 space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-800 font-bold uppercase tracking-wider">Plano Selecionado</p>
                    <p className="text-base font-extrabold text-slate-900">{selectedPlan.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-amber-700">
                      R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs text-slate-500">/mês</span>
                  </div>
                </div>

                {/* Payment toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                      paymentMethod === 'pix'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    Pix (R$ 19,90)
                  </button>

                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                      paymentMethod === 'card'
                        ? 'bg-brand-50 border-brand-500 text-brand-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-brand-600" />
                    Cartão de Crédito
                  </button>
                </div>

                {paymentMethod === 'pix' ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                    <p className="text-xs font-semibold text-slate-700">
                      Escaneie o QR Code abaixo para pagar via Pix:
                    </p>
                    <div className="w-36 h-36 bg-white border border-slate-200 rounded-xl mx-auto flex items-center justify-center shadow-inner">
                      <QrCode className="w-24 h-24 text-slate-800" />
                    </div>
                    <div className="text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-600 truncate">
                      00020126580014br.gov.bcb.pix0136agendafacil-pro-1990
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Número do Cartão"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Validade (MM/AA)"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setIsSubscribed(true)}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Ativar Plano Pro (R$ 19,90)
                </button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">Plano Pro Ativado!</h4>
                <p className="text-xs text-slate-500">
                  Parabéns! O robô de WhatsApp agora cuidará da confirmação de todas as suas aulas na quadra.
                </p>
                <div className="pt-2">
                  <NextLink
                    href="/dashboard"
                    className="w-full py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl block text-center"
                  >
                    Ir para Meu Painel do Professor
                  </NextLink>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppSidebar>
  );
}
