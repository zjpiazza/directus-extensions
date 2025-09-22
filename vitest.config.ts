import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['extensions/**/__tests__/**/*.{test,spec}.{js,ts}', 'extensions/**/*.{test,spec}.{js,ts}'],
  },
})