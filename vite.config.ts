import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  preview: {
    allowedHosts: [
      '.onrender.com' // This will allow all subdomains on render.com
    ]
  },
  base: '/',
})
