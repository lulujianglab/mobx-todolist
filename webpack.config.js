// import path from 'path'
const path = require('path')

const config = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/index.jsx'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  // 定义loader,指示webpack如何编译代码
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      // 使用loader
      use: 'babel-loader'
    }]
  },
  // 方便调试
  devtool: 'inline-source-map'
}

// export default config
module.exports = config