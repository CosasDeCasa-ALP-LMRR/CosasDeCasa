import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const targetUrl = process.env.BACKEND_URL || 'https://localhost:3000';

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
        target: targetUrl,
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: targetUrl,
        changeOrigin: true,
        secure: false,
      },
      '/match': {
        target: targetUrl,
        changeOrigin: true,
        secure: false,
      },
      '/search': {
        target: targetUrl,
        changeOrigin: true,
        secure: false,
      },
      '/messaging': {
        target: targetUrl,
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: targetUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
