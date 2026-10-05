import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 0.0.0.0 — necessário para acessar de fora do container
    port: 5173,
    strictPort: true,
    watch: {
      // Volumes montados do Windows/macOS no Docker não propagam eventos de FS
      usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
    },
  },
});
