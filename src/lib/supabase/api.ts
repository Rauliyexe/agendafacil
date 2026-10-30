import { getSupabase, isSupabaseConfigured } from './client';
import { Tenant, Booking, Service, ChatConversation, ChatMessage, ProviderStory } from '../types';
import {
  INITIAL_TENANTS,
  INITIAL_BOOKINGS,
  INITIAL_CONVERSATIONS,
  INITIAL_PROVIDER_CONVERSATIONS,
  INITIAL_STORIES,
} from '../data';

// Helper to map Supabase row to Tenant
function mapTenantRow(row: any, services: Service[] = []): Tenant {
  return {
    id: row.id || row.slug,
    slug: row.slug,
    name: row.name,
    role: row.role,
    specialty: row.specialty || '',
    rating: Number(row.rating) || 5.0,
    reviews: Number(row.reviews) || 0,
    distance: row.distance || '1,0 km',
    avatar: row.avatar || '',
    address: row.address || '',
    experience: row.experience || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    instagram: row.instagram || '',
    active: row.active ?? true,
    plan: row.plan || 'pro',
    pixKey: row.pix_key || '',
    pixKeyType: row.pix_key_type || 'email',
    pixBeneficiary: row.pix_beneficiary || '',
    acceptStripeCard: row.accept_stripe_card ?? true,
    openingHours: row.opening_hours || {
      start: '08:00',
      end: '20:00',
      days: [1, 2, 3, 4, 5, 6],
      slotIntervalMinutes: 60,
    },
    services,
  };
}

// =============================================================================
// TENANTS API
// =============================================================================
export async function fetchTenantsFromSupabase(): Promise<Record<string, Tenant>> {
  const supabase = getSupabase();
  if (!supabase) return INITIAL_TENANTS;

  try {
    const { data: tenantRows, error: tErr } = await supabase
      .from('tenants')
      .select('*')
      .eq('active', true);

    if (tErr || !tenantRows || tenantRows.length === 0) {
      console.warn('Supabase tenants query empty or error, falling back:', tErr?.message);
      return INITIAL_TENANTS;
    }

    const { data: serviceRows } = await supabase.from('services').select('*');

    const result: Record<string, Tenant> = {};
    for (const row of tenantRows) {
      const tenantServices = (serviceRows || [])
        .filter((s: any) => s.tenant_slug === row.slug)
        .map((s: any) => ({
          id: s.id,
          tenantId: s.tenant_slug,
          name: s.name,
          price: Number(s.price),
          duration: s.duration,
          durationMinutes: s.duration_minutes || 60,
          category: s.category || 'Geral',
          description: s.description || '',
          requestsCount: s.requests_count || 0,
        }));

      result[row.slug] = mapTenantRow(row, tenantServices);
    }

    return result;
  } catch (err) {
    console.error('Error fetching tenants from Supabase:', err);
    return INITIAL_TENANTS;
  }
}

export async function saveTenantToSupabase(tenant: Tenant): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('tenants')
      .upsert({
        slug: tenant.slug,
        name: tenant.name,
        role: tenant.role,
        specialty: tenant.specialty,
        rating: tenant.rating,
        reviews: tenant.reviews,
        avatar: tenant.avatar,
        address: tenant.address,
        experience: tenant.experience || '',
        distance: tenant.distance || '1,0 km',
        active: tenant.active ?? true,
        plan: tenant.plan || 'pro',
        phone: tenant.phone,
        whatsapp: tenant.whatsapp,
        instagram: tenant.instagram,
        pix_key: tenant.pixKey,
        pix_key_type: tenant.pixKeyType,
        pix_beneficiary: tenant.pixBeneficiary,
        accept_stripe_card: tenant.acceptStripeCard,
        opening_hours: tenant.openingHours,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'slug' });

    if (error) {
      console.error('Error saving tenant to Supabase:', error.message);
      return false;
    }

    // Upsert services if present
    if (tenant.services && tenant.services.length > 0) {
      const rows = tenant.services.map((s) => ({
        id: s.id,
        tenant_slug: tenant.slug,
        name: s.name,
        price: s.price,
        duration: s.duration,
        duration_minutes: s.durationMinutes,
        category: s.category || 'Geral',
        description: s.description || '',
      }));

      const { error: sErr } = await supabase.from('services').upsert(rows, { onConflict: 'id' });
      if (sErr) {
        console.error('Error saving services to Supabase:', sErr.message);
      }
    }

    return true;
  } catch (err) {
    console.error('Failed to save tenant to Supabase:', err);
    return false;
  }
}

// =============================================================================
// BOOKINGS API
// =============================================================================
export async function fetchBookingsFromSupabase(): Promise<Booking[]> {
  const supabase = getSupabase();
  if (!supabase) return INITIAL_BOOKINGS;

  try {
    const { data: rows, error } = await supabase
      .from('bookings')
      .select('*, booking_services(*), tenants(*)')
      .order('created_at', { ascending: false });

    if (error || !rows || rows.length === 0) {
      return INITIAL_BOOKINGS;
    }

    return rows.map((r: any) => ({
      id: r.id,
      tenantId: r.tenant_slug,
      tenantName: r.tenants?.name || 'Prestador',
      tenantRole: r.tenants?.role || 'Profissional',
      tenantAvatar: r.tenants?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      tenantPhone: r.tenants?.phone || '',
      clientName: r.client_name,
      clientPhone: r.client_phone,
      clientEmail: r.client_email,
      services: (r.booking_services || []).map((bs: any) => ({
        id: bs.service_id || bs.id,
        name: bs.name,
        price: Number(bs.price),
        duration: bs.duration,
      })),
      totalPrice: Number(r.total_price),
      date: r.date,
      dayOfWeek: r.day_of_week || 1,
      formattedDate: r.formatted_date,
      time: r.time,
      endTime: r.end_time,
      status: r.status,
      address: r.address,
      notes: r.notes || '',
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.error('Error fetching bookings from Supabase:', err);
    return INITIAL_BOOKINGS;
  }
}

export async function saveBookingToSupabase(booking: Booking): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error: bErr } = await supabase.from('bookings').insert({
      id: booking.id,
      tenant_slug: booking.tenantId,
      client_name: booking.clientName,
      client_phone: booking.clientPhone,
      client_email: booking.clientEmail || null,
      total_price: booking.totalPrice,
      date: booking.date,
      day_of_week: booking.dayOfWeek || 1,
      formatted_date: booking.formattedDate,
      time: booking.time,
      end_time: booking.endTime || '10:00',
      status: booking.status,
      address: booking.address,
      notes: booking.notes || '',
      created_at: booking.createdAt,
    });

    if (bErr) {
      console.error('Error inserting booking to Supabase:', bErr.message);
      return false;
    }

    if (booking.services && booking.services.length > 0) {
      const items = booking.services.map((s) => ({
        booking_id: booking.id,
        service_id: s.id,
        name: s.name,
        price: s.price,
        duration: s.duration,
      }));
      await supabase.from('booking_services').insert(items);
    }

    return true;
  } catch (err) {
    console.error('Failed to save booking to Supabase:', err);
    return false;
  }
}

export async function updateBookingStatusInSupabase(
  bookingId: string,
  status: Booking['status']
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating booking status in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to update booking status in Supabase:', err);
    return false;
  }
}
