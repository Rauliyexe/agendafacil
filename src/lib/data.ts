import { Tenant, Booking, SubscriptionPlan, AppNotification, ChatConversation, ProviderStory } from './types';

// =============================================================================
// REPOSITÓRIO INICIAL LIMPO (Sem prestadores mockados)
// Os prestadores agora são cadastrados diretamente pelo usuário ou via Supabase
// =============================================================================
export const INITIAL_TENANTS: Record<string, Tenant> = {};

export const INITIAL_BOOKINGS: Booking[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_CONVERSATIONS: ChatConversation[] = [];

export const INITIAL_PROVIDER_CONVERSATIONS: ChatConversation[] = [];

export const INITIAL_STORIES: ProviderStory[] = [];

export const TOP_REQUESTED_SERVICES = [
  { name: 'Beach Tennis', count: 0, category: 'Esportes' },
  { name: 'Ar-condicionado', count: 0, category: 'Climatização' },
  { name: 'Elétrica', count: 0, category: 'Elétrica' },
  { name: 'Hidráulica', count: 0, category: 'Hidráulica' },
  { name: 'Limpeza', count: 0, category: 'Limpeza' },
  { name: 'Piscina', count: 0, category: 'Piscina' },
  { name: 'Outros', count: 0, category: 'Geral' },
];

export const SAAS_PLANS: SubscriptionPlan[] = [
  {
    id: 'cliente-free',
    name: 'Cliente / Aluno',
    audience: 'cliente',
    tagline: 'Para quem contrata serviços, agenda aulas ou marca horários com terceiros.',
    price: 0,
    period: 'grátis para sempre',
    isFree: true,
    features: [
      'Agendamento 100% gratuito em poucos cliques',
      'Acompanhe confirmações e status em tempo real',
      'Histórico organizado de todos os seus serviços',
      'PWA instalável no navegador do celular ou PC',
      'Notificações e lembretes automáticos',
    ],
    ctaText: 'Começar Agora Grátis',
  },
  {
    id: 'prestador-normal',
    name: 'Plano Normal (Gratuito)',
    audience: 'prestador',
    tagline: 'Para prestadores e professores que querem começar sem custo.',
    price: 0,
    period: 'mês (grátis)',
    isFree: true,
    features: [
      'Link exclusivo de agendamento (agendafacil.com/seu-nome)',
      'Agendamentos ilimitados',
      'Painel com abas: Início, Agenda, Serviços e Clientes',
      'Visão de calendário por Dia, Semana e Mês',
      'App PWA no celular e computador',
    ],
    ctaText: 'Criar Conta Grátis',
  },
  {
    id: 'prestador-pro',
    name: 'Plano Pro + WhatsApp',
    audience: 'prestador',
    tagline: 'Para quem quer zerar faltas com lembretes automáticos no WhatsApp.',
    price: 19.9,
    period: 'mês',
    recommended: true,
    features: [
      'Tudo do Plano Normal Gratuito',
      'Lembretes automáticos no WhatsApp (confirmação em 1 clique)',
      'Destaque na aba de Prestadores Ativos',
      'Cobrança opcional de Sinal / Pix antecipado',
      'Relatórios de serviços mais solicitados e faturamento',
      'Suporte prioritário via WhatsApp',
    ],
    ctaText: 'Assinar Pro por R$ 19,90/mês',
  },
  {
    id: 'prestador-arena',
    name: 'Equipe & Empresas',
    audience: 'prestador',
    tagline: 'Para empresas de serviços, arenas esportivas, salões e clínicas com equipe.',
    price: 39.9,
    period: 'mês',
    features: [
      'Tudo do Plano Pro',
      'Múltiplos prestadores / técnicos / professores',
      'Gestão centralizada de terceiros e comissões',
      'Notificações de equipe em tempo real',
      'Domínio personalizado',
    ],
    ctaText: 'Assinar Plano Equipe',
  },
];
