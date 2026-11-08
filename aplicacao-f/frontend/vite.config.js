// Arquivo fixo: os agentes não podem alterar.
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Tailwind CSS v4: as classes utilitárias funcionam em qualquer componente; o CSS base está em src/index.css.
  plugins: [react(), tailwindcss()],
  // Em desenvolvimento, as chamadas a /api vão para o backend na porta 8000.
  server: {
    proxy: { '/api': 'http://localhost:8000' },
  },
  // O build cai dentro do backend, que serve o front em /. Um único contêiner, um único link.
  build: {
    outDir: '../backend/src/main/resources/static',
    emptyOutDir: true,
  },
})
