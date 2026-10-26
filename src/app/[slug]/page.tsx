'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import NextLink from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Star,
  Check,
  ChevronLeft,
  Share2,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Award,
  ArrowRight,
  Wrench,
  Wind,
  Zap,
  Waves,
  Trophy,
  Home,
  Building2,
  BadgeCheck,
  FileCheck2,
  QrCode,
} from 'lucide-react';
import AppSidebar from '@/components/layout/AppSidebar';
import { getStoredTenants, getStoredBookings, saveNewBooking } from '@/lib/store';
import { INITIAL_TENANTS } from '@/lib/data';
import { Tenant, Service, Booking } from '@/lib/types';
import { generateAvailableSlots } from '@/lib/slot-engine';
import ProviderStoriesBar from '@/components/stories/ProviderStoriesBar';
import PixPaymentModal from '@/components/pix/PixPaymentModal';

export default function TenantBookingDesktopPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'lucas-beachtennis';

  const defaultTenant =
    INITIAL_TENANTS[slug] ||
    INITIAL_TENANTS['lucas-beachtennis'] ||
    Object.values(INITIAL_TENANTS)[0];

  const [tenants, setTenants] = useState<Record<string, Tenant>>(INITIAL_TENANTS);
  const [tenant, setTenant] = useState<Tenant>(defaultTenant);
  const [selectedServices, setSelectedServices] = useState<Service[]>(
    defaultTenant && defaultTenant.services.length > 0 ? [defaultTenant.services[0]] : []
  );
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-26');
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [locationType, setLocationType] = useState<'local_prestador' | 'domicilio'>(
    slug === 'lucas-beachtennis' ? 'local_prestador' : 'domicilio'
  );
  const [customAddress, setCustomAddress] = useState('Av. Paulista, 1578 - Bela Vista');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);

  // Client Form states
  const [clientName, setClientName] = useState('Raul Freitas');
  const [clientPhone, setClientPhone] = useState('(11) 98765-4321');
  const [clientNotes, setClientNotes] = useState('');

  useEffect(() => {
    const loaded = getStoredTenants();
    setTenants(loaded);
    const found = loaded[slug] || loaded['lucas-beachtennis'] || Object.values(loaded)[0];
    if (found) {
      setTenant(found);
      setActiveCategory('Todos');
      setLocationType(found.slug === 'lucas-beachtennis' ? 'local_prestador' : 'domicilio');
      if (found.services.length > 0) {
        setSelectedServices([found.services[0]]);
      }
    }
  }, [slug]);

  const categories = useMemo(() => {
    const cats = new Set<string>(['Todos']);
    tenant.services.forEach((s) => {
      if (s.category) cats.add(s.category);
    });
    return Array.from(cats);
  }, [tenant]);

  const filteredServices = useMemo(() => {
    if (activeCategory === 'Todos') return tenant.services;
    return tenant.services.filter((s) => s.category === activeCategory);
  }, [tenant, activeCategory]);

  const upcomingDays = useMemo(() => {
    return [
      { iso: '2026-10-26', dayName: 'Seg', dayNumber: 26, month: 'Out', fullFormatted: '26 de outubro de 2026' },
      { iso: '2026-10-27', dayName: 'Ter', dayNumber: 27, month: 'Out', fullFormatted: '27 de outubro de 2026' },
      { iso: '2026-10-28', dayName: 'Qua', dayNumber: 28, month: 'Out', fullFormatted: '28 de outubro de 2026' },
      { iso: '2026-10-29', dayName: 'Qui', dayNumber: 29, month: 'Out', fullFormatted: '29 de outubro de 2026' },
      { iso: '2026-10-30', dayName: 'Sex', dayNumber: 30, month: 'Out', fullFormatted: '30 de outubro de 2026' },
      { iso: '2026-10-31', dayName: 'Sáb', dayNumber: 31, month: 'Out', fullFormatted: '31 de outubro de 2026' },
    ];
  }, []);

  const totalDurationMinutes = useMemo(() => {
    return selectedServices.reduce((acc, s) => acc + (s.durationMinutes || 60), 0);
  }, [selectedServices]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((acc, s) => acc + s.price, 0);
  }, [selectedServices]);

  const availableSlots = useMemo(() => {
    const existingBookings = getStoredBookings();
    return generateAvailableSlots(tenant, selectedDate, existingBookings, totalDurationMinutes);
  }, [tenant, selectedDate, totalDurationMinutes]);

  const toggleService = (service: Service) => {
    setIsSuccess(false);
    if (selectedServices.some((s) => s.id === service.id)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
      }
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const getWorkCategoryMeta = (tenantSlug: string) => {
    if (tenantSlug === 'lucas-beachtennis') {
      return {
        icon: Trophy,
        tag: 'Esportes & Aulas (1ª Conta)',
        workType: 'Aulas & Locação de Quadra',
        includes: ['Equipamentos (raquetes e bolinhas) inclusos', 'Quadra de areia oficial reservada', 'Confirmação imediata na agenda'],
      };
    }
    if (tenantSlug === 'carlos-mendes') {
      return {
        icon: Wind,
        tag: 'Trabalho Técnico • Climatização',
        workType: 'Instalação e Manutenção de Ar-Condicionado',
        includes: ['Ferramental e manômetro digital inclusos', 'Higienização bactericida completa', 'Garantia de 90 dias no serviço executado'],
      };
    }
    if (tenantSlug === 'joao-silva') {
      return {
        icon: Zap,
        tag: 'Trabalho Técnico • Elétrica',
        workType: 'Reparos Elétricos, Quadros e Disjuntores',
        includes: ['Diagnóstico de carga com multímetro', 'Atendimento residencial ou comercial', 'Laudo e garantia de segurança elétrica'],
      };
    }
    if (tenantSlug === 'equipe-aqua') {
      return {
        icon: Waves,
        tag: 'Trabalho Técnico • Piscinas',
        workType: 'Limpeza, Aspiração e Controle de pH',
        includes: ['Produtos químicos e medição de cloro/pH', 'Aspiração de fundo e limpeza de bordas', 'Revisão da bomba e filtro'],
      };
    }
    return {
      icon: Sparkles,
      tag: 'Trabalho Técnico • Limpeza',
      workType: 'Limpeza Técnica e Pós-Obra',
      includes: ['Produtos biodegradáveis e maquinário inclusos', 'Equipe uniformizada e verificada', 'Checklist completo por ambiente'],
    };
  };

  const currentMeta = getWorkCategoryMeta(tenant.slug);

  const handleConfirmBooking = () => {
    if (!tenant || !selectedDate || !selectedTime || !clientName || !clientPhone) return;

    const formattedDayObj = upcomingDays.find((d) => d.iso === selectedDate);
    const finalAddress =
      locationType === 'domicilio' ? customAddress || tenant.address : tenant.address;

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantRole: tenant.role,
      tenantAvatar: tenant.avatar,
      tenantPhone: tenant.phone,
      tenantRating: tenant.rating,
      tenantReviews: tenant.reviews,
      clientName,
      clientPhone,
      services: selectedServices.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        duration: s.duration,
      })),
      totalPrice,
      date: selectedDate,
      formattedDate: formattedDayObj ? formattedDayObj.fullFormatted : selectedDate,
      time: selectedTime,
      endTime: '11:00',
      status: 'confirmado',
      address: finalAddress,
      notes: clientNotes || selectedServices.map((s) => s.name).join(' + '),
      createdAt: new Date().toISOString(),
    };

    saveNewBooking(newBooking);
    setCreatedBooking(newBooking);
    setIsSuccess(true);
  };

  return (
    <AppSidebar>
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-28 lg:pb-10 space-y-6">
        {/* ===================================================================
            1. TOP EXPLANATORY BANNER: WHAT IS AGENDAFÁCIL & WORK SWITCHER
           =================================================================== */}
        <div className="bg-[#0B132B] text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-extrabold uppercase tracking-wider">
                <Wrench className="w-3.5 h-3.5" />
                <span>Plataforma de Agendamento Rápido de Trabalhos & Serviços</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Contrate um trabalho ou aula em 3 passos — sem esperar orçamento no WhatsApp
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
                No <strong>AgendaFácil</strong>, você escolhe o serviço com <strong>preço fechado</strong>, vê os <strong>horários livres reais</strong> do prestador e confirma o trabalho na hora. Alterne abaixo para testar diferentes áreas de trabalho:
              </p>
            </div>

            <NextLink
              href="/explorar"
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-extrabold flex items-center gap-2 shrink-0 w-fit transition"
            >
              <span>Ver Todos os Prestadores</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </NextLink>
          </div>

          {/* Interactive Work Type / Provider Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
            {Object.values(tenants).map((t) => {
              const isCurrent = t.slug === tenant.slug;
              const meta = getWorkCategoryMeta(t.slug);
              const Icon = meta.icon;
              return (
                <NextLink
                  key={t.slug}
                  href={`/${t.slug}`}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                    isCurrent
                      ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isCurrent ? 'bg-white text-blue-600' : 'bg-slate-800 text-blue-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold truncate">{t.name}</p>
                    <p
                      className={`text-[11px] truncate ${
                        isCurrent ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {t.role}
                    </p>
                  </div>
                </NextLink>
              );
            })}
          </div>
        </div>

        {/* ===================================================================
            2. HIGH-CONTRAST PROFESSIONAL PROFILE CARD (ZERO OVERLAP BUG)
           =================================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Avatar + Clear Professional Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-slate-200 bg-slate-100 shrink-0">
                <Image
                  src={tenant.avatar}
                  alt={tenant.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold">
                    {currentMeta.tag}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Agenda Online Aberta
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {tenant.name}
                  </h1>
                  <BadgeCheck className="w-6 h-6 text-blue-600 shrink-0" />
                </div>

                <p className="text-sm font-bold text-slate-700">
                  Especialidade: <span className="text-blue-600">{currentMeta.workType}</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1.5 font-extrabold text-slate-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {tenant.rating}{' '}
                    <span className="text-slate-600 font-semibold">
                      ({tenant.reviews} trabalhos avaliados)
                    </span>
                  </span>

                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {tenant.address}
                  </span>

                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Atendimento: {tenant.openingHours.start} às {tenant.openingHours.end}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Direct Communication & Share Actions */}
            <div className="flex flex-wrap sm:flex-col lg:items-end gap-2.5 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
              <div className="flex flex-wrap items-center gap-2.5">
                <NextLink
                  href={`/chat?prestador=${tenant.slug}`}
                  className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-xs transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Tirar Dúvida no Chat</span>
                </NextLink>

                <a
                  href={`https://wa.me/${tenant.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold flex items-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Direto</span>
                </a>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link de agendamento copiado!');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Copiar Link desta Agenda</span>
              </button>
            </div>
          </div>

          {/* 3-Step Explicit Visual Guide Strip */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">
                  Escolha o Trabalho Tabelado
                </p>
                <p className="text-[11px] text-slate-500">
                  Veja o preço fechado e o tempo estimado na lista abaixo
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">
                  Defina Dia, Horário e Local
                </p>
                <p className="text-[11px] text-slate-500">
                  Escolha um horário livre no painel ao lado sem burocracia
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">
                  Trabalho Agendado na Hora
                </p>
                <p className="text-[11px] text-slate-500">
                  Ordem de serviço gerada automaticamente (100% grátis p/ cliente)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STORIES DOS PRESTADORES (Destaques de Trabalhos do Dia) */}
        <ProviderStoriesBar highlightSlug={tenant.slug} />

        {/* ===================================================================
            3. MAIN 12-COLUMN DESKTOP WORKBOOKING SPLIT LAYOUT
           =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN (7 COLS): WORK / SERVICE PACKAGES */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                    Passo 1 de 3 • Catálogo de Preços Fechados
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    Qual trabalho ou serviço você precisa?
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clique para marcar 1 ou mais itens que deseja contratar neste atendimento
                  </p>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        activeCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service / Work Cards List */}
              <div className="space-y-4">
                {filteredServices.map((service) => {
                  const isSelected = selectedServices.some((s) => s.id === service.id);
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-blue-50/60 border-blue-600'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-6 h-6 rounded-lg mt-1 flex items-center justify-center shrink-0 transition ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'border-2 border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-900">
                              {service.name}
                            </h3>
                            {service.category && (
                              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-md">
                                {service.category}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                            {service.description ||
                              'Serviço executado por profissional verificado com horário marcado e preço fixo.'}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-slate-600">
                            <span className="flex items-center gap-1.5 text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              Tempo médio: <strong>{service.duration}</strong>
                            </span>
                            <span className="flex items-center gap-1.5 text-emerald-700">
                              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                              Preço fechado sem taxa extra
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="block text-[10px] font-bold uppercase text-slate-400">
                            Valor do serviço
                          </span>
                          <span className="text-2xl font-black text-slate-900">
                            R$ {service.price}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-extrabold mt-2 px-3.5 py-1.5 rounded-xl transition ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? 'Trabalho Selecionado' : '+ Selecionar Trabalho'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* What's Included in this Professional's Work */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  O que está garantido na contratação de {tenant.name}:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentMeta.includes.map((item, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2 text-xs text-slate-700 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (5 COLS): STICKY DESKTOP WORK BOOKING ENGINE */}
          <div id="checkout-mobile-anchor" className="lg:col-span-5 lg:sticky lg:top-24 scroll-mt-20">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-7 space-y-6">
              {!isSuccess ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                        Passo 2 e 3 • Finalização Rápida
                      </span>
                      <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                        Agendar Dia, Horário e Local
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      Sem Taxa (R$ 0)
                    </span>
                  </div>

                  {/* Step 2A: Where will the work be performed? */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-2">
                      1. Onde o trabalho/serviço será realizado?
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setLocationType('domicilio')}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                          locationType === 'domicilio'
                            ? 'bg-blue-50 border-blue-600 text-blue-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Home className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-xs font-extrabold">No meu endereço</p>
                          <p className="text-[10px] text-slate-500">Visita técnica / Domicílio</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLocationType('local_prestador')}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                          locationType === 'local_prestador'
                            ? 'bg-blue-50 border-blue-600 text-blue-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-xs font-extrabold">Local do prestador</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-[110px]">
                            {tenant.address}
                          </p>
                        </div>
                      </button>
                    </div>

                    {locationType === 'domicilio' && (
                      <div className="mt-2.5">
                        <input
                          type="text"
                          value={customAddress}
                          onChange={(e) => setCustomAddress(e.target.value)}
                          placeholder="Digite o endereço onde o trabalho será feito..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:bg-white focus:border-blue-600"
                        />
                      </div>
                    )}
                  </div>

                  {/* Step 2B: Date Picker Grid */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-2">
                      2. Escolha o dia do trabalho (Outubro 2026):
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {upcomingDays.map((day) => {
                        const isSelected = selectedDate === day.iso;
                        return (
                          <button
                            key={day.iso}
                            onClick={() => setSelectedDate(day.iso)}
                            className={`py-2.5 rounded-2xl flex flex-col items-center justify-center border transition ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span
                              className={`text-[10px] ${
                                isSelected ? 'text-blue-100' : 'text-slate-400'
                              }`}
                            >
                              {day.dayName}
                            </span>
                            <span className="text-base font-extrabold my-0.5">{day.dayNumber}</span>
                            <span
                              className={`text-[9px] ${
                                isSelected ? 'text-blue-200' : 'text-slate-400'
                              }`}
                            >
                              {day.month}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2C: Time Slots Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-extrabold text-slate-800">
                        3. Escolha o horário disponível:
                      </label>
                      <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        {availableSlots.filter((s) => s.available).length} horários livres
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto pr-1">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedTime === slot.time;
                        if (!slot.available) {
                          return (
                            <div
                              key={slot.time}
                              className="py-2 rounded-xl border border-slate-100 bg-slate-50 text-slate-300 text-xs font-semibold text-center line-through cursor-not-allowed"
                            >
                              {slot.time}
                            </div>
                          );
                        }
                        return (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`py-2 rounded-xl text-xs font-bold border transition ${
                              isSelected
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-600 hover:text-blue-600'
                            }`}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Client Identification Fields */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-extrabold text-slate-800">
                      4. Seus dados para emissão da Ordem de Serviço:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Seu nome completo"
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-600"
                      />
                      <input
                        type="text"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="WhatsApp (11) 99999-9999"
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-600"
                      />
                    </div>
                    <input
                      type="text"
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      placeholder="Detalhes do trabalho (ex: marca do aparelho, andar, observações...)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Summary Box & Confirm Button */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Profissional:</span>
                      <strong className="text-slate-900">{tenant.name}</strong>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Trabalho(s) ({selectedServices.length}):</span>
                      <strong className="text-slate-900 truncate max-w-[210px]">
                        {selectedServices.map((s) => s.name).join(', ')}
                      </strong>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Data e Hora:</span>
                      <strong className="text-blue-600">
                        {upcomingDays.find((d) => d.iso === selectedDate)?.fullFormatted} às{' '}
                        {selectedTime}
                      </strong>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="text-xs font-bold text-slate-700">
                        Valor Total Tabelado:
                      </span>
                      <span className="text-2xl font-black text-slate-900">R$ {totalPrice}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmBooking}
                    disabled={!selectedTime}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition"
                  >
                    <span>Confirmar Contratação & Horário</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPixModal(true)}
                    className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Ver QR Code Pix (R$ {totalPrice}) ou Pagar com Cartão</span>
                  </button>
                </>
              ) : (
                /* SUCCESS CONFIRMATION STATE */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold">
                    Ordem de Serviço #{createdBooking?.id.slice(-4)} Emitida
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Trabalho Agendado com Sucesso!
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    O profissional <strong>{tenant.name}</strong> recebeu seu pedido para{' '}
                    <strong>
                      {createdBooking?.formattedDate} às {createdBooking?.time}
                    </strong>
                    .
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
                    <p>
                      <strong>Trabalho contratado:</strong>{' '}
                      {createdBooking?.services.map((s) => s.name).join(', ')}
                    </p>
                    <p>
                      <strong>Local do atendimento:</strong> {createdBooking?.address}
                    </p>
                    <p>
                      <strong>Valor fechado:</strong> R$ {createdBooking?.totalPrice}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPixModal(true)}
                      className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>Gerar QR Code Pix (R$ {createdBooking?.totalPrice || totalPrice}) ou Cartão</span>
                    </button>

                    <NextLink
                      href={`/chat?prestador=${tenant.slug}`}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Combinar Detalhes no Chat Interno
                    </NextLink>

                    <a
                      href={`https://wa.me/${tenant.whatsapp}?text=Olá%20${encodeURIComponent(
                        tenant.name
                      )},%20confirmei%20meu%20agendamento%20para%20${encodeURIComponent(
                        createdBooking?.formattedDate || ''
                      )}%20às%20${createdBooking?.time}!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Enviar Comprovante no WhatsApp
                    </a>

                    <div className="grid grid-cols-2 gap-2">
                      <NextLink
                        href="/dashboard"
                        className="py-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs text-center hover:bg-slate-200 transition"
                      >
                        Ver no Painel
                      </NextLink>
                      <button
                        onClick={() => setIsSuccess(false)}
                        className="py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                      >
                        Agendar Outro
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <PixPaymentModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        providerName={tenant.name}
        pixKey={tenant.pixKey || 'lucas.becker@arenasunset.com.br'}
        pixKeyType={tenant.pixKeyType || 'email'}
        pixBeneficiary={tenant.pixBeneficiary || tenant.name}
        serviceName={
          (createdBooking?.services || selectedServices)
            .map((s) => s.name)
            .join(' + ') || 'Atendimento'
        }
        amount={createdBooking?.totalPrice || totalPrice}
      />
    </AppSidebar>
  );
}
