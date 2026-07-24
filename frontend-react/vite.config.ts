/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const backendUrl = process.env.VITE_BACKEND_URL || 'https://localhost:3000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    port: 5173,
    headers: {
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "frame-ancestors 'none'",
    },
    proxy: {
      // Proxy /identity, /auth, /match and /uploads routes to NestJS backend
      '/identity': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
      '/match': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
      '/search': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
      '/messaging': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
})
