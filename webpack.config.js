const { resolve } = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const cssnano = require('cssnano')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const tsImportPluginFactory = require('./index')

const tsImportPlugin = tsImportPluginFactory({ style: 'css', libraryDirectory: 'es' })

module.exports = {
  entry: './test/fixtures/index.tsx',
  output: {
    filename: '[name].[hash].js',
    path: resolve(process.cwd(), 'dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(jsx|tsx|js|ts)$/,
        loader: 'ts-loader',
        options: {
          getCustomTransformers: () => ({
            before: [tsImportPlugin],
          }),
          compilerOptions: {
            module: 'esnext',
            allowJs: true,
            declaration: false,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: [cssnano()],
            },
          },
        ],
      },
    ],
  },

  mode: 'production',

  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),

    new webpack.optimize.ModuleConcatenationPlugin(),

    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
    }),

    new webpack.HashedModuleIdsPlugin(),

    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: './report.html',
    }),
  ],
}
