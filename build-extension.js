#!/usr/bin/env node

import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const extensionName = process.argv[2]
if (!extensionName) {
  console.error('Usage: node build-extension.js <extension-name>')
  process.exit(1)
}

console.log(`Building extension: ${extensionName}`)

try {
  await build({
    root: extensionName,
    build: {
      lib: {
        entry: resolve(extensionName, 'src/index.ts'),
        name: extensionName,
        fileName: 'index',
        formats: ['es']
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: {
            vue: 'Vue'
          }
        }
      },
      outDir: 'dist',
      emptyOutDir: true
    },
    plugins: [vue()],
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  })
  
  console.log(`✅ ${extensionName} built successfully!`)
} catch (error) {
  console.error(`❌ Failed to build ${extensionName}:`, error)
  process.exit(1)
}
