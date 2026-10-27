import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/rauli/.gemini/antigravity/brain/677b65c1-1b47-4c07-9ddf-8bab0c8620c6';

async function capture() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log('Capturando Home...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_home_new_logo.png'), fullPage: false });

  console.log('Capturando Dashboard...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_dashboard_new_logo.png'), fullPage: false });

  console.log('Capturando Cadastro...');
  await page.goto('http://localhost:3000/cadastro', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_cadastro_new_logo.png'), fullPage: false });

  await browser.close();
  console.log('Screenshots capturados com sucesso!');
}

capture().catch(console.error);
