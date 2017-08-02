const { resolve } = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const antdImportPluginFactory = require('./index')

const antdImportPlugin = antdImportPluginFactory({ style: 'css' })

const Extralib = new ExtractTextPlugin({
  filename: 'lib.css'
})

module.exports = {
  entry: {
    app: './test/fixtures/index.tsx'
  },
  output: {
    filename: '[name].js',
    path: resolve(process.cwd(), 'dist')
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.(jsx|tsx|js|ts)$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          getCustomTransformers: () => ({
            before: [ antdImportPlugin ]
          }),
          compilerOptions: {
            module: 'es2015'
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: Extralib.extract({
          fallback: 'style-loader',
          use: [
            'css-loader?minimize'
          ]
        })
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),

    Extralib,

    new webpack.HashedModuleIdsPlugin(),

    new webpack.optimize.UglifyJsPlugin({
      mangle: {
        screw_ie8: true
      },
      compress: {
        screw_ie8: true,
        dead_code: true,
        warnings: false
      },
      beautify: false,
      sourceMap: false,
      comments: false
    }),

    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: './report.html'
    })
  ]
}
