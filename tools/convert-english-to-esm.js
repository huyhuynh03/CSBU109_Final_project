/**
 * Script: Convert English module JS files to ESM
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const enSrc = resolve(__dirname, '../packages/english/src');

// Map: relative path → export name (or { named: [...] } for multiple)
const files = {
    'config/card-schemas.js': 'CardSchemas',
    'config/vocabulary-topics.js': { named: ['VocabularyTopics', 'TopicCategories'] },
    'fsrs/bqt-v2-cleanup.js': 'BqtV2Cleanup',
    'fsrs/card-mode-manager.js': 'CardModeManager',
    'pages/grammar.js': 'GrammarPage',
    'pages/review.js': 'ReviewPage',
    'pages/study.js': 'StudyPage',
    'pages/topic-detail.js': 'TopicDetailPage',
    'pages/vocabulary.js': 'VocabularyPage',
    'ui/card-filter.js': 'CardFilter',
    'utils/family-word-manager.js': 'FamilyWordManager',
    'utils/seed-importer.js': 'SeedImporter'
};

let converted = 0;

for (const [relPath, exportSpec] of Object.entries(files)) {
    const filePath = resolve(enSrc, relPath);
    let content = readFileSync(filePath, 'utf-8');

    if (content.includes('export default') || content.includes('\nexport {')) {
        console.log(`SKIP (already ESM): ${relPath}`);
        continue;
    }

    if (typeof exportSpec === 'object' && exportSpec.named) {
        content += `\n\nexport { ${exportSpec.named.join(', ')} };\n`;
    } else {
        content += `\n\nexport default ${exportSpec};\n`;
    }

    writeFileSync(filePath, content, 'utf-8');
    console.log(`DONE: ${relPath}`);
    converted++;
}

console.log(`\n✓ Converted ${converted} English files to ESM`);
