import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Load services configuration
const servicesConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'services-config.json'), 'utf-8')
)

// Get base URL from environment (e.g., "/app-1234567890")
const baseUrl = process.env.VITE_BASE_PATH || ''

// Build proxy configuration dynamically with base URL prefix
const proxyConfig: Record<string, any> = {}
servicesConfig.services.forEach((service: any) => {
  // Proxy path MUST include the base path
  const proxyPath = `${baseUrl}${service.path}`.replace(/\/+/g, '/')
  
  proxyConfig[proxyPath] = {
    target: `http://localhost:${service.port}`,
    changeOrigin: true,
    rewrite: (path: string) => {
      const regex = new RegExp(`^${proxyPath.replace(/\//g, '\\/')}`)
      return path.replace(regex, '')
    }
  }
})

// This template combines ALL deployment settings from the configuring-vite-environments skill
// with dynamic proxy configuration for backend services
export default defineConfig({
  plugins: [react()],
  base: baseUrl,
  server: {
    host: '0.0.0.0',
    cors: true,
    allowedHosts: [
      process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS || '.qs.hcllabs.net'
    ],
    proxy: proxyConfig
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
