[![npm version](https://badge.fury.io/js/ts-import-plugin.svg)](https://www.npmjs.com/package/ts-import-plugin)
[![CircleCI](https://circleci.com/gh/Brooooooklyn/ts-import-plugin.svg?style=svg)](https://circleci.com/gh/Brooooooklyn/ts-import-plugin)
[![Coverage Status](https://coveralls.io/repos/github/Brooooooklyn/ts-import-plugin/badge.svg)](https://coveralls.io/github/Brooooooklyn/ts-import-plugin)

# ts-import-plugin

[![Greenkeeper badge](https://badges.greenkeeper.io/Brooooooklyn/ts-import-plugin.svg)](https://greenkeeper.io/)

Modular import plugin for TypeScript, compatible with antd, antd-mobile and so on.

webpack template `./webpack.config.js`, run: `npm start` to see the bundle analyzer.

![bundle-analyzer](./bundle.png)

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

# Usage

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

Due to https://github.com/s-panferov/awesome-typescript-loader/issues/447, `awesome-typescript-loader` is not working with any `TypeScript plugin`, include this one.

## Options

`options` can be an object:

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
  style: true
})
```

```js
{
  libraryName: 'material-ui',
  libraryDirectory: 'components',
  camel2DashComponentName: false
}
```

`options` can be an array:

example:

```javascript
[
  {
    libraryName: 'antd',
    libraryDirectory: 'lib',
    style: true
  }, {
    libraryName: 'material-ui',
    libraryDirectory: 'components',
    camel2DashComponentName: false
  }
]
```