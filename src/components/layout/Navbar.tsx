'use client';

import NextLink from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  User,
  LayoutDashboard,
  Menu,
  X,
  MessageSquare,
  Compass,
  Calendar,
  LogOut,
  LogIn,
  UserPlus,
  CreditCard,
  Briefcase,
} from 'lucide-react';
import { useSession, signOut, switchRole } from '@/lib/auth';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() || '/';
  const router = useRouter();
  const session = useSession();

  const isAuth = session.status === 'authenticated';
  const isProvider = isAuth && session.role === 'prestador';
  const isClient = isAuth && session.role === 'cliente';

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <NextLink href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative w-9 h-9 shrink-0 group-hover:scale-105 transition-transform">
            <Image
              src="/logo.png"
              alt="AgendaFácil"
              width={36}
              height={36}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Agenda
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500">
                Fácil
              </span>
            </span>
            {isClient && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider">
                Área do Cliente
              </span>
            )}
            {isProvider && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-slate-900 text-cyan-400 text-[10px] font-extrabold uppercase tracking-wider">
                Prestador
              </span>
            )}
          </div>
        </NextLink>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
          {!isClient && (
            <NextLink
              href="/"
              className={`px-3.5 py-2 rounded-xl transition ${
                pathname === '/'
                  ? 'text-blue-600 bg-blue-50/80 font-extrabold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Início
            </NextLink>
          )}

          <NextLink
            href="/explorar"
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              pathname.startsWith('/explorar')
                ? 'text-blue-600 bg-blue-50/80 font-extrabold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Profissionais</span>
          </NextLink>

          {isClient && (
            <>
              <NextLink
                href="/cliente/agendamentos"
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  pathname.startsWith('/cliente/agendamentos')
                    ? 'text-blue-600 bg-blue-50/80 font-extrabold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Meus Agendamentos</span>
              </NextLink>

              <NextLink
                href="/cliente/chat"
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  pathname.startsWith('/cliente/chat')
                    ? 'text-blue-600 bg-blue-50/80 font-extrabold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Conversas</span>
              </NextLink>
            </>
          )}

          {!isClient && (
            <NextLink
              href="/planos"
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                pathname.startsWith('/planos')
                  ? 'text-blue-600 bg-blue-50/80 font-extrabold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span>Planos</span>
            </NextLink>
          )}
        </nav>

        {/* Right Action Area */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {session.status === 'loading' ? (
            <div className="w-40 h-9 rounded-xl bg-slate-100 animate-pulse" />
          ) : isAuth ? (
            <div className="flex items-center gap-2">
              {/* Botão de alternância de modo (Mesma conta pode ser Prestador ou Cliente) */}
              {isProvider ? (
                <button
                  type="button"
                  onClick={async () => {
                    await switchRole('cliente');
                    router.push('/cliente/agendamentos');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-2 rounded-xl transition cursor-pointer"
                  title="Alternar para o Modo Cliente (ver seus agendamentos)"
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden xl:inline">Modo Cliente</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    await switchRole('prestador');
                    router.push('/prestador');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-cyan-400 bg-slate-100 hover:bg-slate-900 hover:text-white px-3 py-2 rounded-xl transition cursor-pointer"
                  title="Alternar para o Painel do Prestador"
                >
                  <Briefcase className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="hidden xl:inline">Painel Prestador</span>
                </button>
              )}

              {isProvider && (
                <NextLink
                  href="/prestador"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl transition shadow-xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Painel</span>
                </NextLink>
              )}

              <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl bg-slate-50 border border-slate-200/80">
                <div
                  className={`w-7 h-7 rounded-lg text-white font-extrabold text-xs flex items-center justify-center shrink-0 ${
                    isProvider ? 'bg-slate-900' : 'bg-blue-600'
                  }`}
                >
                  {(session.name || session.email || 'U').slice(0, 1).toUpperCase()}
                </div>
                <div className="pr-1 max-w-[130px]">
                  <p className="text-xs font-extrabold text-slate-900 truncate leading-tight">
                    {session.name || session.email}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 leading-tight">
                    {isProvider ? 'Prestador' : 'Cliente'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Sair da conta"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NextLink
                href="/login?role=cliente"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2.5 rounded-xl transition"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Entrar (Cliente)</span>
              </NextLink>

              <NextLink
                href="/login?role=prestador"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-[#0B132B] hover:bg-slate-800 px-3.5 py-2.5 rounded-xl transition shadow-xs"
              >
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                <span>Área do Prestador</span>
              </NextLink>

              <NextLink
                href="/cadastro"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-2.5 rounded-xl transition shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Criar Conta</span>
              </NextLink>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <NextLink
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 text-xs font-extrabold text-slate-800 hover:bg-slate-50 rounded-xl"
          >
            Início
          </NextLink>
          <NextLink
            href="/explorar"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-extrabold text-slate-800 hover:bg-slate-50 rounded-xl"
          >
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Explorar Profissionais</span>
          </NextLink>

          {isClient && (
            <>
              <NextLink
                href="/cliente/agendamentos"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-extrabold text-slate-800 hover:bg-slate-50 rounded-xl"
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Meus Agendamentos</span>
              </NextLink>
              <NextLink
                href="/cliente/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-extrabold text-slate-800 hover:bg-slate-50 rounded-xl"
              >
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Conversas</span>
              </NextLink>
            </>
          )}

          <NextLink
            href="/planos"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-extrabold text-slate-800 hover:bg-slate-50 rounded-xl"
          >
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span>Planos e Preços</span>
          </NextLink>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            {isAuth ? (
              <>
                {/* Alternância rápida de modo no celular */}
                {isProvider ? (
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await switchRole('cliente');
                      router.push('/cliente/agendamentos');
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200"
                  >
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Alternar para Modo Cliente</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await switchRole('prestador');
                      router.push('/prestador');
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 text-cyan-300 text-xs font-extrabold"
                  >
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                    <span>Alternar para Painel do Prestador</span>
                  </button>
                )}

                {isProvider && (
                  <NextLink
                    href="/prestador"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-extrabold"
                  >
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                    <span>Acessar Meu Painel</span>
                  </NextLink>
                )}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">
                      {session.name || session.email}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {isProvider ? 'Modo Prestador Ativo' : 'Modo Cliente Ativo'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <NextLink
                    href="/login?role=cliente"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-3 text-center text-xs font-extrabold text-slate-800 bg-slate-100 rounded-xl"
                  >
                    Entrar (Cliente)
                  </NextLink>
                  <NextLink
                    href="/login?role=prestador"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-3 text-center text-xs font-extrabold text-cyan-300 bg-[#0B132B] rounded-xl"
                  >
                    Área do Prestador
                  </NextLink>
                </div>
                <NextLink
                  href="/cadastro"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-3 text-center text-xs font-extrabold text-white bg-blue-600 rounded-xl"
                >
                  Criar Conta
                </NextLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
