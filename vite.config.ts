import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/domain-security-project/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
