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
      '/api/metro-stores': {
        target: 'https://www.metro.ua',
        changeOrigin: true,
        rewrite: () => '/sxa/search/results?s=%7B0F3B38A3-7330-4544-B95B-81FC80A6BB6F%7D&sig=store-locator&p=30&v=%7BBECE07BD-19B3-4E41-9C8F-E9D9EC85574F%7D&itemid=%7B871024E5-B25D-4FFD-8AF1-29C3FDF1DD11%7D&o=Distance%2CAscending&g=49.0%2C31.0',
      },
    },
  },
})
