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
  Plus,
  Wrench,
  Bell,
  Settings,
  Search,
  MapPin,
  Phone,
  X,
  Check,
  MessageSquare,
  ClipboardList,
  DollarSign,
  User,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import {
  getStoredTenants,
  getStoredBookings,
  saveNewBooking,
  updateBookingStatus,
  saveTenant,
} from '@/lib/store';
import { INITIAL_NOTIFICATIONS } from '@/lib/data';
import { Tenant, Booking, Service, AppNotification } from '@/lib/types';
import ChatWorkspace from '@/components/chat/ChatWorkspace';
import ProviderStoriesBar from '@/components/stories/ProviderStoriesBar';
import AppSidebar, { DashboardTabId } from '@/components/layout/AppSidebar';

function DashboardContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<DashboardTabId>('inicio');
  const [tenants, setTenants] = useState<Record<string, Tenant>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [chatUnreadCount, setChatUnreadCount] = useState<number>(2);

  // Provider Account Filter ("lucas-beachtennis" by default, or "todos" to see all)
  const [selectedProviderSlug, setSelectedProviderSlug] = useState<string>('lucas-beachtennis');
  const [whenFilter, setWhenFilter] = useState<'todos' | 'hoje' | 'proximos' | 'pendentes'>('todos');
  const [clientSearch, setClientSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Manual Booking Modal for Provider ("Encaixar Cliente na Agenda")
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualClientName, setManualClientName] = useState('');
  const [manualClientPhone, setManualClientPhone] = useState('');
  const [manualDate, setManualDate] = useState('2026-10-26');
  const [manualTime, setManualTime] = useState('16:00');
  const [manualServiceId, setManualServiceId] = useState('');

  // New Service Form inside "Meus Serviços"
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('1h');

  useEffect(() => {
    const tabParam = searchParams.get('tab') as DashboardTabId | null;
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
    setTenants(getStoredTenants());
    setBookings(getStoredBookings());
  }, []);

  const currentProvider: Tenant | undefined = useMemo(() => {
    if (selectedProviderSlug === 'todos') {
      return tenants['lucas-beachtennis'] || Object.values(tenants)[0];
    }
    return tenants[selectedProviderSlug] || tenants['lucas-beachtennis'];
  }, [tenants, selectedProviderSlug]);

  // Filter bookings belonging to the active provider (or all if 'todos')
  const providerBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        if (selectedProviderSlug !== 'todos' && b.tenantId !== selectedProviderSlug) {
          return false;
        }
        if (whenFilter === 'hoje' && b.date !== '2026-10-26') return false;
        if (whenFilter === 'proximos' && b.date === '2026-10-26') return false;
        if (whenFilter === 'pendentes' && b.status !== 'pendente') return false;

        if (clientSearch.trim()) {
          const q = clientSearch.toLowerCase();
          const matchClient = b.clientName.toLowerCase().includes(q);
          const matchService = (b.services[0]?.name || '').toLowerCase().includes(q);
          const matchPhone = b.clientPhone.toLowerCase().includes(q);
          return matchClient || matchService || matchPhone;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
  }, [bookings, selectedProviderSlug, whenFilter, clientSearch]);

  // Provider KPIs
  const allProviderBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.status !== 'cancelado' &&
        (selectedProviderSlug === 'todos' || b.tenantId === selectedProviderSlug)
    );
  }, [bookings, selectedProviderSlug]);

  const todayBookingsCount = useMemo(
    () => allProviderBookings.filter((b) => b.date === '2026-10-26').length,
    [allProviderBookings]
  );

  const expectedRevenue = useMemo(
    () => allProviderBookings.reduce((sum, b) => sum + b.totalPrice, 0),
    [allProviderBookings]
  );

  const confirmedCount = useMemo(
    () => allProviderBookings.filter((b) => b.status === 'confirmado').length,
    [allProviderBookings]
  );

  const pendingCount = useMemo(
    () => allProviderBookings.filter((b) => b.status === 'pendente').length,
    [allProviderBookings]
  );

  const handleConfirmBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'confirmado');
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'confirmado' } : b))
    );
  };

  const handleCompleteBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'concluido');
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'concluido' } : b))
    );
  };

  const handleCancelBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'cancelado');
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelado' } : b))
    );
  };

  const handleCopyPublicLink = () => {
    const slug = currentProvider?.slug || 'lucas-beachtennis';
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCreateManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProvider || !manualClientName.trim()) return;
    const chosenService =
      currentProvider.services.find((s) => s.id === manualServiceId) ||
      currentProvider.services[0];
    if (!chosenService) return;

    const created: Booking = {
      id: `b-manual-${Date.now()}`,
      tenantId: currentProvider.slug,
      tenantName: currentProvider.name,
      tenantRole: currentProvider.role,
      tenantAvatar: currentProvider.avatar,
      tenantPhone: currentProvider.phone,
      tenantRating: currentProvider.rating,
      tenantReviews: currentProvider.reviews,
      clientName: manualClientName,
      clientPhone: manualClientPhone || '(11) 99999-0000',
      services: [
        {
          id: chosenService.id,
          name: chosenService.name,
          price: chosenService.price,
          duration: chosenService.duration,
        },
      ],
      totalPrice: chosenService.price,
      date: manualDate,
      dayOfWeek: 1,
      formattedDate: manualDate === '2026-10-26' ? '26 de outubro de 2026' : manualDate,
      time: manualTime,
      endTime: '17:00',
      color: 'blue',
      status: 'confirmado',
      address: currentProvider.address,
      notes: 'Cliente encaixado manualmente pelo prestador.',
      createdAt: new Date().toISOString(),
    };

    saveNewBooking(created);
    setBookings((prev) => [created, ...prev]);
    setManualClientName('');
    setManualClientPhone('');
    setShowManualModal(false);
  };

  const handleAddServiceToCatalog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProvider || !newServiceName.trim() || !newServicePrice) return;
    const newServ: Service = {
      id: `srv-${Date.now()}`,
      tenantId: currentProvider.slug,
      name: newServiceName,
      price: Number(newServicePrice),
      duration: newServiceDuration,
      durationMinutes: 60,
      description: 'Serviço com preço tabelado e agendamento imediato.',
    };

    const updatedProvider: Tenant = {
      ...currentProvider,
      services: [...currentProvider.services, newServ],
    };

    saveTenant(updatedProvider);
    setTenants((prev) => ({ ...prev, [updatedProvider.slug]: updatedProvider }));
    setNewServiceName('');
    setNewServicePrice('');
  };

  const providerTabs: Array<{ id: DashboardTabId; label: string; icon: any }> = [
    { id: 'inicio', label: 'Quem Agendou', icon: ClipboardList },
    { id: 'agenda', label: 'Minha Agenda', icon: Calendar },
    { id: 'servicos', label: 'Meus Serviços', icon: Wrench },
    { id: 'clientes', label: 'Meus Clientes', icon: Users },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'configuracoes', label: 'Horários', icon: Settings },
  ];

  return (
    <AppSidebar
      activeDashboardTab={activeTab}
      onSelectDashboardTab={setActiveTab}
      chatUnreadCount={chatUnreadCount}
      notificationsCount={notifications.length}
    >
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-28 lg:pb-10 w-full max-w-[1440px] mx-auto space-y-5">
        {/* ===================================================================
            1. CABEÇALHO DO PRESTADOR + SELETOR DE CONTA PROFISSIONAL
           =================================================================== */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              {currentProvider && (
                <div className="relative w-13 h-13 rounded-2xl overflow-hidden border-2 border-blue-500 shrink-0">
                  <Image
                    src={currentProvider.avatar}
                    alt={currentProvider.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                    Painel do Prestador
                  </span>
                  <span className="text-xs text-slate-400">
                    Controle de quem agendou e horários
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {selectedProviderSlug === 'todos'
                    ? 'Visão Geral — Todos os Prestadores'
                    : `${currentProvider?.name} (${currentProvider?.role})`}
                </h1>
              </div>
            </div>

            {/* Provider Account Switcher + Add Manual Booking */}
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={selectedProviderSlug}
                onChange={(e) => setSelectedProviderSlug(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-extrabold outline-none focus:border-blue-500"
              >
                <option value="lucas-beachtennis">
                  Ver como: Prof. Lucas Becker (Beach Tennis)
                </option>
                <option value="carlos-mendes">
                  Ver como: Carlos Mendes (Climatização)
                </option>
                <option value="joao-silva">Ver como: João Silva (Elétrica)</option>
                <option value="equipe-aqua">Ver como: Equipe Aqua (Piscina)</option>
                <option value="lara-santos">Ver como: Lara Santos (Limpeza)</option>
                <option value="todos">Ver Todos os Prestadores Juntos</option>
              </select>

              <button
                type="button"
                onClick={() => setShowManualModal(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Encaixar Cliente</span>
              </button>
            </div>
          </div>

          {/* Public Link Bar for the Provider */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-slate-400">Link da sua agenda para enviar aos clientes:</span>
              <strong className="text-blue-400">
                agendafacil.app/{currentProvider?.slug || 'lucas-beachtennis'}
              </strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPublicLink}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 transition"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Link Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-blue-400" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
              <NextLink
                href={`/${currentProvider?.slug || 'lucas-beachtennis'}`}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition"
              >
                <span>Abrir Página como Cliente</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              </NextLink>
            </div>
          </div>
        </div>

        {/* ===================================================================
            2. NAVEGAÇÃO RÁPIDA ENTRE ABAS DO PRESTADOR
           =================================================================== */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {providerTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center gap-2 shrink-0 transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ===================================================================
            ABA 1: QUEM AGENDOU E QUANDO SERÁ O SERVIÇO (PAINEL PRINCIPAL)
           =================================================================== */}
        {activeTab === 'inicio' && (
          <div className="space-y-5">
            {/* 4 KPI Cards (2x2 on Mobile, 4 Cols on Desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500">
                    Para Hoje (26 Out)
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    {todayBookingsCount} {todayBookingsCount === 1 ? 'serviço' : 'serviços'}
                  </p>
                  <p className="text-[10px] text-slate-400">Na sua agenda de hoje</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500">
                    Total Agendado
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    R$ {expectedRevenue}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Em {allProviderBookings.length} agendamentos
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500">
                    Confirmados
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    {confirmedCount}
                  </p>
                  <p className="text-[10px] text-slate-400">Presença garantida</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500">
                    Aguardando Você
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    {pendingCount}
                  </p>
                  <p className="text-[10px] text-slate-400">Pendentes de confirmação</p>
                </div>
              </div>
            </div>

            {/* MAIN TABLE / CARDS: QUEM AGENDOU E QUANDO SERÁ O SERVIÇO */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Quem Agendou e Quando Será o Serviço ({providerBookings.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lista organizada por data e horário com nome do cliente, serviço contratado e botões de confirmação
                  </p>
                </div>

                {/* Filter Pills: Hoje, Todos, Pendentes */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'todos', label: 'Todos os Horários' },
                    { id: 'hoje', label: 'Hoje (26 Out)' },
                    { id: 'proximos', label: 'Próximos Dias' },
                    { id: 'pendentes', label: `Pendentes (${pendingCount})` },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setWhenFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                        whenFilter === f.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search by Client Name or Phone */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Buscar por nome do cliente, telefone ou serviço agendado..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Booking Cards List */}
              {providerBookings.length === 0 ? (
                <div className="p-8 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-sm font-extrabold text-slate-700">
                    Nenhum agendamento encontrado neste filtro.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setWhenFilter('todos');
                      setClientSearch('');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold"
                  >
                    Mostrar Todos os Agendamentos
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {providerBookings.map((booking) => {
                    const isToday = booking.date === '2026-10-26';
                    return (
                      <div
                        key={booking.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                          booking.status === 'cancelado'
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : booking.status === 'pendente'
                            ? 'bg-amber-50/40 border-amber-300'
                            : 'bg-white border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {/* LEFT: QUANDO SERÁ O SERVIÇO + QUEM AGENDOU */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
                          {/* WHEN BADGE BOX */}
                          <div className="px-4 py-3 rounded-2xl bg-slate-900 text-white text-center shrink-0 sm:w-36">
                            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
                              {isToday ? 'HOJE • 26 OUT' : booking.formattedDate}
                            </span>
                            <span className="block text-lg font-black text-white mt-0.5">
                              {booking.time}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              até {booking.endTime}
                            </span>
                          </div>

                          {/* WHO BOOKED & WHAT SERVICE */}
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-extrabold text-slate-400 uppercase">
                                Cliente:
                              </span>
                              <h3 className="text-base font-extrabold text-slate-900">
                                {booking.clientName}
                              </h3>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  booking.status === 'confirmado'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : booking.status === 'pendente'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : booking.status === 'concluido'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {booking.status === 'pendente'
                                  ? 'Aguardando Confirmação'
                                  : booking.status}
                              </span>
                            </div>

                            {/* Service Name & Price */}
                            <p className="text-xs sm:text-sm font-extrabold text-blue-600">
                              Serviço: {booking.services.map((s) => s.name).join(' + ')} —{' '}
                              <span className="text-slate-900">R$ {booking.totalPrice}</span>
                            </p>

                            {/* Phone & Address */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5">
                              <span className="flex items-center gap-1 font-semibold">
                                <Phone className="w-3.5 h-3.5 text-blue-600" />
                                {booking.clientPhone}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {booking.address}
                              </span>
                              {selectedProviderSlug === 'todos' && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                                  Profissional: {booking.tenantName}
                                </span>
                              )}
                            </div>

                            {booking.notes && (
                              <p className="text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 mt-1">
                                Obs: {booking.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* RIGHT: DIRECT PROVIDER ACTIONS */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          {booking.status === 'pendente' && (
                            <button
                              type="button"
                              onClick={() => handleConfirmBooking(booking.id)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirmar</span>
                            </button>
                          )}

                          {booking.status === 'confirmado' && (
                            <button
                              type="button"
                              onClick={() => handleCompleteBooking(booking.id)}
                              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Concluir</span>
                            </button>
                          )}

                          <a
                            href={`https://wa.me/55${booking.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Olá ${booking.clientName}, aqui é ${booking.tenantName} sobre seu agendamento de ${booking.services[0]?.name} no dia ${booking.formattedDate} às ${booking.time}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-1.5 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                            <span>Chamar Cliente</span>
                          </a>

                          {booking.status !== 'cancelado' && (
                            <button
                              type="button"
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Provider Stories Section (Post work updates) */}
            <ProviderStoriesBar highlightSlug={currentProvider?.slug} />
          </div>
        )}

        {/* ===================================================================
            ABA 2: MINHA AGENDA POR HORÁRIOS DO DIA
           =================================================================== */}
        {activeTab === 'agenda' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Grade de Horários do Dia — Segunda, 26 de Outubro
                </h2>
                <p className="text-xs text-slate-500">
                  Veja rapidamente quais horários estão ocupados por clientes e quais estão livres
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 w-fit"
              >
                <Plus className="w-4 h-4" />
                <span>Encaixar Cliente em Horário</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {['08:00', '09:00', '10:00', '11:30', '14:00', '15:00', '16:00', '18:00'].map(
                (slotTime) => {
                  const found = allProviderBookings.find(
                    (b) => b.date === '2026-10-26' && b.time === slotTime
                  );
                  return (
                    <div
                      key={slotTime}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        found
                          ? 'bg-blue-50/50 border-blue-200'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-sm font-black w-20 text-center shrink-0">
                          {slotTime}
                        </span>
                        {found ? (
                          <div>
                            <p className="text-sm font-extrabold text-slate-900">
                              {found.clientName}{' '}
                              <span className="text-xs font-bold text-blue-600">
                                ({found.services[0]?.name})
                              </span>
                            </p>
                            <p className="text-xs text-slate-500">
                              Tel: {found.clientPhone} • Local: {found.address}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-bold text-emerald-700">Horário Livre</p>
                            <p className="text-xs text-slate-400">
                              Disponível para clientes agendarem online
                            </p>
                          </div>
                        )}
                      </div>

                      {found ? (
                        <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-extrabold w-fit">
                          R$ {found.totalPrice} • {found.status}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setManualTime(slotTime);
                            setShowManualModal(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-blue-600 text-xs font-extrabold text-slate-700 w-fit"
                        >
                          + Reservar este horário
                        </button>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 3: MEUS SERVIÇOS E PREÇOS TABELADOS
           =================================================================== */}
        {(activeTab === 'servicos' || activeTab === 'prestadores') && currentProvider && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Catálogo de Serviços de {currentProvider.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Estes são os preços fixos que seus clientes veem ao agendar com você
                </p>
              </div>

              <div className="space-y-3">
                {currentProvider.services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">{srv.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Duração média: {srv.duration}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-blue-600">R$ {srv.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 space-y-4 h-fit">
              <h3 className="text-base font-extrabold text-slate-900">
                Adicionar Novo Serviço na Minha Agenda
              </h3>
              <form onSubmit={handleAddServiceToCatalog} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nome do Trabalho / Aula
                  </label>
                  <input
                    type="text"
                    required
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="Ex: Aula Experimental ou Visita Técnica"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Preço Tabelado (R$)
                    </label>
                    <input
                      type="number"
                      required
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      placeholder="120"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Duração</label>
                    <input
                      type="text"
                      value={newServiceDuration}
                      onChange={(e) => setNewServiceDuration(e.target.value)}
                      placeholder="1h"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold transition"
                >
                  Salvar Serviço no Catálogo
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 4: MEUS CLIENTES (PESSOAS QUE AGENDARAM)
           =================================================================== */}
        {activeTab === 'clientes' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Meus Clientes Cadastrados ({allProviderBookings.length})
              </h2>
              <p className="text-xs text-slate-500">
                Todos os clientes que agendaram horários e serviços com você
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProviderBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl border border-slate-200 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                        {b.clientName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">{b.clientName}</p>
                        <p className="text-xs text-slate-500">{b.clientPhone}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900">R$ {b.totalPrice}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 text-xs space-y-0.5">
                    <p className="font-bold text-slate-800">{b.services[0]?.name}</p>
                    <p className="text-slate-500">
                      Quando: {b.formattedDate} às {b.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 5: CHAT COM CLIENTES
           =================================================================== */}
        {activeTab === 'chat' && (
          <ChatWorkspace
            initialTenantSlug={currentProvider?.slug}
            onUnreadChange={(c) => setChatUnreadCount(c)}
          />
        )}

        {/* ===================================================================
            ABA 6 & 7: NOTIFICAÇÕES & CONFIGURAÇÕES DE HORÁRIO
           =================================================================== */}
        {(activeTab === 'notificacoes' || activeTab === 'configuracoes') && currentProvider && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              Configuração de Atendimento — {currentProvider.name}
            </h2>
            <p className="text-xs text-slate-500">
              Endereço de atendimento: {currentProvider.address} • Telefone: {currentProvider.phone}
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <p className="font-extrabold text-slate-800">
                Horários abertos para agendamento automático:
              </p>
              <p className="text-slate-600">
                Segunda a Sábado — 08:00 às 19:00 (Intervalo de almoço 12:00 às 13:30)
              </p>
            </div>
          </div>
        )}
      </main>

      {/* MODAL PARA O PRESTADOR ENCAIXAR CLIENTE MANUALMENTE */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Encaixar Cliente na Agenda
              </h3>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  value={manualClientName}
                  onChange={(e) => setManualClientName(e.target.value)}
                  placeholder="Ex: Rodrigo Nunes"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  WhatsApp do Cliente
                </label>
                <input
                  type="text"
                  value={manualClientPhone}
                  onChange={(e) => setManualClientPhone(e.target.value)}
                  placeholder="(11) 99999-8888"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horário</label>
                  <select
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    {['08:00', '09:00', '10:00', '11:30', '14:00', '15:00', '16:00', '18:00'].map(
                      (t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {currentProvider && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Serviço</label>
                  <select
                    value={manualServiceId}
                    onChange={(e) => setManualServiceId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    {currentProvider.services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — R$ {s.price}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold transition"
              >
                Confirmar Agendamento na Minha Agenda
              </button>
            </form>
          </div>
        </div>
      )}
    </AppSidebar>
  );
}

export default function SaaSDashboardApp() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-500">
          Carregando painel do prestador...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
