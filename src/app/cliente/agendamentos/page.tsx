'use client';

import { useState, useEffect, useMemo } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  Wrench,
  Plus,
  Compass,
  Clock,
} from 'lucide-react';
import { getStoredBookings, updateBookingStatus, syncWithSupabase } from '@/lib/store';
import { Booking } from '@/lib/types';
import Navbar from '@/components/layout/Navbar';
import { RequireRole, useSession } from '@/lib/auth';

export default function MeusAgendamentosDesktopPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'proximos' | 'historico'>('proximos');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const session = useSession();

  useEffect(() => {
    const loaded = getStoredBookings();
    setBookings(loaded);
    syncWithSupabase().then((res) => {
      if (res.synced) {
        setBookings(getStoredBookings());
      }
    });
  }, []);

  // Filtra agendamentos vinculados ao cliente logado (ou todos os agendamentos locais feitos neste navegador)
  const clientBookings = useMemo(() => {
    if (bookings.length === 0) return [];
    const name = (session.name || '').toLowerCase().trim();
    const mail = (session.email || '').toLowerCase().trim();
    const phone = (session.phone || '').replace(/\D/g, '');

    const matched = bookings.filter((b) => {
      if (mail && b.clientEmail?.toLowerCase() === mail) return true;
      if (phone && b.clientPhone?.replace(/\D/g, '') === phone) return true;
      if (name && b.clientName?.toLowerCase().includes(name)) return true;
      return false;
    });

    return matched.length > 0 ? matched : bookings;
  }, [bookings, session]);

  useEffect(() => {
    if (clientBookings.length > 0 && !selectedBooking) {
      setSelectedBooking(clientBookings[0]);
    }
  }, [clientBookings, selectedBooking]);

  const upcomingBookings = useMemo(() => {
    return clientBookings.filter((b) => b.status === 'confirmado' || b.status === 'pendente');
  }, [clientBookings]);

  const pastBookings = useMemo(() => {
    return clientBookings.filter((b) => b.status === 'concluido' || b.status === 'cancelado');
  }, [clientBookings]);

  const handleCancel = (bookingId: string) => {
    if (confirm('Deseja realmente cancelar este agendamento?')) {
      updateBookingStatus(bookingId, 'cancelado');
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelado' } : b))
      );
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: 'cancelado' } : null));
      }
    }
  };

  const displayedList = activeTab === 'proximos' ? upcomingBookings : pastBookings;

  return (
    <RequireRole role="cliente">
      <div className="min-h-screen bg-[#F4F7FB] flex flex-col text-slate-900">
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
          {/* Top Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-extrabold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Área do Cliente
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Meus Agendamentos
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Acompanhe seus serviços agendados, consulte horários e fale com o profissional
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <NextLink
                href="/cliente/chat"
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span>Conversas</span>
              </NextLink>
              <NextLink
                href="/explorar"
                className="px-4 py-2.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-2 shadow-xs transition"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Novo Agendamento</span>
              </NextLink>
            </div>
          </div>

          {/* 12-COLUMN MASTER-DETAIL SPLIT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Tabs + List of Appointments */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex rounded-2xl bg-white border border-slate-200 p-1.5 gap-1 shadow-2xs">
                <button
                  onClick={() => setActiveTab('proximos')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                    activeTab === 'proximos'
                      ? 'bg-[#0B132B] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Próximos Horários</span>
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center ${
                      activeTab === 'proximos' ? 'bg-cyan-400 text-slate-950' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {upcomingBookings.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('historico')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                    activeTab === 'historico'
                      ? 'bg-[#0B132B] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Concluídos & Cancelados</span>
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center ${
                      activeTab === 'historico' ? 'bg-cyan-400 text-slate-950' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {pastBookings.length}
                  </span>
                </button>
              </div>

              {/* Appointment Cards */}
              {displayedList.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Nenhum agendamento nesta lista
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Explore os profissionais disponíveis para reservar seu próximo horário.
                    </p>
                  </div>
                  <NextLink
                    href="/explorar"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Explorar Profissionais</span>
                  </NextLink>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedList.map((booking) => {
                    const isConfirmed = booking.status === 'confirmado';
                    const isCancelled = booking.status === 'cancelado';
                    const isSelected = selectedBooking?.id === booking.id;

                    return (
                      <div
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`bg-white rounded-2xl p-5 border-2 transition cursor-pointer flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'border-blue-600 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="text-center bg-[#0B132B] text-white rounded-xl px-3.5 py-2.5 shrink-0 min-w-[68px]">
                            <span className="text-xs font-extrabold text-cyan-400 block">
                              {booking.time}
                            </span>
                            <span className="text-[10px] text-slate-300 block truncate max-w-[64px]">
                              {booking.formattedDate?.split(' de ')[0] || booking.date}
                            </span>
                          </div>

                          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                            <Image
                              src={booking.tenantAvatar}
                              alt={booking.tenantName}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-sm font-extrabold text-slate-900 truncate">
                              {booking.services.map((s) => s.name).join(' + ')}
                            </h3>
                            <p className="text-xs font-bold text-blue-600 truncate">
                              {booking.tenantName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {booking.address}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                              isConfirmed
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isCancelled
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {isConfirmed ? 'Confirmado' : isCancelled ? 'Cancelado' : 'Pendente'}
                          </span>
                          <span className="block text-base font-black text-slate-900 mt-1.5">
                            R$ {booking.totalPrice}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right 5 Columns: Sticky Service Details Card */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              {selectedBooking ? (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <h2 className="text-sm font-extrabold text-slate-900">Detalhes do Agendamento</h2>
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        selectedBooking.status === 'confirmado'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : selectedBooking.status === 'cancelado'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {selectedBooking.status === 'confirmado'
                        ? 'Confirmado'
                        : selectedBooking.status === 'cancelado'
                        ? 'Cancelado'
                        : 'Pendente'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {selectedBooking.services[0]?.name}
                      </h3>
                      <p className="text-xs font-bold text-slate-500">
                        Valor: R$ {selectedBooking.totalPrice}
                      </p>
                    </div>
                  </div>

                  {/* Provider Card */}
                  <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                      <Image
                        src={selectedBooking.tenantAvatar}
                        alt={selectedBooking.tenantName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-slate-900 truncate">
                        {selectedBooking.tenantName}
                      </p>
                      {selectedBooking.tenantPhone && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-blue-600" />
                          {selectedBooking.tenantPhone}
                        </p>
                      )}
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {selectedBooking.tenantRating || 5.0}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 text-xs text-slate-700 pt-1">
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-slate-900">{selectedBooking.formattedDate}</p>
                        <p className="text-slate-500">
                          Horário: {selectedBooking.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="font-medium text-slate-700">{selectedBooking.address}</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Wrench className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-slate-600">
                        {selectedBooking.notes || selectedBooking.services[0]?.name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                    {selectedBooking.status !== 'cancelado' && (
                      <button
                        onClick={() => handleCancel(selectedBooking.id)}
                        className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                      >
                        Cancelar Horário
                      </button>
                    )}
                    <NextLink
                      href={`/cliente/chat?prestador=${selectedBooking.tenantId}`}
                      className="py-2.5 px-4 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-extrabold text-xs text-center flex items-center justify-center gap-1.5 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Abrir Chat</span>
                    </NextLink>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-xs text-slate-400">
                  Selecione um agendamento ao lado para visualizar os detalhes.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </RequireRole>
  );
}
