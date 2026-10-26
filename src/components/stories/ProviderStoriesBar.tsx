'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import NextLink from 'next/link';
import {
  Plus,
  Heart,
  MessageCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
  BadgeCheck,
  Send,
  Sparkles,
  Play,
  Pause,
  ThumbsUp,
  Clock,
  CheckCircle2,
  Trophy,
  Wind,
  Zap,
  Waves,
  Brush,
  Eye,
  Check,
} from 'lucide-react';
import { ProviderStory, StorySlide, Tenant } from '@/lib/types';
import { INITIAL_STORIES } from '@/lib/data';
import {
  getStoredStories,
  saveStories,
  getStoredConversations,
  saveConversations,
  getStoredTenants,
} from '@/lib/store';

interface ProviderStoriesBarProps {
  highlightSlug?: string;
}

const PHOTO_PRESETS = [
  {
    label: 'Quadra de Beach Tennis',
    url: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=900&auto=format&fit=crop&q=80',
  },
  {
    label: 'Manutenção Ar-Condicionado',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop&q=80',
  },
  {
    label: 'Quadro Elétrico Técnico',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&auto=format&fit=crop&q=80',
  },
  {
    label: 'Limpeza de Piscina',
    url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=900&auto=format&fit=crop&q=80',
  },
];

const QUICK_REACTIONS = [
  { label: 'Trabalho impecável', icon: ThumbsUp },
  { label: 'Quero esse horário hoje', icon: Calendar },
  { label: 'Quanto tempo leva?', icon: Clock },
  { label: 'Mais fotos do serviço', icon: Sparkles },
];

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case 'esportes':
      return Trophy;
    case 'climatização':
      return Wind;
    case 'elétrica':
      return Zap;
    case 'piscina':
      return Waves;
    case 'limpeza':
      return Brush;
    default:
      return Sparkles;
  }
}

export default function ProviderStoriesBar({ highlightSlug }: ProviderStoriesBarProps) {
  const [stories, setStories] = useState<ProviderStory[]>(INITIAL_STORIES);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [likedSlides, setLikedSlides] = useState<Record<string, boolean>>({});
  const [reactionSentMsg, setReactionSentMsg] = useState<string | null>(null);
  const [customReplyText, setCustomReplyText] = useState('');

  // Create Story Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [newStorySlug, setNewStorySlug] = useState('');
  const [newStoryBadge, setNewStoryBadge] = useState('HORÁRIO VAGO HOJE');
  const [newStoryCaption, setNewStoryCaption] = useState('');
  const [newStoryPhoto, setNewStoryPhoto] = useState(PHOTO_PRESETS[0].url);
  const [newStoryPrice, setNewStoryPrice] = useState('90');
  const [newStoryService, setNewStoryService] = useState('Atendimento com Preço Tabelado');

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadedTenants = Object.values(getStoredTenants());
    setAvailableTenants(loadedTenants);
    if (loadedTenants.length > 0) {
      setNewStorySlug(loadedTenants[0].slug);
    }

    const loaded = getStoredStories();
    if (highlightSlug) {
      const sorted = [...loaded].sort((a, b) =>
        a.tenantSlug === highlightSlug ? -1 : b.tenantSlug === highlightSlug ? 1 : 0
      );
      setStories(sorted);
    } else {
      setStories(loaded);
    }
  }, [highlightSlug]);

  const activeStory =
    activeStoryIndex !== null ? stories[activeStoryIndex] || null : null;
  const activeSlide: StorySlide | null =
    activeStory && activeStory.slides[activeSlideIndex]
      ? activeStory.slides[activeSlideIndex]
      : null;

  const handleNextSlide = useCallback(() => {
    if (activeStoryIndex === null || !activeStory) return;
    setSlideProgress(0);
    if (activeSlideIndex < activeStory.slides.length - 1) {
      setActiveSlideIndex((prev) => prev + 1);
    } else if (activeStoryIndex < stories.length - 1) {
      const nextStoryIdx = activeStoryIndex + 1;
      setActiveStoryIndex(nextStoryIdx);
      setActiveSlideIndex(0);
      setReactionSentMsg(null);
      // Mark next story as seen
      const updated = stories.map((st, idx) =>
        idx === nextStoryIdx ? { ...st, hasUnseen: false } : st
      );
      setStories(updated);
      saveStories(updated);
    } else {
      setActiveStoryIndex(null);
      setSlideProgress(0);
    }
  }, [activeStoryIndex, activeStory, activeSlideIndex, stories]);

  const handlePrevSlide = useCallback(() => {
    if (activeStoryIndex === null) return;
    setSlideProgress(0);
    if (activeSlideIndex > 0) {
      setActiveSlideIndex((prev) => prev - 1);
    } else if (activeStoryIndex > 0) {
      const prevStoryIdx = activeStoryIndex - 1;
      setActiveStoryIndex(prevStoryIdx);
      setActiveSlideIndex(stories[prevStoryIdx].slides.length - 1);
      setReactionSentMsg(null);
    }
  }, [activeStoryIndex, activeSlideIndex, stories]);

  // Story Auto-Play Timer
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const duration = 5000; // 5 seconds per slide
    const intervalTime = 50;
    const increment = (intervalTime / duration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          handleNextSlide();
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [activeStoryIndex, activeSlideIndex, isPaused, handleNextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeStoryIndex === null) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === 'Escape') {
        setActiveStoryIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStoryIndex, handleNextSlide, handlePrevSlide]);

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    setActiveSlideIndex(0);
    setSlideProgress(0);
    setReactionSentMsg(null);
    setIsPaused(false);

    // Mark story as seen
    const updated = stories.map((st, idx) =>
      idx === index ? { ...st, hasUnseen: false } : st
    );
    setStories(updated);
    saveStories(updated);
  };

  const handleToggleLike = (slideId: string) => {
    if (activeStoryIndex === null) return;
    const isLiked = !!likedSlides[slideId];
    setLikedSlides((prev) => ({ ...prev, [slideId]: !isLiked }));

    const updated = stories.map((st, sIdx) => {
      if (sIdx !== activeStoryIndex) return st;
      return {
        ...st,
        slides: st.slides.map((sl) =>
          sl.id === slideId
            ? { ...sl, likes: isLiked ? sl.likes - 1 : sl.likes + 1 }
            : sl
        ),
      };
    });
    setStories(updated);
    saveStories(updated);
  };

  const handleSendStoryReactionToChat = (text: string) => {
    if (!activeStory || !text.trim()) return;
    const convs = getStoredConversations();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const updatedConvs = convs.map((c) => {
      if (c.tenantSlug !== activeStory.tenantSlug) return c;
      const msgText = `[Story "${activeSlide?.badgeText}"]: ${text}`;
      return {
        ...c,
        lastMessage: msgText,
        lastTime: timeStr,
        messages: [
          ...c.messages,
          {
            id: `story-reply-${Date.now()}`,
            sender: 'user' as const,
            text: msgText,
            time: timeStr,
            status: 'read' as const,
          },
        ],
      };
    });

    saveConversations(updatedConvs);
    setCustomReplyText('');
    setReactionSentMsg('Mensagem enviada diretamente para o Chat do prestador!');
    setTimeout(() => setReactionSentMsg(null), 3000);
  };

  const handleCreateNewStory = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlide: StorySlide = {
      id: `sl-custom-${Date.now()}`,
      imageUrl: newStoryPhoto,
      badgeText: newStoryBadge || 'TRABALHO DO DIA',
      caption:
        newStoryCaption ||
        'Acabei de finalizar mais um atendimento! Confira os horários disponíveis na minha agenda hoje.',
      postedAt: 'Agora mesmo',
      likes: 1,
      linkedServiceName: newStoryService || 'Serviço Tabelado',
      linkedServicePrice: Number(newStoryPrice) || 100,
      availableSlotToday: '17:00',
    };

    const updated = stories.map((st) => {
      if (st.tenantSlug !== newStorySlug) return st;
      return {
        ...st,
        hasUnseen: true,
        slides: [newSlide, ...st.slides],
      };
    });

    setStories(updated);
    saveStories(updated);
    setShowCreateModal(false);
    setNewStoryCaption('');

    const targetIdx = updated.findIndex((s) => s.tenantSlug === newStorySlug);
    if (targetIdx >= 0) {
      handleOpenStory(targetIdx);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Stories & Trabalhos do Dia
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-extrabold">
            <Sparkles className="w-3 h-3 text-blue-600" />
            Rede Social de Prestadores
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-2 transition"
        >
          <Camera className="w-3.5 h-3.5 text-blue-400" />
          <span>Postar Story</span>
        </button>
      </div>

      {/* =====================================================================
          1. MOBILE STORIES BAR (< lg): INSTAGRAM-STYLE AVATAR RING FEED
         ===================================================================== */}
      <div className="lg:hidden flex items-start gap-4 overflow-x-auto pb-2 no-scrollbar">
        {/* Add Story Button on Mobile */}
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex flex-col items-center gap-1.5 shrink-0 w-20 text-center group"
        >
          <div className="relative w-16 h-16 rounded-full bg-slate-50 border-2 border-dashed border-blue-600 flex items-center justify-center text-blue-600 group-hover:bg-blue-50 transition">
            <Plus className="w-6 h-6" />
            <span className="absolute -bottom-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider">
              Postar
            </span>
          </div>
          <span className="text-[11px] font-extrabold text-slate-800 truncate w-20">
            Seu Story
          </span>
          <span className="text-[9px] text-slate-400 truncate w-20 -mt-1">
            Divulgar vaga
          </span>
        </button>

        {/* Provider Story Circles */}
        {stories.map((story, idx) => {
          const latestSlide = story.slides[0];
          const CategoryIcon = getCategoryIcon(story.category);
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => handleOpenStory(idx)}
              className="flex flex-col items-center gap-1.5 shrink-0 w-20 text-center group"
            >
              <div
                className={`relative w-16 h-16 rounded-full p-[2px] transition ${
                  story.hasUnseen
                    ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-white'
                    : 'ring-1 ring-slate-300'
                }`}
              >
                <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-100">
                  <Image
                    src={story.providerAvatar}
                    alt={story.providerName}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />
                </div>
                {latestSlide?.availableSlotToday && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider whitespace-nowrap shadow-xs">
                    VAGA {latestSlide.availableSlotToday}
                  </span>
                )}
              </div>

              <span className="text-[11px] font-extrabold text-slate-900 truncate w-20">
                {story.providerName.replace('Prof. ', '')}
              </span>
              <span className="text-[9px] font-bold text-blue-600 truncate w-20 -mt-1 flex items-center justify-center gap-1">
                <CategoryIcon className="w-2.5 h-2.5" />
                {story.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          2. DESKTOP STORIES BAR (lg:): MODERN VERTICAL 9:16 PREVIEW CARDS
         ===================================================================== */}
      <div className={`hidden lg:grid ${stories.length === 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-6'} gap-3.5`}>
        {/* Create Story Card on Desktop */}
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="h-56 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/40 hover:bg-blue-50 p-4 flex flex-col items-center justify-center text-center gap-3 transition group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition shadow-sm">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-900">
              Postar Story de Trabalho
            </p>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Mostre um trabalho finalizado ou anuncie horários vagos hoje
            </p>
          </div>
          <span className="text-[10px] font-extrabold text-blue-600 bg-blue-100/70 px-2.5 py-1 rounded-lg">
            + Nova Publicação
          </span>
        </button>

        {stories.length === 0 && (
          <div className="lg:col-span-2 h-56 rounded-2xl border border-slate-200 bg-white p-6 flex flex-col items-center justify-center text-center gap-2">
            <span className="text-xs font-extrabold text-slate-800">Nenhum story ativo</span>
            <p className="text-xs text-slate-500 max-w-sm">
              Prestadores cadastrados podem publicar stories para divulgar vagas e trabalhos recentes.
            </p>
          </div>
        )}

        {/* Provider Story Cards on Desktop */}
        {stories.map((story, idx) => {
          const latestSlide = story.slides[0];
          const CategoryIcon = getCategoryIcon(story.category);
          return (
            <div
              key={story.id}
              onClick={() => handleOpenStory(idx)}
              className={`h-56 rounded-2xl overflow-hidden border cursor-pointer relative flex flex-col justify-between p-3 transition group ${
                story.hasUnseen
                  ? 'border-blue-600 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              } bg-slate-950`}
            >
              {/* Background Work Photo with Solid Dark Gradient/Overlay */}
              {latestSlide && (
                <Image
                  src={latestSlide.imageUrl}
                  alt={story.providerName}
                  fill
                  className="object-cover opacity-65 group-hover:scale-105 transition duration-300"
                />
              )}

              {/* Dark protection overlay */}
              <div className="absolute inset-0 bg-slate-950/45 group-hover:bg-slate-950/30 transition pointer-events-none" />

              {/* Top Row: Category Pill & Unseen / Slot Indicator */}
              <div className="relative z-10 flex items-center justify-between gap-1">
                <span className="px-2 py-0.5 rounded-full bg-slate-900/90 text-white border border-slate-700 text-[10px] font-extrabold flex items-center gap-1">
                  <CategoryIcon className="w-3 h-3 text-blue-400" />
                  {story.category}
                </span>

                {latestSlide?.availableSlotToday ? (
                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase">
                    Vaga {latestSlide.availableSlotToday}
                  </span>
                ) : story.hasUnseen ? (
                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase">
                    Novo
                  </span>
                ) : null}
              </div>

              {/* Center Floating Hover Action */}
              <div className="relative z-10 self-center opacity-0 group-hover:opacity-100 transition">
                <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md">
                  <Eye className="w-3.5 h-3.5" />
                  Ver Story
                </span>
              </div>

              {/* Bottom Card Footer: Provider Info & Social Count */}
              <div className="relative z-10 bg-slate-900/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-700/80">
                <div className="flex items-center gap-2">
                  <div
                    className={`relative w-7 h-7 rounded-full overflow-hidden shrink-0 ${
                      story.hasUnseen ? 'ring-2 ring-blue-500' : 'ring-1 ring-white/60'
                    }`}
                  >
                    <Image
                      src={story.providerAvatar}
                      alt={story.providerName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-white truncate">
                      {story.providerName}
                    </p>
                    <p className="text-[10px] text-slate-300 truncate">
                      {story.providerRole}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-700/60">
                  <span className="text-[10px] font-extrabold text-blue-400">
                    {story.slides.length} {story.slides.length === 1 ? 'story' : 'stories'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                    {latestSlide?.likes || 42}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================================
          3. FULL-SCREEN STORY VIEWER MODAL (PRO-CALIBER IMMERSIVE STORY EXPERIENCE)
         ===================================================================== */}
      {activeStory && activeSlide && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 select-none"
          onClick={() => setActiveStoryIndex(null)}
        >
          <div
            className="bg-slate-900 text-white w-full max-w-md rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[94vh]"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={() => setIsPaused(true)}
            onPointerUp={() => setIsPaused(false)}
          >
            {/* Top Segmented Animated Progress Bars */}
            <div className="p-3 pb-2 flex items-center gap-1.5 bg-slate-950">
              {activeStory.slides.map((sl, sIdx) => {
                let fillPercent = 0;
                if (sIdx < activeSlideIndex) {
                  fillPercent = 100;
                } else if (sIdx === activeSlideIndex) {
                  fillPercent = slideProgress;
                }
                return (
                  <button
                    key={sl.id}
                    type="button"
                    onClick={() => {
                      setActiveSlideIndex(sIdx);
                      setSlideProgress(0);
                    }}
                    className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-800"
                  >
                    <div
                      className="h-full bg-blue-500 transition-all duration-75"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Story Author Header */}
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-500 shrink-0">
                  <Image
                    src={activeStory.providerAvatar}
                    alt={activeStory.providerName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-extrabold text-white truncate">
                      {activeStory.providerName}
                    </p>
                    <BadgeCheck className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-[10px] text-slate-400">
                      • {activeSlide.postedAt}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold text-blue-400 truncate">
                      {activeStory.providerRole}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      ({activeSlideIndex + 1}/{activeStory.slides.length})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title={isPaused ? 'Continuar' : 'Pausar'}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStoryIndex(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Story Visual Area */}
            <div className="relative h-72 sm:h-80 bg-slate-950 shrink-0">
              <Image
                src={activeSlide.imageUrl}
                alt={activeSlide.badgeText}
                fill
                className="object-cover"
              />

              {/* Subtle top/bottom shade for contrast */}
              <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />

              {/* Prev / Next Click Zones */}
              <button
                type="button"
                onClick={handlePrevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center border border-slate-700 transition"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center border border-slate-700 transition"
                aria-label="Próximo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Floating Badge inside Story Photo */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                  {activeSlide.badgeText}
                </span>

                {activeSlide.availableSlotToday && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                    Vaga Hoje às {activeSlide.availableSlotToday}
                  </span>
                )}
              </div>
            </div>

            {/* Story Interactive Footer: Caption, Hiring Card, Chat Reactions */}
            <div className="p-4 space-y-3.5 overflow-y-auto bg-slate-900">
              {/* Caption & Like Count */}
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs text-slate-200 leading-relaxed flex-1">
                  {activeSlide.caption}
                </p>

                <button
                  type="button"
                  onClick={() => handleToggleLike(activeSlide.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition ${
                    likedSlides[activeSlide.id]
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      likedSlides[activeSlide.id] ? 'fill-white' : 'text-rose-500'
                    }`}
                  />
                  <span>{activeSlide.likes}</span>
                </button>
              </div>

              {/* Linked Service / Direct Hiring Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
                      Trabalho Vinculado a este Story
                    </span>
                    <p className="text-xs font-extrabold text-white mt-0.5">
                      {activeSlide.linkedServiceName}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block text-[10px] text-slate-400">Preço Fixo</span>
                    <span className="text-base font-black text-white">
                      R$ {activeSlide.linkedServicePrice}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <NextLink
                    href={`/${activeStory.tenantSlug}`}
                    onClick={() => setActiveStoryIndex(null)}
                    className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar Agora</span>
                  </NextLink>

                  <NextLink
                    href={`/chat?prestador=${activeStory.tenantSlug}`}
                    onClick={() => setActiveStoryIndex(null)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Abrir Chat</span>
                  </NextLink>
                </div>
              </div>

              {/* Quick Reactions without Emojis (Pure Lucide Icons) */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {QUICK_REACTIONS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleSendStoryReactionToChat(item.label)}
                        className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-300 whitespace-nowrap transition flex items-center gap-1.5"
                      >
                        <Icon className="w-3 h-3 text-blue-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {reactionSentMsg && (
                  <div className="p-2 rounded-xl bg-blue-600 text-white text-[11px] font-bold text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{reactionSentMsg}</span>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendStoryReactionToChat(customReplyText);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={customReplyText}
                    onChange={(e) => setCustomReplyText(e.target.value)}
                    placeholder={`Responder ao story de ${activeStory.providerName}...`}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none focus:border-blue-500 placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shrink-0 transition"
                    title="Enviar resposta"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. CREATE NEW PROVIDER STORY MODAL (CLEAN & EMOJI-FREE)
         ===================================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Publicar Novo Story de Trabalho
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Divulgue seu serviço ou um horário livre para hoje
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewStory} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Qual prestador está publicando?
                </label>
                <select
                  value={newStorySlug}
                  onChange={(e) => setNewStorySlug(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold outline-none focus:border-blue-600"
                >
                  {availableTenants.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name} ({t.role})
                    </option>
                  ))}
                  {availableTenants.length === 0 && (
                    <option value="">Nenhum prestador cadastrado</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Escolha uma foto do trabalho:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setNewStoryPhoto(preset.url)}
                      className={`p-2 rounded-xl border text-left font-bold truncate transition ${
                        newStoryPhoto === preset.url
                          ? 'bg-blue-50 border-blue-600 text-blue-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Selo de Destaque (Ex: Vaga Hoje / Antes e Depois)
                </label>
                <input
                  type="text"
                  value={newStoryBadge}
                  onChange={(e) => setNewStoryBadge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
                  placeholder="HORÁRIO VAGO HOJE ÀS 17:00"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Serviço Vinculado
                  </label>
                  <input
                    type="text"
                    value={newStoryService}
                    onChange={(e) => setNewStoryService(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Valor R$
                  </label>
                  <input
                    type="number"
                    value={newStoryPrice}
                    onChange={(e) => setNewStoryPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Legenda do Trabalho Realizado
                </label>
                <textarea
                  rows={2}
                  value={newStoryCaption}
                  onChange={(e) => setNewStoryCaption(e.target.value)}
                  placeholder="Conte sobre o trabalho feito ou horário vago..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Publicar Story Agora</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
