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
    filename: '[name].[contenthash].js',
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
            jsx: 'react-jsx',
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
              postcssOptions: {
                plugins: [cssnano()],
              },
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
      cacheGroups: {
        antd: {
          name: `npm-antd`,
          test: testPackageName(/[\\/]node_modules[\\/](antd|@ant-design|rc-[^\\/]+)[\\/]/),
          priority: 200,
          enforce: true,
        },
        react: {
          name: `npm-react`,
          test: testPackageName(/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/),
          priority: 200,
          enforce: true,
        },
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          priority: 190,
          enforce: true,
        },
        styles: {
          name: 'styles',
          test: (module) =>
            module.nameForCondition && /\.css$/.test(module.nameForCondition()) && !/^javascript/.test(module.type),
          chunks: 'all',
          minSize: 1,
          minChunks: 1,
          reuseExistingChunk: true,
          priority: 1000,
          enforce: true,
        },
      },
    },
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),

    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: './report.html',
    }),
  ],
}

function testPackageName(regexp) {
  return (module) => module.nameForCondition && regexp.test(module.nameForCondition())
}
