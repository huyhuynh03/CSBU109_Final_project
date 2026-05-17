/**
 * Generate Maskable Icons with Apple-style gradient background
 * 
 * Tạo maskable icons cho PWA với:
 * - Nền gradient tím-xanh (Apple glossy style)
 * - Hiệu ứng gương nổi (radial highlight overlay)
 * - Icon thu nhỏ 70% để nằm trong safe zone 80%
 * 
 * Usage: node scripts/generate-maskable-icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Configuration
const ICON_SOURCE = path.join(__dirname, '..', 'public', 'icons', 'icon-512.png');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons');
const ICON_SCALE = 0.70; // 70% of canvas size

// Gradient colors (lighter/pastel version)
const GRADIENT_TOP = { r: 130, g: 110, b: 255 };   // #826EFF - Soft lavender-blue
const GRADIENT_BOTTOM = { r: 75, g: 45, b: 180 };  // #4B2DB4 - Medium purple

/**
 * Create an SVG gradient background with Apple-style glossy effect
 */
function createGradientBackground(size) {
    // The glossy highlight is a radial gradient from center-top
    // that fades from semi-transparent white to transparent
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(${GRADIENT_TOP.r},${GRADIENT_TOP.g},${GRADIENT_TOP.b});stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(${GRADIENT_BOTTOM.r},${GRADIENT_BOTTOM.g},${GRADIENT_BOTTOM.b});stop-opacity:1" />
    </linearGradient>
    <radialGradient id="gloss" cx="50%" cy="20%" r="70%" fx="50%" fy="20%">
      <stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:0.18" />
      <stop offset="100%" style="stop-color:rgb(255,255,255);stop-opacity:0" />
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)" />
  <rect width="${size}" height="${size}" fill="url(#gloss)" />
</svg>`;
}

async function generateMaskableIcon(size) {
    console.log(`Generating ${size}x${size} maskable icon...`);

    // 1. Create gradient background
    const bgSvg = createGradientBackground(size);
    const background = sharp(Buffer.from(bgSvg))
        .resize(size, size)
        .png();

    // 2. Load and resize the icon (scale to 70% of canvas)
    const iconSize = Math.round(size * ICON_SCALE);
    const offset = Math.round((size - iconSize) / 2);

    const icon = await sharp(ICON_SOURCE)
        .resize(iconSize, iconSize, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();

    // 3. Composite icon on top of gradient background
    const result = await sharp(Buffer.from(bgSvg))
        .resize(size, size)
        .composite([
            {
                input: icon,
                top: offset,
                left: offset,
                blend: 'over'
            }
        ])
        .png()
        .toBuffer();

    // 4. Save output
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}-maskable.png`);
    fs.writeFileSync(outputPath, result);
    console.log(`  ✅ Saved: ${outputPath}`);
    return outputPath;
}

async function main() {
    console.log('🦉 LinguaFlash - Generate Maskable Icons');
    console.log('=========================================');
    console.log(`Source: ${ICON_SOURCE}`);
    console.log(`Scale: ${ICON_SCALE * 100}%`);
    console.log(`Gradient: #826EFF → #4B2DB4 (Apple glossy, lighter)\n`);

    // Check source exists
    if (!fs.existsSync(ICON_SOURCE)) {
        console.error(`❌ Source icon not found: ${ICON_SOURCE}`);
        process.exit(1);
    }

    // Generate both sizes
    await generateMaskableIcon(192);
    await generateMaskableIcon(512);

    console.log('\n🎉 Done! Maskable icons generated with Apple-style gradient.');
    console.log('   Files saved to public/icons/');
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
