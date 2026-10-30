'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import NextLink from 'next/link';
import {
  Clock,
  MapPin,
  Star,
  Check,
  Share2,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Wind,
  Zap,
  Waves,
  Trophy,
  Home,
  Building2,
  BadgeCheck,
  FileCheck2,
  QrCode,
  User,
  Copy,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { getStoredTenants, getStoredBookings, saveNewBooking, syncWithSupabase } from '@/lib/store';
import { Tenant, Service, Booking } from '@/lib/types';
import { generateAvailableSlots } from '@/lib/slot-engine';
import PixPaymentModal from '@/components/pix/PixPaymentModal';
import { useSession } from '@/lib/auth';

const DAY_NAMES_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_NAMES_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTH_NAMES_FULL = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

function buildUpcomingDays(count = 6) {
  const base = new Date();
  const list: Array<{
    iso: string;
    dayName: string;
    dayNumber: number;
    month: string;
    fullFormatted: string;
  }> = [];

  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const iso = `${yyyy}-${mm}-${dd}`;
    list.push({
      iso,
      dayName: i === 0 ? 'Hoje' : DAY_NAMES_SHORT[d.getDay()],
      dayNumber: d.getDate(),
      month: MONTH_NAMES_SHORT[d.getMonth()],
      fullFormatted: `${d.getDate()} de ${MONTH_NAMES_FULL[d.getMonth()]} de ${yyyy}`,
    });
  }
  return list;
}

export default function TenantBookingDesktopPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const upcomingDays = useMemo(() => buildUpcomingDays(6), []);

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedDate, setSelectedDate] = useState<string>(() => buildUpcomingDays(1)[0].iso);
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [locationType, setLocationType] = useState<'local_prestador' | 'domicilio'>('domicilio');
  const [customAddress, setCustomAddress] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const session = useSession();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  useEffect(() => {
    if (session.status === 'authenticated') {
      if (session.name && !clientName) setClientName(session.name);
      if (session.phone && !clientPhone) setClientPhone(session.phone);
    }
  }, [session, clientName, clientPhone]);

  useEffect(() => {
    const loaded = getStoredTenants();
    if (slug && loaded[slug]) {
      const found = loaded[slug];
      setTenant(found);
      setActiveCategory('Todos');
      setLocationType('domicilio');
      if (found.services && found.services.length > 0) {
        setSelectedServices([found.services[0]]);
      }
    } else if (slug) {
      syncWithSupabase().then(() => {
        const fresh = getStoredTenants();
        if (fresh[slug]) {
          const found = fresh[slug];
          setTenant(found);
          setActiveCategory('Todos');
          if (found.services && found.services.length > 0) {
            setSelectedServices([found.services[0]]);
          }
        }
      });
    }
  }, [slug]);

  const categories = useMemo(() => {
    if (!tenant) return ['Todos'];
    const cats = new Set<string>(['Todos']);
    tenant.services?.forEach((s) => {
      if (s.category) cats.add(s.category);
    });
    return Array.from(cats);
  }, [tenant]);

  const filteredServices = useMemo(() => {
    if (!tenant) return [];
    if (activeCategory === 'Todos') return tenant.services || [];
    return (tenant.services || []).filter((s) => s.category === activeCategory);
  }, [tenant, activeCategory]);

  const totalDurationMinutes = useMemo(() => {
    return selectedServices.reduce((acc, s) => acc + (s.durationMinutes || 60), 0);
  }, [selectedServices]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((acc, s) => acc + s.price, 0);
  }, [selectedServices]);

  const availableSlots = useMemo(() => {
    if (!tenant) return [];
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

  const getWorkCategoryMeta = (pro: Tenant) => {
    const roleLower = (pro.role || '').toLowerCase();
    if (roleLower.includes('beach') || roleLower.includes('esporte') || roleLower.includes('professor')) {
      return {
        icon: Trophy,
        tag: 'Esportes & Aulas',
        workType: pro.role || 'Aulas e Treinamento',
        includes: [
          'Horário reservado exclusivamente na agenda',
          'Atendimento com valor tabelado sem taxas extras',
          'Confirmação imediata do agendamento',
        ],
      };
    }
    if (roleLower.includes('clima') || roleLower.includes('ar')) {
      return {
        icon: Wind,
        tag: 'Climatização & Refrigeração',
        workType: pro.role || 'Manutenção e Instalação de Ar-Condicionado',
        includes: [
          'Atendimento técnico com ferramental adequado',
          'Orçamento e preço fechado antes da visita',
          'Garantia técnica do serviço executado',
        ],
      };
    }
    if (roleLower.includes('elétr') || roleLower.includes('eletr')) {
      return {
        icon: Zap,
        tag: 'Serviços Elétricos',
        workType: pro.role || 'Instalações e Reparos Elétricos',
        includes: [
          'Diagnóstico técnico seguro',
          'Atendimento residencial ou comercial',
          'Preço transparente conforme tabela',
        ],
      };
    }
    if (roleLower.includes('piscina') || roleLower.includes('hidr')) {
      return {
        icon: Waves,
        tag: 'Manutenção & Tratamento',
        workType: pro.role || 'Especialista em Piscinas',
        includes: [
          'Atendimento no horário agendado',
          'Procedimento completo conforme descrição',
          'Pagamento direto ao profissional',
        ],
      };
    }
    return {
      icon: Sparkles,
      tag: 'Atendimento Profissional',
      workType: pro.role || 'Serviços Profissionais',
      includes: [
        'Preços tabelados com transparência',
        'Horário confirmado na agenda do profissional',
        'Pagamento via Pix direto sem taxas extras',
      ],
    };
  };

  if (!tenant) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex flex-col text-slate-900">
        <Navbar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center max-w-md space-y-4 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <User className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-slate-900">Agenda não encontrada</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              O endereço <code className="font-mono text-blue-600">/{slug}</code> não corresponde a um prestador ativo no momento.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <NextLink
                href="/explorar"
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition"
              >
                Ver Profissionais
              </NextLink>
              <NextLink
                href="/cadastro?role=prestador"
                className="px-4 py-2.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-extrabold transition"
              >
                Criar Minha Agenda
              </NextLink>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentMeta = getWorkCategoryMeta(tenant);

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
      clientEmail: session.email,
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

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* ===================================================================
            1. PROFESSIONAL PROFILE HEADER CARD
           =================================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Avatar + Professional Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
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
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Agenda Online Aberta
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {tenant.name}
                  </h1>
                  <BadgeCheck className="w-6 h-6 text-blue-600 shrink-0" />
                </div>

                <p className="text-sm font-bold text-slate-600">{currentMeta.workType}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1.5 font-extrabold text-slate-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {tenant.rating}{' '}
                    <span className="text-slate-600 font-semibold">
                      ({tenant.reviews} avaliações)
                    </span>
                  </span>

                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {tenant.address}
                  </span>

                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Expediente: {tenant.openingHours.start} às {tenant.openingHours.end}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Direct Communication & Share Actions */}
            <div className="flex flex-wrap sm:flex-col lg:items-end gap-2.5 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
              <div className="flex flex-wrap items-center gap-2.5">
                <NextLink
                  href={`/cliente/chat?prestador=${tenant.slug}`}
                  className="px-4 py-2.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-2 shadow-xs transition"
                >
                  <MessageCircle className="w-4 h-4 text-cyan-400" />
                  <span>Conversar no Chat</span>
                </NextLink>

                {tenant.whatsapp && (
                  <a
                    href={`https://wa.me/${tenant.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold flex items-center gap-2 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartilhar Agenda</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================
            2. MAIN 12-COLUMN BOOKING SPLIT LAYOUT
           =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN (7 COLS): SERVICE CATALOG */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                    Passo 1 • Catálogo de Serviços
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    Selecione o serviço desejado
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clique para selecionar um ou mais serviços para o seu atendimento
                  </p>
                </div>

                {/* Category Filter Pills */}
                {categories.length > 1 && (
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
                )}
              </div>

              {/* Service Cards List */}
              <div className="space-y-3.5">
                {filteredServices.map((service) => {
                  const isSelected = selectedServices.some((s) => s.id === service.id);
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-blue-50/50 border-blue-600'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-6 h-6 rounded-lg mt-0.5 flex items-center justify-center shrink-0 transition ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'border-2 border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-900">
                              {service.name}
                            </h3>
                            {service.category && (
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                {service.category}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                            {service.description ||
                              'Atendimento com horário marcado e preço fixo.'}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-slate-600">
                            <span className="flex items-center gap-1.5 text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              Duração: <strong>{service.duration}</strong>
                            </span>
                            <span className="flex items-center gap-1.5 text-emerald-700">
                              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                              Valor tabelado
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="block text-[10px] font-bold uppercase text-slate-400">
                            Valor
                          </span>
                          <span className="text-2xl font-black text-slate-900">
                            R$ {service.price}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-extrabold mt-2 px-3 py-1 rounded-xl transition ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? 'Selecionado' : 'Selecionar'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Guarantees */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Incluso no agendamento com {tenant.name}:
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

          {/* RIGHT COLUMN (5 COLS): STICKY BOOKING ENGINE */}
          <div id="checkout-mobile-anchor" className="lg:col-span-5 lg:sticky lg:top-24 scroll-mt-20">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-7 space-y-6">
              {!isSuccess ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                        Passo 2 e 3 • Reserva de Horário
                      </span>
                      <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                        Escolha Dia, Horário e Local
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      Taxa R$ 0
                    </span>
                  </div>

                  {/* Step 2A: Where will the service be performed? */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-2">
                      1. Local do atendimento:
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
                          <p className="text-[10px] text-slate-500">Em domicílio</p>
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
                          placeholder="Informe seu endereço completo (Rua, número, bairro)..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:bg-white focus:border-blue-600"
                        />
                      </div>
                    )}
                  </div>

                  {/* Step 2B: Dynamic Date Picker Grid */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-2">
                      2. Escolha o dia:
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
                                ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-xs'
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
                        3. Horários disponíveis:
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
                                ? 'bg-[#0B132B] border-[#0B132B] text-white'
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
                      4. Seus dados para confirmação:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Seu nome completo *"
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-600"
                      />
                      <input
                        type="text"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="Seu WhatsApp (11) 99999-9999 *"
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-600"
                      />
                    </div>
                    <input
                      type="text"
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      placeholder="Observações opcionais sobre o serviço..."
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
                      <span>Serviço(s) ({selectedServices.length}):</span>
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
                      <span className="text-xs font-bold text-slate-700">Valor Total:</span>
                      <span className="text-2xl font-black text-slate-900">R$ {totalPrice}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmBooking}
                    disabled={!selectedTime || !clientName.trim() || !clientPhone.trim()}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-sm"
                  >
                    <span>Confirmar Agendamento</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPixModal(true)}
                    className="w-full py-3 rounded-2xl bg-[#0B132B] hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Ver QR Code Pix (R$ {totalPrice})</span>
                  </button>
                </>
              ) : (
                /* SUCCESS CONFIRMATION STATE */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold">
                    Agendamento #{createdBooking?.id.slice(-4)} Confirmado
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Horário Reservado com Sucesso!
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    O profissional <strong>{tenant.name}</strong> recebeu seu agendamento para{' '}
                    <strong>
                      {createdBooking?.formattedDate} às {createdBooking?.time}
                    </strong>
                    .
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
                    <p>
                      <strong>Serviço:</strong>{' '}
                      {createdBooking?.services.map((s) => s.name).join(', ')}
                    </p>
                    <p>
                      <strong>Local:</strong> {createdBooking?.address}
                    </p>
                    <p>
                      <strong>Valor:</strong> R$ {createdBooking?.totalPrice}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPixModal(true)}
                      className="w-full py-3.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>Pagar com QR Code Pix (R$ {createdBooking?.totalPrice || totalPrice})</span>
                    </button>

                    <NextLink
                      href={`/cliente/chat?prestador=${tenant.slug}`}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Falar com o Profissional no Chat
                    </NextLink>

                    {tenant.whatsapp && (
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
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <NextLink
                        href="/cliente/agendamentos"
                        className="py-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs text-center hover:bg-slate-200 transition"
                      >
                        Meus Agendamentos
                      </NextLink>
                      <button
                        onClick={() => setIsSuccess(false)}
                        className="py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                      >
                        Novo Horário
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
        pixKey={tenant.pixKey || tenant.phone || ''}
        pixKeyType={tenant.pixKeyType || 'telefone'}
        pixBeneficiary={tenant.pixBeneficiary || tenant.name}
        serviceName={
          (createdBooking?.services || selectedServices)
            .map((s) => s.name)
            .join(' + ') || 'Atendimento'
        }
        amount={createdBooking?.totalPrice || totalPrice}
      />
    </div>
  );
}
