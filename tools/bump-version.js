#!/usr/bin/env node
/**
 * Prepare deploy: bump APP_VERSION trong sw.js + đồng bộ ?v=<hash> cho mọi
 * JS/CSS local trong public/index.html.
 *
 * Cách dùng:
 *   node tools/bump-version.js                  → bump patch + sync hash (mặc định)
 *   node tools/bump-version.js patch            → tăng patch
 *   node tools/bump-version.js minor            → tăng minor
 *   node tools/bump-version.js major            → tăng major
 *   node tools/bump-version.js set 5.200        → set version cụ thể
 *   node tools/bump-version.js sync             → CHỈ sync hash, không bump version
 *   node tools/bump-version.js --no-sync        → CHỈ bump, không sync hash
 *
 * Sau khi chạy:
 *   - public/sw.js: APP_VERSION mới → CACHE_NAME đổi → activate xoá cache cũ
 *   - public/index.html: mỗi <script>/<link> local có ?v=<hash 8 ký tự đầu SHA-256
 *     của nội dung file>. File không đổi → hash không đổi → browser cache hit.
 *     File đổi → hash đổi → browser tải lại đúng file đó (tận dụng immutable cache).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- Đường dẫn ---
const ROOT = path.join(__dirname, '..');
const SW_PATH = path.join(ROOT, 'public', 'sw.js');
const INDEX_PATH = path.join(ROOT, 'public', 'index.html');
const PUBLIC_DIR = path.join(ROOT, 'public');

// --- Regex ---
const VERSION_REGEX = /const\s+APP_VERSION\s*=\s*['"]([^'"]+)['"]\s*;/;

// Match <script src="/src/..."> hoặc <link rel="stylesheet" href="/src/...">
// Bắt cả phần ?v=... có hoặc không có
// Group 1: trước URL (e.g. src=" hoặc href=")
// Group 2: pathname tương đối (vd /src/js/app.js)
// Group 3: phần ?v=... (có thể rỗng)
// Group 4: sau (")
const ASSET_TAG_REGEX = /(\s(?:src|href)=")(\/[^"?]+\.(?:js|css))(\?v=[^"]*)?(")/g;

// --- Hash util ---
function shortHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 10);
}

// --- Bump version ---
function readSwVersion() {
    if (!fs.existsSync(SW_PATH)) {
        throw new Error(`Không tìm thấy ${SW_PATH}`);
    }
    const content = fs.readFileSync(SW_PATH, 'utf8');
    const match = content.match(VERSION_REGEX);
    if (!match) {
        throw new Error(`Không tìm thấy "const APP_VERSION = '...'" trong ${SW_PATH}`);
    }
    return { content, current: match[1] };
}

function bumpVersion(current, mode) {
    const parts = current.split('.').map((p) => {
        const n = parseInt(p, 10);
        return Number.isFinite(n) ? n : 0;
    });
    while (parts.length < 3) parts.push(0);
    let [major, minor, patch] = parts;

    switch (mode) {
        case 'major':
            major += 1;
            minor = 0;
            patch = 0;
            break;
        case 'minor':
            minor += 1;
            patch = 0;
            break;
        case 'patch':
        default:
            patch += 1;
            break;
    }
    return `${major}.${minor}.${patch}`;
}

function writeSwVersion(content, newVersion) {
    const updated = content.replace(VERSION_REGEX, `const APP_VERSION = '${newVersion}';`);
    fs.writeFileSync(SW_PATH, updated, 'utf8');
}

// --- Sync asset hashes ---
function syncAssetHashes() {
    if (!fs.existsSync(INDEX_PATH)) {
        throw new Error(`Không tìm thấy ${INDEX_PATH}`);
    }
    const html = fs.readFileSync(INDEX_PATH, 'utf8');

    let changed = 0;
    let skipped = 0;
    let missing = 0;

    const updated = html.replace(ASSET_TAG_REGEX, (full, prefix, pathname, oldQuery, suffix) => {
        // Bỏ qua sw-update.js? Vẫn xử lý — nó cũng nằm dưới /src/js/.
        // Bỏ qua external URLs đã được loại trừ bởi regex (chỉ match /...)

        const filePath = path.join(PUBLIC_DIR, pathname);
        if (!fs.existsSync(filePath)) {
            console.warn(`  [sync-hash] ⚠️  File không tồn tại: ${pathname} → giữ nguyên`);
            missing += 1;
            return full;
        }

        const fileContent = fs.readFileSync(filePath);
        const hash = shortHash(fileContent);
        const newQuery = `?v=${hash}`;
        const newTag = `${prefix}${pathname}${newQuery}${suffix}`;

        if (oldQuery === newQuery) {
            skipped += 1;
        } else {
            changed += 1;
            console.log(`  [sync-hash] ${pathname}  ${oldQuery || '(no version)'} → ${newQuery}`);
        }
        return newTag;
    });

    if (updated !== html) {
        fs.writeFileSync(INDEX_PATH, updated, 'utf8');
    }

    console.log(
        `[sync-hash] Tổng kết: ${changed} đổi, ${skipped} không đổi, ${missing} thiếu file`
    );
    return { changed, skipped, missing };
}

// --- Main ---
function main() {
    const args = process.argv.slice(2);
    let cmd = args[0] || 'patch';
    const noSync = args.includes('--no-sync');

    let bumpMode = null; // null = không bump
    let setVersion = null;
    let syncOnly = false;

    if (cmd === 'sync') {
        syncOnly = true;
    } else if (cmd === 'set') {
        if (!args[1]) {
            console.error('Lệnh "set" yêu cầu version, ví dụ: node tools/bump-version.js set 5.200');
            process.exit(1);
        }
        setVersion = args[1].trim();
    } else if (['patch', 'minor', 'major'].includes(cmd)) {
        bumpMode = cmd;
    } else {
        console.error(`Lệnh không hợp lệ: ${cmd}`);
        console.error(
            `Dùng: node tools/bump-version.js [patch|minor|major|set <version>|sync] [--no-sync]`
        );
        process.exit(1);
    }

    // Step 1: Bump version (trừ khi syncOnly)
    if (!syncOnly) {
        const { content, current } = readSwVersion();
        const newVersion = setVersion || bumpVersion(current, bumpMode);
        writeSwVersion(content, newVersion);
        console.log(`[bump-version] sw.js APP_VERSION: ${current} → ${newVersion}`);
        console.log(`[bump-version] CACHE_NAME = linguaflash-v${newVersion}`);
    }

    // Step 2: Sync asset hashes (trừ khi --no-sync)
    if (!noSync) {
        console.log('[sync-hash] Đồng bộ ?v=<hash> cho JS/CSS trong index.html...');
        syncAssetHashes();
    }

    if (!syncOnly) {
        console.log('\n[bump-version] ✅ Sẵn sàng deploy: npm run deploy (Vercel) hoặc npm run deploy:firebase');
    }
}

try {
    main();
} catch (err) {
    console.error('[bump-version] LỖI:', err.message);
    process.exit(1);
}
