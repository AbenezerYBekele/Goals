import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    // IMPORTANT: This base path must match your repository name exactly for GitHub Pages
    // Since your URL is https://abenezerybekele.github.io/Goals/, the base is '/Goals/'
    base: '/Goals/',
    define: {
      // Fixes "process is not defined" error in browser
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ""),
      'process.env': {} 
    }
  }
})