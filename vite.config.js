import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/silpo-api': {
        target: 'https://api.catalog.ecom.silpo.ua',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/silpo-api/, ''),
      },
      '/silpo-branches': {
        target: 'https://sf-ecom-api.silpo.ua',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/silpo-branches/, ''),
      },
    },
  },
})
