const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin')
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.[hash].js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'source-map', // 可以产生source-map
  resolve: { // 更改解析模块的查找方式
    modules: [path.resolve(__dirname, 'source'), path.resolve('node_modules')]
  },
  module: {
    rules: [{
      test: /\.(js|vue)$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      exclude: [
        /node_modules/,
        path.resolve(__dirname, 'src/vdom')
      ],
      options: {
        formatter: require('eslint-friendly-formatter')
      }
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html')
    }),
    new CleanWebpackPlugin()
  ]
}