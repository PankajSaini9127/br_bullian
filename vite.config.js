import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui') || id.includes('@emotion')) return 'mui';
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('canvg') || id.includes('dompurify')) return 'pdf';
            if (id.includes('react-toastify')) return 'toastify';
            if (id.includes('axios')) return 'axios';
            if (id.includes('qz-tray') || id.includes('react-thermal-printer')) return 'printer';
            return 'vendor';
          }
        },
      },
    },
  },
});
