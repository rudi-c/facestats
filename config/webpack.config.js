const webpack = require('webpack');
const path = require('path');
const WebpackNotifierPlugin = require('webpack-notifier');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractSass = new ExtractTextPlugin({
  filename: "[name].[contenthash].css",
  disable: process.env.NODE_ENV === "development"
});

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    'index.tsx'
  ],
  output: {
    filename: 'app.js',
    publicPath: '/dist',
    path: path.resolve('dist')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: ['src', 'node_modules'],
  },
  module: {
    rules: [
      { 
        test: /\.css$/, 
        use: extractSass.extract({
          fallback: "style-loader",
          use: "css-loader"
        }) 
      },
      { test: /\.tsx?$/, use: ['babel-loader', 'ts-loader'] },
      { test: /\.json$/, include: /node_modules/, use: 'json-loader' },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          fallback: "style-loader",
          use: ["css-loader", "sass-loader"]
        }),
      },
    ]
  },
  plugins: [
    // Add the Webpack HMR plugin so it will notify the browser when the app code changes
    new webpack.HotModuleReplacementPlugin(),
    new WebpackNotifierPlugin({ alwaysNotify: true }),
    extractSass,
  ]
};