import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js', 
      
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      
      manifest: {
        name: 'Smart Fridge Tracker',
        short_name: 'Fridge',
        description: 'Track food and expiry dates',
        theme_color: '#3498db',
        background_color: '#f4f7f9',
        display: 'standalone', 
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module' 
      }
    })
  ]
})