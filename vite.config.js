import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this app from /billix-hours/
export default defineConfig({
  base: '/billix-hours/',
  build: {
    outDir: 'docs'
  },
  plugins: [react()],
})
