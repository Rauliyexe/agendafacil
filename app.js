/**
 * AgendaFácil - Protótipo Interativo
 * Lógica de navegação, fluxos de agendamento, estado central e interações de mouse
 */

// Base de dados de profissionais
const PROS_DB = {
  'juliana-silva': {
    id: 'juliana-silva',
    name: 'Juliana Silva',
    role: 'Cabeleireira & Colorista',
    rating: 4.9,
    reviews: 1124,
    distance: '2,3 km',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    address: 'Rua das Flores, 123 - Centro',
    experience: '5 anos',
    specialty: 'Cortes & Coloração',
    phone: '(11) 97123-4567',
    services: [
      { id: 's1', name: 'Corte e escova', price: 130, duration: '1h' },
      { id: 's2', name: 'Coloração completa', price: 210, duration: '2h' },
      { id: 's3', name: 'Hidratação profunda', price: 110, duration: '45min' },
      { id: 's4', name: 'Penteado clássico', price: 160, duration: '1h 15min' }
    ]
  },
  'rafael-mendes': {
    id: 'rafael-mendes',
    name: 'Dr. Rafael Mendes',
    role: 'Clínico Geral & Preventiva',
    rating: 5.0,
    reviews: 890,
    distance: '1,8 km',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80',
    address: 'Av. Paulista, 1000 - Bela Vista',
    experience: '8 anos',
    specialty: 'Medicina Preventiva',
    phone: '(11) 98833-2211',
    services: [
      { id: 'sr1', name: 'Consulta Médica de Rotina', price: 250, duration: '45min' },
      { id: 'sr2', name: 'Check-up Preventivo', price: 380, duration: '1h 30min' },
      { id: 'sr3', name: 'Avaliação de Exames', price: 180, duration: '30min' }
    ]
  },
  'bruna-nunes': {
    id: 'bruna-nunes',
    name: 'Bruna Nunes',
    role: 'Nail Designer & Manicure',
    rating: 4.8,
    reviews: 742,
    distance: '3,1 km',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    address: 'Rua Augusta, 840 - Consolação',
    experience: '4 anos',
    specialty: 'Alongamento em Fibra',
    phone: '(11) 96544-3322',
    services: [
      { id: 'sb1', name: 'Manicure & Spa dos Pés', price: 90, duration: '1h' },
      { id: 'sb2', name: 'Alongamento Fibra de Vidro', price: 190, duration: '2h' },
      { id: 'sb3', name: 'Banho de Gel & Blindagem', price: 110, duration: '1h 15min' }
    ]
  },
  'fernanda-costa': {
    id: 'fernanda-costa',
    name: 'Fernanda Costa',
    role: 'Estética & Sobrancelhas',
    rating: 4.9,
    reviews: 512,
    distance: '1,5 km',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80',
    address: 'Alameda Lorena, 1420 - Jardins',
    experience: '6 anos',
    specialty: 'Design & Micropigmentação',
    phone: '(11) 97788-9900',
    services: [
      { id: 'sf1', name: 'Design de Sobrancelhas', price: 80, duration: '45min' },
      { id: 'sf2', name: 'Limpeza de Pele Profunda', price: 160, duration: '1h 15min' },
      { id: 'sf3', name: 'Drenagem Linfática Facial', price: 120, duration: '50min' }
    ]
  },
  'amanda-lopes': {
    id: 'amanda-lopes',
    name: 'Amanda Lopes',
    role: 'Penteados & Noivas',
    rating: 4.7,
    reviews: 633,
    distance: '5,0 km',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=800&auto=format&fit=crop&q=80',
    address: 'Rua Oscar Freire, 320 - Jardins',
    experience: '7 anos',
    specialty: 'Noivas & Formandas',
    phone: '(11) 99112-3344',
    services: [
      { id: 'sa1', name: 'Penteado Clássico / Noivas', price: 210, duration: '1h 30min' },
      { id: 'sa2', name: 'Produção Completa de Penteado', price: 320, duration: '2h' },
      { id: 'sa3', name: 'Tratamento Capilar Reconstrutor', price: 150, duration: '1h' }
    ]
  },
  'spa': {
    id: 'spa',
    name: 'Studio Bem Estar',
    role: 'Massoterapia & Spa',
    rating: 4.9,
    reviews: 420,
    distance: '2,0 km',
    avatar: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
    address: 'Alameda Santos, 500 - Jardins',
    experience: '10 anos',
    specialty: 'Massagem Relaxante & Pedras Quentes',
    phone: '(11) 98221-7788',
    services: [
      { id: 'sp1', name: 'Massagem Relaxante Aromaterapêutica', price: 160, duration: '1h' },
      { id: 'sp2', name: 'Sessão com Pedras Vulcânicas', price: 220, duration: '1h 20min' },
      { id: 'sp3', name: 'Drenagem Linfática Corporal', price: 170, duration: '1h' }
    ]
  }
};

// Estado central da aplicação
const state = {
  activeScreen: 'screen-3', // Inicia na Home do cliente por padrão
  role: 'client', // 'client' ou 'pro'
  isIphoneFrame: true,
  
  // Usuário cliente logado
  currentUser: {
    name: 'Maria Vitória',
    email: 'maria.vitoria@email.com',
    phone: '(11) 98765-4321',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },

  // Dados do profissional atualmente em visualização
  currentPro: PROS_DB['juliana-silva'],

  // Multi-serviços selecionados (Monte seu Combo)
  selectedServices: [
    { id: 's1', name: 'Corte e escova', price: 130, duration: '1h' }
  ],

  // Dados dos Stories de Trabalhos Recentes / Portfólio
  stories: {
    juliana: {
      author: 'Juliana Silva',
      role: 'Cabeleireira & Colorista',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
      time: 'há 2 horas',
      image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&auto=format&fit=crop&q=80',
      caption: 'Morena iluminada em tons quentes de avelã + hidratação espelhada. Trabalho finalizado hoje.',
      service: 'Corte e escova',
      price: 130
    },
    bruna: {
      author: 'Bruna Nunes',
      role: 'Nail Designer & Manicure',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      time: 'há 3 horas',
      image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop&q=80',
      caption: 'Alongamento em fibra de vidro com encapsulado rosé gold e acabamento natural.',
      service: 'Manicure & Spa dos Pés',
      price: 90
    },
    spa: {
      author: 'Studio Bem Estar',
      role: 'Massoterapia & Spa',
      avatar: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=160&auto=format&fit=crop&q=80',
      time: 'há 4 horas',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80',
      caption: 'Sessão de massagem relaxante com pedras vulcânicas aquecidas e blend de lavanda.',
      service: 'Massagem Relaxante Aromaterapêutica',
      price: 160
    },
    rafael: {
      author: 'Dr. Rafael Mendes',
      role: 'Clínico Geral',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=160&auto=format&fit=crop&q=80',
      time: 'ontem',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
      caption: 'Novas salas de atendimento para medicina preventiva e consultas de rotina.',
      service: 'Consulta Médica de Rotina',
      price: 250
    },
    amanda: {
      author: 'Amanda Lopes',
      role: 'Penteados & Noivas',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=160&auto=format&fit=crop&q=80',
      time: 'ontem',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      caption: 'Penteado clássico semi-preso para casamento no campo com fixação suave.',
      service: 'Penteado Clássico / Noivas',
      price: 210
    }
  },

  // Agendamento em rascunho
  bookingDraft: {
    serviceName: 'Corte e escova',
    servicePrice: 130,
    serviceDuration: '1h',
    dayName: 'Seg',
    dayNumber: '22',
    fullDate: '22 de abril de 2025',
    time: '09:00'
  },

  // Lista de agendamentos do cliente
  clientBookings: [
    {
      id: 'b-1',
      proName: 'Juliana Silva',
      role: 'Cabeleireira',
      service: 'Corte e escova',
      price: 130,
      date: '22 de abril de 2025',
      time: '09:00',
      status: 'Confirmado',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
      address: 'Rua das Flores, 123 - Centro (2,3 km)'
    },
    {
      id: 'b-2',
      proName: 'Dr. Rafael Mendes',
      role: 'Clínico Geral',
      service: 'Consulta de rotina',
      price: 250,
      date: '25 de abril de 2025',
      time: '14:30',
      status: 'Confirmado',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=160&auto=format&fit=crop&q=80',
      address: 'Av. Paulista, 1000 - Bela Vista'
    },
    {
      id: 'b-3',
      proName: 'Studio Bem Estar',
      role: 'Massagem Relaxante',
      service: 'Massagem aromaterapêutica',
      price: 160,
      date: '30 de abril de 2025',
      time: '10:00',
      status: 'Confirmado',
      avatar: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=160&auto=format&fit=crop&q=80',
      address: 'Alameda Santos, 500 - Jardins'
    }
  ],

  // Favoritos
  favorites: new Set(['juliana-silva']),

  // Filtros de busca
  activeSearchFilter: 'todos',
  activeCategory: 'Todos'
};

class AgendaFacilApp {
  constructor() {
    this.currentRatingPro = 'Juliana Silva';
    this.currentRatingValue = 5;
    this.currentDetailsPro = PROS_DB['juliana-silva'];
    this.init();
  }

  init() {
    this.bindDomElements();
    this.loadSavedTheme();
    this.attachEventListeners();
    this.setupMouseHorizontalScroll();
    this.setupNotificationsSheet();
    this.setupRatingModal();
    this.setupBookingDetailsModal();
    this.setupTermsModal();
    this.navigateTo(state.activeScreen);
    this.updateClock();
    setInterval(() => this.updateClock(), 30000);
  }

  bindDomElements() {
    this.screenSelect = document.getElementById('screenSelect');
    this.toggleRoleBtn = document.getElementById('toggleRoleBtn');
    this.roleLabel = document.getElementById('roleLabel');
    this.toggleDeviceBtn = document.getElementById('toggleDeviceBtn');
    this.deviceModeLabel = document.getElementById('deviceModeLabel');
    this.toggleThemeBtn = document.getElementById('toggleThemeBtn');
    this.themeIcon = document.getElementById('themeIcon');
    this.resetDataBtn = document.getElementById('resetDataBtn');
    this.toast = document.getElementById('protoToast');
    this.toastMsg = document.getElementById('toastMsg');
    this.toastIcon = document.getElementById('toastIcon');
  }

  attachEventListeners() {
    // 1. Selector de telas superior
    if (this.screenSelect) {
      this.screenSelect.addEventListener('change', (e) => {
        this.navigateTo(e.target.value);
      });
    }

    // 2. Botão alternar Modo Cliente / Profissional
    if (this.toggleRoleBtn) {
      this.toggleRoleBtn.addEventListener('click', () => {
        this.toggleUserRole();
      });
    }

    // 3. Botão alternar Moldura iPhone / Tela Cheia
    if (this.toggleDeviceBtn) {
      this.toggleDeviceBtn.addEventListener('click', () => {
        this.toggleDeviceFrame();
      });
    }

    // 3.1 Botão alternar Dark Mode / Light Mode
    if (this.toggleThemeBtn) {
      this.toggleThemeBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // 4. Restaurar dados de teste
    if (this.resetDataBtn) {
      this.resetDataBtn.addEventListener('click', () => {
        this.resetDemoData();
      });
    }

    // 5. Cliques globais com atributo data-nav
    document.addEventListener('click', (e) => {
      const targetNav = e.target.closest('[data-nav]');
      if (targetNav) {
        e.preventDefault();
        const screenId = targetNav.getAttribute('data-nav');
        this.navigateTo(screenId);
      }
    });

    // 6. Configurar formulário de cadastro e reveal de senha
    this.setupRegisterScreen();

    // 7. Configurar tela de busca e filtros
    this.setupSearchScreen();

    // 8. Configurar tela de perfil do profissional e seleção de procedimentos
    this.setupProfileScreen();

    // 9. Configurar tela de escolha de horário
    this.setupScheduleScreen();

    // 10. Configurar abas de agendamentos (Próximos | Passados | Cancelados)
    this.setupAppointmentsTabs();

    // 11. Configurar ações da tela de confirmação
    this.setupConfirmationScreen();

    // 12. Configurar dashboard do profissional
    this.setupProDashboard();

    // 13. Configurar modal do perfil do cliente e navegação inferior unificada
    this.setupProfileSheet();
  }

  // ========================================================
  // SCROLL HORIZONTAL COM MOUSE (RODA DO MOUSE + ARRASTAR)
  // ========================================================
  setupMouseHorizontalScroll() {
    const containers = document.querySelectorAll(
      '.home-categories-chips, .featured-pros-carousel, .filter-chips-row, .calendar-days-slider, .stories-scroll'
    );

    containers.forEach(container => {
      // 1. Rotação da roda vertical do mouse rola horizontalmente
      container.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          const maxScroll = container.scrollWidth - container.clientWidth;
          if (maxScroll > 0) {
            e.preventDefault();
            container.scrollLeft += e.deltaY * 0.9;
          }
        }
      }, { passive: false });

      // 2. Clicar e arrastar com o cursor (Drag to Scroll)
      let isDown = false;
      let startX = 0;
      let startScrollLeft = 0;
      let hasDragged = false;

      container.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // apenas botão esquerdo
        isDown = true;
        hasDragged = false;
        container.classList.add('is-dragging');
        startX = e.pageX - container.offsetLeft;
        startScrollLeft = container.scrollLeft;
      });

      window.addEventListener('mouseup', () => {
        if (isDown) {
          isDown = false;
          container.classList.remove('is-dragging');
          setTimeout(() => {
            hasDragged = false;
          }, 60);
        }
      });

      container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const currentX = e.pageX - container.offsetLeft;
        const walk = (currentX - startX) * 1.5;
        if (Math.abs(walk) > 4) {
          hasDragged = true;
        }
        container.scrollLeft = startScrollLeft - walk;
      });

      // Evita disparar cliques acidentais nos botões internos quando o usuário arrasta
      container.addEventListener('click', (e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
    });
  }

  // Navegação entre telas
  navigateTo(screenId) {
    if (!screenId) return;

    const screens = document.querySelectorAll('.app-screen');
    let found = false;

    screens.forEach(screen => {
      if (screen.id === screenId) {
        screen.classList.add('active');
        screen.scrollTop = 0;
        found = true;
      } else {
        screen.classList.remove('active');
      }
    });

    if (found) {
      state.activeScreen = screenId;
      if (this.screenSelect && this.screenSelect.value !== screenId) {
        this.screenSelect.value = screenId;
      }

      // Sincroniza papel para profissional na tela 9
      if (screenId === 'screen-9' && state.role !== 'pro') {
        state.role = 'pro';
        this.roleLabel.innerHTML = 'Modo: <strong>Profissional</strong>';
        this.toggleRoleBtn.classList.add('active');
      } else if ((screenId === 'screen-3' || screenId === 'screen-8') && state.role === 'pro') {
        state.role = 'client';
        this.roleLabel.innerHTML = 'Modo: <strong>Cliente</strong>';
        this.toggleRoleBtn.classList.remove('active');
      }

      // Atualiza barra de navegação inferior permanente
      this.updateBottomNavState(screenId);

      // Ajusta cor do status bar
      const statusBar = document.getElementById('statusBar');
      if (statusBar) {
        const isDark = document.body.classList.contains('dark-mode');
        if (isDark || screenId === 'screen-1-splash' || screenId === 'screen-5') {
          statusBar.style.color = '#FFFFFF';
        } else {
          statusBar.style.color = '#0F172A';
        }
      }
    }
  }

  updateBottomNavState(screenId) {
    const bottomNav = document.getElementById('appBottomNav');
    const clientGroup = document.getElementById('clientNavGroup');
    const proGroup = document.getElementById('proNavGroup');
    if (!bottomNav || !clientGroup || !proGroup) return;

    const screensWithNav = ['screen-3', 'screen-4', 'screen-8', 'screen-9'];
    const showNav = screensWithNav.includes(screenId);

    if (showNav) {
      bottomNav.classList.remove('nav-hidden');
    } else {
      bottomNav.classList.add('nav-hidden');
      return;
    }

    if (screenId === 'screen-9' || state.role === 'pro') {
      clientGroup.style.display = 'none';
      proGroup.style.display = 'flex';

      proGroup.querySelectorAll('.nav-tab').forEach(tab => {
        const targetNav = tab.getAttribute('data-nav');
        if (targetNav === screenId) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
    } else {
      proGroup.style.display = 'none';
      clientGroup.style.display = 'flex';

      clientGroup.querySelectorAll('.nav-tab').forEach(tab => {
        const tabId = tab.getAttribute('data-tab-id');
        let isActive = false;
        if (screenId === 'screen-3' && tabId === 'home') isActive = true;
        if (screenId === 'screen-8' && tabId === 'agendamentos') isActive = true;
        if (screenId === 'screen-4' && tabId === 'favoritos') isActive = true;

        if (isActive) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
    }
  }

  // SELEÇÃO DINÂMICA DE PROFISSIONAL (Atualiza tela 5 e dados de agendamento)
  selectPro(proId) {
    const pro = PROS_DB[proId] || PROS_DB['juliana-silva'];
    state.currentPro = pro;

    // Atualiza cabeçalho e informações do Perfil (Tela 5)
    const heroImg = document.querySelector('.profile-hero-image img');
    if (heroImg) heroImg.src = pro.avatar;

    const titleEl = document.querySelector('.profile-title-block h2');
    if (titleEl) titleEl.textContent = pro.name;

    const roleEl = document.querySelector('.pro-role-subtitle');
    if (roleEl) roleEl.textContent = pro.role;

    const ratingEl = document.querySelector('.profile-ratings-row strong');
    if (ratingEl) ratingEl.textContent = pro.rating.toFixed(1);

    const distanceBadge = document.querySelector('.profile-ratings-row .distance-badge');
    if (distanceBadge) {
      distanceBadge.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        ${pro.distance}
      `;
    }

    // Atualiza caixas de estatísticas
    const statBoxes = document.querySelectorAll('.profile-stats-grid .stat-box');
    if (statBoxes.length >= 2) {
      const expVal = statBoxes[0].querySelector('.stat-value');
      if (expVal) expVal.textContent = pro.experience;
      const specVal = statBoxes[1].querySelector('.stat-value');
      if (specVal) specVal.textContent = pro.specialty;
    }

    // Atualiza endereço
    const addrEl = document.querySelector('.profile-address-box span');
    if (addrEl) addrEl.textContent = pro.address;

    // Atualiza lista de serviços interativa para o profissional
    const servicesList = document.querySelector('.services-selection-list');
    if (servicesList && pro.services) {
      servicesList.innerHTML = pro.services.map((svc, idx) => `
        <div class="service-selection-item ${idx === 0 ? 'active' : ''}" 
             data-service-id="${svc.id}" 
             data-service-name="${svc.name}" 
             data-service-price="${svc.price}" 
             data-service-duration="${svc.duration}">
          <div class="svc-check-box">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="svc-details">
            <div class="svc-title-row">
              <h4>${svc.name}</h4>
              <span class="svc-price">R$ ${svc.price}</span>
            </div>
            <p class="svc-meta">${svc.duration} • Atendimento individual com produtos premium</p>
          </div>
        </div>
      `).join('');

      this.rebindServicesList();
    }

    // Inicializa seleção no primeiro serviço
    if (pro.services && pro.services.length > 0) {
      state.selectedServices = [{ ...pro.services[0] }];
      state.bookingDraft.serviceName = pro.services[0].name;
      state.bookingDraft.servicePrice = pro.services[0].price;
      state.bookingDraft.serviceDuration = pro.services[0].duration;

      const countLabel = document.getElementById('comboCountLabel');
      const timePriceLabel = document.getElementById('comboTimePriceLabel');
      if (countLabel) countLabel.textContent = '1 serviço selecionado';
      if (timePriceLabel) timePriceLabel.textContent = `Total: R$ ${pro.services[0].price},00`;
    }

    // Atualiza status do coração de favorito no perfil
    const favToggle = document.getElementById('profileFavToggle');
    if (favToggle) {
      const heartSvg = favToggle.querySelector('svg');
      const isFav = state.favorites.has(pro.id);
      if (heartSvg) {
        heartSvg.setAttribute('fill', isFav ? '#EF4444' : 'none');
        heartSvg.setAttribute('stroke', isFav ? '#EF4444' : '#0F172A');
      }
    }

    this.updateBookingRecaps();
  }

  // Modal gaveta de perfil do cliente
  setupProfileSheet() {
    const profileBtn = document.getElementById('openClientProfileBtn');
    const avatarMini = document.getElementById('homeUserAvatar');
    const sheetOverlay = document.getElementById('clientProfileSheet');
    const closeBtn = document.getElementById('closeProfileSheetBtn');
    const switchProBtn = document.getElementById('sheetSwitchProBtn');

    const openSheet = () => {
      if (sheetOverlay) sheetOverlay.classList.add('active');
    };

    const closeSheet = () => {
      if (sheetOverlay) sheetOverlay.classList.remove('active');
    };

    if (profileBtn) profileBtn.addEventListener('click', openSheet);
    if (avatarMini) avatarMini.addEventListener('click', openSheet);
    if (closeBtn) closeBtn.addEventListener('click', closeSheet);

    if (sheetOverlay) {
      sheetOverlay.addEventListener('click', (e) => {
        if (e.target === sheetOverlay) closeSheet();
      });
    }

    if (switchProBtn) {
      switchProBtn.addEventListener('click', () => {
        closeSheet();
        this.toggleUserRole();
      });
    }

    const proClientesTab = document.getElementById('proClientesTab');
    if (proClientesTab) {
      proClientesTab.addEventListener('click', () => {
        this.showToast('42 clientes ativos cadastrados na sua carteira');
      });
    }
  }

  closeProfileSheet() {
    const sheetOverlay = document.getElementById('clientProfileSheet');
    if (sheetOverlay) sheetOverlay.classList.remove('active');
  }

  // ========================================================
  // NOTIFICAÇÕES (Sininho de Notificações)
  // ========================================================
  setupNotificationsSheet() {
    const bellBtn = document.getElementById('notifBellBtn');
    const sheet = document.getElementById('notificationsSheet');
    const closeBtn = document.getElementById('closeNotifSheetBtn');
    const markReadBtn = document.getElementById('markAllNotifsReadBtn');

    if (bellBtn && sheet) {
      bellBtn.addEventListener('click', () => {
        sheet.classList.add('active');
      });
    }

    if (closeBtn && sheet) {
      closeBtn.addEventListener('click', () => {
        sheet.classList.remove('active');
      });
    }

    if (sheet) {
      sheet.addEventListener('click', (e) => {
        if (e.target === sheet) {
          sheet.classList.remove('active');
        }
      });
    }

    if (markReadBtn) {
      markReadBtn.addEventListener('click', () => {
        document.querySelectorAll('#notifItemsList .notif-item').forEach(item => {
          item.classList.remove('unread');
        });
        const badgeCount = document.getElementById('notifBadgeCount');
        if (badgeCount) badgeCount.textContent = '0 novas';
        const bellBadge = document.querySelector('.notification-badge');
        if (bellBadge) bellBadge.style.display = 'none';
        this.showToast('Todas as notificações foram marcadas como lidas');
      });
    }
  }

  openNotifBooking() {
    const sheet = document.getElementById('notificationsSheet');
    if (sheet) sheet.classList.remove('active');
    this.navigateTo('screen-8');
  }

  // ========================================================
  // AVALIAÇÃO DE SERVIÇO (Rating Modal com Estrelas 1-5)
  // ========================================================
  setupRatingModal() {
    const modal = document.getElementById('ratingModal');
    const closeBtn = document.getElementById('closeRatingModalBtn');
    const starsGroup = document.getElementById('ratingStarsGroup');

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }

    if (starsGroup) {
      const starBtns = starsGroup.querySelectorAll('.star-btn');
      starBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const starVal = parseInt(btn.getAttribute('data-star'), 10);
          this.currentRatingValue = starVal;
          starBtns.forEach(b => {
            const val = parseInt(b.getAttribute('data-star'), 10);
            b.classList.toggle('active', val <= starVal);
          });
        });
      });
    }
  }

  rateService(proName) {
    this.currentRatingPro = proName;
    this.currentRatingValue = 5;
    const modal = document.getElementById('ratingModal');
    const title = document.getElementById('ratingModalTitle');
    const sub = document.getElementById('ratingModalSubtitle');
    const comment = document.getElementById('ratingCommentInput');

    if (title) title.textContent = `Avaliar ${proName}`;
    if (sub) sub.textContent = `Como foi seu atendimento com ${proName}?`;
    if (comment) comment.value = '';

    const starBtns = document.querySelectorAll('#ratingStarsGroup .star-btn');
    starBtns.forEach(b => b.classList.add('active'));

    if (modal) modal.classList.add('active');
  }

  submitRating() {
    const modal = document.getElementById('ratingModal');
    if (modal) modal.classList.remove('active');
    const stars = this.currentRatingValue || 5;
    const pro = this.currentRatingPro || 'o profissional';
    this.showToast(`Avaliação de ${stars} estrelas registrada para ${pro}! Obrigado.`);
  }

  // ========================================================
  // DETALHES DO AGENDAMENTO (Modal com Informações e Ações)
  // ========================================================
  setupBookingDetailsModal() {
    const modal = document.getElementById('bookingDetailsModal');
    const closeBtn = document.getElementById('closeBookingDetailsBtn');

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }
  }

  showBookingDetails(proName, triggerBtn) {
    const modal = document.getElementById('bookingDetailsModal');
    const body = document.getElementById('bookingDetailsBody');
    if (!modal || !body) return;

    let card = triggerBtn ? triggerBtn.closest('.my-booking-card') : null;
    let spec = 'Atendimento Geral';
    let time = '22 de abril de 2025 • 09:00';
    let status = 'Confirmado';

    if (card) {
      const specEl = card.querySelector('.booking-card-spec');
      const timeEl = card.querySelector('.booking-card-time span');
      const statusEl = card.querySelector('[class*="badge-status-"]');
      if (specEl) spec = specEl.textContent;
      if (timeEl) time = timeEl.textContent;
      if (statusEl) status = statusEl.textContent;
    }

    const proData = Object.values(PROS_DB).find(p => p.name === proName) || state.currentPro;
    this.currentDetailsPro = proData;

    body.innerHTML = `
      <div class="details-row">
        <span class="details-label">Profissional</span>
        <span class="details-val">${proName}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Serviço</span>
        <span class="details-val">${spec}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Data e Horário</span>
        <span class="details-val">${time}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Endereço</span>
        <span class="details-val">${proData.address || 'Rua das Flores, 123'}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Status</span>
        <span class="details-val" style="color: ${status === 'Cancelado' ? 'var(--danger)' : 'var(--success)'};">${status}</span>
      </div>
    `;

    modal.classList.add('active');
  }

  openProWhatsapp() {
    const pro = this.currentDetailsPro || state.currentPro;
    const text = encodeURIComponent(`Olá ${pro.name}! Estou entrando em contato referente ao meu agendamento pelo app AgendaFácil.`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    this.showToast('Abrindo WhatsApp do profissional...');
  }

  // ========================================================
  // TERMOS DE USO & POLÍTICA DE PRIVACIDADE
  // ========================================================
  setupTermsModal() {
    const modal = document.getElementById('termsModal');
    const closeBtn = document.getElementById('closeTermsModalBtn');
    const acceptBtn = document.getElementById('acceptTermsBtn');
    const termsLink = document.getElementById('termsLink');
    const privacyLink = document.getElementById('privacyLink');
    const title = document.getElementById('termsModalTitle');

    const openModal = (modalTitle) => {
      if (title) title.textContent = modalTitle;
      if (modal) modal.classList.add('active');
    };

    const closeModal = () => {
      if (modal) modal.classList.remove('active');
    };

    if (termsLink) {
      termsLink.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('Termos de Uso');
      });
    }

    if (privacyLink) {
      privacyLink.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('Política de Privacidade');
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        closeModal();
        const check = document.getElementById('termsCheck');
        if (check) check.checked = true;
        this.showToast('Termos aceitos com sucesso!');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }
  }

  // Alterna entre visão de Cliente e Profissional
  toggleUserRole() {
    if (state.role === 'client') {
      state.role = 'pro';
      this.roleLabel.innerHTML = 'Modo: <strong>Profissional</strong>';
      this.toggleRoleBtn.classList.add('active');
      this.showToast('Alternado para a visão de Juliana Silva (Cabeleireira)');
      this.navigateTo('screen-9');
    } else {
      state.role = 'client';
      this.roleLabel.innerHTML = 'Modo: <strong>Cliente</strong>';
      this.toggleRoleBtn.classList.remove('active');
      this.showToast('Alternado para a visão de Maria Vitória (Cliente)');
      this.navigateTo('screen-3');
    }
  }

  // Alterna moldura de iPhone
  toggleDeviceFrame() {
    state.isIphoneFrame = !state.isIphoneFrame;
    document.body.classList.toggle('fullscreen-mode', !state.isIphoneFrame);
    
    if (state.isIphoneFrame) {
      this.deviceModeLabel.textContent = 'Moldura iPhone';
      this.showToast('Exibindo moldura móvel iPhone 15 Pro');
    } else {
      this.deviceModeLabel.textContent = 'Tela Cheia';
      this.showToast('Modo tela cheia responsivo ativado');
    }
  }

  // Alterna tema Claro / Escuro
  toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('agendafacil_theme', isDark ? 'dark' : 'light');
    this.updateThemeIcons(isDark);
    const statusBar = document.getElementById('statusBar');
    if (statusBar) {
      if (isDark || state.activeScreen === 'screen-1-splash' || state.activeScreen === 'screen-5') {
        statusBar.style.color = '#FFFFFF';
      } else {
        statusBar.style.color = '#0F172A';
      }
    }
    this.showToast(isDark ? 'Modo Escuro ativado' : 'Modo Claro ativado');
  }

  loadSavedTheme() {
    const saved = localStorage.getItem('agendafacil_theme');
    const isDark = saved === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    this.updateThemeIcons(isDark);
    const statusBar = document.getElementById('statusBar');
    if (statusBar) {
      if (isDark || state.activeScreen === 'screen-1-splash' || state.activeScreen === 'screen-5') {
        statusBar.style.color = '#FFFFFF';
      } else {
        statusBar.style.color = '#0F172A';
      }
    }
  }

  updateThemeIcons(isDark) {
    const sun = document.querySelector('.icon-sun');
    const moon = document.querySelector('.icon-moon');
    if (sun && moon) {
      sun.style.display = isDark ? 'inline-block' : 'none';
      moon.style.display = isDark ? 'none' : 'inline-block';
    }
  }

  // Tela 2: Cadastro
  setupRegisterScreen() {
    const roleButtons = document.querySelectorAll('#registerRoleSegment .seg-btn');
    roleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        roleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const role = btn.getAttribute('data-role');
        const submitBtn = document.getElementById('submitRegisterBtn');
        if (role === 'pro') {
          submitBtn.querySelector('span').textContent = 'Cadastrar meu negócio';
        } else {
          submitBtn.querySelector('span').textContent = 'Criar conta';
        }
      });
    });

    // Reveal password eye buttons
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input) {
          const isPass = input.getAttribute('type') === 'password';
          input.setAttribute('type', isPass ? 'text' : 'password');
          btn.style.color = isPass ? 'var(--primary)' : 'var(--text-light)';
        }
      });
    });

    // Submit do cadastro
    const regForm = document.getElementById('registerForm');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const activeRoleBtn = document.querySelector('#registerRoleSegment .seg-btn.active');
        const isPro = activeRoleBtn && activeRoleBtn.getAttribute('data-role') === 'pro';

        this.showToast('Conta criada com sucesso! Seja bem-vindo(a).');
        if (isPro) {
          state.role = 'pro';
          this.roleLabel.innerHTML = 'Modo: <strong>Profissional</strong>';
          this.navigateTo('screen-9');
        } else {
          state.role = 'client';
          this.roleLabel.innerHTML = 'Modo: <strong>Cliente</strong>';
          this.navigateTo('screen-3');
        }
      });
    }

    // Google Auth Mock
    const googleBtn = document.getElementById('googleAuthBtn');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => {
        this.showToast('Conectando via Google...');
        setTimeout(() => {
          this.showToast('Login com Google realizado!');
          this.navigateTo('screen-3');
        }, 600);
      });
    }
  }

  // Tela 4: Busca de Profissionais
  setupSearchScreen() {
    const searchInput = document.getElementById('proSearchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    const filterChips = document.querySelectorAll('#filterChipsRow .filter-chip');
    const catTag = document.getElementById('activeCategoryTag');

    // Categorias da Home que filtram a busca
    document.querySelectorAll('.category-item, .category-chip').forEach(catBtn => {
      catBtn.addEventListener('click', () => {
        const catName = catBtn.getAttribute('data-category');
        state.activeCategory = catName;
        if (searchInput) searchInput.value = catName === 'Todos' ? '' : catName;
        if (catTag) catTag.textContent = catName;
        this.filterProsList();
      });
    });

    // Limpar busca
    if (clearBtn && searchInput) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        this.filterProsList();
      });
    }

    // Digitação em tempo real
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.filterProsList();
      });
    }

    // Chips de filtros (Todos, Mais bem avaliados, etc.)
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.activeSearchFilter = chip.getAttribute('data-filter');
        this.filterProsList();
      });
    });

    // Clique nos profissionais da lista de busca
    document.querySelectorAll('.pro-list-item').forEach(item => {
      const clickAreas = item.querySelectorAll('.item-avatar-col, .item-info-col');
      clickAreas.forEach(area => {
        area.addEventListener('click', () => {
          const proId = item.getAttribute('data-id');
          if (proId) {
            this.selectPro(proId);
          }
        });
      });
    });

    // Cliques nos corações de favoritos
    document.addEventListener('click', (e) => {
      const favBtn = e.target.closest('.favorite-heart-btn');
      if (favBtn) {
        e.stopPropagation();
        const proId = favBtn.getAttribute('data-fav-id');
        if (state.favorites.has(proId)) {
          state.favorites.delete(proId);
          favBtn.classList.remove('active');
          favBtn.querySelector('svg').setAttribute('fill', 'none');
          this.showToast('Removido dos seus favoritos');
        } else {
          state.favorites.add(proId);
          favBtn.classList.add('active');
          favBtn.querySelector('svg').setAttribute('fill', 'currentColor');
          this.showToast('Adicionado aos seus favoritos!');
        }
      }
    });
  }

  filterProsList() {
    const searchInput = document.getElementById('proSearchInput');
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const items = document.querySelectorAll('.pro-list-item');
    const countLabel = document.getElementById('resultsCountLabel');
    let visibleCount = 0;

    items.forEach(item => {
      const name = item.querySelector('.item-name').textContent.toLowerCase();
      const spec = item.querySelector('.item-spec').textContent.toLowerCase();
      const proId = item.getAttribute('data-id');

      let matchesQuery = !query || name.includes(query) || spec.includes(query);
      let matchesFilter = true;

      if (state.activeSearchFilter === 'favoritos') {
        matchesFilter = state.favorites.has(proId);
      }

      if (matchesQuery && matchesFilter) {
        item.style.display = 'flex';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    if (countLabel) {
      countLabel.textContent = `Exibindo ${visibleCount} profissional${visibleCount === 1 ? '' : 'is'}`;
    }
  }

  // Tela 5: Perfil do profissional (Multi-serviço Combo)
  setupProfileScreen() {
    this.rebindServicesList();

    // Toggle favorito no header do perfil
    const profileFavToggle = document.getElementById('profileFavToggle');
    if (profileFavToggle) {
      profileFavToggle.addEventListener('click', () => {
        const proId = state.currentPro.id;
        const heartSvg = profileFavToggle.querySelector('svg');
        if (state.favorites.has(proId)) {
          state.favorites.delete(proId);
          heartSvg.setAttribute('fill', 'none');
          heartSvg.setAttribute('stroke', '#0F172A');
          this.showToast('Removido dos favoritos');
        } else {
          state.favorites.add(proId);
          heartSvg.setAttribute('fill', '#EF4444');
          heartSvg.setAttribute('stroke', '#EF4444');
          this.showToast('Salvo nos favoritos!');
        }
      });
    }
  }

  rebindServicesList() {
    const serviceItems = document.querySelectorAll('.service-selection-item');
    serviceItems.forEach(item => {
      item.addEventListener('click', () => {
        const sId = item.getAttribute('data-service-id') || item.getAttribute('data-service-name');
        const sName = item.getAttribute('data-service-name');
        const sPrice = parseInt(item.getAttribute('data-service-price'), 10);
        const sDuration = item.getAttribute('data-service-duration');

        const existingIndex = state.selectedServices.findIndex(s => s.name === sName);
        if (existingIndex >= 0) {
          if (state.selectedServices.length > 1) {
            state.selectedServices.splice(existingIndex, 1);
            item.classList.remove('active');
          } else {
            this.showToast('Mantenha ao menos 1 serviço selecionado');
            return;
          }
        } else {
          state.selectedServices.push({ id: sId, name: sName, price: sPrice, duration: sDuration });
          item.classList.add('active');
        }

        const totalCount = state.selectedServices.length;
        const totalPrice = state.selectedServices.reduce((acc, curr) => acc + curr.price, 0);
        const serviceNamesCombined = state.selectedServices.map(s => s.name).join(' + ');

        state.bookingDraft.serviceName = serviceNamesCombined;
        state.bookingDraft.servicePrice = totalPrice;
        state.bookingDraft.serviceDuration = `${totalCount > 1 ? totalCount + ' serviços' : state.selectedServices[0].duration}`;

        const countLabel = document.getElementById('comboCountLabel');
        const timePriceLabel = document.getElementById('comboTimePriceLabel');
        if (countLabel) countLabel.textContent = `${totalCount} serviço${totalCount > 1 ? 's selecionados' : ' selecionado'}`;
        if (timePriceLabel) timePriceLabel.textContent = `Total: R$ ${totalPrice},00`;

        this.updateBookingRecaps();
      });
    });
  }

  // Tela 6: Escolha de horário com turnos agrupados
  setupScheduleScreen() {
    // Dias do calendário
    const dayChips = document.querySelectorAll('#calendarDaysSlider .cal-day-chip');
    dayChips.forEach(chip => {
      chip.addEventListener('click', () => {
        dayChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        state.bookingDraft.dayName = chip.getAttribute('data-day');
        state.bookingDraft.dayNumber = chip.getAttribute('data-date');
        state.bookingDraft.fullDate = chip.getAttribute('data-full');

        this.updateBookingRecaps();
      });
    });

    // Grid de horários nos 3 turnos (Manhã, Tarde, Noite)
    const timeSlots = document.querySelectorAll('.schedule-section .slot-pill');
    timeSlots.forEach(slot => {
      slot.addEventListener('click', () => {
        timeSlots.forEach(s => s.classList.remove('active'));
        slot.classList.add('active');

        state.bookingDraft.time = slot.getAttribute('data-time');
        this.updateBookingRecaps();
      });
    });

    // Confirmar horário -> salvar e ir para confirmação
    const confirmBtn = document.getElementById('confirmScheduleBtn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this.finalizeBooking();
      });
    }
  }

  // Modal Stories de Portfólio
  openStory(storyKey) {
    const story = state.stories[storyKey];
    if (!story) return;

    const modal = document.getElementById('storyViewerModal');
    const authorImg = document.getElementById('storyAuthorImg');
    const authorName = document.getElementById('storyAuthorName');
    const timeAgo = document.getElementById('storyTimeAgo');
    const mainImg = document.getElementById('storyMainImg');
    const caption = document.getElementById('storyCaptionText');
    const progressFill = document.getElementById('storyProgressFill');
    const bookBtn = document.getElementById('storyBookNowBtn');

    if (authorImg) authorImg.src = story.avatar;
    if (authorName) authorName.textContent = story.author;
    if (timeAgo) timeAgo.textContent = `${story.time} • ${story.role}`;
    if (mainImg) mainImg.src = story.image;
    if (caption) caption.textContent = story.caption;

    if (modal) modal.classList.add('active');

    // Reseta barra de progresso
    if (progressFill) {
      progressFill.style.width = '0%';
      setTimeout(() => {
        progressFill.style.width = '100%';
        progressFill.style.transition = 'width 5s linear';
      }, 50);
    }

    if (this.storyTimer) clearTimeout(this.storyTimer);
    this.storyTimer = setTimeout(() => {
      this.closeStory();
    }, 5100);

    // Botão de agendar direto pelo Story
    if (bookBtn) {
      bookBtn.onclick = () => {
        this.closeStory();
        state.bookingDraft.serviceName = story.service;
        state.bookingDraft.servicePrice = story.price;
        state.selectedServices = [{ id: 'story', name: story.service, price: story.price, duration: '1h' }];
        this.updateBookingRecaps();
        this.navigateTo('screen-6');
      };
    }
  }

  closeStory() {
    const modal = document.getElementById('storyViewerModal');
    if (modal) modal.classList.remove('active');
    if (this.storyTimer) clearTimeout(this.storyTimer);
  }

  updateBookingRecaps() {
    const sNameEl = document.getElementById('schedServiceName');
    const sTimeEl = document.getElementById('schedServiceTime');
    const recapDateTimeEl = document.getElementById('recapDateTimeLabel');

    if (sNameEl) sNameEl.textContent = state.bookingDraft.serviceName;
    if (sTimeEl) sTimeEl.textContent = `${state.bookingDraft.serviceDuration} • R$ ${state.bookingDraft.servicePrice}`;
    if (recapDateTimeEl) {
      recapDateTimeEl.textContent = `${state.bookingDraft.dayName === 'Seg' ? 'Segunda-feira' : 'Dia'}, ${state.bookingDraft.fullDate} às ${state.bookingDraft.time}`;
    }

    const ticketDate = document.getElementById('ticketDateText');
    const ticketService = document.getElementById('ticketServiceText');
    if (ticketDate) ticketDate.textContent = `${state.bookingDraft.fullDate} às ${state.bookingDraft.time}`;
    if (ticketService) ticketService.textContent = `${state.bookingDraft.serviceName} • R$ ${state.bookingDraft.servicePrice},00`;

    const homeDate = document.getElementById('homeNextDate');
    if (homeDate) homeDate.textContent = `${state.bookingDraft.fullDate} • ${state.bookingDraft.time}`;

    const homeTimePill = document.getElementById('homeWidgetTimePill');
    const homeServiceText = document.getElementById('homeWidgetServiceText');
    const homeProName = document.getElementById('homeWidgetProName');
    const homeAddress = document.getElementById('homeWidgetAddress');
    const homeAvatar = document.getElementById('homeWidgetAvatar');

    if (homeTimePill) homeTimePill.textContent = `${state.bookingDraft.dayName === 'Seg' ? 'Amanhã' : state.bookingDraft.dayName} • ${state.bookingDraft.time}`;
    if (homeServiceText) homeServiceText.textContent = `${state.bookingDraft.serviceName} • R$ ${state.bookingDraft.servicePrice}`;
    if (homeProName) homeProName.textContent = state.currentPro.name;
    if (homeAddress) homeAddress.textContent = `${state.currentPro.address} (${state.currentPro.distance})`;
    if (homeAvatar) homeAvatar.src = state.currentPro.avatar;
  }

  finalizeBooking() {
    const newBooking = {
      id: 'b-' + Date.now(),
      proName: state.currentPro.name,
      role: state.currentPro.role,
      service: state.bookingDraft.serviceName,
      price: state.bookingDraft.servicePrice,
      date: state.bookingDraft.fullDate,
      time: state.bookingDraft.time,
      status: 'Confirmado',
      avatar: state.currentPro.avatar,
      address: state.currentPro.address
    };

    state.clientBookings.unshift(newBooking);

    const date1 = document.getElementById('bookingCardDate1');
    if (date1) date1.textContent = `${state.bookingDraft.fullDate} • ${state.bookingDraft.time}`;

    this.showToast('Horário agendado com sucesso!');
    this.navigateTo('screen-7');
  }

  // Tela 7: Confirmação do agendamento
  setupConfirmationScreen() {
    const addCalBtn = document.getElementById('addToCalBtn');
    if (addCalBtn) {
      addCalBtn.addEventListener('click', () => {
        this.downloadCalendarFile();
        this.showToast('Lembrete adicionado ao calendário (.ics)!');
      });
    }

    const shareWhatsappBtn = document.getElementById('shareWhatsappBtn');
    if (shareWhatsappBtn) {
      shareWhatsappBtn.addEventListener('click', () => {
        this.shareOnWhatsapp();
      });
    }
  }

  shareOnWhatsapp() {
    const text = encodeURIComponent(
      `Olá! Confirmei meu agendamento pelo app AgendaFácil:\n\n` +
      `Profissional: ${state.currentPro.name}\n` +
      `Serviço: ${state.bookingDraft.serviceName}\n` +
      `Data: ${state.bookingDraft.fullDate} às ${state.bookingDraft.time}\n` +
      `Endereço: ${state.currentPro.address}\n` +
      `Valor: R$ ${state.bookingDraft.servicePrice},00\n\n` +
      `Agendamento garantido com sucesso.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    this.showToast('Abrindo WhatsApp para compartilhar...');
  }

  downloadCalendarFile() {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AgendaFacil//Agendamento//PT-BR
BEGIN:VEVENT
SUMMARY:AgendaFácil: ${state.bookingDraft.serviceName} com ${state.currentPro.name}
DESCRIPTION:Atendimento agendado pelo app AgendaFácil. Serviço: ${state.bookingDraft.serviceName}. Valor: R$ ${state.bookingDraft.servicePrice},00.
LOCATION:${state.currentPro.address}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `agendamento-agendafacil.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Tela 8: Meus agendamentos (Abas: Próximos | Passados | Cancelados)
  setupAppointmentsTabs() {
    const tabButtons = document.querySelectorAll('#appointmentsTabs .seg-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tabKey = btn.getAttribute('data-tab');
        document.querySelectorAll('.appointments-screen .tab-pane').forEach(pane => {
          pane.classList.remove('active');
        });
        const targetPane = document.getElementById(`pane-${tabKey}`);
        if (targetPane) targetPane.classList.add('active');
      });
    });
  }

  cancelBooking(proName, triggerBtn) {
    if (confirm(`Deseja realmente cancelar seu agendamento com ${proName}?`)) {
      const card = triggerBtn ? triggerBtn.closest('.my-booking-card') : document.getElementById('bookingCardJuliana');
      if (card) {
        card.style.opacity = '0.65';
        const badge = card.querySelector('.badge-status-confirmed') || card.querySelector('.badge-status-completed');
        if (badge) {
          badge.className = 'badge-status-cancelled';
          badge.textContent = 'Cancelado';
        }
        const actions = card.querySelector('.booking-card-actions');
        if (actions) {
          actions.innerHTML = `
            <button class="booking-action-btn rebook-btn" onclick="app.rebookPro('${proName}')">Reagendar</button>
          `;
        }
      }
      this.showToast(`Agendamento com ${proName} cancelado.`);
    }
  }

  rebookPro(proName) {
    const found = Object.values(PROS_DB).find(p => 
      p.name.toLowerCase().includes(proName.toLowerCase()) || 
      proName.toLowerCase().includes(p.name.toLowerCase()) ||
      proName.toLowerCase().includes(p.id)
    );
    if (found) {
      this.selectPro(found.id);
    }
    this.navigateTo('screen-6');
  }

  // Tela 9: Dashboard do Profissional
  setupProDashboard() {
    const prevBtn = document.getElementById('prevDayBtn');
    const nextBtn = document.getElementById('nextDayBtn');
    const dateLabel = document.getElementById('proCurrentDateLabel');

    let currentDayIndex = 22;

    const updateDayView = () => {
      if (dateLabel) {
        const isToday = currentDayIndex === 22;
        dateLabel.textContent = `${isToday ? 'Hoje, ' : ''}${currentDayIndex} de abril`;
      }
      const statChips = document.querySelectorAll('.pro-stats-pill-row .pro-stat-chip');
      if (statChips.length >= 3) {
        const slotsCount = ((currentDayIndex * 3) % 4) + 3;
        const totalValue = slotsCount * 115;
        statChips[0].innerHTML = `<strong>${slotsCount}</strong> agendamentos`;
        statChips[1].innerHTML = `<strong>R$ ${totalValue}</strong> previsto`;
        statChips[2].innerHTML = `<span>${currentDayIndex % 2 === 0 ? '100% preenchido' : '2 horários livres'}</span>`;
      }
      this.showToast(`Visualizando agenda de ${currentDayIndex} de abril`);
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentDayIndex--;
        updateDayView();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentDayIndex++;
        updateDayView();
      });
    }
  }

  toggleProSlotStatus(btn) {
    const card = btn.closest('.slot-info-card');
    if (card) {
      const isCompleted = card.classList.toggle('completed');
      if (isCompleted) {
        btn.textContent = 'Realizado';
        const badge = card.querySelector('.badge-status-confirmed');
        if (badge) badge.textContent = 'Concluído';
        this.showToast('Atendimento marcado como concluído!');
      } else {
        btn.textContent = 'Concluir';
        const badge = card.querySelector('.badge-status-confirmed');
        if (badge) badge.textContent = 'Confirmado';
        this.showToast('Status restaurado para confirmado');
      }
    }
  }

  showAddSlotPrompt() {
    const novoHorario = prompt('Digite o horário que deseja abrir na sua agenda (Ex: 15:30):', '15:30');
    if (novoHorario && novoHorario.trim()) {
      const timeline = document.getElementById('proAgendaTimeline');
      if (timeline) {
        const newSlotCard = document.createElement('div');
        newSlotCard.className = 'timeline-slot-card';
        newSlotCard.setAttribute('data-slot', novoHorario.trim());
        newSlotCard.innerHTML = `
          <div class="slot-time-col">
            <span class="slot-time">${novoHorario.trim()}</span>
          </div>
          <div class="slot-info-card">
            <div class="slot-card-header">
              <h4>Novo Atendimento</h4>
              <span class="badge-status-confirmed">Horário Aberto</span>
            </div>
            <p class="slot-service-name">Disponível para agendamento online</p>
            <div class="slot-footer-actions">
              <span class="slot-price">A definir</span>
              <button class="slot-check-btn" onclick="app.toggleProSlotStatus(this)" title="Bloquear ou concluir">
                Concluir
              </button>
            </div>
          </div>
        `;
        timeline.appendChild(newSlotCard);
        
        const firstStat = document.querySelector('.pro-stats-pill-row .pro-stat-chip strong');
        if (firstStat) {
          firstStat.textContent = parseInt(firstStat.textContent, 10) + 1;
        }
      }
      this.showToast(`Horário das ${novoHorario.trim()} adicionado com sucesso à sua agenda!`);
    }
  }

  // Sistema de Notificações Toast
  showToast(message, icon = '') {
    if (!this.toast) return;

    this.toastMsg.textContent = message;
    this.toastIcon.textContent = icon;
    this.toast.classList.add('visible');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toast.classList.remove('visible');
    }, 3200);
  }

  // Atualiza relógio do status bar
  updateClock() {
    const timeEl = document.querySelector('.status-time');
    if (timeEl) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      timeEl.textContent = `${hours}:${mins}`;
    }
  }

  // Reset demo
  resetDemoData() {
    state.currentPro = PROS_DB['juliana-silva'];
    state.bookingDraft = {
      serviceName: 'Corte e escova',
      servicePrice: 130,
      serviceDuration: '1h',
      dayName: 'Seg',
      dayNumber: '22',
      fullDate: '22 de abril de 2025',
      time: '09:00'
    };
    state.favorites = new Set(['juliana-silva']);
    this.selectPro('juliana-silva');
    this.updateBookingRecaps();
    this.showToast('Dados de teste restaurados!');
    this.navigateTo('screen-3');
  }
}

// Inicializar aplicação
const app = new AgendaFacilApp();
window.app = app;
