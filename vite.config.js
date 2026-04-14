import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig( ({mode}) => {

  const isProd = mode === 'production'

  return {
    base: isProd ? '/my-notes-react/' : '/',
    plugins: [react()],
  }
  
})
