import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Use hosted backend by default; override with VITE_API_PROXY_TARGET if needed
        target: process.env.VITE_API_PROXY_TARGET || 'https://hcd-project-1.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
