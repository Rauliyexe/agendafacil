-- =====================================================================
-- AGENDAFÁCIL SAAS — SCHEMA COMPLETO DO SUPABASE (POSTGRESQL)
-- Copie e cole este script no SQL Editor do seu projeto Supabase
-- =====================================================================

-- 1. Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 2. TABELA DE PERFIS DE USUÁRIOS (Clientes e Prestadores)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('cliente', 'prestador')) DEFAULT 'cliente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 3. TABELA DE PRESTADORES / PROFISSIONAIS (Tenants)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  specialty TEXT,
  rating NUMERIC(2, 1) DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  distance TEXT DEFAULT '1,0 km',
  avatar TEXT,
  address TEXT NOT NULL,
  experience TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  instagram TEXT,
  active BOOLEAN DEFAULT TRUE,
  plan TEXT DEFAULT 'pro' CHECK (plan IN ('gratis', 'pro', 'equipe')),
  pix_key TEXT,
  pix_key_type TEXT DEFAULT 'email' CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'telefone', 'aleatoria')),
  pix_beneficiary TEXT,
  accept_stripe_card BOOLEAN DEFAULT TRUE,
  opening_hours JSONB DEFAULT '{"start": "08:00", "end": "20:00", "days": [1,2,3,4,5,6], "slotIntervalMinutes": 60}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 4. TABELA DE SERVIÇOS DO PRESTADOR
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY DEFAULT ('srv-' || substr(md5(random()::text), 1, 10)),
  tenant_slug TEXT NOT NULL REFERENCES public.tenants(slug) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  duration TEXT NOT NULL DEFAULT '1h',
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  category TEXT DEFAULT 'Geral',
  description TEXT,
  requests_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 5. TABELA DE AGENDAMENTOS (Bookings)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY DEFAULT ('b-' || to_char(NOW(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6)),
  tenant_slug TEXT NOT NULL REFERENCES public.tenants(slug) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  total_price NUMERIC(10, 2) NOT NULL,
  date TEXT NOT NULL, -- Formato YYYY-MM-DD
  day_of_week INTEGER DEFAULT 1,
  formatted_date TEXT NOT NULL,
  time TEXT NOT NULL, -- Ex: 09:00
  end_time TEXT NOT NULL, -- Ex: 10:00
  status TEXT NOT NULL CHECK (status IN ('pendente', 'confirmado', 'concluido', 'cancelado')) DEFAULT 'confirmado',
  address TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 6. ITENS/SERVIÇOS INCLUSOS NO AGENDAMENTO
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.booking_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id TEXT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  service_id TEXT,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  duration TEXT NOT NULL DEFAULT '1h'
);

-- =====================================================================
-- 7. TABELA DE CONVERSAS DE CHAT (Conversations)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id TEXT PRIMARY KEY DEFAULT ('conv-' || substr(md5(random()::text), 1, 8)),
  tenant_slug TEXT NOT NULL REFERENCES public.tenants(slug) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_avatar TEXT,
  last_message TEXT,
  last_message_time TEXT,
  unread_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 8. TABELA DE MENSAGENS DO CHAT
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY DEFAULT ('msg-' || substr(md5(random()::text), 1, 8)),
  conversation_id TEXT NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('cliente', 'prestador')),
  text TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT DEFAULT 'read' CHECK (status IN ('sent', 'delivered', 'read')),
  pix_card JSONB, -- Contém dados de cobrança Pix quando enviado
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 9. TABELA DE STORIES DOS PRESTADORES
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.provider_stories (
  id TEXT PRIMARY KEY DEFAULT ('story-' || substr(md5(random()::text), 1, 8)),
  tenant_slug TEXT NOT NULL REFERENCES public.tenants(slug) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  is_live BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 10. SEGURANÇA E POLÍTICAS DE RLS (Row Level Security)
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_stories ENABLE ROW LEVEL SECURITY;

-- Políticas públicas de leitura (qualquer visitante pode ver prestadores, serviços, stories e seus agendamentos)
CREATE POLICY "Leitura pública de prestadores ativos" ON public.tenants FOR SELECT USING (active = true);
CREATE POLICY "Leitura pública de serviços" ON public.services FOR SELECT USING (true);
CREATE POLICY "Leitura pública de stories" ON public.provider_stories FOR SELECT USING (true);
CREATE POLICY "Criação pública de agendamentos" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Leitura pública de agendamentos" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Atualização de agendamentos" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Criação de itens de agendamento" ON public.booking_services FOR ALL USING (true);

-- Políticas de Chat
CREATE POLICY "Acesso a conversas de chat" ON public.chat_conversations FOR ALL USING (true);
CREATE POLICY "Acesso a mensagens de chat" ON public.chat_messages FOR ALL USING (true);

-- Permissões para prestador criar e atualizar seu tenant e serviços
CREATE POLICY "Criação pública de prestadores" ON public.tenants FOR INSERT WITH CHECK (true);
CREATE POLICY "Prestadores atualizam seu tenant" ON public.tenants FOR UPDATE USING (true);
CREATE POLICY "Prestadores gerenciam seus serviços" ON public.services FOR ALL USING (true);
CREATE POLICY "Acesso e criação de perfis" ON public.profiles FOR ALL USING (true);

-- =====================================================================
-- 11. CONCESSÃO DE PERMISSÕES PARA AS ROLES DO SUPABASE (anon e authenticated)
-- =====================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- =====================================================================
-- 11. BASE LIMPA PARA PRODUÇÃO
-- Os prestadores e serviços são criados diretamente pelo cadastro do site ou inseridos no Supabase.
-- =====================================================================
