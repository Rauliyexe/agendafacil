export type UserRole = 'client' | 'pro' | 'admin';

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  price: number;
  duration: string; // ex: '1h', '2h'
  durationMinutes: number;
  category?: string;
  description?: string;
  requestsCount?: number;
}

export interface Tenant {
  id: string;
  slug: string; // ex: 'lucas-beachtennis'
  name: string;
  role: string; // ex: 'Professor de Beach Tennis', 'Climatização'
  specialty: string;
  rating: number;
  reviews: number;
  distance?: string;
  avatar: string;
  address: string;
  experience: string;
  phone: string;
  whatsapp: string;
  instagram?: string;
  active?: boolean;
  openingHours: {
    start: string;
    end: string;
    days: number[];
    slotIntervalMinutes: number;
  };
  services: Service[];
  plan: 'free' | 'pro' | 'arena';
}

export interface Booking {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantRole?: string;
  tenantAvatar: string;
  tenantPhone?: string;
  tenantRating?: number;
  tenantReviews?: number;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  services: { id: string; name: string; price: number; duration: string }[];
  totalPrice: number;
  date: string; // YYYY-MM-DD
  dayOfWeek?: number; // 1 = Seg (26), 2 = Ter (27), 3 = Qua (28), 4 = Qui (29), 5 = Sex (30)
  formattedDate: string; // ex: '26 de outubro de 2026'
  time: string; // '09:00'
  endTime?: string; // '11:00'
  color?: 'blue' | 'green' | 'purple' | 'amber';
  status: 'confirmado' | 'pendente' | 'concluido' | 'cancelado';
  address: string;
  notes?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: 'agendamento' | 'lembrete' | 'sistema';
  title: string;
  description: string;
  timeLabel: string;
  read: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  audience: 'cliente' | 'prestador';
  tagline: string;
  price: number;
  period: string;
  features: string[];
  recommended?: boolean;
  ctaText: string;
  isFree?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'contact' | 'system';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  bookingCard?: {
    serviceName: string;
    date: string;
    time: string;
    price: number;
    status: 'confirmado' | 'pendente';
  };
}

export interface ChatConversation {
  id: string;
  tenantSlug: string;
  contactName: string;
  contactRole: string;
  contactAvatar: string;
  contactPhone: string;
  online: boolean;
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
  category: string;
  messages: ChatMessage[];
}

export interface StorySlide {
  id: string;
  imageUrl: string;
  badgeText: string;
  caption: string;
  postedAt: string;
  likes: number;
  linkedServiceName: string;
  linkedServicePrice: number;
  availableSlotToday?: string;
}

export interface ProviderStory {
  id: string;
  tenantSlug: string;
  providerName: string;
  providerRole: string;
  providerAvatar: string;
  category: string;
  hasUnseen: boolean;
  slides: StorySlide[];
}


