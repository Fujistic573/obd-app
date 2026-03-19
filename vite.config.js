import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const supabaseStoragePath = '/@supabase/storage-js/dist/'

function stripBrokenDependencySourceMaps() {
  return {
    name: 'strip-broken-dependency-source-maps',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes(supabaseStoragePath) || !id.endsWith('.js')) {
        return null
      }

      return {
        code: code.replace(/^\/\/#[#@]?\s*sourceMappingURL=.*$/gm, ''),
        map: null,
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), stripBrokenDependencySourceMaps()],
  server: {
    port: 5173,
    open: true,
    strictPort: false,
  },
})
