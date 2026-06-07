const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputSvg = path.join(__dirname, '../assets/images/logo.svg');
const outputDir = path.join(__dirname, '../assets/images');

async function generateIcons() {
  console.log('--- Generating Brand Assets ---');
  
  try {
    // 1. App Icon (1024x1024)
    await sharp(inputSvg)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(outputDir, 'icon.png'));
    console.log('✅ Generated icon.png');

    // 2. Splash Icon (1024x1024)
    await sharp(inputSvg)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(outputDir, 'splash-icon.png'));
    console.log('✅ Generated splash-icon.png');

    // 3. Android Foreground (Adaptive)
    // We remove the background rect for the foreground image if possible
    let svgContent = fs.readFileSync(inputSvg, 'utf8');
    const foregroundSvg = svgContent.replace(/<rect width="200" height="200" rx="45" fill="#1A1A1A" \/>/, '');
    
    await sharp(Buffer.from(foregroundSvg))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(outputDir, 'android-icon-foreground.png'));
    console.log('✅ Generated android-icon-foreground.png (transparent)');

    console.log('--- Brand Assets Generation Complete ---');
  } catch (err) {
    console.error('❌ Failed to generate assets:', err);
  }
}

generateIcons();
