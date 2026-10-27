'use client';

import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Calendar,
  Wrench,
  UserCheck,
  Users,
  MessageSquare,
  Bell,
  Settings,
  Compass,
  Trophy,
  CreditCard,
  UserPlus,
  Copy,
  Check,
  Smartphone,
  Plus,
  Search,
  Menu,
  X,
  ChevronRight,
  User,
  Briefcase,
  ExternalLink,
  ClipboardList,
} from 'lucide-react';
import { getStoredUserRole, saveStoredUserRole } from '@/lib/store';

export type DashboardTabId =
  | 'inicio'
  | 'agenda'
  | 'servicos'
  | 'prestadores'
  | 'clientes'
  | 'chat'
  | 'notificacoes'
  | 'configuracoes';

interface AppSidebarProps {
  activeDashboardTab?: DashboardTabId;
  onSelectDashboardTab?: (tab: DashboardTabId) => void;
  chatUnreadCount?: number;
  notificationsCount?: number;
  activePage?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  children: React.ReactNode;
}

export default function AppSidebar({
  activeDashboardTab = 'inicio',
  onSelectDashboardTab,
  chatUnreadCount = 2,
  notificationsCount = 3,
  children,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [copiedLink, setCopiedLink] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [roleMode, setRoleMode] = useState<'cliente' | 'prestador'>('cliente');

  const isDashboardPage = pathname === '/dashboard';

  // Sync role mode based on route or stored preference
  useEffect(() => {
    if (pathname === '/dashboard') {
      setRoleMode('prestador');
      saveStoredUserRole('prestador');
    } else if (
      pathname === '/explorar' ||
      pathname === '/meus-agendamentos'
    ) {
      setRoleMode('cliente');
      saveStoredUserRole('cliente');
    } else {
      setRoleMode(getStoredUserRole());
    }
    setMobileDrawerOpen(false);
  }, [pathname]);

  const handleSwitchRole = (targetRole: 'cliente' | 'prestador') => {
    setRoleMode(targetRole);
    saveStoredUserRole(targetRole);
    setMobileDrawerOpen(false);
    if (targetRole === 'cliente') {
      router.push('/explorar');
    } else {
      router.push('/dashboard?tab=inicio');
    }
  };

  // ===========================================================================
  // 1. MENU DO CLIENTE (SIMPLES, DIRETO E SEM POLUIÇÃO VISUAL)
  // ===========================================================================
  const clientMenuItems = [
    {
      href: '/explorar',
      label: 'Explorar Prestadores',
      description: 'Profissionais e preços fixos',
      icon: Compass,
      active: pathname === '/explorar',
    },
    {
      href: '/meus-agendamentos',
      label: 'Meus Agendamentos',
      description: 'Horários marcados',
      icon: Calendar,
      active: pathname === '/meus-agendamentos',
    },
    {
      href: '/chat',
      label: 'Conversas / Chat',
      description: 'Falar com o profissional',
      icon: MessageSquare,
      active: pathname.startsWith('/chat'),
      badge: chatUnreadCount > 0 ? chatUnreadCount : undefined,
    },
  ];

  // ===========================================================================
  // 2. MENU DO PRESTADOR (DASHBOARD DE QUEM AGENDOU E QUANDO SERÁ O SERVIÇO)
  // ===========================================================================
  const providerMenuItems: Array<{
    id: DashboardTabId;
    label: string;
    description: string;
    icon: any;
    badge?: number;
  }> = [
    {
      id: 'inicio',
      label: 'Quem Agendou (Hoje)',
      description: 'Próximos serviços e clientes',
      icon: ClipboardList,
    },
    {
      id: 'agenda',
      label: 'Minha Agenda',
      description: 'Calendário de horários',
      icon: Calendar,
    },
    {
      id: 'servicos',
      label: 'Meus Serviços & Preços',
      description: 'Catálogo tabelado',
      icon: Wrench,
    },
    {
      id: 'clientes',
      label: 'Meus Clientes',
      description: 'Pessoas que agendaram',
      icon: Users,
    },
    {
      id: 'chat',
      label: 'Chat com Clientes',
      description: 'Mensagens diretas',
      icon: MessageSquare,
      badge: chatUnreadCount > 0 ? chatUnreadCount : undefined,
    },
    {
      id: 'notificacoes',
      label: 'Novos Alertas',
      description: 'Avisos de agendamento',
      icon: Bell,
      badge: notificationsCount > 0 ? notificationsCount : undefined,
    },
    {
      id: 'configuracoes',
      label: 'Configurar Agenda',
      description: 'Horários de atendimento',
      icon: Settings,
    },
  ];

  const handleCopyDemoLink = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/dashboard`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNavigateProviderTab = (tab: DashboardTabId) => {
    setRoleMode('prestador');
    saveStoredUserRole('prestador');
    setMobileDrawerOpen(false);
    if (isDashboardPage && onSelectDashboardTab) {
      onSelectDashboardTab(tab);
    } else {
      router.push(`/dashboard?tab=${tab}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col lg:flex-row text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* =====================================================================
          1. DESKTOP LEFT SIDEBAR (ADAPTS CLEARLY TO CLIENTE VS PRESTADOR)
         ===================================================================== */}
      <aside className="hidden lg:flex w-68 bg-white border-r border-slate-200 flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 space-y-5">
          {/* Brand Logo */}
          <NextLink href="/" className="flex items-center gap-2.5 px-1 group">
            <div className="relative w-9 h-9 shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="AgendaFácil"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 block leading-none">
                Agenda<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500">Fácil</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {roleMode === 'cliente' ? 'Visão do Cliente' : 'Painel do Prestador'}
              </span>
            </div>
          </NextLink>

          {/* PROMINENT 1-CLICK ROLE SWITCHER (CLIENTE VS PRESTADOR) */}
          <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => handleSwitchRole('cliente')}
              className={`py-2 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                roleMode === 'cliente'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Sou Cliente</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchRole('prestador')}
              className={`py-2 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                roleMode === 'prestador'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Sou Prestador</span>
            </button>
          </div>

          {/* NAVIGATION ITEMS BASED ON ACTIVE ROLE */}
          {roleMode === 'cliente' ? (
            <div className="space-y-1.5">
              <p className="px-2.5 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                Menu Simples do Cliente
              </p>
              {clientMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NextLink
                    key={item.href}
                    href={item.href}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs transition ${
                      item.active
                        ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          item.active ? 'text-white' : 'text-blue-600'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="truncate">{item.label}</p>
                        <p
                          className={`text-[10px] truncate font-medium ${
                            item.active ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {item.badge && (
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center shrink-0 ${
                          item.active ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NextLink>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="px-2.5 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Gestão do Prestador
              </p>
              {providerMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  (isDashboardPage && activeDashboardTab === item.id) ||
                  (pathname === '/chat' && item.id === 'chat');

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigateProviderTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left text-xs transition ${
                      isActive
                        ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-blue-400' : 'text-slate-400'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="truncate">{item.label}</p>
                        <p
                          className={`text-[10px] truncate font-medium ${
                            isActive ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {item.badge && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Contextual Card */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-white">
          {roleMode === 'prestador' ? (
            <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
                Sua Página Pública
              </p>
              <p className="text-xs font-bold truncate">
                agendafacil.app/sua-agenda
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                <NextLink
                  href="/dashboard"
                  className="flex-1 text-center py-1.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold transition"
                >
                  Painel de Gestão
                </NextLink>
                <button
                  type="button"
                  onClick={handleCopyDemoLink}
                  className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition"
                  title="Copiar Link"
                >
                  {copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800">
                Você trabalha por conta?
              </p>
              <p className="text-[11px] text-slate-600 leading-snug">
                Veja como funciona o painel do profissional com quem agendou e horários.
              </p>
              <button
                type="button"
                onClick={() => handleSwitchRole('prestador')}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition flex items-center justify-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                <span>Abrir Painel do Prestador</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-full text-white font-extrabold text-xs flex items-center justify-center shrink-0 ${
                  roleMode === 'prestador' ? 'bg-slate-900' : 'bg-blue-600'
                }`}
              >
                {roleMode === 'prestador' ? 'P' : 'C'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 truncate">
                  {roleMode === 'prestador' ? 'Prestador' : 'Cliente'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {roleMode === 'prestador' ? 'Conta Prestador' : 'Conta Cliente (Grátis)'}
                </p>
              </div>
            </div>

            <NextLink
              href="/cadastro"
              className="text-[11px] font-extrabold text-blue-600 hover:underline shrink-0"
            >
              Cadastro
            </NextLink>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          2. MAIN CONTENT WRAPPER (TOPBAR + PAGE CONTENT)
         ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* DESKTOP TOP HEADER WITH EASY ROLE SWITCHER */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                roleMode === 'cliente'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-slate-900 text-white'
              }`}
            >
              {roleMode === 'cliente' ? (
                <>
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Área do Cliente — Contratação Rápida</span>
                </>
              ) : (
                <>
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  <span>Dashboard do Prestador — Gestão de Clientes e Horários</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleSwitchRole('cliente')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
                roleMode === 'cliente'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Visão do Cliente</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchRole('prestador')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
                roleMode === 'prestador'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Painel do Prestador</span>
            </button>

            <NextLink
              href="/planos"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              Planos
            </NextLink>
          </div>
        </header>

        {/* ===================================================================
            3. MOBILE TOP HEADER (< lg) — WITH DIRECT 1-TAP ROLE SWITCHER
           =================================================================== */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 h-14 flex items-center justify-between gap-2">
          <NextLink href="/" className="flex items-center gap-2 min-w-0 shrink-0">
            <div className="relative w-7 h-7 shrink-0">
              <Image
                src="/logo.png"
                alt="AgendaFácil"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-sm font-extrabold text-slate-900 tracking-tight">
              Agenda<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500">Fácil</span>
            </span>
          </NextLink>

          {/* 1-Tap Role Pill Switcher on Mobile Top Bar */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleSwitchRole('cliente')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition ${
                roleMode === 'cliente'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Cliente</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchRole('prestador')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition ${
                roleMode === 'prestador'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              <span>Prestador</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition shrink-0"
            aria-label="Abrir Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 pb-24 lg:pb-0">{children}</div>
      </div>

      {/* =====================================================================
          4. MOBILE BOTTOM NAVIGATION BAR (DIFFERENT FOR CLIENTE VS PRESTADOR)
         ===================================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 h-16 px-2 flex items-center justify-around shadow-xs safe-bottom">
        {roleMode === 'cliente' ? (
          <>
            <NextLink
              href="/explorar"
              className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition ${
                pathname === '/explorar'
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px]">Explorar</span>
            </NextLink>

            <NextLink
              href="/meus-agendamentos"
              className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition ${
                pathname === '/meus-agendamentos'
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[10px]">Meus Horários</span>
            </NextLink>

            <NextLink
              href="/chat"
              className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition ${
                pathname.startsWith('/chat')
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <div className="relative">
                <MessageSquare className="w-5 h-5" />
                {chatUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">
                    {chatUnreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px]">Chat</span>
            </NextLink>

            <button
              type="button"
              onClick={() => handleSwitchRole('prestador')}
              className="flex-1 py-1 flex flex-col items-center justify-center gap-1 text-slate-600 font-bold"
            >
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span className="text-[10px]">Prestador</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => handleNavigateProviderTab('inicio')}
              className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition ${
                isDashboardPage && activeDashboardTab === 'inicio'
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[10px]">Quem Agendou</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigateProviderTab('agenda')}
              className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition ${
                isDashboardPage && activeDashboardTab === 'agenda'
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[10px]">Agenda</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigateProviderTab('servicos')}
              className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition ${
                isDashboardPage && activeDashboardTab === 'servicos'
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <Wrench className="w-5 h-5" />
              <span className="text-[10px]">Serviços</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigateProviderTab('clientes')}
              className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition ${
                isDashboardPage && activeDashboardTab === 'clientes'
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px]">Clientes</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchRole('cliente')}
              className="flex-1 py-1 flex flex-col items-center justify-center gap-1 text-slate-600 font-bold"
            >
              <User className="w-5 h-5 text-blue-600" />
              <span className="text-[10px]">Ver Cliente</span>
            </button>
          </>
        )}
      </nav>

      {/* =====================================================================
          5. MOBILE SLIDE-OVER DRAWER
         ===================================================================== */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />

          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 p-4 space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-extrabold text-slate-900">
                  Escolher Modo de Uso
                </span>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Role Switcher inside Drawer */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSwitchRole('cliente')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    roleMode === 'cliente'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <User className="w-4 h-4 mb-1" />
                  <p className="text-xs font-extrabold">Sou Cliente</p>
                  <p
                    className={`text-[10px] ${
                      roleMode === 'cliente' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    Ver e agendar
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchRole('prestador')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    roleMode === 'prestador'
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <Briefcase className="w-4 h-4 mb-1" />
                  <p className="text-xs font-extrabold">Sou Prestador</p>
                  <p
                    className={`text-[10px] ${
                      roleMode === 'prestador' ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    Ver quem agendou
                  </p>
                </button>
              </div>

              {roleMode === 'cliente' ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">
                    Navegação do Cliente
                  </p>
                  {clientMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NextLink
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold ${
                          item.active ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-blue-600" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </NextLink>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">
                    Painel do Prestador
                  </p>
                  {providerMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isDashboardPage && activeDashboardTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigateProviderTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold ${
                          isActive ? 'bg-slate-900 text-white' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-blue-500" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <NextLink
                href="/cadastro"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Criar Conta / Login</span>
              </NextLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
