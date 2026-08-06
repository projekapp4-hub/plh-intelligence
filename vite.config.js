import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // Menentukan base path relatif agar hasil build aman dihosting di mana saja
  base: './',

  // Konfigurasi Path Alias (@ mengarah ke folder src)
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // Konfigurasi Development Server
  server: {
    port: 3000,
    host: true, // Membuka akses dari IP lokal (Wi-Fi/jaringan)
    // Mengarahkan browser agar langsung membuka /landing.html saat `npm run dev`
    open: '/landing.html',
  },

  // Konfigurasi Bundling Produksi (Multi-Page Application)
  build: {
    outDir: 'dist',
    emptyOutDir: true, // Membersihkan folder dist sebelum proses build baru
    rollupOptions: {
      input: {
        // Entry point landing page diperbarui ke landing.html
        landing: resolve(__dirname, 'landing.html'),
        login: resolve(__dirname, 'login.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      },
      output: {
        // Mengelompokkan hasil kompilasi agar struktur folder dist rapi
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')) {
            return 'assets/media/[name]-[hash][extname]';
          }
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});