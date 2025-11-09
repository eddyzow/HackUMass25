import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // Root path for custom domain
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
