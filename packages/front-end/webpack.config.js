const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  module: {
    rules: [
      {
        test: /[.]ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /[.]html$/,
        use: 'html-loader'
      }
    ]
  },
  plugins:  [
    new CopyPlugin([
      'src/index.html',
      { from: 'node_modules/@webcomponents/webcomponentsjs', to: 'webcomponentsjs/' }
    ])
  ],
  resolve: {
    extensions: ['.ts']
  },
  output: {
    filename: 'bundle.js',
    path: `${__dirname}/lib`
  }
};
