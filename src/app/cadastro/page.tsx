'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NextLink from 'next/link';
import Image from 'next/image';
import {
  User,
  Wrench,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Plus,
  Trash2,
  Building2,
  Home,
  Wind,
  Zap,
  Waves,
  Sparkles,
  Trophy,
  BadgeCheck,
  Check,
  Camera,
  Upload,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import {
  saveTenant,
  saveStoredUserRole,
  saveActiveTenantSlug,
  saveStoredLoggedUser,
  getPublicDomain,
} from '@/lib/store';
import { getSupabase } from '@/lib/supabase/client';
import { saveTenantToSupabase } from '@/lib/supabase/api';
import { Tenant } from '@/lib/types';
import { refreshSession } from '@/lib/auth';

type AccountRole = 'cliente' | 'prestador';

const PROFESSION_TEMPLATES = [
  {
    id: 'climatizacao',
    label: 'Climatização / Ar',
    icon: Wind,
    role: 'Técnico em Climatização',
    experience: '8 anos',
    services: [
      {
        name: 'Manutenção e Higienização de Ar-Condicionado',
        price: 150,
        duration: '1h 30min',
        durationMinutes: 90,
        description: 'Limpeza bactericida, medição de gás refrigerante e revisão elétrica.',
      },
      {
        name: 'Instalação de Split (9.000 a 18.000 BTUs)',
        price: 420,
        duration: '2h 30min',
        durationMinutes: 150,
        description: 'Instalação completa com tubulação de cobre, vácuo e teste de pressão.',
      },
    ],
  },
  {
    id: 'eletrica',
    label: 'Eletricista',
    icon: Zap,
    role: 'Eletricista Residencial e Comercial',
    experience: '10 anos',
    services: [
      {
        name: 'Revisão de Quadro Elétrico e Disjuntores',
        price: 180,
        duration: '1h 30min',
        durationMinutes: 90,
        description: 'Balanceamento de fases, aperto de conexões e troca de disjuntores.',
      },
      {
        name: 'Instalação de Chuveiro, Tomadas e Luminárias',
        price: 120,
        duration: '1h',
        durationMinutes: 60,
        description: 'Instalação segura seguindo norma ABNT NBR 5410.',
      },
    ],
  },
  {
    id: 'piscina',
    label: 'Piscineiro',
    icon: Waves,
    role: 'Especialista em Piscinas',
    experience: '6 anos',
    services: [
      {
        name: 'Limpeza Completa + Controle de pH e Cloro',
        price: 160,
        duration: '1h 30min',
        durationMinutes: 90,
        description: 'Aspiração de fundo, peneiração, escovação de bordas e tratamento químico.',
      },
    ],
  },
  {
    id: 'limpeza',
    label: 'Limpeza Técnica',
    icon: Sparkles,
    role: 'Limpeza Técnica e Pós-Obra',
    experience: '5 anos',
    services: [
      {
        name: 'Faxina Residencial Completa',
        price: 200,
        duration: '4h',
        durationMinutes: 240,
        description: 'Limpeza detalhada de todos os cômodos, vidros e banheiros.',
      },
    ],
  },
  {
    id: 'beachtennis',
    label: 'Beach Tennis & Aulas',
    icon: Trophy,
    role: 'Professor de Beach Tennis',
    experience: '6 anos',
    services: [
      {
        name: 'Aula Individual de Beach Tennis',
        price: 90,
        duration: '1h',
        durationMinutes: 60,
        description: 'Treino técnico personalizado com raquetes e bolinhas inclusas.',
      },
      {
        name: 'Aula em Dupla (2 Alunos)',
        price: 140,
        duration: '1h',
        durationMinutes: 60,
        description: 'Posicionamento em quadra, bloqueio, saque e tática de jogo.',
      },
    ],
  },
];

function CadastroPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accountRole, setAccountRole] = useState<AccountRole>('prestador');
  const [step, setStep] = useState<number>(1);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domain, setDomain] = useState('agendafacil-blond.vercel.app');

  useEffect(() => {
    setDomain(getPublicDomain());
  }, []);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'cliente' || roleParam === 'prestador') {
      setAccountRole(roleParam);
    }
  }, [searchParams]);

  // =========================================================================
  // CLIENTE STATES
  // =========================================================================
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientDoc, setClientDoc] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientCep, setClientCep] = useState('');
  const [clientStreet, setClientStreet] = useState('');
  const [clientNumber, setClientNumber] = useState('');
  const [clientComp, setClientComp] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientInterests, setClientInterests] = useState<string[]>([
    'Climatização & Ar-Condicionado',
    'Elétrica & Reparos Residenciais',
  ]);

  // =========================================================================
  // PRESTADOR STATES
  // =========================================================================
  const [proName, setProName] = useState('');
  const [proRole, setProRole] = useState('Técnico em Climatização');
  const [proDoc, setProDoc] = useState('');
  const [proExperience, setProExperience] = useState('6 anos');
  const [proEmail, setProEmail] = useState('');
  const [proPhone, setProPhone] = useState('');
  const [proPassword, setProPassword] = useState('');
  const [proSlug, setProSlug] = useState('');
  const [proWorkMode, setProWorkMode] = useState<'domicilio' | 'local_proprio' | 'ambos'>('ambos');
  const [proAddress, setProAddress] = useState('');
  const [proStartTime, setProStartTime] = useState('08:00');
  const [proEndTime, setProEndTime] = useState('19:00');
  const [proSlotMinutes, setProSlotMinutes] = useState(60);
  const [proSelectedDays, setProSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [proPlan, setProPlan] = useState<'free' | 'pro'>('free');
  const [proPixKeyType, setProPixKeyType] = useState<
    'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria'
  >('telefone');
  const [proPixKey, setProPixKey] = useState('');
  const [proAvatar, setProAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'
  );

  const handleProAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Por favor escolha uma imagem de até 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setProAvatar(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const [proServices, setProServices] = useState<
    Array<{
      name: string;
      price: number;
      duration: string;
      durationMinutes: number;
      description: string;
    }>
  >(PROFESSION_TEMPLATES[0].services);

  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvPrice, setNewSrvPrice] = useState('');
  const [newSrvDuration, setNewSrvDuration] = useState('1h');
  const [newSrvDesc, setNewSrvDesc] = useState('');

  const handleProNameChange = (val: string) => {
    setProName(val);
    const generated = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setProSlug(generated);
  };

  const applyProfessionTemplate = (tplId: string) => {
    const found = PROFESSION_TEMPLATES.find((t) => t.id === tplId);
    if (!found) return;
    setProRole(found.role);
    setProExperience(found.experience);
    setProServices(found.services);
  };

  const toggleWorkDay = (dayIndex: number) => {
    if (proSelectedDays.includes(dayIndex)) {
      if (proSelectedDays.length > 1) {
        setProSelectedDays(proSelectedDays.filter((d) => d !== dayIndex));
      }
    } else {
      setProSelectedDays([...proSelectedDays, dayIndex].sort());
    }
  };

  const toggleClientInterest = (label: string) => {
    if (clientInterests.includes(label)) {
      setClientInterests(clientInterests.filter((i) => i !== label));
    } else {
      setClientInterests([...clientInterests, label]);
    }
  };

  const handleAddProService = () => {
    if (!newSrvName || !newSrvPrice) return;
    setProServices([
      ...proServices,
      {
        name: newSrvName,
        price: Number(newSrvPrice),
        duration: newSrvDuration,
        durationMinutes: newSrvDuration.includes('2h') ? 120 : 60,
        description:
          newSrvDesc ||
          'Trabalho com preço fechado, garantia técnica e agendamento direto.',
      },
    ]);
    setNewSrvName('');
    setNewSrvPrice('');
    setNewSrvDesc('');
  };

  const handleRemoveProService = (idx: number) => {
    if (proServices.length <= 1) return;
    setProServices(proServices.filter((_, i) => i !== idx));
  };

  const handleFinishClientSignup = async () => {
    setIsSubmitting(true);

    const supabase = getSupabase();
    if (supabase && clientEmail && clientPassword) {
      try {
        const redirectUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/login?role=cliente`
          : 'https://agendafacil-blond.vercel.app/login?role=cliente';

        const { data: authData } = await supabase.auth.signUp({
          email: clientEmail,
          password: clientPassword,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: clientName || 'Cliente',
              phone: clientPhone,
              role: 'cliente',
            },
          },
        });

        if (authData?.user) {
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            email: clientEmail,
            full_name: clientName || 'Cliente',
            phone: clientPhone,
            role: 'cliente',
          });
        }
      } catch (err) {
        console.warn('Supabase client registration notice:', err);
      }
    }

    await refreshSession();
    saveStoredUserRole('cliente');
    saveStoredLoggedUser({
      email: clientEmail,
      name: clientName || 'Cliente',
      role: 'cliente',
    });
    setIsSubmitting(false);
    setRegistrationSuccess(true);
    setTimeout(() => {
      router.push('/explorar');
    }, 1200);
  };

  const handleFinishProSignup = async () => {
    setIsSubmitting(true);

    const rawSlug =
      proSlug ||
      proName.toLowerCase().replace(/[^a-z0-9]/g, '-') ||
      `prestador-${Date.now().toString().slice(-4)}`;
    const finalSlug = rawSlug.replace(/--+/g, '-').replace(/^-|-$/g, '');

    const newTenant: Tenant = {
      id: finalSlug,
      slug: finalSlug,
      name: proName || 'Profissional Verificado',
      role: proRole,
      specialty: proRole,
      rating: 5.0,
      reviews: 0,
      avatar:
        proAvatar.trim() ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      address: proAddress || 'Atendimento no local e em domicílio',
      experience: proExperience,
      phone: proPhone,
      whatsapp: `55${(proPhone || '').replace(/\D/g, '')}`,
      active: true,
      plan: proPlan,
      pixKey: proPixKey || proPhone || proEmail,
      pixKeyType: proPixKeyType,
      pixBeneficiary: (proName || 'PROFISSIONAL').toUpperCase(),
      acceptStripeCard: true,
      openingHours: {
        start: proStartTime,
        end: proEndTime,
        days: proSelectedDays,
        slotIntervalMinutes: proSlotMinutes,
      },
      services: proServices.map((s, idx) => ({
        id: `srv-${finalSlug}-${idx}`,
        tenantId: finalSlug,
        name: s.name,
        price: s.price,
        duration: s.duration,
        durationMinutes: s.durationMinutes,
        category: proRole.split(' ')[0],
        description: s.description,
      })),
    };

    const supabase = getSupabase();
    if (supabase && proEmail && proPassword) {
      try {
        const redirectUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/login?role=prestador`
          : 'https://agendafacil-blond.vercel.app/login?role=prestador';

        const { data: authData } = await supabase.auth.signUp({
          email: proEmail,
          password: proPassword,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: proName || 'Prestador',
              phone: proPhone,
              role: 'prestador',
            },
          },
        });

        if (authData?.user) {
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            email: proEmail,
            full_name: proName || 'Prestador',
            phone: proPhone,
            role: 'prestador',
          });
          newTenant.userId = authData.user.id;
        }
      } catch (err) {
        console.warn('Supabase auth signup notice:', err);
      }
    }

    await saveTenantToSupabase(newTenant);

    saveTenant(newTenant);
    saveStoredUserRole('prestador');
    saveActiveTenantSlug(finalSlug);
    saveStoredLoggedUser({
      email: proEmail,
      name: proName || 'Prestador',
      role: 'prestador',
      slug: finalSlug,
    });
    await refreshSession();

    setIsSubmitting(false);
    setRegistrationSuccess(true);
    setTimeout(() => {
      router.push('/prestador');
    }, 1200);
  };

  const weekDays = [
    { id: 1, label: 'Seg' },
    { id: 2, label: 'Ter' },
    { id: 3, label: 'Qua' },
    { id: 4, label: 'Qui' },
    { id: 5, label: 'Sex' },
    { id: 6, label: 'Sáb' },
    { id: 0, label: 'Dom' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* ===================================================================
            TOP HEADER & ROLE SELECTOR (CLIENTE VS PRESTADOR)
           =================================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="relative w-7 h-7 shrink-0">
                  <Image
                    src="/logo.png"
                    alt="AgendaFácil"
                    width={28}
                    height={28}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold uppercase tracking-wider">
                  Criar Nova Conta
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Como você deseja utilizar o Agenda
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500">
                  Fácil
                </span>
                ?
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Selecione se você deseja <strong>divulgar sua agenda profissional</strong> ou <strong>contratar serviços</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 shrink-0">
              <span>Já possui uma conta?</span>
              <NextLink
                href={`/login?role=${accountRole}`}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold transition"
              >
                Entrar
              </NextLink>
            </div>
          </div>

          {/* 2 Big Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setAccountRole('prestador');
                setStep(1);
              }}
              className={`p-5 rounded-2xl border-2 text-left flex items-start gap-4 transition ${
                accountRole === 'prestador'
                  ? 'bg-blue-50/70 border-blue-600'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  accountRole === 'prestador'
                    ? 'bg-[#0B132B] text-cyan-400'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Wrench className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-extrabold text-slate-900">
                    Sou Prestador de Serviços / Profissional
                  </h2>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shrink-0">
                    100% Grátis
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Para técnicos, autônomos e professores que desejam ter sua própria página pública de agendamento e painel de gestão.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountRole('cliente');
                setStep(1);
              }}
              className={`p-5 rounded-2xl border-2 text-left flex items-start gap-4 transition ${
                accountRole === 'cliente'
                  ? 'bg-blue-50/70 border-blue-600'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  accountRole === 'cliente'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-extrabold text-slate-900">
                    Sou Cliente / Contratante
                  </h2>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shrink-0">
                    100% Grátis
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Para quem deseja encontrar profissionais verificados, consultar preços fixos e agendar horários com confirmação imediata.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ===================================================================
            MAIN 12-COLUMN FORM + LIVE PREVIEW WORKSPACE
           =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 7 COLUMNS: STEP-BY-STEP REGISTRATION FORM */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
            {/* Step Progress Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                  {accountRole === 'prestador'
                    ? 'Cadastro Profissional'
                    : 'Cadastro de Cliente'}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {accountRole === 'prestador' ? (
                    <>
                      {step === 1 && '1. Identificação & Credenciais'}
                      {step === 2 && '2. Local de Atendimento & Expediente'}
                      {step === 3 && '3. Catálogo de Serviços & Plano'}
                    </>
                  ) : (
                    <>
                      {step === 1 && '1. Seus Dados Pessoais & Acesso'}
                      {step === 2 && '2. Endereço para Atendimento'}
                      {step === 3 && '3. Preferências de Serviços'}
                    </>
                  )}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setStep(num)}
                    className={`w-8 h-8 rounded-xl text-xs font-extrabold flex items-center justify-center transition ${
                      step === num
                        ? 'bg-blue-600 text-white'
                        : step > num
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {step > num ? <Check className="w-4 h-4" /> : num}
                  </button>
                ))}
              </div>
            </div>

            {registrationSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Cadastro Concluído com Sucesso!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  {accountRole === 'prestador'
                    ? 'Sua página profissional já está publicada! Redirecionando para o seu painel...'
                    : 'Sua conta de cliente foi criada! Redirecionando para os profissionais...'}
                </p>
              </div>
            ) : accountRole === 'prestador' ? (
              <>
                {step === 1 && (
                  <div className="space-y-5">
                    {/* Quick Template Selector */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <p className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-blue-600" />
                        <span>Sugestão rápida de ramo de atividade (opcional):</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {PROFESSION_TEMPLATES.map((tpl) => {
                          const Icon = tpl.icon;
                          const isSelected = proRole === tpl.role;
                          return (
                            <button
                              key={tpl.id}
                              type="button"
                              onClick={() => applyProfessionTemplate(tpl.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                                isSelected
                                  ? 'bg-[#0B132B] border-[#0B132B] text-white'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{tpl.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Foto de Perfil ou Logotipo */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 bg-white shrink-0 shadow-sm">
                        <Image
                          src={proAvatar}
                          alt="Foto de perfil"
                          fill
                          className="object-cover"
                          unoptimized={proAvatar.startsWith('data:')}
                        />
                      </div>
                      <div className="flex-1 space-y-1 text-center sm:text-left">
                        <label className="block text-xs font-bold text-slate-800">
                          Foto de Perfil ou Logotipo
                        </label>
                        <p className="text-[11px] text-slate-500">
                          Sua foto aparece na sua agenda pública e nas notificações enviadas aos clientes.
                        </p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                          <label className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Carregar do Dispositivo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProAvatarFileChange}
                              className="hidden"
                            />
                          </label>
                          <div className="flex items-center gap-1.5">
                            {[
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
                              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
                              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
                            ].map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setProAvatar(preset)}
                                className={`relative w-7 h-7 rounded-full overflow-hidden border-2 transition ${
                                  proAvatar === preset
                                    ? 'border-blue-600 ring-2 ring-blue-400 scale-105'
                                    : 'border-slate-200 hover:border-slate-400'
                                }`}
                              >
                                <Image
                                  src={preset}
                                  alt={`Preset ${idx + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Nome Profissional ou Empresa *
                        </label>
                        <input
                          type="text"
                          value={proName}
                          onChange={(e) => handleProNameChange(e.target.value)}
                          placeholder="Ex: Silva Climatização"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Profissão / Especialidade *
                        </label>
                        <input
                          type="text"
                          value={proRole}
                          onChange={(e) => setProRole(e.target.value)}
                          placeholder="Ex: Técnico em Climatização"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          CPF ou CNPJ (opcional)
                        </label>
                        <input
                          type="text"
                          value={proDoc}
                          onChange={(e) => setProDoc(e.target.value)}
                          placeholder="000.000.000-00"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Tempo de Experiência
                        </label>
                        <select
                          value={proExperience}
                          onChange={(e) => setProExperience(e.target.value)}
                          className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-blue-600"
                        >
                          <option value="1 a 2 anos">1 a 2 anos</option>
                          <option value="3 a 5 anos">3 a 5 anos</option>
                          <option value="6 anos">6 anos</option>
                          <option value="8 anos">8 anos</option>
                          <option value="Mais de 10 anos">Mais de 10 anos</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          WhatsApp Comercial *
                        </label>
                        <input
                          type="text"
                          value={proPhone}
                          onChange={(e) => setProPhone(e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          E-mail de Acesso *
                        </label>
                        <input
                          type="email"
                          value={proEmail}
                          onChange={(e) => setProEmail(e.target.value)}
                          placeholder="voce@profissional.com.br"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Link Exclusivo da Sua Agenda *
                        </label>
                        <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:border-blue-600">
                          <span className="bg-slate-100 text-slate-500 text-xs px-3 py-3 border-r border-slate-200 font-mono truncate max-w-[140px]">
                            /{' '}
                          </span>
                          <input
                            type="text"
                            value={proSlug}
                            onChange={(e) =>
                              setProSlug(
                                e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                              )
                            }
                            placeholder="seu-nome"
                            className="w-full px-3 py-3 text-sm font-bold text-slate-900 outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Crie uma Senha Segura *
                        </label>
                        <input
                          type="password"
                          value={proPassword}
                          onChange={(e) => setProPassword(e.target.value)}
                          placeholder="Mínimo de 6 caracteres"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    {/* Chave Pix */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <p className="text-xs font-extrabold text-slate-900">
                        Sua Chave Pix (para gerar QR Code automático nos agendamentos):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Tipo de Chave
                          </label>
                          <select
                            value={proPixKeyType}
                            onChange={(e) => setProPixKeyType(e.target.value as any)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold outline-none focus:border-blue-600"
                          >
                            <option value="telefone">Celular / WhatsApp</option>
                            <option value="cpf">CPF</option>
                            <option value="cnpj">CNPJ</option>
                            <option value="email">E-mail</option>
                            <option value="aleatoria">Chave Aleatória</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Chave Pix (Recebimento Direto)
                          </label>
                          <input
                            type="text"
                            value={proPixKey}
                            onChange={(e) => setProPixKey(e.target.value)}
                            placeholder="Informe sua chave Pix..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full py-4 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition"
                    >
                      <span>Continuar para Local & Expediente</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Modalidade de Atendimento:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setProWorkMode('domicilio')}
                          className={`p-3.5 rounded-xl border text-left transition ${
                            proWorkMode === 'domicilio'
                              ? 'bg-blue-50 border-blue-600 text-blue-900'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <Home className="w-4 h-4 text-blue-600 mb-1" />
                          <p className="text-xs font-extrabold">Vou até o cliente</p>
                          <p className="text-[10px] text-slate-500">Visita técnica / Domicílio</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setProWorkMode('local_proprio')}
                          className={`p-3.5 rounded-xl border text-left transition ${
                            proWorkMode === 'local_proprio'
                              ? 'bg-blue-50 border-blue-600 text-blue-900'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <Building2 className="w-4 h-4 text-blue-600 mb-1" />
                          <p className="text-xs font-extrabold">Em local próprio</p>
                          <p className="text-[10px] text-slate-500">Estúdio / Consultório / Quadra</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setProWorkMode('ambos')}
                          className={`p-3.5 rounded-xl border text-left transition ${
                            proWorkMode === 'ambos'
                              ? 'bg-blue-50 border-blue-600 text-blue-900'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4 text-blue-600 mb-1" />
                          <p className="text-xs font-extrabold">Ambos</p>
                          <p className="text-[10px] text-slate-500">Cliente escolhe ao agendar</p>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Endereço ou Região de Atendimento *
                      </label>
                      <input
                        type="text"
                        value={proAddress}
                        onChange={(e) => setProAddress(e.target.value)}
                        placeholder="Ex: Centro e Zona Sul - São Paulo, SP"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Dias de Atendimento:
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {weekDays.map((d) => {
                          const isSelected = proSelectedDays.includes(d.id);
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => toggleWorkDay(d.id)}
                              className={`py-2.5 rounded-xl text-xs font-extrabold border transition ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'bg-slate-50 border-slate-200 text-slate-500'
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Início do Expediente
                        </label>
                        <input
                          type="time"
                          value={proStartTime}
                          onChange={(e) => setProStartTime(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Fim do Expediente
                        </label>
                        <input
                          type="time"
                          value={proEndTime}
                          onChange={(e) => setProEndTime(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Intervalo da Agenda
                        </label>
                        <select
                          value={proSlotMinutes}
                          onChange={(e) => setProSlotMinutes(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                        >
                          <option value={30}>A cada 30 min</option>
                          <option value={60}>A cada 1 hora</option>
                          <option value={90}>A cada 1h 30min</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-5 py-3.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex-1 py-3.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition"
                      >
                        <span>Continuar para Catálogo & Plano</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <label className="block text-xs font-extrabold text-slate-800">
                        Serviços cadastrados na sua página ({proServices.length}):
                      </label>
                      {proServices.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-slate-900 truncate">
                              {s.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{s.description}</p>
                            <span className="text-[10px] font-bold text-blue-600">
                              Duração: {s.duration}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-black text-slate-900">
                              R$ {s.price}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveProService(idx)}
                              className="p-1.5 text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add new work item */}
                    <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 space-y-3">
                      <p className="text-xs font-extrabold text-slate-800">
                        + Adicionar outro serviço ao catálogo
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        <input
                          type="text"
                          value={newSrvName}
                          onChange={(e) => setNewSrvName(e.target.value)}
                          placeholder="Nome do serviço"
                          className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                        <input
                          type="number"
                          value={newSrvPrice}
                          onChange={(e) => setNewSrvPrice(e.target.value)}
                          placeholder="Preço R$"
                          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                        <select
                          value={newSrvDuration}
                          onChange={(e) => setNewSrvDuration(e.target.value)}
                          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                        >
                          <option value="45min">45min</option>
                          <option value="1h">1h</option>
                          <option value="1h 30min">1h 30min</option>
                          <option value="2h">2h</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={newSrvDesc}
                        onChange={(e) => setNewSrvDesc(e.target.value)}
                        placeholder="Breve descrição do que está incluso..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddProService}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Incluir Serviço
                      </button>
                    </div>

                    {/* Sem cobrança - 100% Gratuito */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-sm flex items-center gap-1.5 text-emerald-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Cadastro 100% Gratuito</span>
                        </p>
                        <p className="text-emerald-700 text-[11px]">
                          Página pública de agendamento, catálogo de serviços e painel de gestão inclusos sem taxa de adesão.
                        </p>
                      </div>
                      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-600 text-white shrink-0">
                        R$ 0,00
                      </span>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-5 py-3.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={handleFinishProSignup}
                        disabled={isSubmitting}
                        className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>
                          {isSubmitting
                            ? 'Publicando sua agenda...'
                            : 'Finalizar Cadastro e Publicar Agenda'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* ===============================================================
                 FORMULÁRIO DO CLIENTE / CONTRATANTE
                 =============================================================== */
              <>
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Seu nome completo"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          WhatsApp para Confirmações *
                        </label>
                        <input
                          type="text"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          E-mail *
                        </label>
                        <input
                          type="email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="voce@exemplo.com"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          CPF ou CNPJ (opcional)
                        </label>
                        <input
                          type="text"
                          value={clientDoc}
                          onChange={(e) => setClientDoc(e.target.value)}
                          placeholder="000.000.000-00"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Crie sua Senha de Acesso *
                        </label>
                        <input
                          type="password"
                          value={clientPassword}
                          onChange={(e) => setClientPassword(e.target.value)}
                          placeholder="Mínimo de 6 caracteres"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition"
                    >
                      <span>Próximo: Endereço para Atendimento</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <p className="text-xs text-slate-500">
                      Cadastre seu endereço principal para facilitar agendamentos de serviços em domicílio:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          CEP
                        </label>
                        <input
                          type="text"
                          value={clientCep}
                          onChange={(e) => setClientCep(e.target.value)}
                          placeholder="00000-000"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Rua / Avenida
                        </label>
                        <input
                          type="text"
                          value={clientStreet}
                          onChange={(e) => setClientStreet(e.target.value)}
                          placeholder="Nome da rua ou avenida"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Número
                        </label>
                        <input
                          type="text"
                          value={clientNumber}
                          onChange={(e) => setClientNumber(e.target.value)}
                          placeholder="123"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Complemento
                        </label>
                        <input
                          type="text"
                          value={clientComp}
                          onChange={(e) => setClientComp(e.target.value)}
                          placeholder="Apto / Bloco"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Cidade / UF
                        </label>
                        <input
                          type="text"
                          value={clientCity}
                          onChange={(e) => setClientCity(e.target.value)}
                          placeholder="São Paulo - SP"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-5 py-3.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition"
                      >
                        <span>Próximo: Preferências</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2.5">
                        Quais categorias de serviços você mais procura?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          'Climatização & Ar-Condicionado',
                          'Elétrica & Reparos Residenciais',
                          'Manutenção de Piscina & Hidráulica',
                          'Limpeza Técnica & Pós-Obra',
                          'Beach Tennis & Esportes de Areia',
                          'Outros Serviços Profissionais',
                        ].map((item) => {
                          const active = clientInterests.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => toggleClientInterest(item)}
                              className={`p-3.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition ${
                                active
                                  ? 'bg-blue-50 border-blue-600 text-blue-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span>{item}</span>
                              {active && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-5 py-3.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={handleFinishClientSignup}
                        disabled={isSubmitting}
                        className="flex-1 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>
                          {isSubmitting
                            ? 'Criando sua conta...'
                            : 'Concluir Cadastro Gratuito'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT 5 COLUMNS: LIVE PREVIEW CARD */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-[#0B132B] text-white px-6 py-4 flex items-center justify-between text-xs">
                <span className="font-extrabold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  {accountRole === 'prestador'
                    ? 'Prévia da Sua Página Pública'
                    : 'Resumo da Conta de Cliente'}
                </span>
                <span className="font-mono text-[11px] text-slate-300 truncate max-w-[180px]">
                  {accountRole === 'prestador'
                    ? `${domain}/${proSlug || 'seu-nome'}`
                    : '100% Gratuito'}
                </span>
              </div>

              {accountRole === 'prestador' ? (
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#0B132B] text-cyan-400 font-extrabold text-xl flex items-center justify-center shrink-0">
                      {(proName || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-extrabold text-slate-900 truncate">
                          {proName || 'Seu Nome Profissional'}
                        </h3>
                        <BadgeCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      </div>
                      <p className="text-xs font-bold text-blue-600">{proRole}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {proAddress || 'Região de atendimento'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      <span>Serviços ({proServices.length})</span>
                      <span>
                        {proStartTime} às {proEndTime}
                      </span>
                    </div>
                    {proServices.slice(0, 3).map((s, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-extrabold text-slate-900 truncate">{s.name}</p>
                          <p className="text-[10px] text-slate-500">{s.duration}</p>
                        </div>
                        <strong className="text-slate-900 shrink-0">R$ {s.price}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <p className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Conta de Prestador Gratuita (R$ 0)
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Sua página ficará disponível imediatamente após concluir o cadastro.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shrink-0">
                      {(clientName || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        Conta de Cliente • R$ 0
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        {clientName || 'Seu Nome Completo'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {clientPhone || 'Seu WhatsApp'}
                      </p>
                    </div>
                  </div>

                  {(clientStreet || clientCity) && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        Endereço salvo:
                      </p>
                      <p className="text-slate-600">
                        {clientStreet}
                        {clientNumber ? `, ${clientNumber}` : ''}
                        {clientComp ? ` (${clientComp})` : ''}
                        {clientCity ? ` — ${clientCity}` : ''}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Categorias de interesse:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {clientInterests.map((int) => (
                        <span
                          key={int}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold"
                        >
                          {int}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center text-sm text-slate-500">
          Carregando cadastro...
        </div>
      }
    >
      <CadastroPageContent />
    </Suspense>
  );
}
