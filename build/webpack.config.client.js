//path 处理成绝对路径
const path = require('path')
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'

const config = {
  // mode: 'development',
  entry: {
    app: path.join(__dirname, '../client/app.js')
  },
  output: {
    // [name]  由entry app 来变化 
    filename: '[name].[hash].js',
    path: path.join(__dirname, '../dist'),
    publicPath: '/public/' // 静态资源引用路径  区分 url是 api请求还是 静态； cdn 路径
  },
  module: {
    rules: [
      {
        test: /.jsx$/,
        loader: 'babel-loader' // es6+ jsx => es5
      },
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: [
          path.join(__dirname, '../node_modules')
        ]
      }
    ]
  },
  plugins: [
    new HtmlPlugin({
      template: path.join(__dirname, '../client/template.html')
    })
  ]
}

if (isDev) {
  config.entry = {
    app: [
      'react-hot-loader/patch',
      path.join(__dirname, '../client/app.js')
    ]
  }
  config.devServer = {
    host: '0.0.0.0',
    port: '8888',
    contentBase: path.join(__dirname, '../dist'),
    hot: true,
    overlay: { // 编译时报错， 再页面半透明背景报错提示
      errors: true
    },
    publicPath: '/public',
    historyApiFallback: {
      index: '/public/index.html'
    }
  }
  config.plugins.push(new webpack.HotModuleReplacementPlugin())
}

module.exports = config