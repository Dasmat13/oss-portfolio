import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use repository base path only when building on GitHub Actions
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/oss-portfolio/' : '/',
  plugins: [react()],
})
