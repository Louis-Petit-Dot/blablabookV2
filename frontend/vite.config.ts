import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        allowedHosts: [
            'blablabook.online',
            'www.blablabook.online',
            '168.231.76.232',
            'localhost'
        ],
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    },
    resolve: {
        alias: {
            '@': '/src'
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler'
            }
        }
    },
    build: {
        // Optimisations de build pour la performance
        target: 'esnext', // Utilise les features modernes JS
        minify: 'terser', // Meilleure compression que esbuild
        terserOptions: {
            compress: {
                drop_console: true, // Retire les console.log en prod
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug']
            }
        },
        rollupOptions: {
            output: {
                // Stratégie de chunking optimisée
                manualChunks: {
                    // Vendors séparés pour meilleur cache
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
                    'store': ['zustand'],
                    'http': ['axios']
                },
                // Nommage optimisé pour cache busting
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        },
        // Augmente le warning threshold car on a du code-splitting maintenant
        chunkSizeWarningLimit: 600,
        // Active la compression
        reportCompressedSize: true,
        // Source maps légères en production (désactiver si pas nécessaire)
        sourcemap: false
    }
})