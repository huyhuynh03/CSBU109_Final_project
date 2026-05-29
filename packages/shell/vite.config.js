import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Shell Vite config — App mode
 *
 * - Entry: index.html (sẽ tạo ở Phase 3.2)
 * - Output: dist/ tại root workspace (Vercel sẽ deploy folder này)
 * - Public assets: public/ (icons, manifest, sw.js, seed-vocabulary)
 *
 * Code splitting tự động cho dynamic import('@linguaflash/english'):
 * Vite tách English module thành chunk riêng, lazy load khi vào /english/*
 */
export default defineConfig({
    root: __dirname,
    publicDir: resolve(__dirname, 'public'),

    // Output build vào dist/ ở root workspace để Vercel deploy
    build: {
        outDir: resolve(__dirname, '../../dist'),
        emptyOutDir: true,
        sourcemap: true,
        target: 'es2020',
        rollupOptions: {
            output: {
                // Hashed filenames cho immutable caching
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]'
            }
        }
    },

    server: {
        port: 5173,
        open: true,
        host: true
    },

    preview: {
        port: 4173,
        host: true
    },

    resolve: {
        alias: {
            '@shell': resolve(__dirname, 'src'),
            '@english': resolve(__dirname, '../english/src')
        }
    }
});
