import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Empty string base allows the app to be served from a subdirectory (like GitHub Pages)
  base: '', 
})