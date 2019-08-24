const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');


module.exports = [{
  entry: {
    main: './src/index.ts',
    graphVisualizer: './src/graphVisualizer/index.ts'
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
        exclude: [/node_modules/],
      }
    ]
  },
  plugins: [
    new WebpackShellPlugin({
      onBuildExit: ['npm run runEx']
    })
  ],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: 'visualizer'
  },
  devtool: 'inline-source-map'
},
{
  entry: {
    webpack: './src/webpack.ts',
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'ts-loader',
          options: {
              configFile: path.resolve(__dirname, 'tsconfig.node.json'),
          }
      }],
        exclude: /node_modules/,
      }
    ]
  },
  plugins: [
    new WebpackShellPlugin({
      onBuildExit: ['npm run runEx']
    })
  ],
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: "umd"
  },
  devtool: 'inline-source-map'
}
];