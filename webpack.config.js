const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

const config = {
  mode: "production",
  context: path.resolve(__dirname, "src"),
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.(scss|sass)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {}
          },
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env"]]
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
      inject: "body"
    }),
    new MiniCssExtractPlugin({}),
    new CopyWebpackPlugin([{ from: "images", to: "images" }])
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@test": path.resolve(__dirname, "test")
    }
  }
};

const devConfig = {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    contentBase: false,
    port: 7700
  }
};

module.exports = env => {
  if (env && env.development) {
    Object.assign(config, devConfig);
  }
  if (env && env.test) {
    delete config.entry;
    delete config.output;
  }

  return config;
};
