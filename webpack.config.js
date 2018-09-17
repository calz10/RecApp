const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/client/index.js',
  output: {
    path: path.join(process.cwd(), '/public'),
    filename: 'js/[name][hash].bundle.js',
    publicPath: '/',
  },
  plugins: [
    new CleanWebpackPlugin([
      './public/',
    ]),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: [/node_modules(\/|\\)(?!(@feathersjs))/],
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(jpe?g|png|svg|gif|woff|woff2|eot|ttf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              fallback: 'file-loader',
              name: '[hash].[ext]',
              outputPath: 'images',
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          'css-loader'
        ]
      },
      {
        test: /\.(html)$/,
        use: {
          loader: 'html-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css'],
  },
}
