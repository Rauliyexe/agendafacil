/**
 * AgendaFácil - Protótipo Interativo
 * Lógica de navegação, fluxos de agendamento e gerenciamento de estado
 */

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

  // Dados do profissional em visualização/agendamento
  currentPro: {
    id: 'juliana-silva',
    name: 'Juliana Silva',
    role: 'Cabeleireira',
    rating: 4.9,
    reviews: 1124,
    distance: '2,3 km',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    address: 'Rua das Flores, 123 - Centro'
  },

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
      caption: 'Morena iluminada em tons quentes de avelã + hidratação espelhada ✨ Trabalho finalizado hoje!',
      service: 'Corte e escova',
      price: 130
    },
    bruna: {
      author: 'Bruna Nunes',
      role: 'Nail Designer & Manicure',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      time: 'há 3 horas',
      image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop&q=80',
      caption: 'Alongamento em fibra de vidro com encapsulado rosé gold e acabamento natural 💅',
      service: 'Corte feminino',
      price: 90
    },
    spa: {
      author: 'Studio Bem Estar',
      role: 'Massoterapia & Spa',
      avatar: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=160&auto=format&fit=crop&q=80',
      time: 'há 4 horas',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80',
      caption: 'Sessão de massagem relaxante com pedras vulcânicas aquecidas e blend de lavanda 🌿',
      service: 'Hidratação profunda',
      price: 110
    },
    rafael: {
      author: 'Dr. Rafael Mendes',
      role: 'Clínico Geral',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=160&auto=format&fit=crop&q=80',
      time: 'ontem',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
      caption: 'Novas salas de atendimento para medicina preventiva e consultas de rotina 🩺',
      service: 'Corte e escova',
      price: 130
    },
    amanda: {
      author: 'Amanda Lopes',
      role: 'Penteados & Noivas',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=160&auto=format&fit=crop&q=80',
      time: 'ontem',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      caption: 'Penteado clássico semi-preso para casamento no campo com fixação suave 👰',
      service: 'Coloração completa',
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
    this.init();
  }

  init() {
    this.bindDomElements();
    this.attachEventListeners();
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

    // 10. Configurar abas de agendamentos
    this.setupAppointmentsTabs();

    // 11. Configurar ações da tela de confirmação
    this.setupConfirmationScreen();

    // 12. Configurar dashboard do profissional
    this.setupProDashboard();

    // 13. Configurar modal do perfil do cliente e navegação inferior unificada
    this.setupProfileSheet();
  }

  // Navegação entre as 9 telas
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

      // Se navegou para a tela 9, sincroniza papel para profissional
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

      // Ajusta cor do status bar se for tela com cabeçalho escuro/hero
      const statusBar = document.getElementById('statusBar');
      if (statusBar) {
        if (screenId === 'screen-1-splash' || screenId === 'screen-5') {
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

    // Telas que exibem a barra de navegação inferior (Home, Busca, Agendamentos, Dashboard Pro)
    const screensWithNav = ['screen-3', 'screen-4', 'screen-8', 'screen-9'];
    const showNav = screensWithNav.includes(screenId);

    if (showNav) {
      bottomNav.classList.remove('nav-hidden');
    } else {
      bottomNav.classList.add('nav-hidden');
      return;
    }

    // Alterna grupos de abas de acordo com a tela e o papel
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
        this.showToast('42 clientes ativos cadastrados na sua carteira', '👥');
      });
    }
  }

  closeProfileSheet() {
    const sheetOverlay = document.getElementById('clientProfileSheet');
    if (sheetOverlay) sheetOverlay.classList.remove('active');
  }

  // Alterna entre visão de Cliente (Maria Vitória) e Profissional (Juliana Silva)
  toggleUserRole() {
    if (state.role === 'client') {
      state.role = 'pro';
      this.roleLabel.innerHTML = 'Modo: <strong>Profissional</strong>';
      this.toggleRoleBtn.classList.add('active');
      this.showToast('Alternado para a visão de Juliana Silva (Cabeleireira)', '💼');
      this.navigateTo('screen-9');
    } else {
      state.role = 'client';
      this.roleLabel.innerHTML = 'Modo: <strong>Cliente</strong>';
      this.toggleRoleBtn.classList.remove('active');
      this.showToast('Alternado para a visão de Maria Vitória (Cliente)', '👤');
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

  // Tela 2: Cadastro
  setupRegisterScreen() {
    // Alternar Cliente / Profissional no cadastro
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

        this.showToast('Conta criada com sucesso! Seja bem-vindo(a).', '🎉');
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
        this.showToast('Conectando via Google...', '🔍');
        setTimeout(() => {
          this.showToast('Login com Google realizado!', '✓');
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
    const listContainer = document.getElementById('prosListContainer');
    const countLabel = document.getElementById('resultsCountLabel');
    const catTag = document.getElementById('activeCategoryTag');

    // Categorias da Home que filtram a busca
    document.querySelectorAll('.category-item').forEach(catBtn => {
      catBtn.addEventListener('click', () => {
        const catName = catBtn.getAttribute('data-category');
        state.activeCategory = catName;
        if (searchInput) searchInput.value = catName;
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
          this.showToast('Removido dos seus favoritos', '♡');
        } else {
          state.favorites.add(proId);
          favBtn.classList.add('active');
          favBtn.querySelector('svg').setAttribute('fill', 'currentColor');
          this.showToast('Adicionado aos seus favoritos!', '❤️');
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

        // Calcula totais
        const totalCount = state.selectedServices.length;
        const totalPrice = state.selectedServices.reduce((acc, curr) => acc + curr.price, 0);
        const serviceNamesCombined = state.selectedServices.map(s => s.name).join(' + ');

        state.bookingDraft.serviceName = serviceNamesCombined;
        state.bookingDraft.servicePrice = totalPrice;
        state.bookingDraft.serviceDuration = `${totalCount > 1 ? totalCount + ' serviços' : state.selectedServices[0].duration}`;

        // Atualiza labels do footer
        const countLabel = document.getElementById('comboCountLabel');
        const timePriceLabel = document.getElementById('comboTimePriceLabel');
        if (countLabel) countLabel.textContent = `${totalCount} serviço${totalCount > 1 ? 's selecionados' : ' selecionado'}`;
        if (timePriceLabel) timePriceLabel.textContent = `Total: R$ ${totalPrice},00`;

        this.updateBookingRecaps();
      });
    });

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
          this.showToast('Removido dos favoritos', '♡');
        } else {
          state.favorites.add(proId);
          heartSvg.setAttribute('fill', '#EF4444');
          heartSvg.setAttribute('stroke', '#EF4444');
          this.showToast('Salvo nos favoritos!', '❤️');
        }
      });
    }
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
    // Atualiza cabeçalho do serviço na tela 6
    const sNameEl = document.getElementById('schedServiceName');
    const sTimeEl = document.getElementById('schedServiceTime');
    const recapDateTimeEl = document.getElementById('recapDateTimeLabel');

    if (sNameEl) sNameEl.textContent = state.bookingDraft.serviceName;
    if (sTimeEl) sTimeEl.textContent = `${state.bookingDraft.serviceDuration} • R$ ${state.bookingDraft.servicePrice}`;
    if (recapDateTimeEl) {
      recapDateTimeEl.textContent = `${state.bookingDraft.dayName === 'Seg' ? 'Segunda-feira' : 'Dia'}, ${state.bookingDraft.fullDate} às ${state.bookingDraft.time}`;
    }

    // Atualiza ticket da confirmação (tela 7)
    const ticketDate = document.getElementById('ticketDateText');
    const ticketService = document.getElementById('ticketServiceText');
    if (ticketDate) ticketDate.textContent = `${state.bookingDraft.fullDate} às ${state.bookingDraft.time}`;
    if (ticketService) ticketService.textContent = `${state.bookingDraft.serviceName} • R$ ${state.bookingDraft.servicePrice},00`;

    // Atualiza próximo agendamento na home (tela 3)
    const homeDate = document.getElementById('homeNextDate');
    if (homeDate) homeDate.textContent = `${state.bookingDraft.fullDate} • ${state.bookingDraft.time}`;
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

    // Adiciona no topo da lista
    state.clientBookings.unshift(newBooking);

    // Atualiza cards de Meus Agendamentos
    const date1 = document.getElementById('bookingCardDate1');
    if (date1) date1.textContent = `${state.bookingDraft.fullDate} • ${state.bookingDraft.time}`;

    this.showToast('Horário agendado com sucesso!', '🎉');
    this.navigateTo('screen-7');
  }

  // Tela 7: Confirmação do agendamento
  setupConfirmationScreen() {
    const addCalBtn = document.getElementById('addToCalBtn');
    if (addCalBtn) {
      addCalBtn.addEventListener('click', () => {
        this.downloadCalendarFile();
        this.showToast('Lembrete adicionado ao calendário!', '📅');
      });
    }
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

  // Tela 8: Meus agendamentos
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

  cancelBooking(proName) {
    if (confirm(`Deseja realmente cancelar seu agendamento com ${proName}?`)) {
      this.showToast(`Agendamento com ${proName} cancelado.`, '⚠️');
      const card = document.getElementById('bookingCardJuliana');
      if (card) {
        card.style.opacity = '0.5';
        card.querySelector('.badge-status-confirmed').className = 'badge-status-cancelled';
        card.querySelector('.badge-status-cancelled').textContent = 'Cancelado';
      }
    }
  }

  showBookingDetails(proName) {
    this.showToast(`Agendamento confirmado com ${proName}. Notificação enviada por WhatsApp.`);
  }

  rateService(proName) {
    this.showToast(`Obrigado pela sua avaliação para ${proName}! 5 estrelas registradas ⭐`);
  }

  // Tela 9: Dashboard do Profissional
  setupProDashboard() {
    const prevBtn = document.getElementById('prevDayBtn');
    const nextBtn = document.getElementById('nextDayBtn');
    const dateLabel = document.getElementById('proCurrentDateLabel');

    let currentDayIndex = 22;

    if (prevBtn && nextBtn && dateLabel) {
      prevBtn.addEventListener('click', () => {
        currentDayIndex--;
        dateLabel.textContent = `${currentDayIndex} de abril`;
        this.showToast(`Visualizando agenda de ${currentDayIndex} de abril`);
      });

      nextBtn.addEventListener('click', () => {
        currentDayIndex++;
        dateLabel.textContent = `${currentDayIndex} de abril`;
        this.showToast(`Visualizando agenda de ${currentDayIndex} de abril`);
      });
    }
  }

  toggleProSlotStatus(btn) {
    const card = btn.closest('.slot-info-card');
    if (card) {
      const isCompleted = card.classList.toggle('completed');
      if (isCompleted) {
        btn.textContent = '✓ Realizado';
        this.showToast('Atendimento marcado como concluído!', '✅');
      } else {
        btn.textContent = '✓ Concluir';
        this.showToast('Status restaurado para confirmado');
      }
    }
  }

  showAddSlotPrompt() {
    const novoHorario = prompt('Digite o horário que deseja abrir na sua agenda (Ex: 15:30):', '15:30');
    if (novoHorario) {
      this.showToast(`Horário das ${novoHorario} adicionado com sucesso à sua agenda!`, '📅');
    }
  }

  // Sistema de Notificações Toast
  showToast(message, icon = '✓') {
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
    this.updateBookingRecaps();
    this.showToast('Dados de teste restaurados!');
    this.navigateTo('screen-3');
  }
}

// Inicializar aplicação
const app = new AgendaFacilApp();
window.app = app; // Expõe para handlers inline caso necessário
