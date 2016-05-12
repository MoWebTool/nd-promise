require('babel-register')

const webpack = require('webpack')

module.exports = {
  target: 'web',
  entry: './src/core.js',
  output: {
    path: __dirname,
    filename: 'index.js',
    library: 'ndpromise',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        unused: true,
        dead_code: true
      }
    })
  ],
  module: {
    preLoaders: [{
      test: /\.js$/,
      loader: 'eslint',
      exclude: /node_modules/
    }],
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/,
      query: {
        cacheDirectory: true,
        plugins: ['add-module-exports'],
        presets: ['es2015-loose', 'stage-0']
      }
    }]
  },
  eslint: {
    configFile: '.eslintrc'
  }
}
