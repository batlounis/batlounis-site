const csv = require('csvtojson');
const path = require('path');
const fs = require('fs');
const { imageSize } = require('image-size');

const imageBasePath = path.join(__dirname, '..', 'assets', 'images_cropped');

module.exports = async () => {
  const raw = await csv().fromFile(path.join(__dirname, 'grid.csv'));

  return raw.map(row => {
    const slug = row.story_slug.trim();
    const imageFilenames = row.images.split(',').map(f => f.trim());

    const imageData = imageFilenames.map(filename => {
      const imagePath = path.join(imageBasePath, slug, filename);
      let width = 450;
      let height = 450;

      try {
        const buffer = fs.readFileSync(imagePath);
        const dimensions = imageSize(buffer);
        width = dimensions.width;
        height = dimensions.height;
      } catch (err) {
        console.warn(`⚠️ Error reading ${imagePath}: ${err.message}`);
      }

      const aspectRatio = width / height;
      return { filename, width, height, aspectRatio };
    });

    // Total of all aspect ratios
    const totalRatio = imageData.reduce((sum, img) => sum + img.aspectRatio, 0);

    // Calculate width percentages
    const imagesWithPercent = imageData.map(img => ({
      ...img,
      widthPercent: +(img.aspectRatio / totalRatio * 100).toFixed(2)
    }));

    return {
      ...row,
      images: imagesWithPercent
    };
  });
};
