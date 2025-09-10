import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueFlowShared',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['vue', '@vue-flow/core', '@vue-flow/background', '@vue-flow/controls', '@directus/extensions-sdk'],
      output: {
        globals: {
          vue: 'Vue',
          '@vue-flow/core': 'VueFlowCore',
          '@vue-flow/background': 'VueFlowBackground',
          '@vue-flow/controls': 'VueFlowControls',
          '@directus/extensions-sdk': 'DirectusExtensionsSDK'
        }
      }
    }
  }
});
