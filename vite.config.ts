import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // 外部からの接続を受ける
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://localhost:3001'
    },
    // すべてのホストを許可（CloudflareのランダムURLも許可）
    allowedHosts: true
  }
})