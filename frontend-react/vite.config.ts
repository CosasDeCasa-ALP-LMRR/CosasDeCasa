import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

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
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/match': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/search': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/messaging': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
