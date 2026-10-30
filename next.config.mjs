import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Endereços antigos -> nova organização (público / cliente / prestador)
  async redirects() {
    return [
      { source: '/dashboard', destination: '/prestador', permanent: true },
      { source: '/meus-agendamentos', destination: '/cliente/agendamentos', permanent: true },
      { source: '/chat', destination: '/cliente/chat', permanent: true },
      { source: '/onboarding', destination: '/cadastro', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

export default nextConfig;
