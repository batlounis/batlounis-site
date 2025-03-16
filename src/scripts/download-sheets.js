

const fs = require('fs');
const path = require('path');

const SHEETS = [
  {
    id: '1Ybj9iRXasJKKhNH1H5-PKMZPVdtw6dKxxvulvQCFBEs',
    gid: '366754899',
    filename: 'ads.csv'
  },
  {
    id: '1Ybj9iRXasJKKhNH1H5-PKMZPVdtw6dKxxvulvQCFBEs',
    gid: '1898031504',
    filename: 'images.csv'
  },
  {
    id: '1Ybj9iRXasJKKhNH1H5-PKMZPVdtw6dKxxvulvQCFBEs',
    gid: '416464749',
    filename: 'grid.csv'
  },
  {
    id: '1Ybj9iRXasJKKhNH1H5-PKMZPVdtw6dKxxvulvQCFBEs',
    gid: '398053067',
    filename: 'stories.csv'
  }
];

async function downloadSheets() {
  const fetch = (await import('node-fetch')).default;

  for (const sheet of SHEETS) {
    const url = `https://docs.google.com/spreadsheets/d/${sheet.id}/export?format=csv&gid=${sheet.gid}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`❌ Failed to fetch ${sheet.filename}: ${response.statusText}`);
      continue;
    }

    const csvText = await response.text();
    const filePath = path.join(__dirname, '..', 'data', sheet.filename);
    fs.writeFileSync(filePath, csvText);
    console.log(`✅ Saved ${sheet.filename} to data folder`);
  }
}

downloadSheets();