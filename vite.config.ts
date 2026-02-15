import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Configuration pour le développement local
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: true
      },
      // Configuration pour le déploiement (yarn preview)
      preview: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: true // Autorise tous les hôtes pour éviter le blocage Render
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
