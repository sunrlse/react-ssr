const axios = require('axios')
const path = require('path')
const MemoryFs = require('memory-fs')
const proxy = require('http-proxy-middleware')
const ReactDomServerSSR = require('react-dom/server')
const webpack = require('webpack')
const serverConfig = require('../../build/webpack.config.server')

const getTemplate = () => {
  return new Promise((resolve, reject) => {
    axios.get('http://localhost:8888/public/index.html')
      .then(res => {
        resolve(res.data)
      })
      .catch(reject)
  })
}

const Module = module.constructor

const mfs = new MemoryFs()
const serverCompiler = webpack(serverConfig)
serverCompiler.outputFileSystem = mfs // 从内存中读写文件
let serverBundle
serverCompiler.watch({}, (err, stats) => {
  if (err) throw err
  stats = stats.toJson()
  stats.errors.forEach(err => console.error(err))
  stats.warnings.forEach(warn => console.warn(warn))

  const bundlePath = path.join(
    serverConfig.output.path,
    serverConfig.output.filename
  )
  const bundle = mfs.readFileSync(bundlePath, 'utf-8') // 结果为string类型
  const m = new Module()
  m._compile(bundle, 'server-entry.js') // 用 Module 解析 js string 的内容，生成新的模块
  serverBundle = m.exports.default
})


module.exports = function(app) {

  app.use('/public', proxy({
    target: 'http://localhost:8888'
  }))

  app.get('*', function (req, res) {
    getTemplate().then(template => {
      const content = ReactDomServerSSR.renderToString(serverBundle)
      res.send(template.replace('<!-- app -->', content))
    }).catch(error => {
      console.log('==================catch=======================')
      console.error(error)
      console.log('==================catch=======================')
    })
  })
}