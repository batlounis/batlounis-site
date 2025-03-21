const csv = require('csvtojson');
const path = require('path');
const fs = require('fs');
const { imageSize } = require('image-size');
const ffmpeg = require('fluent-ffmpeg');

const imageBasePath = path.join(__dirname, '..', 'assets', 'images_cropped');

function getVideoDimensions(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const stream = metadata.streams.find(s => s.width && s.height);
      if (stream) {
        resolve({ width: stream.width, height: stream.height });
      } else {
        reject(new Error('No video stream found'));
      }
    });
  });
}

module.exports = async () => {
  const raw = await csv().fromFile(path.join(__dirname, 'grid.csv'));

  return Promise.all(raw.map(async row => {
    const slug = row.story_slug.trim();
    const imageFilenames = row.images.split(',').map(f => f.trim());

    const imageData = await Promise.all(imageFilenames.map(async filename => {
      const imagePath = path.join(imageBasePath, slug, filename);
      let width = 450;
      let height = 450;

      try {
        if (filename.toLowerCase().endsWith('.mp4')) {
          const dimensions = await getVideoDimensions(imagePath);
          width = dimensions.width;
          height = dimensions.height;
        } else {
          const buffer = fs.readFileSync(imagePath);
          const dimensions = imageSize(buffer);
          width = dimensions.width;
          height = dimensions.height;
        }
      } catch (err) {
        console.warn(`⚠️ Error reading ${imagePath}: ${err.message}`);
      }

      const aspectRatio = width / height;
      return { filename, width, height, aspectRatio };
    }));

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
  }));
};
