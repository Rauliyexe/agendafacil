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
  Search,
  MapPin,
  Phone,
  X,
  Check,
  MessageSquare,
  ClipboardList,
  DollarSign,
  QrCode,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import {
  getStoredTenants,
  getStoredBookings,
  saveNewBooking,
  updateBookingStatus,
  saveTenant,
  syncWithSupabase,
  getActiveTenantSlug,
  getPublicDomain,
  getPublicUrl,
} from '@/lib/store';
import { saveTenantToSupabase } from '@/lib/supabase/api';
import { INITIAL_NOTIFICATIONS } from '@/lib/data';
import { Tenant, Booking, Service, AppNotification } from '@/lib/types';
import { generatePixBRCode } from '@/lib/pix';
import PixPaymentModal, { PixQrCodeSvg } from '@/components/pix/PixPaymentModal';
import ChatWorkspace from '@/components/chat/ChatWorkspace';
import AppSidebar, { DashboardTabId } from '@/components/layout/AppSidebar';
import { useSession, RequireRole } from '@/lib/auth';

function getTodayIso(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getTodayFormatted(): string {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const session = useSession();
  const todayIso = useMemo(() => getTodayIso(), []);
  const todayFormatted = useMemo(() => getTodayFormatted(), []);

  const [activeTab, setActiveTab] = useState<DashboardTabId>('inicio');
  const [tenants, setTenants] = useState<Record<string, Tenant>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [chatUnreadCount, setChatUnreadCount] = useState<number>(0);

  const [whenFilter, setWhenFilter] = useState<'todos' | 'hoje' | 'proximos' | 'pendentes'>('todos');
  const [clientSearch, setClientSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Manual Booking Modal for Provider ("Encaixar Cliente na Agenda")
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualClientName, setManualClientName] = useState('');
  const [manualClientPhone, setManualClientPhone] = useState('');
  const [manualDate, setManualDate] = useState(() => getTodayIso());
  const [manualTime, setManualTime] = useState('16:00');
  const [manualServiceId, setManualServiceId] = useState('');

  // New Service Form inside "Meus Serviços"
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('1h');

  // Pix & Stripe Settings State for Active Provider
  const [pixKeyInput, setPixKeyInput] = useState('');
  const [pixKeyTypeInput, setPixKeyTypeInput] = useState<
    'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria'
  >('telefone');
  const [pixBeneficiaryInput, setPixBeneficiaryInput] = useState('');
  const [acceptStripeInput, setAcceptStripeInput] = useState(true);
  const [pixTestAmount, setPixTestAmount] = useState(90);
  const [pixSavedMsg, setPixSavedMsg] = useState(false);
  const [copiedTestPix, setCopiedTestPix] = useState(false);

  // Active Booking for QR Code Modal
  const [pixModalBooking, setPixModalBooking] = useState<Booking | null>(null);

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

  const [supabaseSyncing, setSupabaseSyncing] = useState(false);

  useEffect(() => {
    setTenants(getStoredTenants());
    setBookings(getStoredBookings());

    syncWithSupabase().then((res) => {
      if (res.synced) {
        setTenants(getStoredTenants());
        setBookings(getStoredBookings());
      }
    });

    const handleSync = () => {
      setTenants(getStoredTenants());
      setBookings(getStoredBookings());
    };
    window.addEventListener('agendafacil-data-synced', handleSync);
    return () => window.removeEventListener('agendafacil-data-synced', handleSync);
  }, []);

  const handleManualSupabaseSync = async () => {
    setSupabaseSyncing(true);
    const res = await syncWithSupabase();
    setSupabaseSyncing(false);
    if (res.synced) {
      setTenants(getStoredTenants());
      setBookings(getStoredBookings());
    }
  };

  const currentProvider: Tenant | undefined = useMemo(() => {
    const list = Object.values(tenants);
    if (list.length === 0) return undefined;

    if (session.tenantSlug && tenants[session.tenantSlug]) {
      return tenants[session.tenantSlug];
    }
    if (session.userId) {
      const match = list.find((t) => t.userId === session.userId);
      if (match) return match;
    }
    if (session.phone) {
      const cleanPhone = session.phone.replace(/\D/g, '');
      if (cleanPhone) {
        const matchPhone = list.find((t) => t.phone?.replace(/\D/g, '') === cleanPhone);
        if (matchPhone) return matchPhone;
      }
    }
    const activeSlug = getActiveTenantSlug();
    if (activeSlug && tenants[activeSlug]) {
      return tenants[activeSlug];
    }
    return list[0];
  }, [tenants, session]);

  useEffect(() => {
    if (currentProvider) {
      setPixKeyInput(currentProvider.pixKey || currentProvider.phone || '');
      setPixKeyTypeInput(currentProvider.pixKeyType || 'telefone');
      setPixBeneficiaryInput(
        currentProvider.pixBeneficiary || currentProvider.name.toUpperCase()
      );
      setAcceptStripeInput(currentProvider.acceptStripeCard ?? true);
      setPixTestAmount(currentProvider.services[0]?.price || 90);
    }
  }, [currentProvider]);

  const handleSavePixSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProvider) return;
    const updated: Tenant = {
      ...currentProvider,
      pixKey: pixKeyInput,
      pixKeyType: pixKeyTypeInput,
      pixBeneficiary: pixBeneficiaryInput,
      acceptStripeCard: acceptStripeInput,
    };
    saveTenant(updated);
    setTenants((prev) => ({ ...prev, [updated.slug]: updated }));
    await saveTenantToSupabase(updated);
    setPixSavedMsg(true);
    setTimeout(() => setPixSavedMsg(false), 2500);
  };

  const livePreviewBrCode = useMemo(
    () =>
      generatePixBRCode({
        pixKey: pixKeyInput || currentProvider?.pixKey || 'pix@profissional.com',
        pixKeyType: pixKeyTypeInput,
        merchantName: pixBeneficiaryInput || currentProvider?.name || 'PRESTADOR',
        merchantCity: 'SAO PAULO',
        amount: Number(pixTestAmount) || 90,
        description: currentProvider?.services[0]?.name || 'SERVICO',
      }),
    [pixKeyInput, pixKeyTypeInput, pixBeneficiaryInput, pixTestAmount, currentProvider]
  );

  // Filtra agendamentos pertencentes unicamente a este prestador
  const providerBookings = useMemo(() => {
    if (!currentProvider) return [];
    return bookings
      .filter((b) => {
        if (b.tenantId !== currentProvider.slug) {
          return false;
        }
        if (whenFilter === 'hoje' && b.date !== todayIso) return false;
        if (whenFilter === 'proximos' && b.date <= todayIso) return false;
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
  }, [bookings, currentProvider, whenFilter, clientSearch, todayIso]);

  // Provider KPIs
  const allProviderBookings = useMemo(() => {
    if (!currentProvider) return [];
    return bookings.filter(
      (b) => b.status !== 'cancelado' && b.tenantId === currentProvider.slug
    );
  }, [bookings, currentProvider]);

  const todayBookingsCount = useMemo(
    () => allProviderBookings.filter((b) => b.date === todayIso).length,
    [allProviderBookings, todayIso]
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
    if (!currentProvider) return;
    const url = getPublicUrl(currentProvider.slug);
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
      clientPhone: manualClientPhone || '',
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
      formattedDate: manualDate === todayIso ? todayFormatted : manualDate,
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

  const handleAddServiceToCatalog = async (e: React.FormEvent) => {
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
    await saveTenantToSupabase(updatedProvider);
    setNewServiceName('');
    setNewServicePrice('');
  };

  const providerTabs: Array<{ id: DashboardTabId; label: string; icon: any }> = [
    { id: 'inicio', label: 'Visão Geral', icon: ClipboardList },
    { id: 'agenda', label: 'Minha Agenda', icon: Calendar },
    { id: 'servicos', label: 'Meus Serviços', icon: Wrench },
    { id: 'clientes', label: 'Meus Clientes', icon: Users },
    { id: 'chat', label: 'Mensagens', icon: MessageSquare },
    { id: 'configuracoes', label: 'Pix e Recebimentos', icon: QrCode },
  ];

  return (
    <AppSidebar
      activeDashboardTab={activeTab}
      onSelectDashboardTab={setActiveTab}
      chatUnreadCount={chatUnreadCount}
      notificationsCount={notifications.length}
    >
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-10 w-full max-w-[1440px] mx-auto space-y-6">
        {/* ===================================================================
            1. CABEÇALHO DO PRESTADOR
           =================================================================== */}
        <div className="bg-[#0B132B] text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              {currentProvider && (
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-700 shrink-0 bg-slate-800">
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
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 text-[10px] font-extrabold uppercase tracking-wider">
                    Painel Profissional
                  </span>
                  <span className="text-xs text-slate-400">
                    Gestão de clientes, horários e recebimentos
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {currentProvider?.name || session.name || 'Seu Painel de Prestador'}
                </h1>
                {currentProvider?.role && (
                  <p className="text-xs text-slate-300 mt-0.5">{currentProvider.role}</p>
                )}
              </div>
            </div>

            {/* Provider Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleManualSupabaseSync}
                disabled={supabaseSyncing}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
                title="Atualizar dados da nuvem"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${supabaseSyncing ? 'animate-spin' : ''}`} />
                <span>{supabaseSyncing ? 'Sincronizando...' : 'Atualizar'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowManualModal(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Encaixar Cliente</span>
              </button>
            </div>
          </div>

          {/* Public Link Bar for the Provider */}
          <div className="pt-4 border-t border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300 min-w-0">
              <span className="text-slate-400 shrink-0">Link público da sua agenda:</span>
              <strong className="text-cyan-400 font-mono truncate">
                {getPublicDomain()}/{currentProvider?.slug || 'sua-agenda'}
              </strong>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {currentProvider ? (
                <>
                  <button
                    type="button"
                    onClick={handleCopyPublicLink}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 transition"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>
                  <NextLink
                    href={`/${currentProvider.slug}`}
                    target="_blank"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition"
                  >
                    <span>Ver Página Pública</span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  </NextLink>
                </>
              ) : (
                <NextLink
                  href="/cadastro?role=prestador"
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition"
                >
                  <span>Configurar Minha Agenda</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </NextLink>
              )}
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
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center gap-2 shrink-0 transition ${
                  isActive
                    ? 'bg-[#0B132B] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ===================================================================
            ABA 1: VISÃO GERAL & QUEM AGENDOU
           =================================================================== */}
        {activeTab === 'inicio' && (
          <div className="space-y-6">
            {/* 4 KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500">
                    Para Hoje
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    {todayBookingsCount} {todayBookingsCount === 1 ? 'serviço' : 'serviços'}
                  </p>
                  <p className="text-[10px] text-slate-400">Agendados para hoje</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500">
                    Receita Prevista
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
                  <p className="text-[10px] text-slate-400">Presença confirmada</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500">
                    Pendentes
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    {pendingCount}
                  </p>
                  <p className="text-[10px] text-slate-400">Aguardando confirmação</p>
                </div>
              </div>
            </div>

            {/* MAIN TABLE / CARDS: QUEM AGENDOU */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-2xs space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Agendamentos Recebidos ({providerBookings.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Acompanhe seus clientes agendados, confirme horários e gere cobranças via Pix
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'hoje', label: 'Hoje' },
                    { id: 'proximos', label: 'Próximos Dias' },
                    { id: 'pendentes', label: `Pendentes (${pendingCount})` },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setWhenFilter(f.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                        whenFilter === f.id
                          ? 'bg-[#0B132B] text-white'
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
                  placeholder="Buscar por nome do cliente, telefone ou serviço..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>

              {/* Booking Cards List */}
              {providerBookings.length === 0 ? (
                <div className="p-8 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <p className="text-sm font-extrabold text-slate-700">
                    Nenhum agendamento encontrado neste filtro.
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Compartilhe o link da sua agenda com seus clientes ou encaixe um atendimento manualmente.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {whenFilter !== 'todos' && (
                      <button
                        type="button"
                        onClick={() => {
                          setWhenFilter('todos');
                          setClientSearch('');
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 text-xs font-extrabold"
                      >
                        Ver Todos
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowManualModal(true)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold"
                    >
                      + Encaixar Cliente
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {providerBookings.map((booking) => {
                    const isToday = booking.date === todayIso;
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
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
                          <div className="px-4 py-3 rounded-2xl bg-[#0B132B] text-white text-center shrink-0 sm:w-36">
                            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 truncate">
                              {isToday ? 'HOJE' : booking.formattedDate}
                            </span>
                            <span className="block text-lg font-black text-white mt-0.5">
                              {booking.time}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              até {booking.endTime}
                            </span>
                          </div>

                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
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

                            <p className="text-xs sm:text-sm font-extrabold text-blue-600">
                              {booking.services.map((s) => s.name).join(' + ')} —{' '}
                              <span className="text-slate-900">R$ {booking.totalPrice}</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5">
                              {booking.clientPhone && (
                                <span className="flex items-center gap-1 font-semibold">
                                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                                  {booking.clientPhone}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {booking.address}
                              </span>
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

                          <button
                            type="button"
                            onClick={() => setPixModalBooking(booking)}
                            className="px-3.5 py-2 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1.5 transition"
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                            <span>QR Code Pix</span>
                          </button>

                          {booking.clientPhone && (
                            <a
                              href={`https://wa.me/55${booking.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Olá ${booking.clientName}, aqui é ${booking.tenantName} sobre seu agendamento de ${booking.services[0]?.name} no dia ${booking.formattedDate} às ${booking.time}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-1.5 transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                              <span>WhatsApp</span>
                            </a>
                          )}

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
          </div>
        )}

        {/* ===================================================================
            ABA 2: MINHA AGENDA POR HORÁRIOS DO DIA
           =================================================================== */}
        {activeTab === 'agenda' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Grade de Horários de Hoje — {todayFormatted}
                </h2>
                <p className="text-xs text-slate-500">
                  Consulte quais horários estão reservados e encaixe novos atendimentos
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1.5 w-fit"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Encaixar Cliente em Horário</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {['08:00', '09:00', '10:00', '11:30', '14:00', '15:00', '16:00', '18:00'].map(
                (slotTime) => {
                  const found = allProviderBookings.find(
                    (b) => b.date === todayIso && b.time === slotTime
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
                        <span className="px-3.5 py-2 rounded-xl bg-[#0B132B] text-white text-sm font-black w-20 text-center shrink-0">
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
                              {found.clientPhone ? `Tel: ${found.clientPhone} • ` : ''}Local: {found.address}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-bold text-emerald-700">Horário Livre</p>
                            <p className="text-xs text-slate-400">
                              Disponível na sua página pública de agendamento
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
                          className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-blue-600 text-xs font-extrabold text-slate-700 w-fit transition"
                        >
                          + Reservar horário
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
                  Catálogo de Serviços — {currentProvider.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Estes são os serviços e valores exibidos na sua página pública
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
                        Duração estimada: {srv.duration}
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
                Adicionar Novo Serviço
              </h3>
              <form onSubmit={handleAddServiceToCatalog} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nome do Serviço
                  </label>
                  <input
                    type="text"
                    required
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="Ex: Manutenção Preventiva"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Valor (R$)
                    </label>
                    <input
                      type="number"
                      required
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      placeholder="150"
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
                  className="w-full py-3 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-extrabold transition"
                >
                  Salvar no Catálogo
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 4: MEUS CLIENTES
           =================================================================== */}
        {activeTab === 'clientes' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Meus Clientes ({allProviderBookings.length})
              </h2>
              <p className="text-xs text-slate-500">
                Histórico de clientes que realizaram agendamentos na sua página
              </p>
            </div>

            {allProviderBookings.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                Ainda não há clientes registrados na sua agenda.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allProviderBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl border border-slate-200 space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0B132B] text-cyan-400 font-extrabold text-xs flex items-center justify-center">
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
                        Data: {b.formattedDate} às {b.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            ABA 5: CHAT COM CLIENTES
           =================================================================== */}
        {activeTab === 'chat' && (
          <ChatWorkspace
            forcedRole="prestador"
            initialTenantSlug={currentProvider?.slug}
            onUnreadChange={(c) => setChatUnreadCount(c)}
          />
        )}

        {/* ===================================================================
            ABA 6: CHAVE PIX & RECEBIMENTOS
           =================================================================== */}
        {(activeTab === 'notificacoes' || activeTab === 'configuracoes') && currentProvider && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Cols: Configurar Chave Pix */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-5">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider">
                  <QrCode className="w-3.5 h-3.5" />
                  Recebimento Direto (0% de Taxa)
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                  Configurar Chave Pix e Pagamentos
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  O sistema utiliza sua chave Pix abaixo para gerar QR Code e código Copia e Cola com o valor exato de cada serviço.
                </p>
              </div>

              <form onSubmit={handleSavePixSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tipo da Chave Pix
                    </label>
                    <select
                      value={pixKeyTypeInput}
                      onChange={(e) => setPixKeyTypeInput(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold outline-none focus:border-blue-600"
                    >
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="email">E-mail</option>
                      <option value="telefone">Celular / WhatsApp</option>
                      <option value="aleatoria">Chave Aleatória</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Sua Chave Pix
                    </label>
                    <input
                      type="text"
                      required
                      value={pixKeyInput}
                      onChange={(e) => setPixKeyInput(e.target.value)}
                      placeholder="Informe sua chave Pix..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nome do Favorecido / Titular da Conta
                  </label>
                  <input
                    type="text"
                    required
                    value={pixBeneficiaryInput}
                    onChange={(e) => setPixBeneficiaryInput(e.target.value)}
                    placeholder="Nome completo ou razão social"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold outline-none focus:border-blue-600"
                  />
                </div>

                {/* Stripe Option Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>Permitir também Cartão de Crédito</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Habilita a opção de pagamento via cartão além do Pix direto.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={acceptStripeInput}
                    onChange={(e) => setAcceptStripeInput(e.target.checked)}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer shrink-0"
                  />
                </div>

                {pixSavedMsg && (
                  <div className="p-3 rounded-xl bg-emerald-600 text-white font-extrabold text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Configurações de pagamento salvas com sucesso!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-extrabold transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Salvar Configurações de Recebimento</span>
                </button>
              </form>
            </div>

            {/* Right 5 Cols: Simulador de QR Code Pix */}
            <div className="lg:col-span-5 bg-[#0B132B] text-white rounded-3xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Prévia do QR Code Pix
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                  Padrão Banco Central
                </span>
              </div>

              <div className="flex flex-col items-center text-center space-y-2 py-2">
                <PixQrCodeSvg brCode={livePreviewBrCode} size={176} />
                <p className="text-xs font-extrabold text-white pt-1">
                  {pixBeneficiaryInput || currentProvider.name}
                </p>
                <p className="text-[11px] text-cyan-400">
                  Chave ({pixKeyTypeInput.toUpperCase()}): {pixKeyInput || 'Não informada'}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Valor de Teste (R$):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={pixTestAmount}
                    onChange={(e) => setPixTestAmount(Number(e.target.value) || 0)}
                    className="w-28 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-black text-sm outline-none focus:border-blue-500"
                  />
                  <div className="flex flex-wrap gap-1">
                    {currentProvider.services.slice(0, 3).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setPixTestAmount(s.price)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 transition"
                      >
                        R$ {s.price}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">
                  Código Pix Copia e Cola:
                </span>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 break-all line-clamp-2">
                  {livePreviewBrCode}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(livePreviewBrCode);
                    setCopiedTestPix(true);
                    setTimeout(() => setCopiedTestPix(false), 2500);
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                >
                  {copiedTestPix ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Código Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Código (R$ {pixTestAmount})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE QR CODE PIX PARA UM AGENDAMENTO ESPECÍFICO */}
      {pixModalBooking && (
        <PixPaymentModal
          isOpen={!!pixModalBooking}
          onClose={() => setPixModalBooking(null)}
          providerName={pixModalBooking.tenantName}
          pixKey={currentProvider?.pixKey || currentProvider?.phone || ''}
          pixKeyType={currentProvider?.pixKeyType || 'telefone'}
          pixBeneficiary={currentProvider?.pixBeneficiary || pixModalBooking.tenantName}
          serviceName={`${pixModalBooking.services[0]?.name || 'Serviço'} (${pixModalBooking.clientName})`}
          amount={pixModalBooking.totalPrice}
          allowEditAmount={true}
          onPaymentConfirmed={() => {
            handleConfirmBooking(pixModalBooking.id);
          }}
        />
      )}

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
                <label className="block font-bold text-slate-700 mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  value={manualClientName}
                  onChange={(e) => setManualClientName(e.target.value)}
                  placeholder="Nome completo do cliente"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
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
                  placeholder="(11) 99999-9999"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horário</label>
                  <select
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-600"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-600"
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
                className="w-full py-3.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-extrabold transition"
              >
                Confirmar Agendamento
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
    <RequireRole role="prestador">
      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-slate-500">
            Carregando painel do prestador...
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </RequireRole>
  );
}
