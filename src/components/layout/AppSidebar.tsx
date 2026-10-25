'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
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
  activeDashboardTab,
  onSelectDashboardTab,
  chatUnreadCount = 2,
  notificationsCount = 3,
  children,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [copiedLink, setCopiedLink] = useState(false);

  const isDashboardPage = pathname === '/dashboard';

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

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col lg:flex-row text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* =====================================================================
          UNIFIED FIXED LEFT SIDEBAR (DESKTOP — NEVER CHANGES ACROSS OPTIONS)
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

          {/* Section 1: Main Tabs */}
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

          {/* Section 2: Direct Pages (Always visible in the exact same sidebar) */}
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
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      page.active
                        ? 'text-blue-600'
                        : page.highlight
                        ? 'text-amber-500'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{page.label}</span>
                </NextLink>
              );
            })}
          </div>
        </div>

        {/* Bottom User Profile & Quick Beach Tennis Demo Link */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-white">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
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
                className="p-1.5 rounded-lg bg-white border border-amber-200 text-slate-700 hover:bg-amber-100 transition"
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
          RIGHT MAIN WRAPPER (UNIFIED TOPBAR + MOBILE BAR + PAGE CONTENT)
         ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* DESKTOP TOP HEADER BAR */}
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

        {/* MOBILE TOP HEADER + UNIFIED SCROLLABLE TABS */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="px-4 py-3 flex items-center justify-between">
            <NextLink href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold text-slate-900">
                Agenda<span className="text-blue-600">Fácil</span>
              </span>
            </NextLink>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('open-pwa-install'))}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span>Instalar</span>
              </button>
              <NextLink
                href="/explorar"
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agendar
              </NextLink>
            </div>
          </div>

          <div className="px-4 pb-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {dashboardNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isDashboardPage && activeDashboardTab === item.id;
              if (isDashboardPage && onSelectDashboardTab) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectDashboardTab(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              }
              return (
                <NextLink
                  key={item.id}
                  href={`/dashboard?tab=${item.id}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 bg-slate-100 text-slate-600"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NextLink>
              );
            })}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1">{children}</div>
      </div>

      {/* UNIFIED MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-2 px-3 flex items-center justify-around shadow-lg safe-bottom">
        <NextLink
          href="/dashboard?tab=inicio"
          onClick={(e) => {
            if (isDashboardPage && onSelectDashboardTab) {
              e.preventDefault();
              onSelectDashboardTab('inicio');
            }
          }}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-bold ${
            isDashboardPage && activeDashboardTab === 'inicio'
              ? 'text-blue-600'
              : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Início</span>
        </NextLink>

        <NextLink
          href="/dashboard?tab=agenda"
          onClick={(e) => {
            if (isDashboardPage && onSelectDashboardTab) {
              e.preventDefault();
              onSelectDashboardTab('agenda');
            }
          }}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-bold ${
            isDashboardPage && activeDashboardTab === 'agenda'
              ? 'text-blue-600'
              : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Agenda</span>
        </NextLink>

        <NextLink
          href="/explorar"
          className={`flex flex-col items-center gap-0.5 text-[11px] font-bold ${
            pathname === '/explorar' ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Explorar</span>
        </NextLink>

        <NextLink
          href="/dashboard?tab=chat"
          onClick={(e) => {
            if (isDashboardPage && onSelectDashboardTab) {
              e.preventDefault();
              onSelectDashboardTab('chat');
            }
          }}
          className={`relative flex flex-col items-center gap-0.5 text-[11px] font-bold ${
            (isDashboardPage && activeDashboardTab === 'chat') || pathname === '/chat'
              ? 'text-blue-600'
              : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chat</span>
          {chatUnreadCount > 0 && (
            <span className="absolute -top-1 right-0 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-extrabold flex items-center justify-center">
              {chatUnreadCount}
            </span>
          )}
        </NextLink>

        <NextLink
          href="/lucas-beachtennis"
          className={`flex flex-col items-center gap-0.5 text-[11px] font-bold ${
            pathname === '/lucas-beachtennis' ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>1ª Conta</span>
        </NextLink>
      </nav>
    </div>
  );
}
