import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function resolveRootFile(fileName) {
  const extensions = ['.jsx', '.js', '.tsx', '.ts', '.json', '.css', '']
  for (const ext of extensions) {
    const p = path.resolve(__dirname, fileName + ext)
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      return p
    }
  }
  return null
}

function rootAliasPlugin() {
  return {
    name: 'custom-root-alias',
    enforce: 'pre',
    resolveId(source, importer) {
      if (importer && importer.includes('node_modules')) {
        return null
      }

      if (source.startsWith('@/')) {
        const subpath = source.replace(/^@\//, '')
        
        // 1. Direct path
        const direct = resolveRootFile(subpath)
        if (direct) return direct

        // 2. Basename fallback (e.g. components/ui/toaster -> toaster.jsx)
        const baseName = path.basename(subpath)
        const baseDirect = resolveRootFile(baseName)
        if (baseDirect) return baseDirect

        // 3. src/
        const srcDirect = resolveRootFile(path.join('src', subpath))
        if (srcDirect) return srcDirect
      }

      return null
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    rootAliasPlugin(),
    react(),
  ],
})
