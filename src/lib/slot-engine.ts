import { Tenant, Booking } from './types';

export interface GeneratedSlot {
  time: string;
  available: boolean;
}

/**
 * Motor de cálculo de horários disponíveis.
 * Cruza o expediente do profissional, o tempo do serviço e os agendamentos já marcados.
 */
export function generateAvailableSlots(
  tenant: Tenant,
  selectedDateStr: string,
  existingBookings: Booking[],
  totalDurationMinutes: number = 60
): GeneratedSlot[] {
  const { start, end, slotIntervalMinutes = 30 } = tenant.openingHours;

  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  const startTotalMinutes = startHour * 60 + startMin;
  const endTotalMinutes = endHour * 60 + endMin;

  // Filtrar apenas agendamentos desta data e que estejam ativos
  const activeBookingsToday = existingBookings.filter(
    (b) => b.tenantId === tenant.id && b.date === selectedDateStr && b.status !== 'cancelado'
  );

  const slots: GeneratedSlot[] = [];

  for (let current = startTotalMinutes; current + totalDurationMinutes <= endTotalMinutes; current += slotIntervalMinutes) {
    const hours = Math.floor(current / 60).toString().padStart(2, '0');
    const minutes = (current % 60).toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    // Verificar se o slot conflita com algum agendamento já marcado
    const slotEndTime = current + totalDurationMinutes;

    const hasConflict = activeBookingsToday.some((booking) => {
      const [bHour, bMin] = booking.time.split(':').map(Number);
      const bStartTotal = bHour * 60 + bMin;
      // Duração aproximada do agendamento existente (default 60 min se não especificado)
      const bDuration = booking.services.reduce((acc, s) => {
        if (s.duration.includes('2h')) return acc + 120;
        if (s.duration.includes('1h 30')) return acc + 90;
        if (s.duration.includes('1h 15')) return acc + 75;
        if (s.duration.includes('1h')) return acc + 60;
        if (s.duration.includes('45min')) return acc + 45;
        if (s.duration.includes('30min')) return acc + 30;
        return acc + 60;
      }, 0) || 60;
      const bEndTotal = bStartTotal + bDuration;

      // Há sobreposição se: start < bEndTotal E slotEndTime > bStartTotal
      return current < bEndTotal && slotEndTime > bStartTotal;
    });

    slots.push({
      time: timeString,
      available: !hasConflict,
    });
  }

  return slots;
}
