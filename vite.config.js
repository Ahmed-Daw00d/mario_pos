import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import printerPlugin from './vite-print-plugin.js'

export default defineConfig({
  plugins: [react(), printerPlugin()],
  server: {
    port: 3000,
    host: true
  }
})
