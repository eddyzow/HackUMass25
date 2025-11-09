import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/HackUMass25/',  // GitHub Pages base path
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
