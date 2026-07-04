/*
  目的：從 assets/icon.svg 生成各尺寸 PNG 圖標（開發期一次性工具，產物已入 repo）
  作者：徐傳企 Mario Hsu（AI 協助：Claude Haiku 初版、Claude Fable 5 修訂）
  沿革：
       2026-07-04  v0.0.0.2  1.sharp 移出正式依賴（AVIF 改走 avifenc sidecar）：sharp 未安裝且圖標已存在時跳過，不再讓 postinstall 失敗。
       2026-07-02  v0.0.0.1  1.誕生日。
*/
// 2026-07-04 17:25:07 sharp 改為可選：沒裝且圖標齊全就跳過（圖標產物已入 repo，postinstall 不需重生）. By Claude Fable 5 (effort: default), 傳企監看。begin
// const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 64, 128, 256];
const svgPath = path.join(__dirname, '../assets/icon.svg');
const outputDir = path.join(__dirname, '../assets');

let sharp;
try {
  sharp = require('sharp');
} catch {
  const allIconsExist = [...sizes.map((s) => `icon-${s}x${s}.png`), 'icon.png'].every((f) =>
    fs.existsSync(path.join(outputDir, f))
  );
  if (allIconsExist) {
    console.log('⏭️ sharp not installed and icons already exist — skipping icon generation.');
    process.exit(0);
  }
  console.error('❌ sharp not installed and icons are missing. Run: npm i -D sharp && npm run icons');
  process.exit(1);
}
// 2026-07-04 17:25:07 sharp 改為可選：沒裝且圖標齊全就跳過（圖標產物已入 repo，postinstall 不需重生）. By Claude Fable 5 (effort: default), 傳企監看。 end

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
