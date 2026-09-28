/// <reference types="vitest" />
// Dung defineConfig tu 'vitest/config' de duoc type 'test' ma khong phai
// khai bao them mot file config rieng. Alias o day phai trung khop voi
// phan 'paths' trong tsconfig.json, neu khong 'tsc' va vitest se resolve
// cung mot tep nhung ra hai dia chi khac nhau.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../packages/shared/src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
