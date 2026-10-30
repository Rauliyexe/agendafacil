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
  Clock,
} from 'lucide-react';
import { getStoredTenants, getStoredBookings, syncWithSupabase } from '@/lib/store';
import { Tenant, Booking } from '@/lib/types';
import Navbar from '@/components/layout/Navbar';
import { useSession } from '@/lib/auth';

const CATEGORIES = [
  { id: 'todos', label: 'Todos os Serviços', icon: Sparkles },
  { id: 'esportes', label: 'Esportes & Aulas', icon: Trophy },
  { id: 'climatizacao', label: 'Climatização & Ar', icon: Wind },
  { id: 'eletrica', label: 'Elétrica & Reparos', icon: Zap },
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
  const session = useSession();

  const myBookings = useMemo(() => {
    if (session.status !== 'authenticated') return [];
    const name = (session.name || '').toLowerCase();
    const mail = (session.email || '').toLowerCase();
    const phone = (session.phone || '').replace(/\D/g, '');
    return bookings.filter((b) => {
      if (b.status === 'cancelado') return false;
      if (mail && b.clientEmail?.toLowerCase() === mail) return true;
      if (phone && b.clientPhone?.replace(/\D/g, '') === phone) return true;
      if (name && b.clientName?.toLowerCase().includes(name)) return true;
      return false;
    });
  }, [bookings, session]);

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
        return (
          t.role.toLowerCase().includes('beach') ||
          t.specialty.toLowerCase().includes('beach') ||
          t.role.toLowerCase().includes('professor')
        );
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
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        {/* ===================================================================
            1. CABEÇALHO DE BUSCA E FILTROS
           =================================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-extrabold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                Diretório de Profissionais
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Encontre um profissional e agende online
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Consulte o catálogo de preços fixos e escolha o melhor horário diretamente na agenda do prestador.
              </p>
            </div>

            {session.status === 'authenticated' && session.role === 'cliente' && (
              <NextLink
                href="/cliente/agendamentos"
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-2 w-fit shrink-0 transition"
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Meus Agendamentos ({myBookings.length})</span>
              </NextLink>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome do profissional, especialidade ou serviço..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition ${
                    isSelected
                      ? 'bg-[#0B132B] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
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
          <div className="bg-[#0B132B] text-white rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-cyan-400">
                  Seu próximo serviço agendado:
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-white truncate">
                  {nextBooking.services[0]?.name} com {nextBooking.tenantName} • {nextBooking.formattedDate} às {nextBooking.time}
                </p>
              </div>
            </div>

            <NextLink
              href="/cliente/agendamentos"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 w-fit transition"
            >
              <span>Ver detalhes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </NextLink>
          </div>
        )}

        {/* ===================================================================
            3. LISTA DE PROFISSIONAIS DISPONÍVEIS
           =================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Profissionais Disponíveis ({filteredTenants.length})
            </h2>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Preços transparentes • Agendamento imediato
            </span>
          </div>

          {filteredTenants.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Nenhum profissional encontrado
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  {searchQuery || selectedCategory !== 'todos'
                    ? 'Tente ajustar sua busca ou selecionar outra categoria de serviço.'
                    : 'Seja o primeiro profissional a publicar sua agenda online e receber clientes pela plataforma.'}
                </p>
              </div>
              <div className="pt-1 flex items-center justify-center gap-3">
                {(searchQuery || selectedCategory !== 'todos') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('todos');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition"
                  >
                    Limpar Filtros
                  </button>
                )}
                <NextLink
                  href="/cadastro?role=prestador"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-extrabold shadow-xs transition"
                >
                  <span>Sou Prestador: Criar Minha Agenda</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NextLink>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTenants.map((pro) => (
                <div
                  key={pro.slug}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Provider Header */}
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
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
                        <div className="flex items-center gap-2 mt-1 text-xs font-bold text-slate-700">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {pro.rating}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {pro.openingHours.start} às {pro.openingHours.end}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <p className="mt-3.5 text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{pro.address}</span>
                    </p>

                    {/* Price Table */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-1.5">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                        Serviços e Valores
                      </p>
                      {pro.services.slice(0, 3).map((serv) => (
                        <div
                          key={serv.id}
                          className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 border border-slate-100"
                        >
                          <span className="font-semibold text-slate-700 truncate pr-2">
                            {serv.name}
                          </span>
                          <strong className="text-slate-900 shrink-0">R$ {serv.price}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <NextLink
                      href={`/cliente/chat?prestador=${pro.slug}`}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-1.5 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Dúvidas</span>
                    </NextLink>

                    <NextLink
                      href={`/${pro.slug}`}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <span>Ver Horários e Agendar</span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                    </NextLink>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
