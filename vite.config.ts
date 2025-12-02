import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'لعبة المكعب المختلف',
        short_name: 'المكعب',
        description: 'لعبة تحدي البصر والربح',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'https://i.ibb.co/HLfD5wgf/dualite-favicon.png', // Placeholder icon
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://i.ibb.co/HLfD5wgf/dualite-favicon.png', // Placeholder icon
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
