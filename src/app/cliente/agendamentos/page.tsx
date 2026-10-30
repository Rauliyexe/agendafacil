'use client';

import { useState, useEffect, useMemo } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  MessageCircle,
  Navigation,
  ChevronLeft,
  Search,
  LayoutDashboard,
  Trophy,
  Phone,
  Star,
  Wrench,
  Plus
} from 'lucide-react';
import { getStoredBookings, updateBookingStatus } from '@/lib/store';
import { Booking } from '@/lib/types';
import AppSidebar from '@/components/layout/AppSidebar';
import { RequireRole } from '@/lib/auth';

export default function MeusAgendamentosDesktopPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'proximos' | 'historico'>('proximos');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const loaded = getStoredBookings();
    setBookings(loaded);
    if (loaded.length > 0) {
      setSelectedBooking(loaded[0]);
    }
  }, []);

  const upcomingBookings = useMemo(() => {
    return bookings.filter((b) => b.status === 'confirmado' || b.status === 'pendente');
  }, [bookings]);

  const pastBookings = useMemo(() => {
    return bookings.filter((b) => b.status === 'concluido' || b.status === 'cancelado');
  }, [bookings]);

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
      <AppSidebar>
      {/* MAIN DESKTOP CONTENT AREA */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-28 lg:pb-10 w-full max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Meus Agendamentos
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Acompanhe todos os seus serviços e aulas marcados em tempo real
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NextLink
              href="/explorar"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Novo Agendamento
            </NextLink>
          </div>
        </div>

        {/* 12-COLUMN MASTER-DETAIL DESKTOP SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left 7 Columns: Tabs + List of Appointments */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex rounded-2xl bg-white border border-slate-200/80 p-1.5 gap-1 shadow-2xs">
              <button
                onClick={() => setActiveTab('proximos')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'proximos'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Próximos Agendamentos</span>
                <span
                  className={`w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center ${
                    activeTab === 'proximos' ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {upcomingBookings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('historico')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'historico'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Concluídos & Cancelados</span>
                <span
                  className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    activeTab === 'historico' ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {pastBookings.length}
                </span>
              </button>
            </div>

            {/* Appointment Cards */}
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
                        ? 'border-blue-600 shadow-md'
                        : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="text-center bg-slate-100 rounded-xl px-3 py-2 shrink-0">
                        <span className="text-xs font-extrabold text-blue-600 block">
                          {booking.time}
                        </span>
                        <span className="text-[10px] text-slate-500">26 Out</span>
                      </div>

                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">
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
                        <p className="text-xs text-slate-500 truncate">{booking.tenantName}</p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {booking.address}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          isConfirmed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isCancelled
                            ? 'bg-red-50 text-red-700 border border-red-200'
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
          </div>

          {/* Right 5 Columns: Sticky "Detalhes do serviço" Card (From Design Board) */}
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            {selectedBooking ? (
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200/80 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                  <h2 className="text-sm font-extrabold text-slate-900">Detalhes do serviço</h2>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      selectedBooking.status === 'confirmado'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : selectedBooking.status === 'cancelado'
                        ? 'bg-red-50 text-red-700 border border-red-200'
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
                  <h3 className="text-base font-extrabold text-slate-900">
                    {selectedBooking.services[0]?.name}
                  </h3>
                </div>

                {/* Provider Card */}
                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={selectedBooking.tenantAvatar}
                      alt={selectedBooking.tenantName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      {selectedBooking.tenantName}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-blue-600" />
                      {selectedBooking.tenantPhone || '(11) 98765-4321'}
                    </p>
                    <p className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {selectedBooking.tenantRating || 4.8}{' '}
                      <span className="text-slate-400 font-normal">
                        ({selectedBooking.tenantReviews || 124} avaliações)
                      </span>
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 text-xs text-slate-700 pt-1">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">{selectedBooking.formattedDate}</p>
                      <p className="text-slate-500">
                        {selectedBooking.time} – {selectedBooking.endTime || '11:00'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="font-medium text-slate-700">{selectedBooking.address}</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Wrench className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-slate-600">
                      {selectedBooking.notes || selectedBooking.services[0]?.name}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleCancel(selectedBooking.id)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-red-50 hover:text-red-600 transition"
                  >
                    Cancelar
                  </button>
                  <a
                    href={`https://wa.me/55${(selectedBooking.tenantPhone || '11987654321').replace(
                      /\D/g,
                      ''
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center shadow-md shadow-blue-600/20 transition"
                  >
                    Ver contato
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-xs text-slate-400">
                Selecione um agendamento ao lado para ver todos os detalhes.
              </div>
            )}
          </div>

        </div>
      </main>
    </AppSidebar>
  </RequireRole>
  );
}
