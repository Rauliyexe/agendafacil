'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import NextLink from 'next/link';
import {
  Search,
  Send,
  CheckCheck,
  Calendar,
  MapPin,
  Phone,
  Star,
  ExternalLink,
  MessageCircle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  User,
  Briefcase,
  DollarSign,
  Check,
  Info,
  X,
  Bell,
  FileText,
  ArrowRight,
  QrCode,
  Copy,
} from 'lucide-react';
import { ChatConversation, ChatMessage, Tenant } from '@/lib/types';
import { generatePixBRCode } from '@/lib/pix';
import PixPaymentModal, { PixQrCodeSvg } from '@/components/pix/PixPaymentModal';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_PROVIDER_CONVERSATIONS,
  INITIAL_TENANTS,
} from '@/lib/data';
import {
  getStoredConversations,
  saveConversations,
  getStoredProviderConversations,
  saveProviderConversations,
  getStoredTenants,
  updateBookingStatus,
} from '@/lib/store';

const EMPTY_TENANT: Tenant = {
  id: '',
  slug: '',
  name: 'Prestador',
  role: 'Profissional',
  specialty: '',
  rating: 5.0,
  reviews: 0,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
  address: 'Atendimento',
  experience: '',
  phone: '',
  whatsapp: '',
  services: [],
  plan: 'pro',
  openingHours: { start: '08:00', end: '18:00', days: [1, 2, 3, 4, 5, 6], slotIntervalMinutes: 60 },
};

interface ChatWorkspaceProps {
  initialTenantSlug?: string;
  forcedRole?: 'cliente' | 'prestador';
  onUnreadChange?: (totalUnread: number) => void;
}

export default function ChatWorkspace({
  initialTenantSlug,
  forcedRole,
  onUnreadChange,
}: ChatWorkspaceProps) {
  const [chatRole, setChatRole] = useState<'cliente' | 'prestador'>(
    forcedRole || 'cliente'
  );
  const [clientConversations, setClientConversations] =
    useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [providerConversations, setProviderConversations] = useState<
    ChatConversation[]
  >(INITIAL_PROVIDER_CONVERSATIONS);
  const [tenants, setTenants] = useState<Record<string, Tenant>>(INITIAL_TENANTS);

  const [activeClientConvId, setActiveClientConvId] = useState<string>(
    INITIAL_CONVERSATIONS[0]?.id || ''
  );
  const [activeProviderConvId, setActiveProviderConvId] = useState<string>(
    INITIAL_PROVIDER_CONVERSATIONS[0]?.id || ''
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'todas' | 'nao_lidas'>('todas');
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Mobile native navigation: 'list' (Inbox) or 'chat' (Full conversation)
  const [mobileScreen, setMobileScreen] = useState<'list' | 'chat'>('list');
  const [showMobileDetailsSheet, setShowMobileDetailsSheet] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial data & role
  useEffect(() => {
    const storedClientConvs = getStoredConversations();
    const storedProvConvs = getStoredProviderConversations();
    const storedTenants = getStoredTenants();

    setClientConversations(storedClientConvs);
    setProviderConversations(storedProvConvs);
    setTenants(storedTenants);

    const activeRole = forcedRole || 'cliente';
    setChatRole(activeRole);

    if (initialTenantSlug) {
      if (activeRole === 'cliente') {
        const found = storedClientConvs.find(
          (c) => c.tenantSlug === initialTenantSlug
        );
        if (found) {
          setActiveClientConvId(found.id);
          setMobileScreen('chat');
        }
      } else {
        const foundProv = storedProvConvs.find(
          (c) => c.tenantSlug === initialTenantSlug
        );
        if (foundProv) {
          setActiveProviderConvId(foundProv.id);
        }
      }
    }
  }, [initialTenantSlug, forcedRole]);

  const conversations =
    chatRole === 'prestador' ? providerConversations : clientConversations;

  const activeConvId =
    chatRole === 'prestador' ? activeProviderConvId : activeClientConvId;

  useEffect(() => {
    const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
    if (onUnreadChange) {
      onUnreadChange(totalUnread);
    }
  }, [conversations, onUnreadChange]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConvId) || conversations[0] || null,
    [conversations, activeConvId]
  );

  const activeTenant: Tenant = useMemo(() => {
    if (!activeConversation) return Object.values(tenants)[0] || EMPTY_TENANT;
    return (
      tenants[activeConversation.tenantSlug] ||
      Object.values(tenants)[0] ||
      EMPTY_TENANT
    );
  }, [activeConversation, tenants]);

  const handleSelectConversation = (convId: string) => {
    if (chatRole === 'prestador') {
      setActiveProviderConvId(convId);
      const updated = providerConversations.map((c) =>
        c.id === convId ? { ...c, unreadCount: 0 } : c
      );
      setProviderConversations(updated);
      saveProviderConversations(updated);
    } else {
      setActiveClientConvId(convId);
      const updated = clientConversations.map((c) =>
        c.id === convId ? { ...c, unreadCount: 0 } : c
      );
      setClientConversations(updated);
      saveConversations(updated);
    }
    setMobileScreen('chat');
  };

  // Contextual automated reply depending on whether user is Prestador or Cliente
  const getContextualReply = (
    role: 'cliente' | 'prestador',
    conv: ChatConversation,
    userText: string
  ): string => {
    const lower = userText.toLowerCase();

    if (role === 'prestador') {
      // Reply from the Client back to the Provider!
      if (lower.includes('pix') || lower.includes('pagamento') || lower.includes('chave')) {
        return `Perfeito! Acabei de copiar a chave Pix. Vou transferir os R$ ${conv.servicePrice || 90} e já te envio o comprovante!`;
      }
      if (lower.includes('confirmado') || lower.includes('confirmo')) {
        return `Maravilha, muito obrigado por confirmar! Estarei no local no horário combinado (${conv.scheduledTime || 'hoje'}).`;
      }
      if (lower.includes('endereço') || lower.includes('local') || lower.includes('quadra')) {
        return 'Ótimo, já salvei a localização aqui no mapa. Até mais!';
      }
      return `Combinado! Muito obrigado pelo retorno rápido, ${activeTenant.name}. Nos vemos no horário agendado!`;
    } else {
      // Reply from the Provider back to the Client!
      if (lower.includes('endereço') || lower.includes('local')) {
        return `O atendimento será em: ${activeTenant.address}. Qualquer dúvida na chegada pode me chamar aqui!`;
      }
      if (lower.includes('pix') || lower.includes('pagamento') || lower.includes('valor')) {
        return 'Aceitamos Pix sem taxa, cartão ou pagamento direto no local após o serviço!';
      }
      if (lower.includes('horário') || lower.includes('vaga') || lower.includes('hoje')) {
        return 'Tenho horário disponível hoje às 16:00 e às 17:30! Quer que eu já deixe reservado para você?';
      }
      return `Recebido! Seu atendimento com ${activeTenant.name} está garantido pelo AgendaFácil.`;
    }
  };

  const handleSendMessage = (
    customText?: string,
    customBookingCard?: ChatMessage['bookingCard'],
    customPixCard?: ChatMessage['pixCard']
  ) => {
    const textToSend = (customText ?? messageInput).trim();
    if (!textToSend || !activeConversation) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: timeStr,
      status: 'read',
      bookingCard: customBookingCard,
      pixCard: customPixCard,
    };

    const targetConvId = activeConversation.id;

    if (chatRole === 'prestador') {
      const updated = providerConversations.map((c) =>
        c.id === targetConvId
          ? {
              ...c,
              lastMessage: textToSend,
              lastTime: timeStr,
              unreadCount: 0,
              messages: [...c.messages, newMsg],
            }
          : c
      );
      setProviderConversations(updated);
      saveProviderConversations(updated);
    } else {
      const updated = clientConversations.map((c) =>
        c.id === targetConvId
          ? {
              ...c,
              lastMessage: textToSend,
              lastTime: timeStr,
              unreadCount: 0,
              messages: [...c.messages, newMsg],
            }
          : c
      );
      setClientConversations(updated);
      saveConversations(updated);
    }

    if (!customText) {
      setMessageInput('');
    }

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    // Simulate realistic reply from the other party
    setIsTyping(true);
    setTimeout(() => {
      const replyText = getContextualReply(chatRole, activeConversation, textToSend);
      const replyMsg: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: 'contact',
        text: replyText,
        time: timeStr,
        status: 'read',
      };

      if (chatRole === 'prestador') {
        setProviderConversations((prev) => {
          const next = prev.map((c) =>
            c.id === targetConvId
              ? {
                  ...c,
                  lastMessage: replyText,
                  lastTime: timeStr,
                  messages: [...c.messages, replyMsg],
                }
              : c
          );
          saveProviderConversations(next);
          return next;
        });
      } else {
        setClientConversations((prev) => {
          const next = prev.map((c) =>
            c.id === targetConvId
              ? {
                  ...c,
                  lastMessage: replyText,
                  lastTime: timeStr,
                  messages: [...c.messages, replyMsg],
                }
              : c
          );
          saveConversations(next);
          return next;
        });
      }

      setIsTyping(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }, 850);
  };

  // Provider 1-Click Action: Confirm Client's Booking right inside Chat
  const handleProviderConfirmBookingInChat = () => {
    if (!activeConversation) return;
    if (activeConversation.bookingId) {
      updateBookingStatus(activeConversation.bookingId, 'confirmado');
    }

    const updatedProv = providerConversations.map((c) =>
      c.id === activeConversation.id
        ? { ...c, bookingStatus: 'confirmado' as const }
        : c
    );
    setProviderConversations(updatedProv);
    saveProviderConversations(updatedProv);

    handleSendMessage(
      `Olá ${activeConversation.contactName}! Acabei de CONFIRMAR seu horário de ${
        activeConversation.serviceName || 'atendimento'
      } para ${activeConversation.scheduledDate || 'hoje'} (${
        activeConversation.scheduledTime || 'horário marcado'
      }). Te espero lá!`,
      {
        serviceName: activeConversation.serviceName || 'Serviço Confirmado',
        date: activeConversation.scheduledDate || 'Hoje, 26 de outubro',
        time: activeConversation.scheduledTime || '10:00',
        price: activeConversation.servicePrice || 90,
        status: 'confirmado',
      }
    );
  };

  // Provider 1-Click Action: Send Pix Charge with Real QR Code in Chat
  const handleProviderSendPixCharge = () => {
    if (!activeConversation) return;
    const price = activeConversation.servicePrice || 90;
    const srvName = activeConversation.serviceName || 'Atendimento';
    const pixKey = activeTenant.pixKey || 'lucas.becker@arenasunset.com.br';
    const pixKeyType = activeTenant.pixKeyType || 'email';
    const beneficiary = activeTenant.pixBeneficiary || activeTenant.name;

    const brCode = generatePixBRCode({
      pixKey,
      pixKeyType,
      merchantName: beneficiary,
      merchantCity: 'SAO PAULO',
      amount: price,
      description: srvName,
    });

    handleSendMessage(
      `Olá ${activeConversation.contactName}! Segue o QR Code Pix oficial e o código Copia e Cola já com o valor exato de R$ ${price.toFixed(
        2
      )} para o serviço "${srvName}":`,
      undefined,
      {
        pixKey,
        pixKeyType,
        beneficiary,
        amount: price,
        serviceName: srvName,
        brCode,
      }
    );
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.serviceName || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === 'nao_lidas') return c.unreadCount > 0;
    return true;
  });

  const quickReplies =
    chatRole === 'prestador'
      ? [
          'Seu horário está confirmado!',
          'Segue endereço e localização',
          'Sim, emprestamos material/raquete!',
          'Pode pagar via Pix no local',
        ]
      : [
          'Tem horário livre hoje?',
          'Confirmar minha presença',
          'Qual o endereço exato?',
          'Aceita Pix no local?',
        ];

  return (
    <div className="w-full">
      {/* =====================================================================
          MAIN CHAT CONTAINER (FULL-HEIGHT NATIVE MOBILE & 3-COLUMN PC)
         ===================================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[calc(100dvh-8.5rem)] lg:h-[calc(100vh-8.5rem)] min-h-[560px] max-h-[820px]">
        {/* ===================================================================
            LEFT PANE (4 COLS ON PC | FULL SCREEN ON MOBILE WHEN mobileScreen==='list')
           =================================================================== */}
        <div
          className={`lg:col-span-4 border-r border-slate-200 flex flex-col h-full bg-white ${
            mobileScreen === 'list' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Left Header: Role Switcher + Search + Filters */}
          <div className="p-4 border-b border-slate-100 space-y-3 bg-white shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    chatRole === 'prestador'
                      ? 'bg-slate-900 text-white'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {chatRole === 'prestador' ? (
                    <>
                      <Briefcase className="w-3 h-3 text-blue-400" />
                      <span>Chat do Prestador</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3 text-blue-600" />
                      <span>Chat do Cliente</span>
                    </>
                  )}
                </span>
                <h2 className="text-base font-extrabold text-slate-900 mt-1">
                  {chatRole === 'prestador'
                    ? 'Clientes que Agendaram'
                    : 'Meus Prestadores'}
                </h2>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  chatRole === 'prestador'
                    ? 'Buscar cliente ou serviço agendado...'
                    : 'Buscar profissional ou área...'
                }
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterTab('todas')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition ${
                  filterTab === 'todas'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas ({conversations.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('nao_lidas')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition ${
                  filterTab === 'nao_lidas'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Não lidas (
                {conversations.filter((c) => c.unreadCount > 0).length})
              </button>
            </div>
          </div>

          {/* Scrollable Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.map((conv) => {
              const isSelected = activeConversation?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition ${
                    isSelected ? 'bg-blue-50/80' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                    <Image
                      src={conv.contactAvatar}
                      alt={conv.contactName}
                      fill
                      className="object-cover"
                    />
                    {conv.online && (
                      <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                        {conv.contactName}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">
                        {conv.lastTime}
                      </span>
                    </div>

                    {/* In Provider Mode: Show booked service & time pill */}
                    {chatRole === 'prestador' && conv.serviceName ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                            conv.bookingStatus === 'pendente'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {conv.scheduledDate} • {conv.scheduledTime?.split(' ')[0]}
                        </span>
                        <span className="text-[11px] font-bold text-blue-600 truncate">
                          R$ {conv.servicePrice}
                        </span>
                      </div>
                    ) : (
                      <p className="text-[11px] font-bold text-blue-600 truncate">
                        {conv.contactRole}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-xs text-slate-500 truncate">
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===================================================================
            CENTER PANE: ACTIVE CONVERSATION (5 COLS ON PC | FULL SCREEN ON MOBILE)
           =================================================================== */}
        <div
          className={`lg:col-span-5 flex flex-col h-full bg-[#F4F7FB] ${
            mobileScreen === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {!activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">
                Nenhuma conversa no momento
              </h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                {chatRole === 'prestador'
                  ? 'Quando os clientes entrarem em contato para agendar ou tirar dúvidas, as mensagens aparecerão aqui.'
                  : 'Inicie uma conversa ao explorar os profissionais para combinar horários ou tirar dúvidas.'}
              </p>
            </div>
          ) : (
            <>
              {/* Top Conversation Header */}
              <div className="px-3.5 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Mobile Back Button to Inbox List */}
                  <button
                    type="button"
                    onClick={() => setMobileScreen('list')}
                    className="lg:hidden p-1.5 -ml-1 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0"
                    aria-label="Voltar para lista"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <Image
                      src={activeConversation.contactAvatar}
                      alt={activeConversation.contactName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-extrabold text-slate-900 truncate">
                        {activeConversation.contactName}
                      </h3>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 truncate">
                      {chatRole === 'prestador'
                        ? `${activeConversation.serviceName || 'Cliente'} • R$ ${
                            activeConversation.servicePrice || 90
                          }`
                        : activeConversation.contactRole}
                    </p>
                  </div>
                </div>

                {/* Right Action in Chat Header */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {chatRole === 'prestador' ? (
                    <>
                      {activeConversation.bookingStatus === 'pendente' && (
                        <button
                          type="button"
                          onClick={handleProviderConfirmBookingInChat}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold flex items-center gap-1 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirmar</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowMobileDetailsSheet(true)}
                        className="lg:hidden px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-[11px] font-extrabold flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ficha</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <NextLink
                        href={`/${activeConversation.tenantSlug}`}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-extrabold flex items-center gap-1 transition"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Agendar</span>
                      </NextLink>
                      <button
                        type="button"
                        onClick={() => setShowMobileDetailsSheet(true)}
                        className="lg:hidden p-1.5 rounded-xl bg-slate-100 text-slate-700"
                        aria-label="Ver preços"
                      >
                        <Info className="w-4 h-4 text-blue-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Pinned Context Strip (Different for Provider vs Client) */}
              {chatRole === 'prestador' && activeConversation.serviceName ? (
                <div className="px-3.5 py-2 bg-slate-900 text-white flex items-center justify-between gap-2 text-[11px] shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate font-bold">
                      {activeConversation.scheduledDate} às{' '}
                      {activeConversation.scheduledTime} —{' '}
                      {activeConversation.serviceName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleProviderSendPixCharge}
                    className="px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-extrabold shrink-0 transition"
                  >
                    Cobrar R$ {activeConversation.servicePrice}
                  </button>
                </div>
              ) : (
                <div className="px-3.5 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between gap-2 text-[11px] text-blue-900 shrink-0">
                  <span className="truncate font-bold">
                    Atendimento com preço tabelado • {activeTenant.address}
                  </span>
                  <NextLink
                    href={`/${activeConversation.tenantSlug}`}
                    className="font-extrabold text-blue-600 hover:underline shrink-0"
                  >
                    Ver horários
                  </NextLink>
                </div>
              )}

              {/* Scrollable Messages Area */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3">
                {activeConversation.messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[86%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        <p>{msg.text}</p>

                        {/* Optional Attached Booking Card inside Message */}
                        {msg.bookingCard && (
                          <div
                            className={`mt-2.5 p-3 rounded-xl border text-xs space-y-1.5 ${
                              isUser
                                ? 'bg-slate-900 border-slate-800 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
                                Ordem de Agendamento
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                  msg.bookingCard.status === 'confirmado'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-amber-400 text-slate-950'
                                }`}
                              >
                                {msg.bookingCard.status}
                              </span>
                            </div>
                            <p className="font-extrabold">
                              {msg.bookingCard.serviceName}
                            </p>
                            <div className="flex items-center justify-between text-[11px] opacity-85 pt-1 border-t border-slate-700/20">
                              <span>
                                {msg.bookingCard.date} • {msg.bookingCard.time}
                              </span>
                              <strong className="text-sm font-black">
                                R$ {msg.bookingCard.price}
                              </strong>
                            </div>
                          </div>
                        )}

                        {/* Optional Attached Pix QR Code Card inside Message */}
                        {msg.pixCard && (
                          <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                                <QrCode className="w-3.5 h-3.5" />
                                QR Code Pix Oficial
                              </span>
                              <span className="text-sm font-black text-white">
                                R$ {msg.pixCard.amount.toFixed(2).replace('.', ',')}
                              </span>
                            </div>

                            <div className="flex justify-center py-1">
                              <PixQrCodeSvg brCode={msg.pixCard.brCode} size={136} />
                            </div>

                            <div className="text-[10px] text-slate-300 space-y-0.5 text-center">
                              <p className="font-bold text-white">
                                {msg.pixCard.beneficiary}
                              </p>
                              <p className="text-blue-300 truncate">
                                Chave: {msg.pixCard.pixKey}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.pixCard!.brCode);
                                  setCopiedMsgId(msg.id);
                                  setTimeout(() => setCopiedMsgId(null), 2500);
                                }}
                                className="py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold flex items-center justify-center gap-1 transition"
                              >
                                {copiedMsgId === msg.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copia e Cola</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => setShowPixModal(true)}
                                className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-extrabold flex items-center justify-center gap-1 transition"
                              >
                                <QrCode className="w-3.5 h-3.5 text-blue-400" />
                                <span>Ampliar / Cartão</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                            isUser ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          <span>{msg.time}</span>
                          {isUser && <CheckCheck className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-start">
                    <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-500 font-semibold">
                      {activeConversation.contactName} está digitando...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Composer: Quick Replies + Input */}
              <div className="p-3 bg-white border-t border-slate-200 space-y-2 shrink-0">
                {/* Quick Reply Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {quickReplies.map((qr) => (
                    <button
                      key={qr}
                      type="button"
                      onClick={() => handleSendMessage(qr)}
                      className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-[11px] font-bold whitespace-nowrap transition shrink-0"
                    >
                      {qr}
                    </button>
                  ))}
                </div>

                {/* Text Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={
                      chatRole === 'prestador'
                        ? `Responder ao cliente ${activeConversation.contactName}...`
                        : `Escrever mensagem para ${activeConversation.contactName}...`
                    }
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0 transition"
                    aria-label="Enviar mensagem"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* ===================================================================
            RIGHT PANE (3 COLS ON PC):
            - IN PROVIDER MODE: FICHA DO CLIENTE & FERRAMENTAS DE CONFIRMAÇÃO
            - IN CLIENT MODE: CATÁLOGO DE PREÇOS & AGENDAMENTO RÁPIDO
           =================================================================== */}
        <div className="hidden lg:flex lg:col-span-3 border-l border-slate-200 bg-white flex-col justify-between p-5 overflow-y-auto h-full">
          {chatRole === 'prestador' && activeConversation ? (
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                  Ficha do Cliente Agendado
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {activeConversation.contactName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  WhatsApp: {activeConversation.contactPhone}
                </p>
              </div>

              {/* Scheduled Service Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
                    Serviço Agendado
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      activeConversation.bookingStatus === 'confirmado'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-400 text-slate-950'
                    }`}
                  >
                    {activeConversation.bookingStatus || 'confirmado'}
                  </span>
                </div>

                <p className="text-sm font-extrabold">
                  {activeConversation.serviceName || 'Atendimento Agendado'}
                </p>

                <div className="space-y-1 text-xs text-slate-300 pt-1 border-t border-slate-800">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>{activeConversation.scheduledDate || 'Hoje, 26 Out'}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>{activeConversation.scheduledTime || '10:00 – 11:00'}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{activeConversation.clientAddress || activeTenant.address}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Valor Tabelado</span>
                  <span className="text-lg font-black text-white">
                    R$ {activeConversation.servicePrice || 90}
                  </span>
                </div>
              </div>

              {/* Provider 1-Click Actions inside Chat */}
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Ações Rápidas do Prestador
                </p>

                <button
                  type="button"
                  onClick={handleProviderConfirmBookingInChat}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enviar Confirmação no Chat</span>
                </button>

                <button
                  type="button"
                  onClick={handleProviderSendPixCharge}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Enviar Cobrança Pix (R$ {activeConversation.servicePrice || 90})</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSendMessage(
                      `Lembrete AgendaFácil: Olá ${activeConversation.contactName}, lembrando do nosso horário de ${activeConversation.serviceName} (${activeConversation.scheduledDate} às ${activeConversation.scheduledTime}). Local: ${activeConversation.clientAddress}.`
                    )
                  }
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                >
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span>Enviar Lembrete de Horário</span>
                </button>
              </div>
            </div>
          ) : activeTenant && activeTenant.slug ? (
            /* CLIENT MODE RIGHT PANE: PROVIDER DETAILS & SERVICES */
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                  <Image
                    src={activeTenant.avatar}
                    alt={activeTenant.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-900 truncate">
                    {activeTenant.name}
                  </h3>
                  <p className="text-xs font-bold text-blue-600 truncate">
                    {activeTenant.role}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{activeTenant.rating}</span>
                    <span className="text-slate-400 font-normal">
                      ({activeTenant.reviews})
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{activeTenant.address}</span>
                </p>
                <p className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Atendimento: {activeTenant.openingHours.start} às{' '}
                    {activeTenant.openingHours.end}
                  </span>
                </p>
              </div>

              {/* Clickable Services to Ask or Book */}
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Toque para perguntar no chat:
                </p>
                {activeTenant.services.map((srv) => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() =>
                      handleSendMessage(
                        `Olá ${activeTenant.name}! Quero agendar o serviço "${srv.name}" (R$ ${srv.price}). Quais horários tem hoje?`
                      )
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate">
                        {srv.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{srv.duration}</p>
                    </div>
                    <span className="text-xs font-black text-blue-600 shrink-0">
                      R$ {srv.price}
                    </span>
                  </button>
                ))}
              </div>

              <NextLink
                href={`/${activeTenant.slug}`}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition"
              >
                <Calendar className="w-4 h-4" />
                <span>Abrir Agenda Completa</span>
              </NextLink>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">Ficha do Prestador</p>
              <p className="text-[11px] text-slate-500">
                Selecione uma conversa com um profissional para ver serviços e horários.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          MOBILE BOTTOM SHEET FOR DETAILS (FICHA DO CLIENTE OR PREÇOS DO PRESTADOR)
         ===================================================================== */}
      {showMobileDetailsSheet && activeConversation && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end justify-center p-3"
          onClick={() => setShowMobileDetailsSheet(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                {chatRole === 'prestador'
                  ? `Ficha de ${activeConversation.contactName}`
                  : `Serviços de ${activeTenant.name}`}
              </h3>
              <button
                type="button"
                onClick={() => setShowMobileDetailsSheet(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {chatRole === 'prestador' ? (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-1.5">
                  <p className="text-[10px] font-bold text-blue-400 uppercase">
                    Serviço Contratado
                  </p>
                  <p className="text-sm font-extrabold">
                    {activeConversation.serviceName} — R${' '}
                    {activeConversation.servicePrice}
                  </p>
                  <p className="text-slate-300">
                    Quando: {activeConversation.scheduledDate} às{' '}
                    {activeConversation.scheduledTime}
                  </p>
                  <p className="text-slate-400">
                    Local: {activeConversation.clientAddress}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleProviderConfirmBookingInChat();
                      setShowMobileDetailsSheet(false);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-extrabold"
                  >
                    Confirmar no Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleProviderSendPixCharge();
                      setShowMobileDetailsSheet(false);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-blue-600 text-white font-extrabold"
                  >
                    Cobrar Pix
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeTenant.services.map((srv) => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => {
                      handleSendMessage(
                        `Olá ${activeTenant.name}! Quero agendar "${srv.name}" (R$ ${srv.price}).`
                      );
                      setShowMobileDetailsSheet(false);
                    }}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-800">{srv.name}</span>
                    <strong className="text-blue-600">R$ {srv.price}</strong>
                  </button>
                ))}
                <NextLink
                  href={`/${activeTenant.slug}`}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5"
                >
                  <span>Ir para Agenda do Prestador</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NextLink>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PIX & STRIPE CHECKOUT MODAL */}
      {activeConversation && (
        <PixPaymentModal
          isOpen={showPixModal}
          onClose={() => setShowPixModal(false)}
          providerName={activeTenant.name}
          pixKey={activeTenant.pixKey || 'lucas.becker@arenasunset.com.br'}
          pixKeyType={activeTenant.pixKeyType || 'email'}
          pixBeneficiary={activeTenant.pixBeneficiary || activeTenant.name}
          serviceName={
            activeConversation.serviceName ||
            activeTenant.services[0]?.name ||
            'Atendimento'
          }
          amount={
            activeConversation.servicePrice ||
            activeTenant.services[0]?.price ||
            90
          }
          allowEditAmount={chatRole === 'prestador'}
        />
      )}
    </div>
  );
}
