import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/rauli/.gemini/antigravity/brain/677b65c1-1b47-4c07-9ddf-8bab0c8620c6';
const PUBLIC_DIR = 'c:/Users/rauli/.gemini/antigravity-ide/scratch/agendafacil/public';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function smoothScroll(page, targetY, durationMs = 800) {
  await page.evaluate(async ({ targetY, durationMs }) => {
    const startY = window.scrollY;
    const diff = targetY - startY;
    const startTime = performance.now();
    return new Promise((resolve) => {
      function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
        window.scrollTo(0, startY + diff * ease);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }, { targetY, durationMs });
  await sleep(durationMs + 100);
}

async function smoothMoveAndClick(page, selectorOrLocator) {
  const locator = typeof selectorOrLocator === 'string' ? page.locator(selectorOrLocator).first() : selectorOrLocator;
  await locator.scrollIntoViewIfNeeded();
  await sleep(200);
  const box = await locator.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
    await sleep(150);
    await page.mouse.down();
    await sleep(100);
    await page.mouse.up();
    await sleep(250);
  } else {
    await locator.click();
  }
}

async function typeSmoothly(page, locator, text) {
  await locator.scrollIntoViewIfNeeded();
  await locator.click();
  await sleep(100);
  await locator.fill('');
  for (const char of text) {
    await page.keyboard.type(char);
    await sleep(25);
  }
  await sleep(200);
}

async function runTour() {
  console.log('--- INICIANDO GRAVAÇÃO DO VÍDEO COMPLETO DO AGENDAFÁCIL (NOVA LOGO E DESIGN) ---');
  
  const startTime = Date.now();

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: ARTIFACT_DIR,
      size: { width: 1280, height: 800 },
    },
  });

  // Inject visual cursor with violet brand styling
  await context.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const cursor = document.createElement('div');
      cursor.id = 'demo-cursor';
      cursor.style.width = '22px';
      cursor.style.height = '22px';
      cursor.style.border = '2px solid #7c3aed';
      cursor.style.borderRadius = '50%';
      cursor.style.position = 'fixed';
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = '999999';
      cursor.style.transition = 'transform 0.08s ease, background-color 0.15s ease';
      cursor.style.backgroundColor = 'rgba(124, 58, 237, 0.25)';
      cursor.style.boxShadow = '0 0 10px rgba(124, 58, 237, 0.4)';
      cursor.style.transform = 'translate(-50%, -50%)';
      cursor.style.display = 'none';
      document.body.appendChild(cursor);

      window.addEventListener('mousemove', (e) => {
        cursor.style.display = 'block';
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      });

      window.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
        cursor.style.backgroundColor = 'rgba(124, 58, 237, 0.8)';
      });

      window.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.backgroundColor = 'rgba(124, 58, 237, 0.25)';
      });
    });
  });

  const page = await context.newPage();

  // =========================================================================
  // CENA 1: LANDING PAGE & APRESENTAÇÃO GERAL COM A NOVA LOGO
  // =========================================================================
  console.log('Cena 1: Landing Page com Nova Logo e Design');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await sleep(1800);

  // Scroll suave pela Home mostrando Hero, Nova Logo, e Cards
  await smoothScroll(page, 450, 1000);
  await sleep(1400);

  // Mostrar seção "Como Funciona"
  await smoothScroll(page, 1000, 1000);
  await sleep(1400);

  // Mostrar seção de planos com o novo card violeta/ciano
  await smoothScroll(page, 1550, 1000);
  await sleep(1600);

  // Voltar ao topo suavemente
  await smoothScroll(page, 0, 800);
  await sleep(800);

  // Clicar para Cadastrar
  const cadastreTopBtn = page.locator('nav a:has-text("Cadastre-se"), a:has-text("Sou Prestador"), nav a:has-text("Começar")').first();
  if (await cadastreTopBtn.isVisible()) {
    await smoothMoveAndClick(page, cadastreTopBtn);
  } else {
    await page.goto('http://localhost:3000/cadastro', { waitUntil: 'networkidle' });
  }
  await sleep(1500);

  // Se foi para o dashboard, ir para /cadastro
  if (page.url().includes('/dashboard')) {
    await page.goto('http://localhost:3000/cadastro', { waitUntil: 'networkidle' });
    await sleep(1200);
  }

  // =========================================================================
  // CENA 2: O PRIMEIRO CADASTRO DE PRESTADOR
  // =========================================================================
  console.log('Cena 2: Cadastro de Prestador Oficial');
  await smoothScroll(page, 180, 800);
  await sleep(1000);

  // Preencher modelo rápido de Climatização / Ar
  const templateBtn = page.locator('button:has-text("Climatização / Ar")').first();
  if (await templateBtn.isVisible()) {
    await smoothMoveAndClick(page, templateBtn);
    await sleep(600);
  }

  // Nome Profissional
  const nameInput = page.locator('input[placeholder*="Ex: Roberto Silva"]').first();
  await typeSmoothly(page, nameInput, 'Marcos Climatização & Elétrica');
  await sleep(400);

  // Especialidade
  const roleInput = page.locator('input[placeholder*="Ex: Técnico em Climatização"]').first();
  await typeSmoothly(page, roleInput, 'Técnico Especialista em Ar-Condicionado');
  await sleep(400);

  // WhatsApp
  const phoneInput = page.locator('input[placeholder*="(11) 98765-4321"]').first();
  await typeSmoothly(page, phoneInput, '(11) 98888-7777');
  await sleep(400);

  // Email
  const emailInput = page.locator('input[type="email"]').first();
  await typeSmoothly(page, emailInput, 'marcos.clima@agendafacil.app');
  await sleep(400);

  // Senha
  const passInput = page.locator('input[type="password"]').first();
  await typeSmoothly(page, passInput, 'SenhaSegura2026');
  await sleep(400);

  // Chave Pix
  await smoothScroll(page, 450, 600);
  await sleep(600);

  const pixKeyType = page.locator('select').filter({ hasText: /WhatsApp|E-mail|Celular/ }).first();
  if (await pixKeyType.isVisible()) {
    await pixKeyType.selectOption('email');
    await sleep(400);
  }

  const pixKeyInput = page.locator('input[placeholder*="Digite sua chave Pix"]').first();
  if (await pixKeyInput.isVisible()) {
    await typeSmoothly(page, pixKeyInput, 'marcos.clima@agendafacil.app');
    await sleep(500);
  }

  // Avançar para Etapa 2
  const nextBtn1 = page.locator('button:has-text("Continuar para Local"), button:has-text("Avançar")').first();
  await smoothMoveAndClick(page, nextBtn1);
  await sleep(1200);

  // Etapa 2: Local & Horários
  await smoothScroll(page, 150, 600);
  await sleep(800);

  const ambosWorkBtn = page.locator('button:has-text("Ambos")').first();
  if (await ambosWorkBtn.isVisible()) {
    await smoothMoveAndClick(page, ambosWorkBtn);
    await sleep(500);
  }

  const addressInput = page.locator('input[placeholder*="Av. Paulista"]').first();
  if (await addressInput.isVisible()) {
    await typeSmoothly(page, addressInput, 'Av. Paulista, 1578 - Atendimento em toda SP');
    await sleep(500);
  }

  // Avançar para Etapa 3
  const nextBtn2 = page.locator('button:has-text("Continuar para Tabela"), button:has-text("Avançar")').first();
  await smoothMoveAndClick(page, nextBtn2);
  await sleep(1200);

  // Etapa 3: Serviços e Preços
  await smoothScroll(page, 200, 600);
  await sleep(800);

  // Adicionar um novo serviço
  const newSrvName = page.locator('input[placeholder*="Nome do trabalho"]').first();
  const newSrvPrice = page.locator('input[placeholder*="Preço R$"]').first();
  const newSrvDesc = page.locator('input[placeholder*="O que está incluso"]').first();

  if (await newSrvName.isVisible()) {
    await typeSmoothly(page, newSrvName, 'Higienização Completa com Bactericida Hospitalar');
    await sleep(300);
    await typeSmoothly(page, newSrvPrice, '180');
    await sleep(300);
    await typeSmoothly(page, newSrvDesc, 'Desmontagem, limpeza bactericida, teste de pressão e dreno.');
    await sleep(400);

    const addServiceBtn = page.locator('button:has-text("Incluir na Tabela")').first();
    await smoothMoveAndClick(page, addServiceBtn);
    await sleep(1000);
  }

  await smoothScroll(page, 550, 600);
  await sleep(800);

  // Selecionar Plano Pro
  const proPlanBtn = page.locator('button:has-text("Plano Pro")').first();
  if (await proPlanBtn.isVisible()) {
    await smoothMoveAndClick(page, proPlanBtn);
    await sleep(600);
  }

  // Finalizar Cadastro
  const finishBtn = page.locator('button:has-text("Finalizar Cadastro"), button:has-text("Publicar Minha Agenda")').first();
  await smoothMoveAndClick(page, finishBtn);
  await sleep(2500);

  // =========================================================================
  // CENA 3: PÁGINA PÚBLICA EXCLUSIVA DO PRESTADOR + AGENDAMENTO COM PIX
  // =========================================================================
  console.log('Cena 3: Página Pública do Prestador');
  const currentUrl = page.url();
  if (!currentUrl.includes('marcos-climatizacao')) {
    await page.goto('http://localhost:3000/marcos-climatizacao-eletrica', { waitUntil: 'networkidle' });
  }
  await sleep(1500);

  // Mostrar página pública do prestador
  await smoothScroll(page, 220, 800);
  await sleep(1200);

  // Selecionar o serviço de R$ 180 adicionado
  const srvCard = page.locator('button:has-text("Higienização Completa"), div:has-text("Higienização Completa")').first();
  if (await srvCard.isVisible()) {
    await smoothMoveAndClick(page, srvCard);
    await sleep(800);
  }

  // Selecionar data e horário
  await smoothScroll(page, 520, 600);
  await sleep(800);

  // Clicar no dia seguinte no carrossel de datas
  const dateBtn = page.locator('div.grid-cols-6 button, button:has-text("Ter"), button:has-text("Qua")').nth(1);
  if (await dateBtn.isVisible()) {
    await smoothMoveAndClick(page, dateBtn);
    await sleep(600);
  }

  // Clicar em um horário disponível
  const slotBtn = page.locator('button:has-text("10:00"), button:has-text("09:00"), button:has-text("14:00")').first();
  if (await slotBtn.isVisible()) {
    await smoothMoveAndClick(page, slotBtn);
    await sleep(600);
  }

  // Preencher dados do cliente
  const clientNameInput = page.locator('input[placeholder*="Seu nome completo"]').first();
  if (await clientNameInput.isVisible()) {
    await typeSmoothly(page, clientNameInput, 'Mariana Costa');
    await sleep(300);
  }

  const clientPhoneInput = page.locator('input[placeholder*="WhatsApp (11)"]').first();
  if (await clientPhoneInput.isVisible()) {
    await typeSmoothly(page, clientPhoneInput, '(11) 99123-4567');
    await sleep(300);
  }

  const clientNotesInput = page.locator('input[placeholder*="Detalhes do trabalho"]').first();
  if (await clientNotesInput.isVisible()) {
    await typeSmoothly(page, clientNotesInput, 'Ar Split Inverter na sala de estar');
    await sleep(400);
  }

  await smoothScroll(page, 820, 600);
  await sleep(800);

  // Confirmar agendamento
  const confirmBookingBtn = page.locator('button:has-text("Confirmar Contratação & Horário")').first();
  if (await confirmBookingBtn.isVisible()) {
    await smoothMoveAndClick(page, confirmBookingBtn);
    await sleep(1500);
  }

  // Abrir Modal de Pix com QR Code
  const pixModalBtn = page.locator('button:has-text("Ver QR Code Pix"), button:has-text("QR Code")').first();
  if (await pixModalBtn.isVisible()) {
    await smoothMoveAndClick(page, pixModalBtn);
    await sleep(1800);

    // Clicar em Copiar Código Pix
    const copyPixBtn = page.locator('button:has-text("Copiar Código Pix"), button:has-text("Copiar Chave")').first();
    if (await copyPixBtn.isVisible()) {
      await smoothMoveAndClick(page, copyPixBtn);
      await sleep(1200);
    }

    // Fechar modal de Pix
    const closePixBtn = page.locator('button:has-text("Fechar"), button:has-text("Concluir")').first();
    if (await closePixBtn.isVisible()) {
      await smoothMoveAndClick(page, closePixBtn);
      await sleep(800);
    }
  }

  // =========================================================================
  // CENA 4: DASHBOARD / PAINEL DE CONTROLE DO PRESTADOR COM A NOVA LOGO
  // =========================================================================
  console.log('Cena 4: Dashboard do Prestador com Novo Design');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await sleep(1500);

  // Mostrar Tab "Quem Agendou" com o agendamento da Mariana
  await smoothScroll(page, 260, 700);
  await sleep(1400);

  // Tab "Meus Serviços"
  const servicosTab = page.locator('button:has-text("Meus Serviços")').first();
  if (await servicosTab.isVisible()) {
    await smoothMoveAndClick(page, servicosTab);
    await sleep(1400);
  }

  // Tab "Chave Pix & Stripe"
  const pixTab = page.locator('button:has-text("Chave Pix"), button:has-text("Pix & Stripe")').first();
  if (await pixTab.isVisible()) {
    await smoothMoveAndClick(page, pixTab);
    await sleep(1500);
    await smoothScroll(page, 300, 700);
    await sleep(1400);
  }

  // Tab "Chat"
  const chatTab = page.locator('button:has-text("Chat")').first();
  if (await chatTab.isVisible()) {
    await smoothMoveAndClick(page, chatTab);
    await sleep(1500);
  }

  // =========================================================================
  // CENA 5: DIRETÓRIO DE EXPLORAR PRESTADORES
  // =========================================================================
  console.log('Cena 5: Explorar Prestadores com Novo Design');
  await page.goto('http://localhost:3000/explorar', { waitUntil: 'networkidle' });
  await sleep(1500);

  // Ver que agora Marcos Climatização aparece na lista com botão de agendar
  await smoothScroll(page, 200, 700);
  await sleep(1500);

  const filtroClima = page.locator('button:has-text("Ar-condicionado")').first();
  if (await filtroClima.isVisible()) {
    await smoothMoveAndClick(page, filtroClima);
    await sleep(1200);
  }

  await smoothScroll(page, 350, 700);
  await sleep(2200);

  // Finalizar gravação
  console.log('Concluindo gravação de vídeo...');
  await page.close();
  await context.close();
  await browser.close();

  // Find the newly recorded video file
  await sleep(1500);
  const files = fs.readdirSync(ARTIFACT_DIR)
    .filter((f) => f.endsWith('.webm') && f.startsWith('page@'))
    .map((f) => ({
      name: f,
      time: fs.statSync(path.join(ARTIFACT_DIR, f)).mtimeMs,
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length > 0) {
    const latestVideo = path.join(ARTIFACT_DIR, files[0].name);
    const targetArtifact = path.join(ARTIFACT_DIR, 'video_tour_completo_agendafacil.webm');
    const targetPublic = path.join(PUBLIC_DIR, 'video_tour_completo.webm');

    fs.copyFileSync(latestVideo, targetArtifact);
    fs.copyFileSync(latestVideo, targetPublic);
    console.log(`Vídeo copiado com sucesso para:`);
    console.log(`- ${targetArtifact}`);
    console.log(`- ${targetPublic}`);
  }

  console.log(`Gravação finalizada com sucesso em ${((Date.now() - startTime) / 1000).toFixed(1)}s!`);
}

runTour().catch((err) => {
  console.error('Erro na execução do tour:', err);
  process.exit(1);
});
