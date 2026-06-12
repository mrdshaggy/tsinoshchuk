import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
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
      '/metro-api': {
        target: 'https://shop.metro.ua',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/metro-api/, ''),
      },
      '/metro-www': {
        target: 'https://www.metro.ua',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/metro-www/, ''),
      },
      '/api/overpass': {
        target: 'https://overpass-api.de',
        changeOrigin: true,
        rewrite: () => '/api/interpreter',
      },
    },
  },
})
