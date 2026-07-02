const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 64, 128, 256];
const svgPath = path.join(__dirname, '../assets/icon.svg');
const outputDir = path.join(__dirname, '../assets');

async function generateIcons() {
  console.log('🎨 Generating icons...');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    try {
      await sharp(svgPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${outputPath}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${size}x${size}:`, error);
    }
  }

  // Generate main icon.png (256x256) for tray
  try {
    await sharp(svgPath)
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, 'icon.png'));

    console.log('✅ Generated icon.png (tray icon)');
  } catch (error) {
    console.error('❌ Failed to generate icon.png:', error);
  }

  console.log('\n✨ Icon generation complete!');
}

generateIcons().catch(console.error);
