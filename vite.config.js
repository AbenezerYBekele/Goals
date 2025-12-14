import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // This makes process.env.API_KEY work in your code
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    },
    // IMPORTANT: Change 'goals-app' to your GitHub repository name
    base: '/goals-app/', 
  }
})