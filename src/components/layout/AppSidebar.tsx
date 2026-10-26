'use client';

import { useState, useEffect } from 'react';
import NextLink from 'next/link';
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
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

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
  activePage,
  headerTitle,
  headerSubtitle,
  children,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [copiedLink, setCopiedLink] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isDashboardPage = pathname === '/dashboard';

  // Close drawer on path changes
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  const dashboardNavItems: Array<{
    id: DashboardTabId;
    label: string;
    icon: any;
    badge?: number;
  }> = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'servicos', label: 'Serviços', icon: Wrench },
    { id: 'prestadores', label: 'Prestadores', icon: UserCheck },
    { id: 'clientes', label: 'Clientes', icon: Users },
    {
      id: 'chat',
      label: 'Chat & Mensagens',
      icon: MessageSquare,
      badge: chatUnreadCount > 0 ? chatUnreadCount : undefined,
    },
    {
      id: 'notificacoes',
      label: 'Notificações',
      icon: Bell,
      badge: notificationsCount > 0 ? notificationsCount : undefined,
    },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  const shortcutPageItems = [
    {
      href: '/explorar',
      label: 'Explorar Trabalhos',
      icon: Compass,
      active: pathname === '/explorar',
    },
    {
      href: '/meus-agendamentos',
      label: 'Meus Agendamentos',
      icon: Calendar,
      active: pathname === '/meus-agendamentos',
    },
    {
      href: '/lucas-beachtennis',
      label: '1ª Conta: Beach Tennis',
      icon: Trophy,
      active: pathname === '/lucas-beachtennis',
      highlight: true,
    },
    {
      href: '/planos',
      label: 'Planos (R$ 0 e R$ 19,90)',
      icon: CreditCard,
      active: pathname === '/planos',
    },
    {
      href: '/cadastro',
      label: 'Cadastro / Login',
      icon: UserPlus,
      active: pathname === '/cadastro' || pathname === '/login' || pathname === '/onboarding',
    },
  ];

  const handleCopyDemoLink = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/lucas-beachtennis`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNavigateTab = (tab: DashboardTabId) => {
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
          1. UNIFIED DESKTOP LEFT SIDEBAR (STICKY ON PC, NEVER JUMPS)
         ===================================================================== */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 space-y-6">
          {/* Brand Logo */}
          <NextLink href="/" className="flex items-center gap-2.5 px-2 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white group-hover:scale-105 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Agenda<span className="text-blue-600">Fácil</span>
            </span>
          </NextLink>

          {/* Section 1: Dashboard Tabs */}
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Painel & Gestão
            </p>
            {dashboardNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                (isDashboardPage && activeDashboardTab === item.id) ||
                (pathname === '/chat' && item.id === 'chat');

              if (isDashboardPage && onSelectDashboardTab) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectDashboardTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <NextLink
                  key={item.id}
                  href={`/dashboard?tab=${item.id}`}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </NextLink>
              );
            })}
          </div>

          {/* Section 2: Direct Pages */}
          <div className="space-y-1 pt-3 border-t border-slate-100">
            <p className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Páginas & Contratação
            </p>
            {shortcutPageItems.map((page) => {
              const Icon = page.icon;
              return (
                <NextLink
                  key={page.href}
                  href={page.href}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    page.active
                      ? 'bg-blue-600 text-white'
                      : page.highlight
                      ? 'bg-blue-50/70 text-blue-700 hover:bg-blue-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      page.active
                        ? 'text-white'
                        : page.highlight
                        ? 'text-blue-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{page.label}</span>
                </NextLink>
              );
            })}
          </div>
        </div>

        {/* Bottom User Profile Card on PC */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-white">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800">
              1ª Conta / Teste Público
            </p>
            <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
              Prof. Lucas (Beach Tennis)
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <NextLink
                href="/lucas-beachtennis"
                className="flex-1 text-center py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition"
              >
                Abrir Agenda
              </NextLink>
              <button
                type="button"
                onClick={handleCopyDemoLink}
                className="p-1.5 rounded-lg bg-white border border-blue-200 text-slate-700 hover:bg-blue-100 transition"
                title="Copiar Link"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
              R
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-slate-900 truncate">Raul Freitas</p>
              <p className="text-[11px] text-slate-400 truncate">raul@empresa.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          2. MAIN CONTENT WRAPPER
         ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* DESKTOP TOP HEADER (PC ONLY) */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold text-slate-700">
              Central de Agendamento Rápido de Trabalhos & Serviços
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              Cliente R$ 0 • Prestador Grátis ou Pro R$ 19,90
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NextLink
              href="/explorar"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                pathname === '/explorar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Explorar Trabalhos
            </NextLink>

            <NextLink
              href="/lucas-beachtennis"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                pathname === '/lucas-beachtennis'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>1ª Conta (Beach Tennis)</span>
            </NextLink>

            <NextLink
              href="/cadastro"
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              Criar Conta
            </NextLink>

            {isDashboardPage && onSelectDashboardTab ? (
              <button
                type="button"
                onClick={() => onSelectDashboardTab('chat')}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
                {chatUnreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white text-blue-600 text-[10px] font-extrabold">
                    {chatUnreadCount}
                  </span>
                )}
              </button>
            ) : (
              <NextLink
                href="/dashboard?tab=chat"
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </NextLink>
            )}
          </div>
        </header>

        {/* ===================================================================
            3. ULTRA-SLIM NATIVE MOBILE APP HEADER (< lg)
            Zero visual duplication: Clean 52px single bar, no duplicate tabs!
           =================================================================== */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 h-14 flex items-center justify-between">
          <NextLink href="/" className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-base font-extrabold text-slate-900 tracking-tight truncate">
              Agenda<span className="text-blue-600">Fácil</span>
            </span>
          </NextLink>

          <div className="flex items-center gap-1.5">
            {/* Quick Action: Agendar */}
            <NextLink
              href="/explorar"
              className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-extrabold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agendar</span>
            </NextLink>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => handleNavigateTab('notificacoes')}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              aria-label="Notificações"
            >
              <Bell className="w-4 h-4" />
              {notificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              )}
            </button>

            {/* Mobile Drawer Trigger (Menu) */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              aria-label="Abrir Menu Completo"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER (WITH PROPER BOTTOM PADDING ON MOBILE) */}
        <div className="flex-1 pb-24 lg:pb-0">{children}</div>
      </div>

      {/* =====================================================================
          4. ERGONOMIC NATIVE MOBILE BOTTOM NAVIGATION BAR (< lg)
          Clean, elegant 5-tab docked bar with active indicator dot
         ===================================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 h-16 px-2 flex items-center justify-around shadow-xs safe-bottom">
        {/* Tab 1: Início */}
        <button
          type="button"
          onClick={() => handleNavigateTab('inicio')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition ${
            isDashboardPage && activeDashboardTab === 'inicio'
              ? 'text-blue-600 font-extrabold'
              : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Início</span>
          {isDashboardPage && activeDashboardTab === 'inicio' && (
            <span className="w-1 h-1 rounded-full bg-blue-600 -mt-0.5" />
          )}
        </button>

        {/* Tab 2: Explorar */}
        <NextLink
          href="/explorar"
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition ${
            pathname === '/explorar'
              ? 'text-blue-600 font-extrabold'
              : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Explorar</span>
          {pathname === '/explorar' && (
            <span className="w-1 h-1 rounded-full bg-blue-600 -mt-0.5" />
          )}
        </NextLink>

        {/* Tab 3: Agenda */}
        <button
          type="button"
          onClick={() => handleNavigateTab('agenda')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition ${
            isDashboardPage && activeDashboardTab === 'agenda'
              ? 'text-blue-600 font-extrabold'
              : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Agenda</span>
          {isDashboardPage && activeDashboardTab === 'agenda' && (
            <span className="w-1 h-1 rounded-full bg-blue-600 -mt-0.5" />
          )}
        </button>

        {/* Tab 4: Chat */}
        <NextLink
          href="/chat"
          className={`relative flex-1 py-1 flex flex-col items-center justify-center gap-1 transition ${
            pathname.startsWith('/chat') || (isDashboardPage && activeDashboardTab === 'chat')
              ? 'text-blue-600 font-extrabold'
              : 'text-slate-400 font-medium hover:text-slate-600'
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
          {(pathname.startsWith('/chat') || (isDashboardPage && activeDashboardTab === 'chat')) && (
            <span className="w-1 h-1 rounded-full bg-blue-600 -mt-0.5" />
          )}
        </NextLink>

        {/* Tab 5: Menu / Mais (Opens sleek drawer) */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition ${
            mobileDrawerOpen
              ? 'text-blue-600 font-extrabold'
              : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">Mais</span>
          {mobileDrawerOpen && (
            <span className="w-1 h-1 rounded-full bg-blue-600 -mt-0.5" />
          )}
        </button>
      </nav>

      {/* =====================================================================
          5. SLEEK SLIDE-OVER MOBILE DRAWER (MENU COMPLETO)
         ===================================================================== */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10">
            {/* Drawer Header */}
            <div>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    R
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 leading-tight">
                      Raul Freitas
                    </p>
                    <p className="text-[10px] text-slate-400">
                      raul@empresa.com
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1ª Conta Beach Tennis Banner inside Drawer */}
              <div className="p-4 bg-blue-50/60 border-b border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                    1ª Conta / Teste Oficial
                  </span>
                  <span className="px-2 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-black">
                    DEMO
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900">
                  Prof. Lucas Becker (Beach Tennis)
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <NextLink
                    href="/lucas-beachtennis"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 text-white text-xs font-extrabold text-center transition"
                  >
                    Ver Perfil & Agenda
                  </NextLink>
                  <button
                    type="button"
                    onClick={handleCopyDemoLink}
                    className="p-1.5 rounded-lg bg-white border border-blue-200 text-slate-700 transition"
                  >
                    {copiedLink ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Navigation Group 1: Painel & Gestão */}
              <div className="p-3 space-y-1">
                <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Painel de Controle
                </p>
                {dashboardNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isDashboardPage && activeDashboardTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigateTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Group 2: Contratação & Páginas */}
              <div className="p-3 pt-1 space-y-1 border-t border-slate-100">
                <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Mais Opções
                </p>
                {shortcutPageItems.map((page) => {
                  const Icon = page.icon;
                  return (
                    <NextLink
                      key={page.href}
                      href={page.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                        page.active
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            page.active ? 'text-white' : 'text-slate-400'
                          }`}
                        />
                        <span>{page.label}</span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 ${
                          page.active ? 'text-white' : 'text-slate-300'
                        }`}
                      />
                    </NextLink>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50">
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  window.dispatchEvent(new Event('open-pwa-install'));
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-2 shadow-2xs transition"
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Instalar Aplicativo (PWA)</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                <span>Versão 1.2 PWA</span>
                <span className="text-emerald-600 font-bold">Online</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
