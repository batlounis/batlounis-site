const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');
const { stringify } = require('csv-stringify/sync');
const readline = require('readline');

const SHEET_ID = '1Ybj9iRXasJKKhNH1H5-PKMZPVdtw6dKxxvulvQCFBEs';
const GID = '366754899';
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

// const INPUT_PATH = path.join(__dirname, '..', 'data', 'ads.csv');
const OUTPUT_PATH = path.join(__dirname, '..', 'assets', 'google_ads.csv');
const CAMPAIGN_NAME = 'photos.batlounis.com';
const FINAL_URL_BASE = 'https://photos.batlounis.com/stories/';

// Desired column headers in order
const HEADERS = [
  'Record Type', 'Campaign', 'Campaign Status', 'Campaign Type', 'Budget', 'Bidding Strategy Type',
  'Ad Group', 'Keyword', 'Ad Group Status', 'Ad Type', 'Final URL',
  'Headline 1', 'Headline 2', 'Headline 3', 'Headline 4', 'Headline 5', 'Headline 6', 'Headline 7',
  'Description Line 1', 'Description Line 2', 'Description Line 3',
  'Ad Status'
];

async function fetchSheetAsJSON() {
  const fetch = (await import('node-fetch')).default;
  const response = await fetch(SHEET_CSV_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.statusText}`);
  }
  const csvText = await response.text();
  const json = await csv({ trim: true }).fromString(csvText);
  console.log('📄 Fetched Google Sheet data:', json);
  return json;
}

function askForSlug() {
  const args = process.argv.slice(2);
  if (args[0]) return Promise.resolve(args[0]);

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

async function generateGoogleAds(slugFilter) {
  const rawData = await fetchSheetAsJSON();
  const data = rawData.map(row => {
    const normalized = {};
    for (const key in row) {
      normalized[key.trim()] = row[key];
    }
    return normalized;
  });

  const rows = [];

  // Add Campaign row
  rows.push({
    'Record Type': 'Campaign',
    'Campaign': CAMPAIGN_NAME,
    'Campaign Status': 'Enabled',
    'Campaign Type': 'Search',
    'Budget': 2,
    'Bidding Strategy Type': 'Manual CPC'
  });

  for (const row of data) {
    if (slugFilter && row.slug !== slugFilter) continue;

    const {
      slug,
      headline_1,
      headline_2,
      headline_3,
      headline_4,
      headline_5,
      headline_6,
      headline_7,
      description_line_1,
      description_line_2,
      description_line_3,
      keywords
    } = row;

    const adGroup = slug;
    const keywordList = keywords.split(',').map(k => k.trim()).filter(Boolean);

    // Ad Group row
    rows.push({
      'Record Type': 'Ad Group',
      'Campaign': CAMPAIGN_NAME,
      'Ad Group': adGroup,
      'Ad Group Status': 'Enabled'
    });

    // Ad row
    rows.push({
      'Record Type': 'Ad',
      'Campaign': CAMPAIGN_NAME,
      'Ad Group': adGroup,
      'Ad Type': 'Responsive search ad',
      'Final URL': FINAL_URL_BASE + slug,
      'Headline 1': headline_1,
      'Headline 2': headline_2,
      'Headline 3': headline_3,
      'Headline 4': headline_4,
      'Headline 5': headline_5,
      'Headline 6': headline_6,
      'Headline 7': headline_7,
      'Description Line 1': description_line_1,
      'Description Line 2': description_line_2,
      'Description Line 3': description_line_3,
      'Ad Status': 'Enabled'
    });

    // Keyword rows
    for (const keyword of keywordList) {
      rows.push({
        'Record Type': 'Keyword',
        'Campaign': CAMPAIGN_NAME,
        'Ad Group': adGroup,
        'Keyword': keyword
      });
    }
  }

  // Ensure all rows have values in the correct column order
  const formattedRows = rows.map(row =>
    HEADERS.map(col => (col in row ? row[col] : ''))
  );

  // Add headers at the top
  formattedRows.unshift(HEADERS);

  const output = stringify(formattedRows, { header: false });
  fs.writeFileSync(OUTPUT_PATH, output);
  console.log(`✅ Google Ads CSV written to ${OUTPUT_PATH}`);
}

(async () => {
  const slug = await askForSlug();
  if (slug) console.log(`🔍 Generating ads only for slug: ${slug}`);
  await generateGoogleAds(slug);
})();