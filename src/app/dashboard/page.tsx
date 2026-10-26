'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NextLink from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  MessageCircle,
  ExternalLink,
  Copy,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Plus,
  Home,
  Wrench,
  UserCheck,
  Bell,
  Settings,
  Search,
  Star,
  MapPin,
  Phone,
  MoreHorizontal,
  Filter,
  Wind,
  Zap,
  Droplets,
  Waves,
  Trophy,
  X,
  ArrowRight,
  Smartphone,
  Check,
  MessageSquare
} from 'lucide-react';
import { getStoredTenants, getStoredBookings, saveNewBooking, updateBookingStatus } from '@/lib/store';
import { INITIAL_NOTIFICATIONS, TOP_REQUESTED_SERVICES } from '@/lib/data';
import { Tenant, Booking, Service, AppNotification } from '@/lib/types';
import ChatWorkspace from '@/components/chat/ChatWorkspace';
import ProviderStoriesBar from '@/components/stories/ProviderStoriesBar';
import AppSidebar, { DashboardTabId } from '@/components/layout/AppSidebar';

type ActiveTab = DashboardTabId;

function DashboardContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const [tenants, setTenants] = useState<Record<string, Tenant>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [chatUnreadCount, setChatUnreadCount] = useState<number>(2);
  const [selectedChatSlug, setSelectedChatSlug] = useState<string | undefined>(undefined);

  // Filters & UI states
  const [calendarView, setCalendarView] = useState<'dia' | 'semana' | 'mes'>('semana');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(26);
  const [providerSearch, setProviderSearch] = useState('');
  const [notifFilter, setNotifFilter] = useState<'todas' | 'agendamento' | 'sistema'>('todas');
  const [copiedLink, setCopiedLink] = useState(false);

  // "Detalhes do serviço" Modal state
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null);

  // "Novo agendamento" (3-step flow in Serviços tab or modal)
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedServiceItem, setSelectedServiceItem] = useState<{
    service: Service;
    tenant: Tenant;
  } | null>(null);
  const [newBookingDate, setNewBookingDate] = useState('2026-10-26');
  const [newBookingTime, setNewBookingTime] = useState('10:00');
  const [newBookingClient, setNewBookingClient] = useState('Raul Freitas');
  const [newBookingPhone, setNewBookingPhone] = useState('(11) 98765-4321');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as ActiveTab | null;
    if (
      tabParam &&
      [
        'inicio',
        'agenda',
        'servicos',
        'prestadores',
        'clientes',
        'chat',
        'notificacoes',
        'configuracoes',
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadedTenants = getStoredTenants();
    const loadedBookings = getStoredBookings();
    setTenants(loadedTenants);
    setBookings(loadedBookings);

    // Default selected service in "Novo agendamento"
    const firstTenant = loadedTenants['carlos-mendes'] || loadedTenants['lucas-beachtennis'] || Object.values(loadedTenants)[0];
    if (firstTenant && firstTenant.services.length > 0) {
      setSelectedServiceItem({
        service: firstTenant.services[0],
        tenant: firstTenant,
      });
    }
  }, []);

  const tenantList = useMemo(() => Object.values(tenants), [tenants]);

  // Flatten all services across all providers for the "Novo agendamento / Serviços" tab
  const allServicesWithTenant = useMemo(() => {
    const list: Array<{ service: Service; tenant: Tenant }> = [];
    tenantList.forEach((t) => {
      t.services.forEach((s) => {
        list.push({ service: s, tenant: t });
      });
    });
    return list.filter(
      (item) =>
        item.service.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        item.tenant.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        (item.service.category || '').toLowerCase().includes(serviceSearch.toLowerCase())
    );
  }, [tenantList, serviceSearch]);

  // Filtered providers for "Prestadores" tab
  const filteredProviders = useMemo(() => {
    return tenantList.filter(
      (t) =>
        t.name.toLowerCase().includes(providerSearch.toLowerCase()) ||
        t.role.toLowerCase().includes(providerSearch.toLowerCase()) ||
        t.specialty.toLowerCase().includes(providerSearch.toLowerCase())
    );
  }, [tenantList, providerSearch]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    if (notifFilter === 'todas') return notifications;
    if (notifFilter === 'agendamento') {
      return notifications.filter((n) => n.type === 'agendamento' || n.type === 'lembrete');
    }
    return notifications.filter((n) => n.type === 'sistema');
  }, [notifications, notifFilter]);

  // KPI Metrics matching the design board
  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status !== 'cancelado'),
    [bookings]
  );
  const confirmedCount = useMemo(
    () => bookings.filter((b) => b.status === 'confirmado').length,
    [bookings]
  );
  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === 'pendente').length,
    [bookings]
  );

  // Create new booking from the 3-step wizard
  const handleCreateNewBooking = () => {
    if (!selectedServiceItem) return;
    const { service, tenant } = selectedServiceItem;

    const created: Booking = {
      id: `b-${Date.now()}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantRole: tenant.role,
      tenantAvatar: tenant.avatar,
      tenantPhone: tenant.phone,
      tenantRating: tenant.rating,
      tenantReviews: tenant.reviews,
      clientName: newBookingClient,
      clientPhone: newBookingPhone,
      services: [
        {
          id: service.id,
          name: service.name,
          price: service.price,
          duration: service.duration,
        },
      ],
      totalPrice: service.price,
      date: newBookingDate,
      dayOfWeek: 1,
      formattedDate: '26 de outubro de 2026',
      time: newBookingTime,
      endTime: '11:30',
      color: 'blue',
      status: 'confirmado',
      address: tenant.address,
      notes: service.description || service.name,
      createdAt: new Date().toISOString(),
    };

    saveNewBooking(created);
    setBookings((prev) => [created, ...prev]);
    setBookingSuccessMsg(true);
    setTimeout(() => {
      setBookingSuccessMsg(false);
      setBookingStep(1);
      setActiveTab('agenda');
    }, 1800);
  };

  const handleCancelBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'cancelado');
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelado' } : b))
    );
    setSelectedBookingDetail(null);
  };

  const handleCopyDemoLink = () => {
    const url = `${window.location.origin}/lucas-beachtennis`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getCategoryIcon = (category?: string) => {
    const c = (category || '').toLowerCase();
    if (c.includes('beach') || c.includes('esporte') || c.includes('quadra')) return Trophy;
    if (c.includes('clima') || c.includes('ar')) return Wind;
    if (c.includes('elétr') || c.includes('eletr')) return Zap;
    if (c.includes('hidr')) return Droplets;
    if (c.includes('piscina')) return Waves;
    return Sparkles;
  };

  const sidebarItems: Array<{
    id: ActiveTab;
    label: string;
    icon: any;
    badge?: number;
  }> = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'servicos', label: 'Serviços', icon: Wrench },
    { id: 'prestadores', label: 'Prestadores', icon: UserCheck },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'chat', label: 'Chat', icon: MessageSquare, badge: chatUnreadCount > 0 ? chatUnreadCount : undefined },
    { id: 'notificacoes', label: 'Notificações', icon: Bell, badge: notifications.length },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  // October 2026 Calendar Grid days
  const octoberDays = [
    { num: 27, muted: true }, { num: 28, muted: true }, { num: 29, muted: true }, { num: 30, muted: true }, { num: 1, muted: false }, { num: 2, muted: false }, { num: 3, muted: false },
    { num: 4, muted: false }, { num: 5, muted: false }, { num: 6, muted: false }, { num: 7, muted: false }, { num: 8, muted: false }, { num: 9, muted: false }, { num: 10, muted: false },
    { num: 11, muted: false }, { num: 12, muted: false }, { num: 13, muted: false }, { num: 14, muted: false }, { num: 15, muted: false }, { num: 16, muted: false }, { num: 17, muted: false },
    { num: 18, muted: false }, { num: 19, muted: false }, { num: 20, muted: false }, { num: 21, muted: false }, { num: 22, muted: false }, { num: 23, muted: false }, { num: 24, muted: false },
    { num: 25, muted: false }, { num: 26, muted: false, active: true }, { num: 27, muted: false }, { num: 28, muted: false, hasDot: true }, { num: 29, muted: false, hasDot: true }, { num: 30, muted: false }, { num: 31, muted: false },
  ];

  return (
    <AppSidebar
      activeDashboardTab={activeTab}
      onSelectDashboardTab={setActiveTab}
      chatUnreadCount={chatUnreadCount}
      notificationsCount={notifications.length}
    >
      {/* MAIN WORKSPACE CONTENT AREA */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-28 lg:pb-10 w-full max-w-[1440px] mx-auto space-y-4 sm:space-y-6">
        
        {/* MOBILE-ONLY SEGMENTED PILL SWITCHER (SCROLLS WITH PAGE, NOT GLUED TO SCREEN) */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* -------------------------------------------------------------------
            ABA 1: INÍCIO ("Olá, Raul!" - Dashboard Overview)
           ------------------------------------------------------------------- */}
        {activeTab === 'inicio' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Top Greeting Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div>
                <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Olá, Raul!
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Aqui está um resumo dos seus serviços de hoje.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] sm:text-xs font-semibold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>26 de outubro de 2026</span>
                </div>

                <button
                  onClick={() => {
                    setBookingStep(1);
                    setActiveTab('servicos');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo agendamento</span>
                </button>
              </div>
            </div>

            {/* STORIES DOS PRESTADORES (Rede Social de Trabalhos no Celular e PC) */}
            <ProviderStoriesBar />

            {/* 4 KPI Metric Cards (2x2 Grid on Mobile, 4 Cols on PC) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-4">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Agendamentos hoje</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{activeBookings.length}</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">+2 vs ontem</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-4">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Prestadores ativos</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">8</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Confirmados</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-4">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Concluídos</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{confirmedCount}</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">de {activeBookings.length} total</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-4">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Pendentes</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{pendingCount || 2}</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Em andamento</p>
                </div>
              </div>
            </div>

            {/* 3-Column Bottom Grid: Próximos agendamentos | Outubro 2026 | Serviços mais solicitados */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* COL 1: Próximos agendamentos (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-extrabold text-slate-900">Próximos agendamentos</h2>
                  <button
                    onClick={() => setActiveTab('agenda')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Ver todos
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {activeBookings.slice(0, 5).map((booking) => {
                    const isConfirmed = booking.status === 'confirmado';
                    return (
                      <div
                        key={booking.id}
                        onClick={() => setSelectedBookingDetail(booking)}
                        className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <span className="text-sm font-bold text-slate-700 w-12 shrink-0 pt-0.5">
                            {booking.time}
                          </span>
                          <div className="w-1 h-9 rounded-full bg-blue-600 shrink-0"></div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {booking.services[0]?.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{booking.tenantName}</p>
                          </div>
                        </div>

                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                            isConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isConfirmed ? 'Confirmado' : 'Pendente'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COL 2: Mini Calendar Outubro 2026 (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-extrabold text-slate-900">Outubro 2026</h2>
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 mb-2">
                  <span>Dom</span>
                  <span>Seg</span>
                  <span>Ter</span>
                  <span>Qua</span>
                  <span>Qui</span>
                  <span>Sex</span>
                  <span>Sáb</span>
                </div>

                <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs">
                  {octoberDays.map((d, index) => {
                    const isSelected = !d.muted && d.num === selectedDayNumber;
                    return (
                      <button
                        key={index}
                        onClick={() => !d.muted && setSelectedDayNumber(d.num)}
                        className={`h-8 w-8 mx-auto rounded-full flex flex-col items-center justify-center relative font-semibold transition ${
                          d.muted
                            ? 'text-slate-300 cursor-default'
                            : isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-xs shadow-blue-600/30'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{d.num}</span>
                        {d.hasDot && !isSelected && (
                          <span className="w-1 h-1 rounded-full bg-blue-500 absolute bottom-1"></span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Dia selecionado: <strong>{selectedDayNumber}/10/2026</strong></span>
                  <button
                    onClick={() => setActiveTab('agenda')}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Abrir grade
                  </button>
                </div>
              </div>

              {/* COL 3: Serviços mais solicitados (3 cols) */}
              <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
                <h2 className="text-base font-extrabold text-slate-900 mb-4">
                  Serviços mais solicitados
                </h2>

                <div className="space-y-2.5">
                  {TOP_REQUESTED_SERVICES.map((item, idx) => {
                    const Icon = getCategoryIcon(item.category);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setServiceSearch(item.name.split(' ')[0]);
                          setActiveTab('servicos');
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            ABA 2: AGENDA (Weekly Calendar Grid + Detalhes do dia)
           ------------------------------------------------------------------- */}
        {activeTab === 'agenda' && (
          <div className="space-y-6">
            {/* Top Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-2xl font-extrabold text-slate-900">Agenda</h1>

                {/* Dia | Semana | Mês Switcher */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1">
                  {(['dia', 'semana', 'mes'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setCalendarView(v)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                        calendarView === v
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {v === 'mes' ? 'Mês' : v}
                    </button>
                  ))}
                </div>

                <span className="text-xs font-bold text-slate-600">
                  26 – 30 de outubro de 2026
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <button className="p-2 hover:bg-slate-50 text-slate-600">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 border-x border-slate-200">
                    Hoje
                  </button>
                  <button className="p-2 hover:bg-slate-50 text-slate-600">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setBookingStep(1);
                    setActiveTab('servicos');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  Novo agendamento
                </button>
              </div>
            </div>

            {/* Weekly Grid + Right Day Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Weekly Time Grid (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto">
                <div className="min-w-[640px]">
                  {/* Week Header */}
                  <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50/60">
                    <div className="p-3 text-center text-xs font-semibold text-slate-400 border-r border-slate-100">
                      Horário
                    </div>
                    {[
                      { label: 'Seg', num: 26 },
                      { label: 'Ter', num: 27 },
                      { label: 'Qua', num: 28 },
                      { label: 'Qui', num: 29 },
                      { label: 'Sex', num: 30 },
                    ].map((day) => {
                      const isActive = selectedDayNumber === day.num;
                      return (
                        <button
                          key={day.num}
                          onClick={() => setSelectedDayNumber(day.num)}
                          className={`p-3 text-center border-r border-slate-100 last:border-r-0 transition ${
                            isActive ? 'bg-blue-50/60' : 'hover:bg-slate-100/50'
                          }`}
                        >
                          <span className="block text-[11px] font-semibold text-slate-400">
                            {day.label}
                          </span>
                          <span
                            className={`inline-flex w-7 h-7 mt-0.5 rounded-full items-center justify-center text-sm font-extrabold ${
                              isActive ? 'bg-blue-600 text-white' : 'text-slate-800'
                            }`}
                          >
                            {day.num}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Time Rows */}
                  {[
                    '08:00',
                    '09:00',
                    '10:00',
                    '11:00',
                    '12:00',
                    '13:00',
                    '14:00',
                    '15:00',
                    '16:00',
                  ].map((hour) => (
                    <div key={hour} className="grid grid-cols-6 border-b border-slate-100 min-h-[68px]">
                      <div className="p-2 text-right pr-3 text-xs font-semibold text-slate-400 border-r border-slate-100">
                        {hour}
                      </div>

                      {/* Seg 26 */}
                      <div className="p-1 border-r border-slate-100 relative">
                        {hour === '08:00' && (
                          <div
                            onClick={() => setSelectedBookingDetail(bookings[0] || null)}
                            className="p-2 rounded-xl bg-amber-50 border-l-4 border-amber-500 text-amber-950 text-[11px] cursor-pointer hover:shadow-sm transition"
                          >
                            <p className="font-extrabold truncate">Aula Beach Tennis</p>
                            <p className="text-[10px] text-amber-700 truncate">Prof. Lucas Becker</p>
                          </div>
                        )}
                        {hour === '09:00' && (
                          <div
                            onClick={() => setSelectedBookingDetail(bookings[1] || null)}
                            className="p-2 rounded-xl bg-blue-50 border-l-4 border-blue-600 text-blue-950 text-[11px] cursor-pointer hover:shadow-sm transition"
                          >
                            <p className="font-extrabold truncate">Instalação de ar-condicionado</p>
                            <p className="text-[10px] text-blue-700 truncate">Carlos Mendes</p>
                          </div>
                        )}
                        {hour === '11:00' && (
                          <div
                            onClick={() => setSelectedBookingDetail(bookings[2] || null)}
                            className="p-2 rounded-xl bg-emerald-50 border-l-4 border-emerald-500 text-emerald-950 text-[11px] cursor-pointer hover:shadow-sm transition"
                          >
                            <p className="font-extrabold truncate">Revisão elétrica</p>
                            <p className="text-[10px] text-emerald-700 truncate">João Silva</p>
                          </div>
                        )}
                      </div>

                      {/* Ter 27 */}
                      <div className="p-1 border-r border-slate-100"></div>

                      {/* Qua 28 */}
                      <div className="p-1 border-r border-slate-100">
                        {hour === '14:00' && (
                          <div
                            onClick={() => setSelectedBookingDetail(bookings[3] || null)}
                            className="p-2 rounded-xl bg-blue-50 border-l-4 border-blue-500 text-blue-950 text-[11px] cursor-pointer hover:shadow-sm transition"
                          >
                            <p className="font-extrabold truncate">Manutenção de piscina</p>
                            <p className="text-[10px] text-blue-700 truncate">Equipe Aqua</p>
                          </div>
                        )}
                      </div>

                      {/* Qui 29 */}
                      <div className="p-1 border-r border-slate-100">
                        {hour === '11:00' && (
                          <div
                            onClick={() => setSelectedBookingDetail(bookings[4] || null)}
                            className="p-2 rounded-xl bg-purple-50 border-l-4 border-purple-500 text-purple-950 text-[11px] cursor-pointer hover:shadow-sm transition"
                          >
                            <p className="font-extrabold truncate">Limpeza técnica</p>
                            <p className="text-[10px] text-purple-700 truncate">Lara Santos</p>
                          </div>
                        )}
                      </div>

                      {/* Sex 30 */}
                      <div className="p-1"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel: Detalhes do dia (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Detalhes do dia</h2>
                  <p className="text-xs text-slate-500">{selectedDayNumber} de outubro de 2026</p>
                </div>

                <div className="space-y-3">
                  {activeBookings.map((booking) => {
                    const isConfirmed = booking.status === 'confirmado';
                    return (
                      <div
                        key={booking.id}
                        onClick={() => setSelectedBookingDetail(booking)}
                        className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/70 flex items-start gap-3 cursor-pointer transition"
                      >
                        <span className="text-xs font-extrabold text-slate-700 pt-1 w-11 shrink-0">
                          {booking.time}
                        </span>
                        <div className="w-1 self-stretch rounded-full bg-blue-600 shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-extrabold text-slate-900 truncate">
                            {booking.services[0]?.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{booking.tenantName}</p>
                          <span
                            className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isConfirmed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isConfirmed ? 'Confirmado' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            ABA 3: SERVIÇOS & NOVO AGENDAMENTO (3-Step Stepper from Bottom-Left)
           ------------------------------------------------------------------- */}
        {activeTab === 'servicos' && (
          <div className="space-y-6">
            {/* Header & 3-Step Indicator */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('inicio')}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-extrabold text-slate-900">Novo agendamento</h1>
              </div>

              {/* Stepper: 1 Serviço -> 2 Data e hora -> 3 Confirmação */}
              <div className="flex items-center gap-3 text-xs font-bold">
                <button
                  onClick={() => setBookingStep(1)}
                  className={`flex items-center gap-1.5 ${
                    bookingStep >= 1 ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center">
                    1
                  </span>
                  <span>Serviço</span>
                </button>
                <div className="w-6 h-0.5 bg-slate-200"></div>
                <button
                  onClick={() => selectedServiceItem && setBookingStep(2)}
                  className={`flex items-center gap-1.5 ${
                    bookingStep >= 2 ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${
                      bookingStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    2
                  </span>
                  <span>Data e hora</span>
                </button>
                <div className="w-6 h-0.5 bg-slate-200"></div>
                <span
                  className={`flex items-center gap-1.5 ${
                    bookingStep === 3 ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${
                      bookingStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    3
                  </span>
                  <span>Confirmação</span>
                </span>
              </div>
            </div>

            {/* 2-Column Split: Selecione o serviço (Left) | Detalhes do serviço (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Service Selection List (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
                <h2 className="text-sm font-extrabold text-slate-900">Selecione o serviço</h2>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder="Buscar serviço ou prestador..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {allServicesWithTenant.map((item) => {
                    const isSelected = selectedServiceItem?.service.id === item.service.id;
                    const Icon = getCategoryIcon(item.service.category);
                    return (
                      <button
                        key={item.service.id}
                        onClick={() => {
                          setSelectedServiceItem(item);
                          setBookingStep(1);
                        }}
                        className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-600 shadow-2xs'
                            : 'bg-white border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-slate-900 truncate">
                              {item.service.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {item.service.category || item.tenant.role} • {item.tenant.name}
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Detalhes do serviço & Stepper Action (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
                <h2 className="text-sm font-extrabold text-slate-900">Detalhes do serviço</h2>

                {selectedServiceItem ? (
                  <>
                    <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                            {(() => {
                              const Icon = getCategoryIcon(selectedServiceItem.service.category);
                              return <Icon className="w-6 h-6" />;
                            })()}
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900">
                              {selectedServiceItem.service.name}
                            </h3>
                            <span className="inline-block mt-0.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                              {selectedServiceItem.service.category || selectedServiceItem.tenant.role}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-black text-slate-900">
                            R$ {selectedServiceItem.service.price}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {selectedServiceItem.service.description ||
                          'Serviço realizado por profissional verificado com garantia de horário e confirmação automática.'}
                      </p>

                      <div className="pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>
                            Duração estimada: <strong>{selectedServiceItem.service.duration}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span>
                            Prestador: <strong>{selectedServiceItem.tenant.name}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 & 3: Escolher Data, Hora e Confirmar */}
                    {bookingStep >= 2 && (
                      <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-4">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-800">
                          Escolha a Data, Horário e Cliente
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Data</label>
                            <input
                              type="date"
                              value={newBookingDate}
                              onChange={(e) => setNewBookingDate(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Horário</label>
                            <select
                              value={newBookingTime}
                              onChange={(e) => setNewBookingTime(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                            >
                              <option value="08:00">08:00</option>
                              <option value="09:00">09:00</option>
                              <option value="10:00">10:00</option>
                              <option value="11:30">11:30</option>
                              <option value="14:00">14:00</option>
                              <option value="16:30">16:30</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Seu Nome</label>
                            <input
                              type="text"
                              value={newBookingClient}
                              onChange={(e) => setNewBookingClient(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">WhatsApp</label>
                            <input
                              type="text"
                              value={newBookingPhone}
                              onChange={(e) => setNewBookingPhone(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {bookingSuccessMsg && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Agendamento confirmado com sucesso! Redirecionando para a Agenda...
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3">
                      {bookingStep === 1 ? (
                        <button
                          onClick={() => setBookingStep(2)}
                          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition"
                        >
                          <span>Próximo</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setBookingStep(1)}
                            className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                          >
                            Voltar
                          </button>
                          <button
                            onClick={handleCreateNewBooking}
                            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirmar Agendamento</span>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">Selecione um serviço na lista ao lado.</p>
                )}
              </div>

            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            ABA 4: PRESTADORES (Directory from Bottom-Center-Right of Image)
           ------------------------------------------------------------------- */}
        {activeTab === 'prestadores' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Prestadores</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Profissionais e terceiros conectados ao seu AgendaFácil (1ª conta: Prof. Lucas Beach Tennis)
                </p>
              </div>

              <NextLink
                href="/onboarding"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition w-fit"
              >
                <Plus className="w-4 h-4" />
                Adicionar Prestador
              </NextLink>
            </div>

            {/* Search bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={providerSearch}
                  onChange={(e) => setProviderSearch(e.target.value)}
                  placeholder="Buscar prestador..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm outline-none focus:border-blue-600 shadow-2xs"
                />
              </div>
              <button className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Provider List matching image */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100">
              {filteredProviders.map((pro, idx) => (
                <div
                  key={pro.slug}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">
                      <Image src={pro.avatar} alt={pro.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900">{pro.name}</h3>
                        {pro.slug === 'lucas-beachtennis' && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            1ª Conta • Beach Tennis
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{pro.role}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs font-bold text-slate-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{pro.rating}</span>
                        <span className="text-slate-400 font-normal">({pro.reviews})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Ativo
                    </span>

                    <button
                      onClick={() => {
                        setSelectedChatSlug(pro.slug);
                        setActiveTab('chat');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>Chat</span>
                    </button>

                    <NextLink
                      href={`/${pro.slug}`}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>Página Pública</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </NextLink>

                    <button
                      onClick={() => {
                        if (pro.services[0]) {
                          setSelectedServiceItem({ service: pro.services[0], tenant: pro });
                          setBookingStep(1);
                          setActiveTab('servicos');
                        }
                      }}
                      className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            ABA 5: CLIENTES
           ------------------------------------------------------------------- */}
        {activeTab === 'clientes' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Clientes & Alunos</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Histórico de pessoas atendidas e agendamentos ativos
                </p>
              </div>
              <NextLink
                href="/explorar"
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition"
              >
                Ver Visão do Cliente
              </NextLink>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100">
              {bookings.map((b) => (
                <div key={b.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center">
                      {b.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">{b.clientName}</p>
                      <p className="text-xs text-slate-500">
                        {b.clientPhone} • Último serviço: <strong>{b.services[0]?.name}</strong> ({b.tenantName})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedChatSlug(b.tenantId);
                        setActiveTab('chat');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat Interno
                    </button>
                    <a
                      href={`https://wa.me/55${b.clientPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            ABA CHAT: CENTRAL DE MENSAGENS (12-Column Desktop Split Layout)
           ------------------------------------------------------------------- */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Chat & Mensagens</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Converse ao vivo com prestadores, professores e clientes dentro do AgendaFácil
                </p>
              </div>
              <NextLink
                href="/chat"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 w-fit"
              >
                <span>Abrir em Tela Cheia (/chat)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </NextLink>
            </div>

            <ChatWorkspace
              initialTenantSlug={selectedChatSlug}
              onUnreadChange={(count) => setChatUnreadCount(count)}
            />
          </div>
        )}

        {/* -------------------------------------------------------------------
            ABA 6: NOTIFICAÇÕES (12-Column Desktop Split Layout)
           ------------------------------------------------------------------- */}
        {activeTab === 'notificacoes' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('inicio')}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-xl font-extrabold text-slate-900">Notificações</h1>
                </div>

                {/* Filter Pills: Todas (3) | Agendamentos | Sistema */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNotifFilter('todas')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                      notifFilter === 'todas'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todas ({notifications.length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('agendamento')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                      notifFilter === 'agendamento'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Agendamentos
                  </button>
                  <button
                    onClick={() => setNotifFilter('sistema')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                      notifFilter === 'sistema'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Sistema
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setActiveTab('agenda')}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-4 cursor-pointer hover:border-blue-300 transition"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          n.type === 'agendamento'
                            ? 'bg-blue-50 text-blue-600'
                            : n.type === 'lembrete'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {n.type === 'agendamento' ? (
                          <Calendar className="w-5 h-5" />
                        ) : n.type === 'lembrete' ? (
                          <Bell className="w-5 h-5" />
                        ) : (
                          <UserCheck className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">{n.title}</h3>
                        <p className="text-xs text-slate-600 mt-0.5">{n.description}</p>
                        <span className="block text-[11px] text-slate-400 mt-1">{n.timeLabel}</span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right 4 Columns: Alert Settings on Desktop */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
              <h2 className="text-base font-extrabold text-slate-900">Canais de Alerta Ativos</h2>
              <p className="text-xs text-slate-500">
                Receba avisos imediatos sempre que um cliente ou prestador atualizar um serviço.
              </p>
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">WhatsApp Automático</span>
                  <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    ATIVO
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">Push no Navegador (PC/PWA)</span>
                  <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    ATIVO
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            ABA 7: CONFIGURAÇÕES & CARD PWA
           ------------------------------------------------------------------- */}
        {activeTab === 'configuracoes' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Configurações da Conta & Planos</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gerencie seu perfil, link da primeira conta (Beach Tennis) e sua assinatura SaaS
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                    Seu Plano Atual
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    Plano Pro + WhatsApp (R$ 19,90/mês)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Clientes agendam de graça (R$ 0) • Você tem plano Normal Grátis ou Pro R$ 19,90
                  </p>
                </div>
                <NextLink
                  href="/planos"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                >
                  Ver Planos
                </NextLink>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Link Público da Primeira Conta (Prof. Lucas - Beach Tennis)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="agendafacil.com/lucas-beachtennis"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700"
                  />
                  <NextLink
                    href="/lucas-beachtennis"
                    className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                  >
                    Testar Página
                  </NextLink>
                </div>
              </div>
            </div>

            {/* Dark Navy PWA Card from Bottom-Right of the Image */}
            <div className="lg:col-span-5 bg-[#0B132B] text-white rounded-3xl p-8 text-center shadow-xl relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Agenda<span className="text-blue-400">Fácil</span>
              </h2>
              <p className="mt-3 text-lg font-bold text-slate-100">
                Seu tempo bem agendado.
              </p>

              <button
                onClick={() => window.dispatchEvent(new Event('open-pwa-install'))}
                className="mt-6 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition"
              >
                Instalar app
              </button>

              <p className="mt-4 text-xs text-slate-400">Disponível no seu navegador</p>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-4 text-xs font-extrabold text-slate-300">
                <span className="tracking-widest">PWA</span>
                <span>•</span>
                <span>iOS</span>
                <span>•</span>
                <span>Android</span>
                <span>•</span>
                <span>Web</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* =====================================================================
          MODAL: "DETALHES DO SERVIÇO" (Identical to Bottom-2nd Card of Image)
         ===================================================================== */}
      {selectedBookingDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5">
            {/* Top header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <button
                onClick={() => setSelectedBookingDetail(null)}
                className="flex items-center gap-2 text-sm font-extrabold text-slate-900 hover:text-blue-600"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Detalhes do serviço</span>
              </button>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    selectedBookingDetail.status === 'confirmado'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {selectedBookingDetail.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                </span>
                <button
                  onClick={() => setSelectedBookingDetail(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Service & Provider Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {selectedBookingDetail.services[0]?.name}
                </h3>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={selectedBookingDetail.tenantAvatar}
                    alt={selectedBookingDetail.tenantName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    {selectedBookingDetail.tenantName}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-blue-600" />
                    {selectedBookingDetail.tenantPhone || '(11) 98765-4321'}
                  </p>
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {selectedBookingDetail.tenantRating || 4.8}{' '}
                    <span className="text-slate-400 font-normal">
                      ({selectedBookingDetail.tenantReviews || 124} avaliações)
                    </span>
                  </p>
                </div>
              </div>

              {/* Date, Address, Description */}
              <div className="space-y-3 text-xs text-slate-700 pt-1">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">{selectedBookingDetail.formattedDate}</p>
                    <p className="text-slate-500">
                      {selectedBookingDetail.time} – {selectedBookingDetail.endTime || '11:00'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="font-medium text-slate-700">{selectedBookingDetail.address}</p>
                </div>

                <div className="flex items-start gap-3">
                  <Wrench className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-slate-600">
                    {selectedBookingDetail.notes || selectedBookingDetail.services[0]?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons: Cancelar | Ver contato */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleCancelBooking(selectedBookingDetail.id)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
              >
                Cancelar
              </button>
              <a
                href={`https://wa.me/55${(selectedBookingDetail.tenantPhone || '11987654321').replace(
                  /\D/g,
                  ''
                )}?text=Olá%20${encodeURIComponent(
                  selectedBookingDetail.tenantName
                )},%20sobre%20o%20agendamento%20de%20${encodeURIComponent(
                  selectedBookingDetail.services[0]?.name || ''
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center shadow-md shadow-blue-600/20 transition"
              >
                Ver contato
              </a>
            </div>
          </div>
        </div>
      )}
    </AppSidebar>
  );
}

export default function SaaSDashboardApp() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Carregando painel...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
