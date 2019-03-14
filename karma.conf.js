const path = require('path')

module.exports = (config) => {
  config.set({
    browsers: ['Firefox'],
    files: [
      { pattern: 'test/*.test.js', watched: false },
      { pattern: 'test/**/*.test.js', watched: false }
    ],
    frameworks: ['jasmine'],
    preprocessors: {
      'test/*.test.js': ['webpack', 'sourcemap'],
      'test/**/*.test.js': ['webpack', 'sourcemap']
    },
    webpack: {
      devtool: 'inline-source-map',
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      },
      resolve: {
        alias: {
          '@scripts': path.resolve(__dirname, './src/scripts')
        }
      }
    }
  })
}