const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

module.exports = async () => {
  const csvFilePath = path.join(__dirname, 'stories.csv');
  return await csv().fromFile(csvFilePath);
};
