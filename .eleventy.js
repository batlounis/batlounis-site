module.exports = function(eleventyConfig) {
  // Copy assets (images, CSS)
  eleventyConfig.addPassthroughCopy("src/assets");

  return {
    dir: {
      input: "src",
      output: "docs",  // GitHub Pages will use this
      includes: "_includes"
    }
  };
};
