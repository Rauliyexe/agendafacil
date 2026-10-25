'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Calendar, User, LayoutDashboard, Menu, X, ArrowRight, MessageSquare } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo matching the image */}
        <NextLink href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-600/25 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Agenda<span className="text-blue-600">Fácil</span>
          </span>
        </NextLink>

        {/* Center Navigation Links matching the image */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <NextLink
            href="/"
            className={`py-5 border-b-2 transition ${
              pathname === '/'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Início
          </NextLink>

          <NextLink
            href="/dashboard"
            className={`py-5 border-b-2 transition flex items-center gap-1.5 ${
              pathname?.startsWith('/dashboard')
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-blue-600" />
            Painel (Abas)
          </NextLink>

          <NextLink
            href="/explorar"
            className={`py-5 border-b-2 transition flex items-center gap-1.5 ${
              pathname?.startsWith('/explorar') || pathname?.startsWith('/meus-agendamentos')
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-slate-400" />
            Área do Cliente
          </NextLink>

          <NextLink
            href="/lucas-beachtennis"
            className={`py-5 border-b-2 transition flex items-center gap-1.5 ${
              pathname?.startsWith('/lucas-beachtennis')
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            1ª Conta (Beach Tennis)
          </NextLink>

          <NextLink
            href="/chat"
            className={`py-5 border-b-2 transition flex items-center gap-1.5 ${
              pathname?.startsWith('/chat')
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Chat
          </NextLink>

          <NextLink
            href="/planos"
            className={`py-5 border-b-2 transition ${
              pathname?.startsWith('/planos')
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Planos
          </NextLink>
        </nav>

        {/* Right Action Buttons: Entrar | Cadastrar */}
        <div className="hidden md:flex items-center gap-3">
          <NextLink
            href="/login"
            className="text-sm font-bold text-slate-700 hover:text-blue-600 px-3 py-2 transition"
          >
            Entrar
          </NextLink>
          <NextLink
            href="/cadastro"
            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-full transition"
          >
            Criar Conta
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2.5">
          <NextLink
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 rounded-xl"
          >
            Início
          </NextLink>
          <NextLink
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl"
          >
            Painel Completo com Abas (Olá, Raul!)
          </NextLink>
          <NextLink
            href="/explorar"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            Área do Cliente (Explorar & Meus Horários)
          </NextLink>
          <NextLink
            href="/lucas-beachtennis"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            1ª Conta Demo: Prof. Lucas (Beach Tennis)
          </NextLink>
          <NextLink
            href="/chat"
            className={`py-5 border-b-2 transition flex items-center gap-1.5 ${
              pathname?.startsWith('/chat')
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Chat
          </NextLink>

          <NextLink
            href="/planos"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            Planos (Grátis e R$ 19,90)
          </NextLink>
          <div className="pt-2 grid grid-cols-2 gap-2">
            <NextLink
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center block font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-full text-sm"
            >
              Entrar
            </NextLink>
            <NextLink
              href="/cadastro"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center block font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-full text-sm"
            >
              Criar Conta
            </NextLink>
          </div>
        </div>
      )}
    </header>
  );
}
