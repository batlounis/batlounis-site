const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');
const mime = require('mime-types');
const readline = require('readline');

const IMAGES_DIR = path.join(__dirname, '..', 'assets', 'images');
const CSV_DIR = path.join(__dirname, '..', 'data');
const GRID_CSV_HEADERS = ['row', 'images'];
const IMAGES_CSV_HEADERS = [
  'file_name',
  'aspect_ratio',
  'x_start_pct',
  'y_start_pct',
  'width_pct',
  'height_pct',
  'alt_text',
  'reason',
  'score',
  'similar_to'
];

function getFilesRecursively(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(f => f.isFile())
    .map(f => f.name)
    .filter(name => /\.(jpe?g|png|mp4|mov|mkv|webm)$/i.test(name));
}

function calculateAspectRatio(width, height) {
  return +(width / height).toFixed(3);
}

async function createCsvs(slug) {
  const inputDir = path.join(IMAGES_DIR, slug);
  const gridDir = path.join(CSV_DIR, slug, 'grid');
  const imagesDir = path.join(CSV_DIR, slug, 'images');

  fs.mkdirSync(gridDir, { recursive: true });
  fs.mkdirSync(imagesDir, { recursive: true });

  const fileNames = getFilesRecursively(inputDir);
  if (fileNames.length === 0) {
    console.warn(`⚠️ No files found in ${inputDir}`);
    return;
  }

  const gridData = [];
  for (let i = 0; i < fileNames.length; i += 3) {
  gridData.push({
      row: i / 3 + 1,
      images: fileNames.slice(i, i + 3).join(',')
  });
  }
  const imageData = fileNames.map(file => ({
    file_name: file,
    aspect_ratio: '',
    x_start_pct: 0,
    y_start_pct: 0,
    width_pct: 100,
    height_pct: 100,
    alt_text: '',
    reason: '',
    score: '',
    similar_to: ''
  }));

  const gridCsv = parse(gridData, { fields: GRID_CSV_HEADERS });
  const imagesCsv = parse(imageData, { fields: IMAGES_CSV_HEADERS });

  fs.writeFileSync(path.join(gridDir, 'grid.csv'), gridCsv);
  fs.writeFileSync(path.join(imagesDir, 'images.csv'), imagesCsv);
  
  // Merge to parent level CSVs
  const parentGridPath = path.join(CSV_DIR, 'grid', 'grid.csv');
  const parentImagesPath = path.join(CSV_DIR, 'images', 'images.csv');
  
  fs.mkdirSync(path.dirname(parentGridPath), { recursive: true });
  fs.mkdirSync(path.dirname(parentImagesPath), { recursive: true });
  
  const appendOrNew = (existingPath, newData, headers) => {
    let combined = [...newData];
    if (fs.existsSync(existingPath)) {
      const existing = fs.readFileSync(existingPath, 'utf-8').split('\n').slice(1).join('\n');
      combined = [...newData, ...existing.split('\n').filter(Boolean).map(row => row)];
    }
    const finalCsv = [headers.join(','), ...combined].join('\n');
    fs.writeFileSync(existingPath, finalCsv);
  };
  
  appendOrNew(parentGridPath, gridCsv.split('\n').slice(1), GRID_CSV_HEADERS);
  appendOrNew(parentImagesPath, imagesCsv.split('\n').slice(1), IMAGES_CSV_HEADERS);
  
  console.log(`✅ Created and merged grid.csv and images.csv for slug: ${slug}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter slug: ', async (slug) => {
  if (!slug) {
    console.error('❌ Slug is required.');
    rl.close();
    process.exit(1);
  }
  await createCsvs(slug.trim());
  rl.close();
});