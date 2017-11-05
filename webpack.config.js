const path = require('path');

module.exports = {
  entry: './public/js/core.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/js1')
  }
};