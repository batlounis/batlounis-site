module.exports = function(eleventyConfig) {
  // 👇 This tells Eleventy: from inside 'src/pages', go up to 'src/assets'
  eleventyConfig.addPassthroughCopy({"src/assets":"assets"});

  eleventyConfig.addFilter("filterBySlug", (array, slug) => {
    return array.filter(item => item.story_slug === slug);
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