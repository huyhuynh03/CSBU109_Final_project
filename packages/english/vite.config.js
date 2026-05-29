import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * English Module Vite config — Library mode
 *
 * Build ra 1 ESM bundle duy nhất export default theo Module Contract
 * (xem plans/microfrontend-architecture.md mục 3).
 *
 * Shell sẽ dynamic import bundle này khi user vào /english/*.
 *
 * Note: Trong Phase 3 (monorepo workspace), Shell import trực tiếp qua alias
 * '@linguaflash/english' nên cấu hình lib này chủ yếu dùng cho Phase 4
 * khi tách module ra repo riêng và self-host bundle.
 */
export default defineConfig({
    root: __dirname,

    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.js'),
            name: 'LinguaFlashEnglish',
            formats: ['es'],
            fileName: () => 'english-module.js'
        },
        outDir: resolve(__dirname, 'dist'),
        emptyOutDir: true,
        sourcemap: true,
        target: 'es2020',
        // Không bundle Host API (sẽ truy cập qua window.LinguaFlashHost ở runtime)
        rollupOptions: {
            external: [],
            output: {
                inlineDynamicImports: true,
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return 'english-module.css';
                    }
                    return 'assets/[name][extname]';
                }
            }
        },
        cssCodeSplit: false
    },

    resolve: {
        alias: {
            '@english': resolve(__dirname, 'src')
        }
    }
});
