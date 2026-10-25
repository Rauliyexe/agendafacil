import { Tenant, Booking, SubscriptionPlan, AppNotification, ChatConversation, ProviderStory } from './types';

export const INITIAL_TENANTS: Record<string, Tenant> = {
  'lucas-beachtennis': {
    id: 'lucas-beachtennis',
    slug: 'lucas-beachtennis',
    name: 'Prof. Lucas Becker',
    role: 'Professor de Beach Tennis',
    specialty: 'Beach Tennis & Esportes de Areia',
    rating: 4.9,
    reviews: 342,
    distance: '1,2 km',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    address: 'Arena Sunset - Rua das Flores, 123 - Centro',
    experience: '6 anos',
    phone: '(11) 98122-3344',
    whatsapp: '5511981223344',
    instagram: '@lucasbecker.bt',
    active: true,
    plan: 'pro',
    openingHours: {
      start: '07:00',
      end: '21:00',
      days: [1, 2, 3, 4, 5, 6],
      slotIntervalMinutes: 60,
    },
    services: [
      {
        id: 'bt1',
        tenantId: 'lucas-beachtennis',
        name: 'Aula Individual de Beach Tennis',
        price: 90,
        duration: '1h',
        durationMinutes: 60,
        category: 'Beach Tennis',
        description: 'Treino técnico personalizado: saque, smash, drop shot e movimentação em quadra de areia.',
        requestsCount: 15
      },
      {
        id: 'bt2',
        tenantId: 'lucas-beachtennis',
        name: 'Aula em Dupla (2 Alunos)',
        price: 140,
        duration: '1h',
        durationMinutes: 60,
        category: 'Beach Tennis',
        description: 'Tática de jogo em dupla, cobertura de quadra, bloqueio e entrosamento com parceiro.',
        requestsCount: 11
      },
      {
        id: 'bt3',
        tenantId: 'lucas-beachtennis',
        name: 'Clínica de Saque & Smash em Grupo',
        price: 60,
        duration: '1h 30min',
        durationMinutes: 90,
        category: 'Beach Tennis',
        description: 'Treino em grupo focado em repetição intensiva de golpes ofensivos e defesa.',
        requestsCount: 8
      },
      {
        id: 'bt4',
        tenantId: 'lucas-beachtennis',
        name: 'Locação da Quadra de Areia + Bolinhas',
        price: 80,
        duration: '1h',
        durationMinutes: 60,
        category: 'Quadra',
        description: 'Reserva de quadra oficial iluminada com kit de raquetes e bolinhas inclusos.',
        requestsCount: 9
      }
    ]
  },
  'carlos-mendes': {
    id: 'carlos-mendes',
    slug: 'carlos-mendes',
    name: 'Carlos Mendes',
    role: 'Climatização',
    specialty: 'Instalação e Manutenção de Ar-condicionado',
    rating: 4.8,
    reviews: 124,
    distance: '2,1 km',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    address: 'Rua das Flores, 123 - Centro',
    experience: '8 anos',
    phone: '(11) 98765-4321',
    whatsapp: '5511987654321',
    active: true,
    plan: 'pro',
    openingHours: {
      start: '08:00',
      end: '18:00',
      days: [1, 2, 3, 4, 5, 6],
      slotIntervalMinutes: 60,
    },
    services: [
      {
        id: 'cm1',
        tenantId: 'carlos-mendes',
        name: 'Instalação de ar-condicionado',
        price: 350,
        duration: '2h',
        durationMinutes: 120,
        category: 'Climatização',
        description: 'Instalação e configuração de aparelhos de ar-condicionado Split 9.000 a 18.000 BTUs com suporte técnico especializado.',
        requestsCount: 12
      },
      {
        id: 'cm2',
        tenantId: 'carlos-mendes',
        name: 'Higienização e recarga de gás',
        price: 180,
        duration: '1h 30min',
        durationMinutes: 90,
        category: 'Climatização',
        description: 'Limpeza química profunda de serpentina, filtros e verificação de pressão do gás refrigerante.',
        requestsCount: 7
      }
    ]
  },
  'joao-silva': {
    id: 'joao-silva',
    slug: 'joao-silva',
    name: 'João Silva',
    role: 'Elétrica',
    specialty: 'Revisão Elétrica Residencial e Comercial',
    rating: 4.7,
    reviews: 98,
    distance: '1,9 km',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80',
    address: 'Av. Paulista, 900 - Bela Vista',
    experience: '10 anos',
    phone: '(11) 97654-3210',
    whatsapp: '5511976543210',
    active: true,
    plan: 'pro',
    openingHours: {
      start: '08:00',
      end: '18:00',
      days: [1, 2, 3, 4, 5],
      slotIntervalMinutes: 60,
    },
    services: [
      {
        id: 'js1',
        tenantId: 'joao-silva',
        name: 'Revisão elétrica',
        price: 220,
        duration: '1h 30min',
        durationMinutes: 90,
        category: 'Elétrica',
        description: 'Inspeção completa de quadro de disjuntores, tomadas, aterramento e balanceamento de fases.',
        requestsCount: 9
      }
    ]
  },
  'equipe-aqua': {
    id: 'equipe-aqua',
    slug: 'equipe-aqua',
    name: 'Equipe Aqua',
    role: 'Piscina & Hidráulica',
    specialty: 'Manutenção de Piscinas e Bombas',
    rating: 4.9,
    reviews: 76,
    distance: '3,4 km',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    address: 'Alameda Santos, 410 - Jardins',
    experience: '7 anos',
    phone: '(11) 96543-2109',
    whatsapp: '5511965432109',
    active: true,
    plan: 'free',
    openingHours: {
      start: '08:00',
      end: '17:00',
      days: [1, 2, 3, 4, 5, 6],
      slotIntervalMinutes: 60,
    },
    services: [
      {
        id: 'ea1',
        tenantId: 'equipe-aqua',
        name: 'Manutenção de piscina',
        price: 160,
        duration: '2h',
        durationMinutes: 120,
        category: 'Piscina',
        description: 'Aspiração, controle de pH e cloro, limpeza de bordas e revisão do sistema de filtragem.',
        requestsCount: 4
      }
    ]
  },
  'lara-santos': {
    id: 'lara-santos',
    slug: 'lara-santos',
    name: 'Lara Santos',
    role: 'Limpeza Técnica',
    specialty: 'Limpeza Pós-obra e Higienização',
    rating: 4.6,
    reviews: 64,
    distance: '2,8 km',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    address: 'Rua Augusta, 650 - Consolação',
    experience: '5 anos',
    phone: '(11) 95432-1098',
    whatsapp: '5511954321098',
    active: true,
    plan: 'free',
    openingHours: {
      start: '08:00',
      end: '18:00',
      days: [1, 2, 3, 4, 5, 6],
      slotIntervalMinutes: 60,
    },
    services: [
      {
        id: 'ls1',
        tenantId: 'lara-santos',
        name: 'Limpeza técnica',
        price: 200,
        duration: '2h',
        durationMinutes: 120,
        category: 'Limpeza',
        description: 'Higienização técnica detalhada de ambientes residenciais, comerciais ou quadras esportivas.',
        requestsCount: 5
      }
    ]
  }
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-1',
    tenantId: 'lucas-beachtennis',
    tenantName: 'Prof. Lucas Becker',
    tenantRole: 'Beach Tennis',
    tenantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    tenantPhone: '(11) 98122-3344',
    tenantRating: 4.9,
    tenantReviews: 342,
    clientName: 'Raul Freitas',
    clientPhone: '(11) 98833-4455',
    services: [{ id: 'bt1', name: 'Aula Individual de Beach Tennis', price: 90, duration: '1h' }],
    totalPrice: 90,
    date: '2026-10-26',
    dayOfWeek: 1, // Seg 26
    formattedDate: '26 de outubro de 2026',
    time: '08:00',
    endTime: '09:00',
    color: 'blue',
    status: 'confirmado',
    address: 'Arena Sunset - Rua das Flores, 123 - Centro',
    notes: 'Aula técnica de saque, smash e movimentação em quadra de areia.',
    createdAt: '2026-10-25T08:00:00Z'
  },
  {
    id: 'b-2',
    tenantId: 'carlos-mendes',
    tenantName: 'Carlos Mendes',
    tenantRole: 'Climatização',
    tenantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    tenantPhone: '(11) 98765-4321',
    tenantRating: 4.8,
    tenantReviews: 124,
    clientName: 'Raul Freitas',
    clientPhone: '(11) 98765-4321',
    services: [{ id: 'cm1', name: 'Instalação de ar-condicionado', price: 350, duration: '2h' }],
    totalPrice: 350,
    date: '2026-10-26',
    dayOfWeek: 1, // Seg 26
    formattedDate: '26 de outubro de 2026',
    time: '09:00',
    endTime: '11:00',
    color: 'blue',
    status: 'confirmado',
    address: 'Rua das Flores, 123 - Centro',
    notes: 'Instalação de ar-condicionado 12.000 BTUs.',
    createdAt: '2026-10-25T08:42:00Z'
  },
  {
    id: 'b-3',
    tenantId: 'joao-silva',
    tenantName: 'João Silva',
    tenantRole: 'Elétrica',
    tenantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
    tenantPhone: '(11) 97654-3210',
    tenantRating: 4.7,
    tenantReviews: 98,
    clientName: 'Raul Freitas',
    clientPhone: '(11) 97654-3210',
    services: [{ id: 'js1', name: 'Serviço de elétrica', price: 220, duration: '1h 30min' }],
    totalPrice: 220,
    date: '2026-10-26',
    dayOfWeek: 1, // Seg 26
    formattedDate: '26 de outubro de 2026',
    time: '11:30',
    endTime: '13:00',
    color: 'green',
    status: 'confirmado',
    address: 'Av. Paulista, 900 - Bela Vista',
    notes: 'Revisão elétrica de quadro principal e tomadas.',
    createdAt: '2026-10-25T08:20:00Z'
  },
  {
    id: 'b-4',
    tenantId: 'equipe-aqua',
    tenantName: 'Equipe Aqua',
    tenantRole: 'Piscina',
    tenantAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    tenantPhone: '(11) 96543-2109',
    tenantRating: 4.9,
    tenantReviews: 76,
    clientName: 'Raul Freitas',
    clientPhone: '(11) 96543-2109',
    services: [{ id: 'ea1', name: 'Manutenção de piscina', price: 160, duration: '2h' }],
    totalPrice: 160,
    date: '2026-10-28',
    dayOfWeek: 3, // Qua 28
    formattedDate: '28 de outubro de 2026',
    time: '14:00',
    endTime: '15:30',
    color: 'blue',
    status: 'pendente',
    address: 'Alameda Santos, 410 - Jardins',
    notes: 'Tratamento da água, limpeza de filtro e bordas.',
    createdAt: '2026-10-24T18:45:00Z'
  },
  {
    id: 'b-5',
    tenantId: 'lara-santos',
    tenantName: 'Lara Santos',
    tenantRole: 'Limpeza',
    tenantAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
    tenantPhone: '(11) 95432-1098',
    tenantRating: 4.6,
    tenantReviews: 64,
    clientName: 'Raul Freitas',
    clientPhone: '(11) 95432-1098',
    services: [{ id: 'ls1', name: 'Limpeza técnica', price: 200, duration: '2h' }],
    totalPrice: 200,
    date: '2026-10-29',
    dayOfWeek: 4, // Qui 29
    formattedDate: '29 de outubro de 2026',
    time: '11:30',
    endTime: '13:00',
    color: 'purple',
    status: 'confirmado',
    address: 'Rua Augusta, 650 - Consolação',
    notes: 'Limpeza técnica pós-manutenção.',
    createdAt: '2026-10-24T15:10:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'agendamento',
    title: 'Agendamento confirmado',
    description: 'Aula de Beach Tennis — Prof. Lucas Becker (08:00) e Instalação de ar-condicionado — Carlos Mendes',
    timeLabel: 'Hoje, 08:42',
    read: false,
  },
  {
    id: 'notif-2',
    type: 'lembrete',
    title: 'Lembrete de serviço',
    description: 'Revisão elétrica — João Silva agendado para hoje às 11:30',
    timeLabel: 'Hoje, 08:20',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'sistema',
    title: 'Novo prestador disponível',
    description: 'Prof. Lucas Becker (Beach Tennis) e Lara Santos (Limpeza técnica) ativaram agenda online',
    timeLabel: 'Ontem, 18:45',
    read: false,
  }
];

export const TOP_REQUESTED_SERVICES = [
  { name: 'Beach Tennis (Aulas & Quadra)', count: 15, category: 'Esportes' },
  { name: 'Ar-condicionado', count: 12, category: 'Climatização' },
  { name: 'Elétrica', count: 9, category: 'Elétrica' },
  { name: 'Hidráulica', count: 7, category: 'Hidráulica' },
  { name: 'Limpeza', count: 5, category: 'Limpeza' },
  { name: 'Piscina', count: 4, category: 'Piscina' },
  { name: 'Outros', count: 3, category: 'Geral' },
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
      'Notificações e lembretes automáticos'
    ],
    ctaText: 'Começar Agora Grátis'
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
      'App PWA no celular e computador'
    ],
    ctaText: 'Criar Conta Grátis'
  },
  {
    id: 'prestador-pro',
    name: 'Plano Pro + WhatsApp',
    audience: 'prestador',
    tagline: 'Para quem quer zerar faltas com lembretes automáticos no WhatsApp.',
    price: 19.90,
    period: 'mês',
    recommended: true,
    features: [
      'Tudo do Plano Normal Gratuito',
      '⚡ Lembretes automáticos no WhatsApp (confirmação em 1 clique)',
      'Destaque na aba de Prestadores Ativos',
      'Cobrança opcional de Sinal / Pix antecipado',
      'Relatórios de serviços mais solicitados e faturamento',
      'Suporte prioritário via WhatsApp'
    ],
    ctaText: 'Assinar Pro por R$ 19,90/mês'
  },
  {
    id: 'prestador-arena',
    name: 'Equipe & Empresas',
    audience: 'prestador',
    tagline: 'Para empresas de serviços, arenas esportivas, salões e clínicas com equipe.',
    price: 39.90,
    period: 'mês',
    features: [
      'Tudo do Plano Pro',
      'Múltiplos prestadores / técnicos / professores',
      'Gestão centralizada de terceiros e comissões',
      'Notificações de equipe em tempo real',
      'Domínio personalizado'
    ],
    ctaText: 'Assinar Plano Equipe'
  }
];

export const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-lucas',
    tenantSlug: 'lucas-beachtennis',
    contactName: 'Prof. Lucas Becker',
    contactRole: 'Professor de Beach Tennis • 1ª Conta',
    contactAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    contactPhone: '(11) 98122-3344',
    online: true,
    unreadCount: 1,
    lastMessage: 'Tudo pronto na Quadra 02! Raquetes de carbono e bolinhas já estão separadas.',
    lastTime: '08:15',
    category: 'Esportes',
    messages: [
      {
        id: 'm1',
        sender: 'contact',
        text: 'Fala Raul! Bom dia! Confirmando nossa Aula Individual de Beach Tennis hoje às 08:00 na Arena Sunset.',
        time: '07:45',
        status: 'read',
        bookingCard: {
          serviceName: 'Aula Individual (Personal Beach Tennis)',
          date: '26 de outubro de 2026',
          time: '08:00 – 09:00',
          price: 90,
          status: 'confirmado'
        }
      },
      {
        id: 'm2',
        sender: 'user',
        text: 'Bom dia Prof. Lucas! Confirmado, já estou a caminho. Tem raquete disponível para teste hoje?',
        time: '07:50',
        status: 'read'
      },
      {
        id: 'm3',
        sender: 'contact',
        text: 'Tudo pronto na Quadra 02! Raquetes de carbono e bolinhas já estão separadas.',
        time: '08:15',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'conv-carlos',
    tenantSlug: 'carlos-mendes',
    contactName: 'Carlos Mendes',
    contactRole: 'Técnico em Climatização',
    contactAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    contactPhone: '(11) 98765-4321',
    online: true,
    unreadCount: 1,
    lastMessage: 'Chego às 08:55 na portaria da Av. Paulista, 1578 com o ferramental completo.',
    lastTime: '08:30',
    category: 'Climatização',
    messages: [
      {
        id: 'c1',
        sender: 'contact',
        text: 'Olá Raul! Recebi seu agendamento pelo AgendaFácil para a Manutenção de ar-condicionado hoje das 09:00 às 11:00.',
        time: '08:10',
        status: 'read',
        bookingCard: {
          serviceName: 'Manutenção de ar-condicionado',
          date: '26 de outubro de 2026',
          time: '09:00 – 11:00',
          price: 150,
          status: 'confirmado'
        }
      },
      {
        id: 'c2',
        sender: 'user',
        text: 'Perfeito Carlos! Já deixei seu nome liberado na recepção do 12º andar.',
        time: '08:22',
        status: 'read'
      },
      {
        id: 'c3',
        sender: 'contact',
        text: 'Chego às 08:55 na portaria da Av. Paulista, 1578 com o ferramental completo.',
        time: '08:30',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'conv-joao',
    tenantSlug: 'joao-silva',
    contactName: 'João Silva',
    contactRole: 'Eletricista Residencial e Comercial',
    contactAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
    contactPhone: '(11) 99123-4567',
    online: false,
    unreadCount: 0,
    lastMessage: 'Pode deixar, levo os disjuntores novos para o quadro principal.',
    lastTime: 'Ontem',
    category: 'Elétrica',
    messages: [
      {
        id: 'j1',
        sender: 'user',
        text: 'Olá João, agendei a revisão elétrica para hoje às 11:30. Precisa desligar a chave geral?',
        time: 'Ontem, 17:20',
        status: 'read'
      },
      {
        id: 'j2',
        sender: 'contact',
        text: 'Olá Raul! Só por cerca de 15 minutos durante o teste de carga. Pode deixar, levo os disjuntores novos para o quadro principal.',
        time: 'Ontem, 17:35',
        status: 'read'
      }
    ]
  },
  {
    id: 'conv-aqua',
    tenantSlug: 'equipe-aqua',
    contactName: 'Equipe Aqua',
    contactRole: 'Especialistas em Piscinas',
    contactAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    contactPhone: '(11) 97654-3210',
    online: true,
    unreadCount: 0,
    lastMessage: 'Confirmado para quarta-feira às 14:00 com medição de pH inclusa.',
    lastTime: 'Ontem',
    category: 'Piscina',
    messages: [
      {
        id: 'a1',
        sender: 'contact',
        text: 'Confirmado para quarta-feira às 14:00 com medição de pH inclusa.',
        time: 'Ontem, 15:10',
        status: 'read'
      }
    ]
  },
  {
    id: 'conv-lara',
    tenantSlug: 'lara-santos',
    contactName: 'Lara Santos',
    contactRole: 'Limpeza Técnica e Pós-Obra',
    contactAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
    contactPhone: '(11) 96543-2109',
    online: true,
    unreadCount: 0,
    lastMessage: 'Levamos todos os produtos biodegradáveis e aspirador industrial.',
    lastTime: '24 Out',
    category: 'Limpeza',
    messages: [
      {
        id: 'l1',
        sender: 'contact',
        text: 'Levamos todos os produtos biodegradáveis e aspirador industrial.',
        time: '24 Out, 14:00',
        status: 'read'
      }
    ]
  }
];

export const INITIAL_STORIES: ProviderStory[] = [
  {
    id: 'story-lucas',
    tenantSlug: 'lucas-beachtennis',
    providerName: 'Prof. Lucas Becker',
    providerRole: 'Beach Tennis • 1ª Conta',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    category: 'Esportes',
    hasUnseen: true,
    slides: [
      {
        id: 'sl-lucas-1',
        imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=900&auto=format&fit=crop&q=80',
        badgeText: '🎾 QUADRA 02 PRONTA • VAGA HOJE 16:00',
        caption: 'Areia nivelada e kit de raquetes de carbono 18K prontos na Arena Sunset! Abriu 1 horário hoje às 16:00 para aula individual ou dupla.',
        postedAt: 'Há 18 min',
        likes: 64,
        linkedServiceName: 'Aula Individual de Beach Tennis',
        linkedServicePrice: 90,
        availableSlotToday: '16:00'
      },
      {
        id: 'sl-lucas-2',
        imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&auto=format&fit=crop&q=80',
        badgeText: '🏆 CLÍNICA DE SMASH & SAQUE',
        caption: 'Resultado do treino tático da turma das 07h! Quer evoluir sua defesa e bloqueio na rede? Reserve seu horário na agenda.',
        postedAt: 'Há 1h',
        likes: 92,
        linkedServiceName: 'Clínica de Saque & Smash em Grupo',
        linkedServicePrice: 60,
        availableSlotToday: '18:00'
      }
    ]
  },
  {
    id: 'story-carlos',
    tenantSlug: 'carlos-mendes',
    providerName: 'Carlos Mendes',
    providerRole: 'Climatização & Ar',
    providerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    category: 'Climatização',
    hasUnseen: true,
    slides: [
      {
        id: 'sl-carlos-1',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop&q=80',
        badgeText: '❄️ ANTES E DEPOIS • HIGIENIZAÇÃO SPLIT',
        caption: 'Trabalho concluído agora na Av. Paulista! Limpeza química da serpentina + recarga de gás. Seu ar voltou a gelar como novo!',
        postedAt: 'Há 35 min',
        likes: 47,
        linkedServiceName: 'Manutenção de ar-condicionado',
        linkedServicePrice: 150,
        availableSlotToday: '14:00'
      }
    ]
  },
  {
    id: 'story-joao',
    tenantSlug: 'joao-silva',
    providerName: 'João Silva',
    providerRole: 'Eletricista Técnico',
    providerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
    category: 'Elétrica',
    hasUnseen: true,
    slides: [
      {
        id: 'sl-joao-1',
        imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&auto=format&fit=crop&q=80',
        badgeText: '⚡ QUADRO ELÉTRICO NOVO • NBR 5410',
        caption: 'Montagem e identificação completa de quadro de disjuntores DIN com DR e DPS contra surtos. Segurança total para sua residência!',
        postedAt: 'Há 1h 20min',
        likes: 53,
        linkedServiceName: 'Serviço de elétrica',
        linkedServicePrice: 120,
        availableSlotToday: '15:00'
      }
    ]
  },
  {
    id: 'story-aqua',
    tenantSlug: 'equipe-aqua',
    providerName: 'Equipe Aqua',
    providerRole: 'Manutenção de Piscina',
    providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    category: 'Piscina',
    hasUnseen: true,
    slides: [
      {
        id: 'sl-aqua-1',
        imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=900&auto=format&fit=crop&q=80',
        badgeText: '💧 ÁGUA CRISTALINA • PH 7.4',
        caption: 'Tratamento de choque, aspiração de fundo e limpeza de bordas finalizados no condomínio Jardins. Agenda aberta para esta semana!',
        postedAt: 'Há 2h',
        likes: 39,
        linkedServiceName: 'Manutenção de piscina',
        linkedServicePrice: 160,
        availableSlotToday: '16:00'
      }
    ]
  },
  {
    id: 'story-lara',
    tenantSlug: 'lara-santos',
    providerName: 'Lara Santos',
    providerRole: 'Limpeza Pós-Obra',
    providerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
    category: 'Limpeza',
    hasUnseen: false,
    slides: [
      {
        id: 'sl-lara-1',
        imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&auto=format&fit=crop&q=80',
        badgeText: '✨ ENTREGA PÓS-REFORMA IMPECÁVEL',
        caption: 'Remoção de resíduos de tinta e rejunte de porcelanato com maquinário profissional e produtos biodegradáveis.',
        postedAt: 'Há 3h',
        likes: 71,
        linkedServiceName: 'Limpeza técnica',
        linkedServicePrice: 200,
        availableSlotToday: '13:00'
      }
    ]
  }
];


