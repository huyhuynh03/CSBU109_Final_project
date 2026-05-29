/**
 * Script: Convert shell JS files to ESM
 * 
 * Strategy: Add `export default X;` at the end of each file.
 * The main.js entry will import each module and assign to window.X
 * so cross-references between modules still work at runtime.
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const shellSrc = resolve(__dirname, '../packages/shell/src/js');

// Map: relative path → export name
const files = {
    'firebase-config.js': null, // Special: multiple exports
    'utils/helpers.js': 'Helpers',
    'utils/tts.js': 'TTS',
    'ui/toast.js': 'Toast',
    'ui/theme.js': 'Theme',
    'ui/background.js': 'Background',
    'ui/components.js': 'Components',
    'ui/pwa-install.js': 'PwaInstall',
    'ui/sidebar.js': 'Sidebar',
    'auth/auth.js': 'Auth',
    'auth/auth-ui.js': 'AuthUI',
    'db/firestore.js': 'FirestoreDB',
    'db/sync.js': 'Sync',
    'db/languageid-migration.js': 'LanguageIdMigration',
    'fsrs/fsrs.js': 'FSRS',
    'fsrs/migration.js': 'FsrsMigration',
    'pages/home.js': 'HomePage',
    'pages/languages.js': 'LanguagesPage',
    'pages/settings.js': 'SettingsPage',
    'pages/account.js': 'AccountPage',
    'pages/auth-page.js': 'AuthPage',
    'router.js': 'Router',
    'host.js': 'LinguaFlashHost',
    'sw-update.js': 'SwUpdate',
    'app.js': 'App'
};

let converted = 0;

for (const [relPath, exportName] of Object.entries(files)) {
    const filePath = resolve(shellSrc, relPath);
    let content = readFileSync(filePath, 'utf-8');

    // Skip if already has export
    if (content.includes('export default') || content.includes('export {')) {
        console.log(`SKIP (already ESM): ${relPath}`);
        continue;
    }

    if (exportName === null) {
        // firebase-config.js: export multiple named exports
        content += '\n\nexport { db, auth, firebase, authPersistenceReady };\n';
    } else {
        content += `\n\nexport default ${exportName};\n`;
    }

    writeFileSync(filePath, content, 'utf-8');
    console.log(`DONE: ${relPath} → export default ${exportName || '{ ... }'}`);
    converted++;
}

console.log(`\n✓ Converted ${converted} files to ESM`);
