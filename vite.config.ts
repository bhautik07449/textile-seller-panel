import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/seller/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    headers: {
      'Cache-Control': 'no-store',
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'ag-grid-community',
      'ag-grid-react',
      'lucide-react',
      'clsx',
      'tailwind-merge',
    ],
  },
});
