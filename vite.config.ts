import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: true
      },
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.REACT_APP_SUPABASE_URL': JSON.stringify(env.REACT_APP_SUPABASE_URL || env.SUPABASE_URL || 'https://bsoycjudezjsclrlfcnt.supabase.co'),
        'process.env.REACT_APP_SUPABASE_ANON_KEY': JSON.stringify(env.REACT_APP_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzb3ljanVkZXpqc2NscmxmY250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2ODQ4NTQsImV4cCI6MjA4NTI2MDg1NH0.TItSukFXfUA1YTkHRpU0Cb8Mv2Om4_sWoH66rCNH4v0')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
