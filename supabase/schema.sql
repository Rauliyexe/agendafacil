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

-- Permissões para prestador atualizar seu próprio tenant e serviços
CREATE POLICY "Prestadores atualizam seu tenant" ON public.tenants FOR UPDATE USING (true);
CREATE POLICY "Prestadores gerenciam seus serviços" ON public.services FOR ALL USING (true);

-- =====================================================================
-- 11. DADOS INICIAIS (SEED) — OS 5 PRESTADORES E SEUS SERVIÇOS
-- =====================================================================

-- Prestador 1: Prof. Lucas Becker (Beach Tennis)
INSERT INTO public.tenants (
  slug, name, role, specialty, rating, reviews, avatar, address, phone, whatsapp, instagram,
  plan, pix_key, pix_key_type, pix_beneficiary, accept_stripe_card
) VALUES (
  'lucas-beachtennis',
  'Prof. Lucas Becker',
  'Professor de Beach Tennis',
  'Beach Tennis & Esportes de Areia',
  4.9, 342,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
  'Arena Sunset - Rua das Flores, 123 - Centro',
  '(11) 98122-3344', '5511981223344', '@lucasbecker.bt',
  'pro', 'lucas.becker@arenasunset.com.br', 'email', 'LUCAS BECKER BEACH TENNIS', true
) ON CONFLICT (slug) DO NOTHING;

-- Prestador 2: Carlos Mendes (Climatização)
INSERT INTO public.tenants (
  slug, name, role, specialty, rating, reviews, avatar, address, phone, whatsapp, instagram,
  plan, pix_key, pix_key_type, pix_beneficiary, accept_stripe_card
) VALUES (
  'carlos-mendes',
  'Carlos Mendes Climatização',
  'Técnico em Climatização e Refrigeração',
  'Instalação, Manutenção e Higienização de Ar-Condicionado',
  4.9, 128,
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
  'Atendimento em domicílio • São Paulo e Região',
  '(11) 97133-2211', '5511971332211', '@carlos.climatizacao',
  'pro', 'carlos.ar@agendafacil.app', 'email', 'CARLOS MENDES REFRIGERACAO', true
) ON CONFLICT (slug) DO NOTHING;

-- Prestador 3: João Silva (Elétrica)
INSERT INTO public.tenants (
  slug, name, role, specialty, rating, reviews, avatar, address, phone, whatsapp, instagram,
  plan, pix_key, pix_key_type, pix_beneficiary, accept_stripe_card
) VALUES (
  'joao-silva',
  'João Silva Eletricista',
  'Eletricista Residencial e Comercial',
  'Quadros de Distribuição, Fiação e Iluminação LED',
  4.8, 94,
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
  'Atendimento em domicílio • Centro e Zona Sul',
  '(11) 96544-1122', '5511965441122', '@joao.eletrica',
  'gratis', '11965441122', 'telefone', 'JOAO SILVA ELETRICISTA', true
) ON CONFLICT (slug) DO NOTHING;

-- Prestador 4: Equipe Aqua (Piscina)
INSERT INTO public.tenants (
  slug, name, role, specialty, rating, reviews, avatar, address, phone, whatsapp, instagram,
  plan, pix_key, pix_key_type, pix_beneficiary, accept_stripe_card
) VALUES (
  'equipe-aqua',
  'Equipe Aqua Piscinas',
  'Tratamento Químico e Manutenção de Piscinas',
  'Limpeza Física, Cloração, Decantação e Manutenção de Bombas',
  4.9, 215,
  'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop&q=80',
  'Condomínios, Residências e Clubes • Grande SP',
  '(11) 98877-6655', '5511988776655', '@equipe.aqua',
  'pro', 'contato@aquapiscinas.com.br', 'email', 'AQUA PISCINAS LTDA', true
) ON CONFLICT (slug) DO NOTHING;

-- Prestador 5: Lara Santos (Limpeza)
INSERT INTO public.tenants (
  slug, name, role, specialty, rating, reviews, avatar, address, phone, whatsapp, instagram,
  plan, pix_key, pix_key_type, pix_beneficiary, accept_stripe_card
) VALUES (
  'lara-santos',
  'Lara Santos Limpeza Especializada',
  'Higienização de Estofados e Limpeza Pós-Obra',
  'Higienização de Sofás, Tapetes e Colchões a Seco',
  5.0, 167,
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
  'Atendimento Residencial e Comercial • Capital',
  '(11) 99123-4455', '5511991234455', '@lara.limpeza',
  'pro', '32.456.789/0001-90', 'cnpj', 'LARA SANTOS HIGIENIZACAO ME', true
) ON CONFLICT (slug) DO NOTHING;

-- SERVIÇOS DO PROF. LUCAS BECKER
INSERT INTO public.services (id, tenant_slug, name, price, duration, duration_minutes, category, description) VALUES
('bt1', 'lucas-beachtennis', 'Aula Individual de Beach Tennis', 90.00, '1h', 60, 'Beach Tennis', 'Treino técnico personalizado: saque, smash, drop shot e movimentação em quadra de areia.'),
('bt2', 'lucas-beachtennis', 'Aula em Dupla (2 Alunos)', 140.00, '1h', 60, 'Beach Tennis', 'Tática de jogo em dupla, cobertura de quadra, bloqueio e entrosamento com parceiro.'),
('bt3', 'lucas-beachtennis', 'Clínica de Saque & Smash em Grupo', 60.00, '1h 30min', 90, 'Beach Tennis', 'Aprimoramento intensivo de golpes de ataque e potência com até 4 alunos em quadra.')
ON CONFLICT (id) DO NOTHING;

-- SERVIÇOS DO CARLOS MENDES
INSERT INTO public.services (id, tenant_slug, name, price, duration, duration_minutes, category, description) VALUES
('cm1', 'carlos-mendes', 'Manutenção Preventiva e Higienização Split', 150.00, '1h 30min', 90, 'Climatização', 'Limpeza bactericida das serpentinas, turbina, filtros e medição da carga de gás refrigerante.'),
('cm2', 'carlos-mendes', 'Instalação Completa Split (9.000 a 12.000 BTUs)', 450.00, '3h', 180, 'Climatização', 'Instalação com até 3 metros de tubulação de cobre, teste de vácuo e garantia de 1 ano.'),
('cm3', 'carlos-mendes', 'Recarga Completa de Gás R410A / R32', 220.00, '1h', 60, 'Climatização', 'Identificação de micro-vazamentos, teste de pressão com nitrogênio e recarga por peso na balança.')
ON CONFLICT (id) DO NOTHING;
