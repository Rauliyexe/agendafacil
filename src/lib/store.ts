import { Tenant, Booking, ChatConversation, ChatMessage, ProviderStory } from './types';
import {
  INITIAL_TENANTS,
  INITIAL_BOOKINGS,
  INITIAL_CONVERSATIONS,
  INITIAL_PROVIDER_CONVERSATIONS,
  INITIAL_STORIES,
} from './data';

const STORAGE_KEYS = {
  TENANTS: 'agendafacil_tenants_v3_design',
  BOOKINGS: 'agendafacil_bookings_v4_roles',
  CONVERSATIONS: 'agendafacil_conversations_v3_design',
  PROVIDER_CONVERSATIONS: 'agendafacil_provider_conversations_v1',
  STORIES: 'agendafacil_stories_v3_design',
  USER_ROLE: 'agendafacil_user_role_mode',
};

export function getStoredUserRole(): 'cliente' | 'prestador' {
  if (typeof window === 'undefined') return 'cliente';
  try {
    const val = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    if (val === 'prestador' || val === 'cliente') return val;
    return 'cliente';
  } catch {
    return 'cliente';
  }
}

export function saveStoredUserRole(role: 'cliente' | 'prestador'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  window.dispatchEvent(new CustomEvent('agendafacil-role-changed', { detail: role }));
}

export function getStoredTenants(): Record<string, Tenant> {
  if (typeof window === 'undefined') return INITIAL_TENANTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TENANTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(INITIAL_TENANTS));
      return INITIAL_TENANTS;
    }
    const parsed = JSON.parse(raw);
    if (!parsed['lucas-beachtennis'] || !parsed['carlos-mendes']) {
      const merged = { ...INITIAL_TENANTS, ...parsed };
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch {
    return INITIAL_TENANTS;
  }
}

export function saveTenant(tenant: Tenant): void {
  if (typeof window === 'undefined') return;
  const tenants = getStoredTenants();
  tenants[tenant.slug] = tenant;
  localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
}

export function getStoredBookings(): Booking[] {
  if (typeof window === 'undefined') return INITIAL_BOOKINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export function saveNewBooking(booking: Booking): void {
  if (typeof window === 'undefined') return;
  const bookings = getStoredBookings();
  const updated = [booking, ...bookings];
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
}

export function updateBookingStatus(bookingId: string, status: Booking['status']): void {
  if (typeof window === 'undefined') return;
  const bookings = getStoredBookings();
  const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status } : b));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
}

export function getStoredConversations(): ChatConversation[] {
  if (typeof window === 'undefined') return INITIAL_CONVERSATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(INITIAL_CONVERSATIONS));
      return INITIAL_CONVERSATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CONVERSATIONS;
  }
}

export function saveConversations(conversations: ChatConversation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
}

export function getStoredProviderConversations(): ChatConversation[] {
  if (typeof window === 'undefined') return INITIAL_PROVIDER_CONVERSATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROVIDER_CONVERSATIONS);
    if (!raw) {
      localStorage.setItem(
        STORAGE_KEYS.PROVIDER_CONVERSATIONS,
        JSON.stringify(INITIAL_PROVIDER_CONVERSATIONS)
      );
      return INITIAL_PROVIDER_CONVERSATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROVIDER_CONVERSATIONS;
  }
}

export function saveProviderConversations(conversations: ChatConversation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROVIDER_CONVERSATIONS, JSON.stringify(conversations));
}

export function getStoredStories(): ProviderStory[] {
  if (typeof window === 'undefined') return INITIAL_STORIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(INITIAL_STORIES));
      return INITIAL_STORIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STORIES;
  }
}

export function saveStories(stories: ProviderStory[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
}


