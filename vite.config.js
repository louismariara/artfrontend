import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // esbuild: {
  //   loader: 'jsx',
  //   include: /src\/.*\.jsx?$/,
  // },
  server: {
    proxy: {
      '/sign-up': {
        target: 'https://artbackend-1.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: 'https://artbackend-1.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/artworks': {
        target: 'https://artbackend-1.onrender.com', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/artworks/, '')
      },
      '^/api/.*': {
        target: 'https://artbackend-1.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
    },
  },
})