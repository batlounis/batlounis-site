const csv = require('csvtojson');
const path = require('path');

module.exports = async () => {
  const filePath = path.join(__dirname, 'images.csv');
  const raw = await csv().fromFile(filePath);

  return raw.map(row => ({
    story_slug: row.story_slug.trim(),
    file_name: row.file_name.trim(),
    alt_text: row.alt_text,
    reason: row.reason,
    score: parseFloat(row.score),
    aspect_ratio: row.aspect_ratio,
    crop: {
      x: parseFloat(row.x_start_pct),
      y: parseFloat(row.y_start_pct),
      width: parseFloat(row.width_pct),
      height: parseFloat(row.height_pct)
    },
    similar_to: row.similar_to?.trim() || null
  }));
};
