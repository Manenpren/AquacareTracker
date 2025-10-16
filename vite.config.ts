import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  define: {
    // Fix: Expose process.env.API_KEY to client-side code for Gemini API compatibility.
    'process.env': {
      API_KEY: process.env.API_KEY
    }
  }
})
