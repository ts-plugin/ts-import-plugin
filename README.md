# ts-import-plugin

Modular import plugin for TypeScript, compatible with antd, antd-mobile and so on.

# Why use this

transform such code:
```ts
import { Alert, Card as C } from 'antd'
```
into:

```ts
import Alert from 'antd/lib/alert'
import 'antd/lib/alert/style/index.less'
import { default as C } from 'antd/lib/card'
import 'antd/lib/card/style/index.less'
```

# Useage

## With ts-loader

```js
// webpack.config.js
const tsImportPluginFactory = require('ts-import-plugin')

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.(jsx|tsx|js|ts)$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          getCustomTransformers: () => ({
            before: [ tsImportPluginFactory( /** options */) ]
          }),
          compilerOptions: {
            module: 'es2015'
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  // ...
}
```

## With awesome-typescript-loader

```js
// webpack.config.js
const tsImportPluginFactory = require('ts-import-plugin')

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.(jsx|tsx|js|ts)$/,
        loader: 'awesome-typescript-loader',
        options: {
          getCustomTransformers: () => ({
            before: [ tsImportPluginFactory( /** options */) ]
          })
        }
      }
    ]
  },
  // ...
}
```

## Options

options is a object

- libraryName `string`

  default `'antd'`
- style `boolean | 'css'`

  default `false`
- libraryDirectory `string`

  default `'lib'`
- camel2DashComponentName `boolean`

  default `true`
- camel2UnderlineComponentName `boolean`

  default `false`

example:

```js
tsImportPluginFactory({
  libraryName: 'antd',
  libraryDirectory: 'lib',
  style: 'true'
})
```

```js
{
  libraryName: 'material-ui',
  libraryDirectory: 'components',
  camel2DashComponentName: false
}
```
