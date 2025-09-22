import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000 // Define a porta para 3000
    // A propriedade "host" foi removida para voltar ao padrão (localhost)
  }
})