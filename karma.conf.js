const path = require("path");

const webpackConfig = require("./webpack.config.js")({
  development: true,
  test: true
});

module.exports = config => {
  config.set({
    browsers: ["Firefox"],
    files: [
      { pattern: "test/*.test.js", watched: false },
      { pattern: "test/**/*.test.js", watched: false }
    ],
    frameworks: ["jasmine"],
    preprocessors: {
      "test/*.test.js": ["webpack", "sourcemap"],
      "test/**/*.test.js": ["webpack", "sourcemap"]
    },
    webpack: webpackConfig
  });
};
