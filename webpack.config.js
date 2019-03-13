const HtmlWebpackPlugin = require('html-webpack-plugin');
const {resolve} = require('path')

const config = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.styl$/,
        use: [
          'style-loader',
          'css-loader',
          'stylus-loader'
        ]
      },
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
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body'
    })
  ]
}

module.exports = env => {
  if (env.development) {
    config.mode = 'development'
    config.devtool = 'inline-source-map'
    config.devServer = {
      contentBase: false,
      port: 7700
    }
  }
  
  return config
}