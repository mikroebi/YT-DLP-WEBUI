import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use './' to ensure all asset paths are relative to the current directory.
  // This is essential for GitHub Pages where the app is served from a subdirectory (e.g., /repo-name/).
  base: './', 
})