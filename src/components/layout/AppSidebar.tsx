'use client';

import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calendar,
  Wrench,
  Users,
  MessageSquare,
  Bell,
  Settings,
  Compass,
  Copy,
  Check,
  Menu,
  X,
  Briefcase,
  ExternalLink,
  ClipboardList,
  LogOut,
  QrCode,
} from 'lucide-react';
import { getPublicDomain, getPublicUrl } from '@/lib/store';
import { useSession, signOut } from '@/lib/auth';

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

const PROVIDER_TABS: Array<{
  id: DashboardTabId;
  label: string;
  description: string;
  icon: any;
  short: string;
}> = [
  { id: 'inicio', label: 'Visão Geral', description: 'Quem agendou e resumo', icon: ClipboardList, short: 'Início' },
  { id: 'agenda', label: 'Minha Agenda', description: 'Grade de horários do dia', icon: Calendar, short: 'Agenda' },
  { id: 'servicos', label: 'Meus Serviços', description: 'Catálogo e preços fixos', icon: Wrench, short: 'Serviços' },
  { id: 'clientes', label: 'Meus Clientes', description: 'Histórico de clientes', icon: Users, short: 'Clientes' },
  { id: 'chat', label: 'Mensagens', description: 'Chat direto com clientes', icon: MessageSquare, short: 'Chat' },
  { id: 'configuracoes', label: 'Pix e Recebimentos', description: 'Chave Pix e QR Code', icon: QrCode, short: 'Pix' },
];

export default function AppSidebar({
  activeDashboardTab = 'inicio',
  onSelectDashboardTab,
  chatUnreadCount = 0,
  notificationsCount = 0,
  children,
}: AppSidebarProps) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const session = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [domain, setDomain] = useState('agendafacil-blond.vercel.app');

  useEffect(() => setDomain(getPublicDomain()), []);
  useEffect(() => setDrawerOpen(false), [pathname]);

  const isProviderPanel = pathname === '/prestador';
  const tenantSlug = session.tenantSlug || null;

  const goProviderTab = (tab: DashboardTabId) => {
    setDrawerOpen(false);
    if (isProviderPanel && onSelectDashboardTab) {
      onSelectDashboardTab(tab);
      router.replace(`/prestador?tab=${tab}`, { scroll: false });
    } else {
      router.push(`/prestador?tab=${tab}`);
    }
  };

  const handleCopyLink = () => {
    if (!tenantSlug || typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(getPublicUrl(tenantSlug));
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const renderMenu = () => (
    <div className="space-y-1">
      <p className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
        Gestão Profissional
      </p>
      {PROVIDER_TABS.map((item) => {
        const Icon = item.icon;
        const isActive = isProviderPanel && activeDashboardTab === item.id;
        const badge =
          item.id === 'chat' ? chatUnreadCount : item.id === 'notificacoes' ? notificationsCount : 0;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => goProviderTab(item.id)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left text-xs transition ${
              isActive
                ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-bold'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <div className="min-w-0">
                <p className="truncate">{item.label}</p>
                <p className={`text-[10px] truncate font-medium ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                  {item.description}
                </p>
              </div>
            </div>
            {badge > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderContextCard = () => {
    if (!tenantSlug) {
      return (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
            Agenda não publicada
          </p>
          <p className="text-[11px] text-amber-900 leading-snug">
            Conclua a configuração para liberar seu link público de agendamento.
          </p>
          <NextLink
            href="/cadastro?role=prestador"
            className="block text-center py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition"
          >
            Configurar Página
          </NextLink>
        </div>
      );
    }

    return (
      <div className="p-3.5 rounded-2xl bg-[#0B132B] text-white space-y-2.5 border border-slate-800">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
            Sua Página Pública
          </p>
          <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online" />
        </div>
        <p className="text-xs font-bold truncate text-slate-100 font-mono" title={`${domain}/${tenantSlug}`}>
          {domain}/{tenantSlug}
        </p>
        <div className="flex items-center gap-1.5 pt-0.5">
          <NextLink
            href={`/${tenantSlug}`}
            target="_blank"
            className="flex-1 text-center py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold transition flex items-center justify-center gap-1.5"
          >
            <span>Abrir Página</span>
            <ExternalLink className="w-3 h-3" />
          </NextLink>
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition"
            title="Copiar link de agendamento"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    );
  };

  const renderAccountBox = () => {
    if (session.status === 'loading') {
      return <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />;
    }

    return (
      <div className="flex items-center justify-between gap-2 px-1 pt-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
            {(session.name || session.email || 'P').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-slate-900 truncate">
              {session.name || session.email || 'Prestador'}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 truncate">Conta Profissional</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
          title="Sair da conta"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const bottomItems = PROVIDER_TABS.filter((t) =>
    ['inicio', 'agenda', 'servicos', 'chat'].includes(t.id)
  ).map((t) => ({
    key: t.id,
    label: t.short,
    icon: t.icon,
    active: isProviderPanel && activeDashboardTab === t.id,
    onClick: () => goProviderTab(t.id),
    badge: t.id === 'chat' ? chatUnreadCount : 0,
  }));

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col lg:flex-row text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* ===================== DESKTOP SIDEBAR ===================== */}
      <aside className="hidden lg:flex w-68 bg-white border-r border-slate-200/90 flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 space-y-6">
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
                Agenda
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500">
                  Fácil
                </span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Painel do Prestador
              </span>
            </div>
          </NextLink>
          {renderMenu()}
        </div>

        <div className="p-4 border-t border-slate-100 space-y-3 bg-white">
          {renderContextCard()}
          {renderAccountBox()}
        </div>
      </aside>

      {/* ===================== CONTEÚDO PRINCIPAL ===================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topo desktop */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200/80 px-8 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-extrabold flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
              <span>Área do Prestador</span>
            </span>
            {tenantSlug && (
              <span className="text-xs font-semibold text-slate-400">
                • {domain}/{tenantSlug}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <NextLink
              href="/explorar"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-extrabold flex items-center gap-1.5 transition"
            >
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              <span>Ver Diretório Público</span>
            </NextLink>
            {tenantSlug && (
              <NextLink
                href={`/${tenantSlug}`}
                target="_blank"
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-extrabold flex items-center gap-1.5 transition"
              >
                <span>Ver Minha Página</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </NextLink>
            )}
          </div>
        </header>

        {/* Topo mobile */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 h-14 flex items-center justify-between gap-2">
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
              Agenda
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500">
                Fácil
              </span>
            </span>
          </NextLink>
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-slate-900 text-white">
            Painel do Prestador
          </span>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition shrink-0"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 pb-24 lg:pb-0">{children}</div>
      </div>

      {/* ===================== BARRA INFERIOR MOBILE ===================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 h-16 px-2 flex items-center justify-around shadow-xs safe-bottom">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const cls = `flex-1 py-1 flex flex-col items-center justify-center gap-1 transition ${
            item.active ? 'text-blue-600 font-extrabold' : 'text-slate-400 font-medium'
          }`;
          return (
            <button key={item.key} type="button" onClick={item.onClick} className={cls}>
              <div className="relative">
                <Icon className="w-5 h-5" />
                {!!item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex-1 py-1 flex flex-col items-center justify-center gap-1 text-slate-400 font-medium"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">Mais</span>
        </button>
      </nav>

      {/* ===================== MENU LATERAL MOBILE ===================== */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[86%] max-w-sm bg-white shadow-xl flex flex-col">
            <div className="h-14 px-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-extrabold text-slate-900">Painel do Prestador</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">{renderMenu()}</div>
            <div className="p-4 border-t border-slate-100 space-y-3">
              {renderContextCard()}
              {renderAccountBox()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
