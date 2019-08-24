const path = require('path');
const { DependencyGraphWebpackPlugin } = require('./../dist/webpack.js');

module.exports = {
  entry: {
    main: './example/src/index.ts',
    main2: './example/src/index2.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'ts-loader',
          options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
          }
      }],
        exclude: /node_modules/,
      }
    ]
  },
  plugins: [
    new DependencyGraphWebpackPlugin(),
  ],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: 'example',
    libraryTarget: 'var'
  },
  devtool: 'inline-source-map'
};