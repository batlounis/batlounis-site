module.exports = function(eleventyConfig) {
  // 👇 This tells Eleventy: from inside 'src/pages', go up to 'src/assets'
  eleventyConfig.addPassthroughCopy({"src/assets":"assets"});

  eleventyConfig.addFilter("filterBySlug", (array, slug) => {
    return array.filter(item => item.story_slug === slug);
  });

  eleventyConfig.addFilter("findPhotoByFile", (photos, storySlug, fileName) => {
    return (
      photos.find(
        photo => photo.story_slug === storySlug && photo.file_name === fileName
      ) || {}
    );
  });
  
  

  return {
    dir: {
      input: "src/pages",
      includes: "../_includes",
      data: "../data",
      output: "docs"
    }
  };
};