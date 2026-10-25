'use client';

import { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { ChatConversation, ChatMessage, Tenant } from '@/lib/types';
import { INITIAL_CONVERSATIONS, INITIAL_TENANTS } from '@/lib/data';
import { getStoredConversations, saveConversations, getStoredTenants } from '@/lib/store';

interface ChatWorkspaceProps {
  initialTenantSlug?: string;
  onUnreadChange?: (totalUnread: number) => void;
}

export default function ChatWorkspace({ initialTenantSlug, onUnreadChange }: ChatWorkspaceProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [tenants, setTenants] = useState<Record<string, Tenant>>(INITIAL_TENANTS);
  const [activeConvId, setActiveConvId] = useState<string>(INITIAL_CONVERSATIONS[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'todas' | 'nao_lidas'>('todas');
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat' | 'info'>('chat');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedConvs = getStoredConversations();
    const storedTenants = getStoredTenants();
    setConversations(storedConvs);
    setTenants(storedTenants);

    if (initialTenantSlug) {
      const found = storedConvs.find((c) => c.tenantSlug === initialTenantSlug);
      if (found) {
        setActiveConvId(found.id);
      }
    }
  }, [initialTenantSlug]);

  useEffect(() => {
    const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
    if (onUnreadChange) {
      onUnreadChange(totalUnread);
    }
  }, [conversations, onUnreadChange]);

  const activeConversation =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  const activeTenant = activeConversation
    ? tenants[activeConversation.tenantSlug] || INITIAL_TENANTS['lucas-beachtennis']
    : INITIAL_TENANTS['lucas-beachtennis'];

  const handleSelectConversation = (convId: string) => {
    setActiveConvId(convId);
    setMobileView('chat');
    const updated = conversations.map((c) =>
      c.id === convId ? { ...c, unreadCount: 0 } : c
    );
    setConversations(updated);
    saveConversations(updated);
  };

  const getContextualReply = (slug: string, userText: string): string => {
    const lower = userText.toLowerCase();
    if (lower.includes('endereço') || lower.includes('local')) {
      return `O atendimento será em: ${activeTenant.address}. Qualquer dúvida na chegada pode me chamar aqui!`;
    }
    if (lower.includes('pix') || lower.includes('pagamento') || lower.includes('valor')) {
      return 'Aceitamos Pix sem taxa, cartão ou pagamento direto no local após o atendimento!';
    }
    if (lower.includes('reagendar') || lower.includes('horário')) {
      return 'Sem problemas! Me diga qual horário fica melhor para você que já atualizo na agenda.';
    }
    if (slug === 'lucas-beachtennis') {
      return 'Perfeito! Quadra 02 confirmada na Arena Sunset. Raquetes e bolinhas já estão separadas para nossa aula!';
    }
    if (slug === 'carlos-mendes') {
      return 'Combinado! Estou levando o manômetro digital e os produtos de higienização do ar-condicionado.';
    }
    return 'Recebido! Seu horário está confirmado na minha agenda pelo AgendaFácil. Até já!';
  };

  const handleSendMessage = (customText?: string) => {
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
    };

    const updatedWithUserMsg = conversations.map((c) =>
      c.id === activeConversation.id
        ? {
            ...c,
            unreadCount: 0,
            lastMessage: textToSend,
            lastTime: timeStr,
            messages: [...c.messages, newMsg],
          }
        : c
    );

    setConversations(updatedWithUserMsg);
    saveConversations(updatedWithUserMsg);
    if (!customText) setMessageInput('');

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    // Simulated intelligent provider reply
    setIsTyping(true);
    const targetConvId = activeConversation.id;
    const targetSlug = activeConversation.tenantSlug;

    setTimeout(() => {
      const replyText = getContextualReply(targetSlug, textToSend);
      const replyMsg: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: 'contact',
        text: replyText,
        time: timeStr,
        status: 'read',
      };

      setConversations((prev) => {
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
      setIsTyping(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }, 900);
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === 'nao_lidas') return c.unreadCount > 0;
    return true;
  });

  const quickReplies = [
    'Confirmar presença hoje',
    'Qual o endereço exato?',
    'Aceita Pix no local?',
    'Preciso reagendar horário',
  ];

  return (
    <div className="space-y-4">
      {/* Mobile View Switcher (Only visible on Smartphone/Tablet < lg) */}
      <div className="lg:hidden grid grid-cols-3 gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          type="button"
          onClick={() => setMobileView('list')}
          className={`py-2 rounded-xl text-xs font-extrabold transition ${
            mobileView === 'list' ? 'bg-blue-600 text-white' : 'text-slate-600'
          }`}
        >
          Contatos ({conversations.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileView('chat')}
          className={`py-2 rounded-xl text-xs font-extrabold transition ${
            mobileView === 'chat' ? 'bg-blue-600 text-white' : 'text-slate-600'
          }`}
        >
          Conversa Ativa
        </button>
        <button
          type="button"
          onClick={() => setMobileView('info')}
          className={`py-2 rounded-xl text-xs font-extrabold transition ${
            mobileView === 'info' ? 'bg-blue-600 text-white' : 'text-slate-600'
          }`}
        >
          Info Prestador
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* =====================================================================
          LEFT COLUMN (4 COLS): CONVERSATION LIST
         ===================================================================== */}
      <div
        className={`${
          mobileView === 'list' ? 'flex' : 'hidden lg:flex'
        } lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex-col h-[560px] lg:h-[680px]`}
      >
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Conversas</h2>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setFilterTab('todas')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterTab === 'todas'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas ({conversations.length})
              </button>
              <button
                onClick={() => setFilterTab('nao_lidas')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterTab === 'nao_lidas'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Não lidas
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar prestador ou mensagem..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === activeConversation?.id;
            return (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`w-full p-4 text-left flex items-start gap-3.5 transition ${
                  isSelected ? 'bg-blue-50/80' : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">
                  <Image
                    src={conv.contactAvatar}
                    alt={conv.contactName}
                    fill
                    className="object-cover"
                  />
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-extrabold text-slate-900 truncate">
                      {conv.contactName}
                    </p>
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                      {conv.lastTime}
                    </span>
                  </div>

                  <p className="text-[11px] font-bold text-blue-600 truncate mt-0.5">
                    {conv.contactRole}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
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

      {/* =====================================================================
          CENTER COLUMN (5 COLS): ACTIVE CHAT WINDOW (NO GRADIENTS)
         ===================================================================== */}
      <div
        className={`${
          mobileView === 'chat' ? 'flex' : 'hidden lg:flex'
        } lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex-col h-[560px] lg:h-[680px]`}
      >
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 shrink-0">
              <Image
                src={activeConversation.contactAvatar}
                alt={activeConversation.contactName}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 truncate">
                  {activeConversation.contactName}
                </h3>
                {activeConversation.tenantSlug === 'lucas-beachtennis' && (
                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    1ª Conta
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeConversation.online ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                ></span>
                <span>{activeConversation.online ? 'Online agora' : 'Visto recentemente'}</span>
                <span>•</span>
                <span className="truncate">{activeConversation.category}</span>
              </div>
            </div>
          </div>

          <NextLink
            href={`/${activeConversation.tenantSlug}`}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 shrink-0 transition"
          >
            <span>Ver Agenda</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </NextLink>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F4F7FB]">
          <div className="text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-500">
              Hoje, 26 de outubro de 2026
            </span>
          </div>

          {activeConversation.messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {/* Optional Embedded Booking Card */}
                  {msg.bookingCard && (
                    <div className="mb-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Agendamento Vinculado
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Confirmado
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-900">
                        {msg.bookingCard.serviceName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {msg.bookingCard.date} • {msg.bookingCard.time}
                      </p>
                      <p className="text-xs font-black text-blue-600">
                        R$ {msg.bookingCard.price}
                      </p>
                    </div>
                  )}

                  <p>{msg.text}</p>

                  <div
                    className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                      isUser ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.time}</span>
                    {isUser && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-4 py-2.5 text-xs font-semibold text-slate-500 shadow-2xs">
                {activeConversation.contactName} está digitando...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Chips */}
        <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          {quickReplies.map((chip) => (
            <button
              key={chip}
              onClick={() => handleSendMessage(chip)}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-[11px] font-bold whitespace-nowrap transition"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2.5"
        >
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={`Escreva uma mensagem para ${activeConversation.contactName}...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition shrink-0"
          >
            <span>Enviar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* =====================================================================
          RIGHT COLUMN (3 COLS): CONTACT & SERVICE CONTEXT PANEL
         ===================================================================== */}
      <div
        className={`${
          mobileView === 'info' ? 'block' : 'hidden lg:block'
        } lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-5`}
      >
        <div className="text-center pb-4 border-b border-slate-100">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 mx-auto mb-3">
            <Image
              src={activeConversation.contactAvatar}
              alt={activeConversation.contactName}
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            {activeConversation.contactName}
          </h3>
          <p className="text-xs font-semibold text-blue-600 mt-0.5">
            {activeTenant.role}
          </p>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs font-bold text-slate-700">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{activeTenant.rating}</span>
            <span className="text-slate-400 font-normal">
              ({activeTenant.reviews} avaliações)
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-2.5 text-slate-700">
            <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Telefone / WhatsApp</p>
              <p className="text-slate-500">{activeConversation.contactPhone}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-slate-700">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Local de Atendimento</p>
              <p className="text-slate-500">{activeTenant.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-slate-700">
            <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Horário de Funcionamento</p>
              <p className="text-slate-500">
                {activeTenant.openingHours.start} às {activeTenant.openingHours.end}
              </p>
            </div>
          </div>
        </div>

        {/* Available Services Preview */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Principais Serviços
          </p>
          {activeTenant.services.slice(0, 3).map((srv) => (
            <div
              key={srv.id}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{srv.name}</p>
                <p className="text-[10px] text-slate-500">{srv.duration}</p>
              </div>
              <span className="text-xs font-extrabold text-blue-600 shrink-0">
                R$ {srv.price}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-2.5">
          <NextLink
            href={`/${activeConversation.tenantSlug}`}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar Novo Horário</span>
          </NextLink>

          <a
            href={`https://wa.me/${activeTenant.whatsapp}?text=Olá%20${encodeURIComponent(
              activeConversation.contactName
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-extrabold flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Abrir no WhatsApp</span>
          </a>
        </div>
      </div>
      </div>
    </div>
  );
}
