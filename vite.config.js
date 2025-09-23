import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Conditionally set base path for GitHub Pages deployment
  base: process.env.NODE_ENV === 'production' && process.env.VITE_APP_GH_PAGES
        ? '/gemini-redner-occo/' // <--- CORRECTED REPO NAME HERE!
        : '/', // Use root path for local dev/preview, and default production builds
});