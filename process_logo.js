import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = 'C:/Users/rauli/.gemini/antigravity/brain/677b65c1-1b47-4c07-9ddf-8bab0c8620c6/.user_uploaded/media_1793061048592_61645e8a.jpg';
const outputDir = 'c:/Users/rauli/.gemini/antigravity-ide/scratch/agendafacil/public';

async function processLogo() {
  console.log('Lendo imagem original...');
  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const outBuffer = Buffer.alloc(width * height * 4);

  // We want transparent background with clean anti-aliased edges
  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * 3;
    const dstIdx = i * 4;

    const r = data[srcIdx];
    const g = data[srcIdx + 1];
    const b = data[srcIdx + 2];

    const minC = Math.min(r, g, b);
    const maxC = Math.max(r, g, b);
    const delta = maxC - minC;

    // In this logo, foreground is vibrant purple/blue/cyan.
    // White background has r, g, b >= 250 and delta <= 4.
    // Near-edge pixels have a transition from white to the saturated color.
    
    // Distance from white (255, 255, 255)
    // For cyan: R is low (~0-30), G and B are high
    // For purple: G is low (~40-80), R and B are high
    // For blue: R is low (~20-50), G is medium (~90-140), B is high (~240-255)
    const dR = 255 - r;
    const dG = 255 - g;
    const dB = 255 - b;
    const distFromWhite = Math.max(dR, dG, dB);

    let alpha = 0;
    if (distFromWhite <= 5 && delta <= 6) {
      // Pure white background
      alpha = 0;
    } else if (distFromWhite >= 140) {
      // Solid foreground
      alpha = 255;
    } else {
      // Smooth anti-aliased edge
      // Smoothstep between dist 5 and 140
      const t = Math.max(0, Math.min(1, (distFromWhite - 5) / (140 - 5)));
      // Cubic ease
      const smoothT = t * t * (3 - 2 * t);
      alpha = Math.round(smoothT * 255);
    }

    if (alpha === 0) {
      outBuffer[dstIdx] = 0;
      outBuffer[dstIdx + 1] = 0;
      outBuffer[dstIdx + 2] = 0;
      outBuffer[dstIdx + 3] = 0;
    } else if (alpha === 255) {
      outBuffer[dstIdx] = r;
      outBuffer[dstIdx + 1] = g;
      outBuffer[dstIdx + 2] = b;
      outBuffer[dstIdx + 3] = 255;
    } else {
      // Un-premultiply white to eliminate white halo/fringe on dark backgrounds
      const normA = alpha / 255;
      const unmix = (c) => Math.min(255, Math.max(0, Math.round((c - 255 * (1 - normA)) / normA)));
      
      outBuffer[dstIdx] = unmix(r);
      outBuffer[dstIdx + 1] = unmix(g);
      outBuffer[dstIdx + 2] = unmix(b);
      outBuffer[dstIdx + 3] = alpha;
    }
  }

  // 1. Salvar logo full (1024x1024) com transparência
  const fullPng = path.join(outputDir, 'logo.png');
  await sharp(outBuffer, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(fullPng);
  console.log('Salvo:', fullPng);

  // 2. Salvar versões otimizadas de diferentes tamanhos
  // Ícone 512x512
  await sharp(fullPng)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'logo-512.png'));

  // Ícone 192x192
  await sharp(fullPng)
    .resize(192, 192)
    .png()
    .toFile(path.join(outputDir, 'logo-192.png'));

  // Ícone 64x64 e 32x32 para favicon
  await sharp(fullPng)
    .resize(64, 64)
    .png()
    .toFile(path.join(outputDir, 'logo-64.png'));

  await sharp(fullPng)
    .resize(32, 32)
    .png()
    .toFile(path.join(outputDir, 'favicon-32.png'));

  // Copiar também para o diretório de artifacts para visualização
  const artifactPath = 'C:/Users/rauli/.gemini/antigravity/brain/677b65c1-1b47-4c07-9ddf-8bab0c8620c6/logo.png';
  fs.copyFileSync(fullPng, artifactPath);
  console.log('Copiado para artifact:', artifactPath);

  console.log('Processamento de logo finalizado com sucesso!');
}

processLogo().catch(console.error);
