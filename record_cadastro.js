import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/rauli/.gemini/antigravity/brain/677b65c1-1b47-4c07-9ddf-8bab0c8620c6';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function record() {
  console.log('Iniciando gravação de vídeo do cadastro...');
  
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

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

  const page = await context.newPage();
  
  // 1. Abrir página de cadastro
  await page.goto('http://localhost:3000/cadastro', { waitUntil: 'networkidle' });
  await sleep(1500);

  // Scroll suave inicial mostrando cabeçalho e opções
  await page.evaluate(() => window.scrollBy({ top: 180, behavior: 'smooth' }));
  await sleep(1200);

  // 2. Preencher dados do Prestador (Etapa 1)
  const nameInput = page.locator('input[placeholder*="Carlos Mendes"], input[placeholder*="Nome Completo"], input').first();
  if (await nameInput.isVisible()) {
    await nameInput.click();
    await nameInput.fill('Marcos Silva');
    await sleep(600);
  }

  // Preencher WhatsApp e Email
  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible()) {
    await emailInput.click();
    await emailInput.fill('marcos.clima@gmail.com');
    await sleep(600);
  }

  const phoneInput = page.locator('input[placeholder*="11"], input[type="tel"]').first();
  if (await phoneInput.isVisible()) {
    await phoneInput.click();
    await phoneInput.fill('(11) 98765-4321');
    await sleep(600);
  }

  const passwordInput = page.locator('input[type="password"]').first();
  if (await passwordInput.isVisible()) {
    await passwordInput.click();
    await passwordInput.fill('SenhaForte123');
    await sleep(600);
  }

  // Mostrar Chave Pix
  const pixInput = page.locator('input[placeholder*="seu@email"], input[placeholder*="Chave Pix"]').first();
  if (await pixInput.isVisible()) {
    await pixInput.scrollIntoViewIfNeeded();
    await pixInput.click();
    await pixInput.fill('marcos.clima@gmail.com');
    await sleep(800);
  }

  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
  await sleep(1000);

  // Clicar em Avançar para Etapa 2 (Serviços e Preços)
  const nextBtn1 = page.locator('button:has-text("Avançar para Serviços"), button:has-text("Avançar")').first();
  if (await nextBtn1.isVisible()) {
    await nextBtn1.click();
    await sleep(1500);
  }

  // 3. Etapa 2 (Serviços e Preços Tabelados)
  await page.evaluate(() => window.scrollTo({ top: 150, behavior: 'smooth' }));
  await sleep(1000);

  // Adicionar um novo serviço personalizado
  const srvNameInput = page.locator('input[placeholder*="Nome do serviço"]').first();
  const srvPriceInput = page.locator('input[placeholder*="150"], input[type="number"]').first();
  
  if (await srvNameInput.isVisible() && await srvPriceInput.isVisible()) {
    await srvNameInput.click();
    await srvNameInput.fill('Higienização Completa com Bactericida');
    await sleep(500);
    await srvPriceInput.click();
    await srvPriceInput.fill('180');
    await sleep(500);

    const addBtn = page.locator('button:has-text("Adicionar ao Catálogo")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await sleep(1000);
    }
  }

  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
  await sleep(1200);

  // Clicar em Avançar para Etapa 3 (Horários e Plano)
  const nextBtn2 = page.locator('button:has-text("Avançar para Horários"), button:has-text("Avançar")').first();
  if (await nextBtn2.isVisible()) {
    await nextBtn2.click();
    await sleep(1500);
  }

  // 4. Etapa 3 (Horários, Dias da Semana e Planos)
  await page.evaluate(() => window.scrollTo({ top: 120, behavior: 'smooth' }));
  await sleep(1000);

  // Selecionar dia de sábado
  const sabBtn = page.locator('button:has-text("Sáb")').first();
  if (await sabBtn.isVisible()) {
    await sabBtn.click();
    await sleep(600);
  }

  await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
  await sleep(1200);

  // 5. Agora demonstrar a opção "Sou Cliente"
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await sleep(1000);

  const clienteRoleBtn = page.locator('button:has-text("Sou Cliente"), button:has-text("Quero Contratar")').first();
  if (await clienteRoleBtn.isVisible()) {
    await clienteRoleBtn.click();
    await sleep(1500);
  }

  // Preencher nome do cliente
  const clientNameInput = page.locator('input[placeholder*="Nome completo"], input').first();
  if (await clientNameInput.isVisible()) {
    await clientNameInput.click();
    await clientNameInput.fill('Camila Rodrigues');
    await sleep(600);
  }

  const clientEmailInput = page.locator('input[type="email"]').first();
  if (await clientEmailInput.isVisible()) {
    await clientEmailInput.click();
    await clientEmailInput.fill('camila.rodrigues@gmail.com');
    await sleep(600);
  }

  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
  await sleep(1000);

  // Avançar para endereço do cliente
  const clientNextBtn = page.locator('button:has-text("Avançar para Endereço"), button:has-text("Avançar")').first();
  if (await clientNextBtn.isVisible()) {
    await clientNextBtn.click();
    await sleep(1200);
  }

  await page.evaluate(() => window.scrollBy({ top: 150, behavior: 'smooth' }));
  await sleep(1000);

  // Avançar para interesses
  const clientNextBtn2 = page.locator('button:has-text("Avançar para Interesses"), button:has-text("Avançar")').first();
  if (await clientNextBtn2.isVisible()) {
    await clientNextBtn2.click();
    await sleep(1200);
  }

  await sleep(2000);

  // Finalizar gravação
  await page.close();
  await context.close();
  await browser.close();

  console.log('Gravação finalizada com sucesso!');
}

record().catch((err) => {
  console.error('Erro na gravação:', err);
  process.exit(1);
});
