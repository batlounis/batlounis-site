const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const csv = require('csvtojson');
const { parse } = require('json2csv');

const INPUT_DIR = path.join(__dirname, '..', 'assets', 'images');
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'images_cropped');
const CSV_DIR = path.join(__dirname, '..', 'data');
const IMAGES_CSV_PATH = path.join(CSV_DIR, 'images.csv');
const GRID_CSV_PATH = path.join(CSV_DIR, 'grid.csv');
const MAX_WIDTH = 1400;
const QUALITY = 85;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const readline = require('readline');

async function getSlugFilter() {
  const args = process.argv.slice(2);
  if (args[0]) return args[0];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question('Enter slug to process (leave empty to process all): ', answer => {
      rl.close();
      resolve(answer.trim() || undefined);
    });
  });
}

async function mergeCsvsWithSlug(slug, type) {
  const inputDir = path.join(CSV_DIR, slug, type); // e.g. data/my-slug/grid/
  const outputFile = type === 'grid' ? GRID_CSV_PATH : IMAGES_CSV_PATH;

  if (!fs.existsSync(inputDir)) {
    console.warn(`⚠️ Folder not found: ${inputDir}`);
    return;
  }

  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.csv'));

  for (const file of files) {
    const filePath = path.join(inputDir, file);
    const json = await csv().fromFile(filePath);

    const withSlug = json.map(row => ({ slug, ...row }));

    const csvData = parse(withSlug, { header: false });
    fs.appendFileSync(outputFile, '\n' + csvData);
    const mergedCsvPath = path.join(CSV_DIR, slug, `${type}.csv`);
    fs.appendFileSync(mergedCsvPath, '\n' + csvData);
    console.log(`📎 Also saved merged data to ${mergedCsvPath}`);
    console.log(`📎 Appended ${filePath} to ${outputFile}`);
  }
}


async function cropAndResizeImages(SLUG_FILTER) {
  const rows = await csv().fromFile(IMAGES_CSV_PATH);

  for (const row of rows) {
    if (SLUG_FILTER && row.story_slug !== SLUG_FILTER) continue;

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

(async () => {
  const SLUG_FILTER = await getSlugFilter();

  if (SLUG_FILTER) {
    console.log(`🔍 Processing slug: ${SLUG_FILTER}`);
    await mergeCsvsWithSlug(SLUG_FILTER, 'grid');
    await mergeCsvsWithSlug(SLUG_FILTER, 'images');
  }

  await cropAndResizeImages(SLUG_FILTER);
})();