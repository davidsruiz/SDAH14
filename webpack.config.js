const path = require('path');
const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
  cache: true,
  entry: './public/js/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/js1')
  },
  plugins: [
    new MinifyPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
        ],
      },
    ],
  },
};