const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const csv = require('csvtojson');

const INPUT_DIR = path.join(__dirname, '..', 'assets', 'images');
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'images_cropped');
const CSV_PATH = path.join(__dirname, '..', 'data', 'images.csv');
const MAX_WIDTH = 1400;
const QUALITY = 85;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function cropAndResizeImages() {
  const rows = await csv().fromFile(CSV_PATH);

  for (const row of rows) {
    const {
      story_slug,
      file_name,
      x_start_pct,
      y_start_pct,
      width_pct,
      height_pct
    } = row;

    const inputPath = path.join(INPUT_DIR, story_slug, file_name);
    const outputPath = path.join(OUTPUT_DIR, story_slug);
    const outputFile = path.join(outputPath, file_name);

    if (!fs.existsSync(inputPath)) {
      console.warn(`⚠️ File not found: ${inputPath}`);
      continue;
    }

    // Ensure subdirectory exists
    fs.mkdirSync(outputPath, { recursive: true });

    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      const x = Math.round((x_start_pct / 100) * metadata.width);
      const y = Math.round((y_start_pct / 100) * metadata.height);
      const w = Math.round((width_pct / 100) * metadata.width);
      const h = Math.round((height_pct / 100) * metadata.height);

      let cropped = image.extract({ left: x, top: y, width: w, height: h });

      if (w > MAX_WIDTH) {
        const newHeight = Math.round(MAX_WIDTH * (h / w));
        cropped = cropped.resize(MAX_WIDTH, newHeight);
      }

      await cropped.jpeg({ quality: QUALITY }).toFile(outputFile);
      console.log(`✅ Cropped and saved: ${outputFile}`);
    } catch (err) {
      console.error(`❌ Error processing ${inputPath}: ${err.message}`);
    }
  }
}

cropAndResizeImages();
