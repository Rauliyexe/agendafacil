'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, CheckCircle2, Share2 } from 'lucide-react';

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // Detecta se já está rodando instalado em modo standalone (PWA)
    const standaloneMatch =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standaloneMatch);

    // Registra o Service Worker tanto em localhost quanto em produção
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          setSwRegistered(true);
        })
        .catch((err) => {
          console.log('Service Worker registration info:', err);
        });
    }

    // Detecção de iOS (iPhone / iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Captura evento nativo de instalação (Chrome, Edge, Android, Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem('pwa_banner_dismissed')) {
        setTimeout(() => setShowBanner(true), 2500);
      }
    };

    // Permite abrir o modal de instalação de qualquer botão do app
    const handleOpenInstallModal = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        setShowGuideModal(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('open-pwa-install', handleOpenInstallModal);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install', handleOpenInstallModal);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        setShowGuideModal(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowGuideModal(true);
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', '1');
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Banner Flutuante (Acima da barra inferior no celular, canto direito no PC) */}
      {showBanner && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40">
          <div className="bg-[#0B132B] text-white rounded-2xl p-4 shadow-2xl border border-slate-700 flex items-center justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">
                Aplicativo PWA Pronto
              </p>
              <p className="text-xs font-extrabold text-white truncate">
                Instalar AgendaFácil no Aparelho
              </p>
              <p className="text-[11px] text-slate-300 truncate">
                Acesso direto sem ocupar memória
              </p>
            </div>

            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shrink-0 transition"
            >
              Instalar
            </button>

            <button
              onClick={handleDismissBanner}
              className="text-slate-400 hover:text-white p-1"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Guia de Instalação PWA Multiplataforma (Android, iOS e PC) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Instalar Aplicativo AgendaFácil (PWA)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Service Worker {swRegistered ? 'Ativo ✓' : 'Pronto'} • Funciona em Celular e PC
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {deferredPrompt && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold text-blue-950">
                    Instalação Direta Disponível!
                  </p>
                  <p className="text-[11px] text-blue-700">
                    Seu navegador suporta instalação automática em 1 clique.
                  </p>
                </div>
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shrink-0"
                >
                  Instalar Agora
                </button>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-extrabold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  No Android (Chrome / Samsung Internet):
                </p>
                <p className="text-slate-600">
                  Toque nos <strong>3 pontinhos (⋮)</strong> no canto superior do navegador e selecione <strong>&quot;Instalar aplicativo&quot;</strong> ou <strong>&quot;Adicionar à tela inicial&quot;</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-extrabold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  No iPhone / iPad (Safari iOS):
                </p>
                <p className="text-slate-600">
                  Toque no ícone <strong>Compartilhar</strong> na barra inferior do Safari e depois em <strong>&quot;Adicionar à Tela de Início&quot;</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-extrabold text-slate-900 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-slate-700" />
                  No Computador (Chrome / Edge):
                </p>
                <p className="text-slate-600">
                  Clique no ícone de <strong>Instalar (computador com seta)</strong> no lado direito da barra de endereços (`localhost:3000`).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition"
            >
              Entendi, fechar guia
            </button>
          </div>
        </div>
      )}
    </>
  );
}
