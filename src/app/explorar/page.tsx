'use client';

import { useState, useMemo, useEffect } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  Star,
  Calendar,
  Sparkles,
  Trophy,
  Wind,
  Zap,
  Waves,
  ChevronRight,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  User,
  Compass,
} from 'lucide-react';
import { getStoredTenants, getStoredBookings, syncWithSupabase } from '@/lib/store';
import { Tenant, Booking } from '@/lib/types';
import ProviderStoriesBar from '@/components/stories/ProviderStoriesBar';
import AppSidebar from '@/components/layout/AppSidebar';

const CATEGORIES = [
  { id: 'todos', label: 'Todos', icon: Sparkles },
  { id: 'esportes', label: 'Beach Tennis', icon: Trophy },
  { id: 'climatizacao', label: 'Ar-condicionado', icon: Wind },
  { id: 'eletrica', label: 'Elétrica', icon: Zap },
  { id: 'piscina', label: 'Piscina & Limpeza', icon: Waves },
];

export default function ExplorarClientePage() {
  const [tenants, setTenants] = useState<Record<string, Tenant>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

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

  const tenantList = useMemo(() => Object.values(tenants), [tenants]);

  // Client's own bookings (Raul Freitas)
  const myBookings = useMemo(
    () => bookings.filter((b) => b.clientName === 'Raul Freitas' && b.status !== 'cancelado'),
    [bookings]
  );

  const nextBooking = myBookings[0];

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
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-28 lg:pb-10 w-full max-w-6xl mx-auto space-y-5">
        {/* ===================================================================
            1. CABEÇALHO SIMPLES E DIRETO DO CLIENTE + BUSCA
           =================================================================== */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-extrabold">
                <Compass className="w-3 h-3 text-blue-600" />
                Explorar Prestadores
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                O que você quer agendar hoje?
              </h1>
            </div>

            <NextLink
              href="/meus-agendamentos"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-2 w-fit transition"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Meus Horários ({myBookings.length})</span>
            </NextLink>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar profissional ou serviço (Ex: Beach Tennis, Ar-condicionado, Elétrica)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Simple Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-xs'
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

        {/* ===================================================================
            2. FAIXA COMPACTA DO PRÓXIMO HORÁRIO DO CLIENTE (SE HOUVER)
           =================================================================== */}
        {nextBooking && (
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-blue-400">
                  Seu próximo serviço agendado:
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-white truncate">
                  {nextBooking.services[0]?.name} com {nextBooking.tenantName} • {nextBooking.formattedDate} às {nextBooking.time}
                </p>
              </div>
            </div>

            <NextLink
              href="/meus-agendamentos"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 w-fit transition"
            >
              <span>Ver detalhes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </NextLink>
          </div>
        )}

        {/* ===================================================================
            3. STORIES RÁPIDOS DOS PROFISSIONAIS
           =================================================================== */}
        <ProviderStoriesBar />

        {/* ===================================================================
            4. LISTA LIMPA E SIMPLES DE PROFISSIONAIS PARA AGENDAR
           =================================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Escolha um Profissional para Agendar ({filteredTenants.length})
            </h2>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Preços fixos • Sem esperar orçamento
            </span>
          </div>

          {filteredTenants.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Nenhum prestador cadastrado no momento
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  Todos os prestadores de teste foram removidos. Cadastre um novo prestador pela página de cadastro ou insira diretamente no seu banco Supabase.
                </p>
              </div>
              <div className="pt-2">
                <NextLink
                  href="/cadastro"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm transition"
                >
                  <User className="w-4 h-4" />
                  <span>Cadastrar Novo Prestador</span>
                </NextLink>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTenants.map((pro) => (
                <div
                  key={pro.slug}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-blue-400 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Provider Header */}
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                        <Image src={pro.avatar} alt={pro.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-extrabold text-slate-900 truncate">
                            {pro.name}
                          </h3>
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        </div>
                        <p className="text-xs font-bold text-blue-600 truncate">{pro.role}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-xs font-bold text-slate-700">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{pro.rating}</span>
                          <span className="text-slate-400 font-normal">({pro.reviews})</span>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{pro.address}</span>
                    </p>

                    {/* Simple Price Table */}
                    <div className="mt-3.5 pt-3.5 border-t border-slate-100 space-y-1.5">
                      {pro.services.slice(0, 3).map((serv) => (
                        <div
                          key={serv.id}
                          className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-50"
                        >
                          <span className="font-semibold text-slate-700 truncate pr-2">
                            {serv.name}
                          </span>
                          <strong className="text-slate-900 shrink-0">R$ {serv.price}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clear Action Buttons */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2">
                    <NextLink
                      href={`/chat?prestador=${pro.slug}`}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-1.5 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Chat</span>
                    </NextLink>

                    <NextLink
                      href={`/${pro.slug}`}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <span>Ver Horários e Agendar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </NextLink>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AppSidebar>
  );
}
