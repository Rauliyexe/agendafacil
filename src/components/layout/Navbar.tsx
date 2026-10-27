'use client';

import NextLink from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { User, LayoutDashboard, Menu, X, MessageSquare, Compass, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <NextLink href="/" className="flex items-center gap-2.5 group">
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
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Agenda<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500">Fácil</span>
          </span>
        </NextLink>

        {/* Center Navigation Links (Clean & Direct) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
          <NextLink
            href="/"
            className={`transition ${
              pathname === '/'
                ? 'text-violet-600 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Início
          </NextLink>

          <NextLink
            href="/explorar"
            className={`transition flex items-center gap-1.5 ${
              pathname?.startsWith('/explorar') || pathname?.startsWith('/meus-agendamentos')
                ? 'text-violet-600 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-slate-400" />
            Explorar Prestadores
          </NextLink>

          <NextLink
            href="/chat"
            className={`transition flex items-center gap-1.5 ${
              pathname?.startsWith('/chat')
                ? 'text-violet-600 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-violet-600" />
            Chat
          </NextLink>

          <NextLink
            href="/planos"
            className={`transition ${
              pathname?.startsWith('/planos')
                ? 'text-violet-600 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Planos
          </NextLink>
        </nav>

        {/* Right Action Buttons: Sou Cliente | Sou Prestador */}
        <div className="hidden md:flex items-center gap-2.5">
          <NextLink
            href="/explorar"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3.5 py-2 rounded-xl transition"
          >
            <User className="w-3.5 h-3.5 text-violet-600" />
            <span>Sou Cliente</span>
          </NextLink>
          <NextLink
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition shadow-xs border border-slate-800 hover:border-slate-700"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sou Prestador</span>
          </NextLink>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer (Clean & Enxuto) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <NextLink
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-xl"
          >
            Início
          </NextLink>
          <NextLink
            href="/explorar"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 text-sm font-bold text-blue-700 bg-blue-50 rounded-xl"
          >
            Explorar Prestadores (Sou Cliente)
          </NextLink>
          <NextLink
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl"
          >
            Painel do Prestador (Sou Profissional)
          </NextLink>
          <NextLink
            href="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            Chat & Conversas
          </NextLink>
          <NextLink
            href="/planos"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            Planos & Preços
          </NextLink>
        </div>
      )}
    </header>
  );
}
