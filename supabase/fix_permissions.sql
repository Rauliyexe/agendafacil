-- =====================================================================
-- AGENDAFÁCIL SAAS — CORREÇÃO DE PERMISSÕES NO SUPABASE
-- Execute este script no SQL Editor do painel do seu Supabase
-- (https://supabase.com/dashboard/project/kehfpyslciobhremtgah/sql/new)
-- =====================================================================

-- 1. Liberar permissão no schema public para visitantes e usuários logados
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Conceder permissões em todas as tabelas, sequências e rotinas
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Configurar permissões padrão para quaisquer tabelas criadas no futuro
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 4. Habilitar Row Level Security (RLS) nas tabelas do sistema
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Políticas da tabela TENANTS (Permitir que qualquer pessoa veja e se cadastre como prestador)
DROP POLICY IF EXISTS "Leitura pública de prestadores ativos" ON public.tenants;
CREATE POLICY "Leitura pública de prestadores ativos" ON public.tenants FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Criação pública de prestadores" ON public.tenants;
CREATE POLICY "Criação pública de prestadores" ON public.tenants FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Prestadores atualizam seu tenant" ON public.tenants;
CREATE POLICY "Prestadores atualizam seu tenant" ON public.tenants FOR UPDATE USING (true);

-- 6. Políticas da tabela SERVICES (Serviços dos prestadores)
DROP POLICY IF EXISTS "Leitura pública de serviços" ON public.services;
CREATE POLICY "Leitura pública de serviços" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Prestadores gerenciam seus serviços" ON public.services;
CREATE POLICY "Prestadores gerenciam seus serviços" ON public.services FOR ALL USING (true);

-- 7. Políticas da tabela BOOKINGS (Agendamentos)
DROP POLICY IF EXISTS "Criação pública de agendamentos" ON public.bookings;
CREATE POLICY "Criação pública de agendamentos" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Leitura pública de agendamentos" ON public.bookings;
CREATE POLICY "Leitura pública de agendamentos" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Atualização de agendamentos" ON public.bookings;
CREATE POLICY "Atualização de agendamentos" ON public.bookings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Criação de itens de agendamento" ON public.booking_services;
CREATE POLICY "Criação de itens de agendamento" ON public.booking_services FOR ALL USING (true);

-- 8. Políticas da tabela PROFILES (Perfis de clientes e prestadores)
DROP POLICY IF EXISTS "Acesso e criação de perfis" ON public.profiles;
CREATE POLICY "Acesso e criação de perfis" ON public.profiles FOR ALL USING (true);

