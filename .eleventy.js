module.exports = function(eleventyConfig) {
  // 👇 This tells Eleventy: from inside 'src/pages', go up to 'src/assets'
  eleventyConfig.addPassthroughCopy({"src/assets":"assets"});
  eleventyConfig.addPassthroughCopy({ ".nojekyll": ".nojekyll" });
  eleventyConfig.addPassthroughCopy({ "CNAME": "CNAME" });

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

  eleventyConfig.addCollection("stories", collection => {
    return collection.getAll().filter(item =>
      item.data.layout === "layout.njk" &&
      item.data.story && // from pagination alias
      item.url.startsWith("/stories/")
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