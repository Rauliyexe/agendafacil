'use client';

import { useState, useMemo, useEffect } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  Star,
  Calendar,
  Clock,
  Sparkles,
  Trophy,
  Wind,
  Zap,
  Waves,
  ChevronRight,
  ArrowRight,
  MessageCircle,
  LayoutDashboard,
  UserCheck,
  Home,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { getStoredTenants, getStoredBookings } from '@/lib/store';
import { Tenant, Booking } from '@/lib/types';
import ProviderStoriesBar from '@/components/stories/ProviderStoriesBar';
import AppSidebar from '@/components/layout/AppSidebar';

const CATEGORIES = [
  { id: 'todos', label: 'Todos os Serviços', icon: Sparkles },
  { id: 'esportes', label: 'Beach Tennis & Esportes', icon: Trophy },
  { id: 'climatizacao', label: 'Ar-condicionado', icon: Wind },
  { id: 'eletrica', label: 'Elétrica', icon: Zap },
  { id: 'piscina', label: 'Piscina & Limpeza', icon: Waves },
];

export default function ExplorarClienteDesktopPage() {
  const [tenants, setTenants] = useState<Record<string, Tenant>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const clientUser = {
    name: 'Raul Freitas',
    email: 'raul@empresa.com',
    city: 'São Paulo, SP',
  };

  useEffect(() => {
    setTenants(getStoredTenants());
    setBookings(getStoredBookings());
  }, []);

  const tenantList = useMemo(() => Object.values(tenants), [tenants]);

  const nextBooking = useMemo(() => {
    return bookings.find((b) => b.status === 'confirmado' || b.status === 'pendente') || bookings[0];
  }, [bookings]);

  const filteredTenants = useMemo(() => {
    return tenantList.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.specialty.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (selectedCategory === 'todos') return true;
      if (selectedCategory === 'esportes') {
        return t.role.toLowerCase().includes('beach') || t.specialty.toLowerCase().includes('beach');
      }
      if (selectedCategory === 'climatizacao') {
        return t.role.toLowerCase().includes('clima') || t.specialty.toLowerCase().includes('ar');
      }
      if (selectedCategory === 'eletrica') {
        return t.role.toLowerCase().includes('elétr') || t.role.toLowerCase().includes('eletr');
      }
      if (selectedCategory === 'piscina') {
        return (
          t.role.toLowerCase().includes('piscina') ||
          t.role.toLowerCase().includes('limpeza') ||
          t.role.toLowerCase().includes('hidr')
        );
      }
      return true;
    });
  }, [tenantList, searchQuery, selectedCategory]);

  return (
    <AppSidebar>
      {/* MAIN DESKTOP WORKSPACE */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-28 lg:pb-10 w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Desktop Bar */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{clientUser.city} • Contratação Rápida com Preço Tabelado (R$ 0 de taxa)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Agende Trabalhos, Técnicos e Aulas sem Esperar Orçamento
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Escolha o trabalho com preço fechado, veja os horários livres reais do profissional e confirme em 1 clique.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NextLink
              href="/meus-agendamentos"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 transition"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              Meus Horários ({bookings.length})
            </NextLink>
            <NextLink
              href="/dashboard"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              Painel Completo
            </NextLink>
          </div>
        </div>

        {/* STORIES DOS PRESTADORES (Mobile Circle Bar + Desktop Social Work Cards) */}
        <ProviderStoriesBar />

        {/* 12-Column Desktop Hero Row: Search & Categories (7 cols) | Next Appointment (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left 7 Cols: Search & Category Filters */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900">
                Qual serviço ou aula você precisa agendar hoje?
              </h2>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por Beach Tennis, Ar-condicionado, Elétrica, Piscina, Limpeza..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 5 Cols: Next Appointment Highlight Card */}
          {nextBooking && (
            <div className="lg:col-span-5 bg-[#0B132B] text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Próximo Agendamento
                  </span>
                  <span className="text-xs text-slate-400">{nextBooking.formattedDate}</span>
                </div>

                <div className="flex items-center gap-3.5 mt-2">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/20 shrink-0">
                    <Image
                      src={nextBooking.tenantAvatar}
                      alt={nextBooking.tenantName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold text-white truncate">
                      {nextBooking.services[0]?.name}
                    </h3>
                    <p className="text-xs text-blue-300 font-semibold truncate">
                      {nextBooking.tenantName} • {nextBooking.time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                <NextLink
                  href="/meus-agendamentos"
                  className="text-xs font-bold text-white hover:text-blue-300 flex items-center gap-1"
                >
                  Ver Detalhes <ChevronRight className="w-3.5 h-3.5" />
                </NextLink>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Confirmado
                </span>
              </div>
            </div>
          )}

        </div>

        {/* ===================================================================
            3-COLUMN DESKTOP GRID OF PROVIDERS
           =================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">
              Prestadores Disponíveis ({filteredTenants.length})
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              Clique em um prestador para abrir a agenda completa no PC
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTenants.map((pro) => (
              <div
                key={pro.slug}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-lg hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                        <Image src={pro.avatar} alt={pro.name} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-extrabold text-slate-900">{pro.name}</h3>
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        </div>
                        <p className="text-xs font-bold text-blue-600">{pro.role}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs font-bold text-slate-700">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{pro.rating}</span>
                          <span className="text-slate-400 font-normal">({pro.reviews} avaliações)</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      Ativo
                    </span>
                  </div>

                  {pro.slug === 'lucas-beachtennis' && (
                    <div className="mt-3 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>1ª Conta Oficial • Professor de Beach Tennis</span>
                    </div>
                  )}

                  <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{pro.address}</span>
                  </p>

                  {/* Services list */}
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Trabalhos & Serviços com Preço Fechado:
                    </p>
                    {pro.services.slice(0, 3).map((serv) => (
                      <div
                        key={serv.id}
                        className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-50"
                      >
                        <span className="font-semibold text-slate-700 truncate pr-2">{serv.name}</span>
                        <strong className="text-slate-900 shrink-0">R$ {serv.price}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <NextLink
                    href={`/chat?prestador=${pro.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span>Chat</span>
                  </NextLink>
                  <NextLink
                    href={`/${pro.slug}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    <span>Agendar Trabalho</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </NextLink>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </AppSidebar>
  );
}
