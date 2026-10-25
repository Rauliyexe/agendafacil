-- ==============================================================================
-- AgendaFácil SaaS - Schema Multi-Tenant PostgreSQL (Supabase)
-- ==============================================================================

-- 1. Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Tenants (Estabelecimentos / Profissionais)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(80) UNIQUE NOT NULL, -- ex: juliana-silva (agendafacil.com/juliana-silva)
  name VARCHAR(150) NOT NULL,
  role VARCHAR(100) NOT NULL,
  specialty VARCHAR(150),
  avatar_url TEXT,
  phone VARCHAR(30) NOT NULL,
  whatsapp VARCHAR(30) NOT NULL,
  instagram VARCHAR(60),
  address TEXT NOT NULL,
  plan VARCHAR(30) DEFAULT 'solo' CHECK (plan IN ('free', 'solo', 'pro', 'enterprise')),
  subscription_status VARCHAR(30) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida de slug nas páginas públicas
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);

-- 3. Horários de Funcionamento (Business Hours)
CREATE TABLE IF NOT EXISTS public.tenant_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '19:00',
  slot_interval_minutes INT NOT NULL DEFAULT 30,
  days_of_week INT[] NOT NULL DEFAULT '{1,2,3,4,5,6}' -- 1=Seg, 6=Sáb, 0=Dom
);

-- 4. Tabela de Serviços
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(80) DEFAULT 'Geral',
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  duration_label VARCHAR(30) NOT NULL DEFAULT '1h',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_tenant ON public.services(tenant_id);

-- 5. Tabela de Agendamentos (Bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_name VARCHAR(120) NOT NULL,
  client_phone VARCHAR(30) NOT NULL,
  client_email VARCHAR(120),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  total_duration_minutes INT NOT NULL DEFAULT 60,
  status VARCHAR(30) DEFAULT 'confirmado' CHECK (status IN ('pendente', 'confirmado', 'concluido', 'cancelado')),
  payment_status VARCHAR(30) DEFAULT 'pendente' CHECK (payment_status IN ('pendente', 'sinal_pago', 'pago', 'reembolsado')),
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_tenant_date ON public.bookings(tenant_id, booking_date);

-- 6. Tabela Pivot: Itens do Agendamento (Múltiplos Serviços por Agendamento)
CREATE TABLE IF NOT EXISTS public.booking_services (
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT,
  service_name VARCHAR(150) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INT NOT NULL,
  PRIMARY KEY (booking_id, service_id)
);

-- 7. Configuração de Row Level Security (RLS)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso:
-- A página pública /[slug] pode ler serviços e horários do tenant
CREATE POLICY "Public read tenants" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (is_active = true);

-- Clientes públicos podem criar um agendamento
CREATE POLICY "Public create booking" ON public.bookings FOR INSERT WITH CHECK (true);
