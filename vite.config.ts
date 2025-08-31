import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  build: {
    // Optimize build for memory usage
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks to reduce memory usage
          vendor: ['react', 'react-dom'],
          orderly: ['@orderly.network/hooks', '@orderly.network/react-app'],
          aarc: ['@aarc-dev/fundkit-web-sdk', '@aarc-xyz/eth-connector'],
          wagmi: ['wagmi', 'viem', '@rainbow-me/rainbowkit'],
        },
      },
    },
    // Reduce memory usage during build
    minify: 'esbuild',
  },
  preview: {
    allowedHosts: [
      '.onrender.com' // This will allow all subdomains on render.com
    ]
  },
  base: '/',
})
