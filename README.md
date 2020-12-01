[![Financial Contributors on Open Collective](https://opencollective.com/ts-import-plugin/all/badge.svg?label=financial+contributors)](https://opencollective.com/ts-import-plugin) [![npm version](https://badge.fury.io/js/ts-import-plugin.svg)](https://www.npmjs.com/package/ts-import-plugin)
[![CircleCI](https://circleci.com/gh/Brooooooklyn/ts-import-plugin.svg?style=svg)](https://circleci.com/gh/Brooooooklyn/ts-import-plugin)
[![codecov](https://codecov.io/gh/Brooooooklyn/ts-import-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/Brooooooklyn/ts-import-plugin)

# ts-import-plugin

Modular import plugin for TypeScript, compatible with antd, antd-mobile and so on.

webpack template `./webpack.config.js`, run: `npm start` to see the bundle analyzer.

> This plugin is not work if your are using `import * as _ from 'lodash'` or `import _ from 'lodash'`

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
//tsconfig.json
{
  ...
  "module": "ESNext",
  ...
}
```

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

## With awesome-typescript-loader ( >= 3.5.0 )
```js
//tsconfig.json
{
  ...
  "module": "ESNext",
  ...
}
```

```js
// webpack.config.js
const tsImportPluginFactory = require('ts-import-plugin')

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        options: {
          getCustomTransformers: () => ({
            before: [ tsImportPluginFactory( /** options */) ]
          }),
        },
        exclude: /node_modules/
      }
    ]
  },
  // ...
}
```

## With rollup
```js
import typescript from 'rollup-plugin-typescript2'
import createTransformer from 'ts-import-plugin'

const transformer = createTransformer({
  libraryDirectory: 'es',
  libraryName: 'antd',
  style: true
})

export default {
  input: `./test/fixtures/index.tsx`,
  plugins: [typescript({
    clean: true,
    transformers: [() => ({
      before: transformer,
    })]
  })],
  output: [
    {
      file: `./dist/rollup.dist.js`,
      format: 'esm',
    },
  ],
}
```

## Options

`options` can be an object:

- libraryName `string`

  default `'antd'`
- style `boolean | string | ((path: string) => string)`

  default `false`
- libraryDirectory `string | ((name: string) => string)`

  default `'lib'`
- camel2DashComponentName `boolean`

  default `true`
- camel2UnderlineComponentName `boolean`

  default `false`
- libraryOverride `boolean`

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
  libraryName: '@material-ui/core',
  libraryDirectory: '',
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
    libraryName: '@material-ui/core',
    libraryDirectory: '',
    camel2DashComponentName: false
  }
]
```

# Compatible libs:

## [ant-design](https://github.com/ant-design/ant-design)

```ts
const transformerFactory = require('ts-import-plugin')
// with less
transformerFactory({ style: true })
// with css
transformerFactory({ style: 'css' })
// without style
transformerFactory()
```

## [lodash](https://github.com/lodash/lodash/)

> notice you should manual `import 'lodash/core'` in your project if your are using `import { chain } from 'lodash'` .

```ts
transformerFactory({
  style: false,
  libraryName: 'lodash',
  libraryDirectory: null,
  camel2DashComponentName: false
})
```

## [antd-mobile](https://github.com/ant-design/ant-design-mobile)

```ts
// with css.web
transformerFactory({ libraryName: 'antd-mobile', style: 'css', styleExt: 'css.web' })

// antd-mobile recently changed styleExt. If error occurs with prev, try next.
transformerFactory({ libraryName: 'antd-mobile', style: 'css' })
```

## [material-ui](https://github.com/mui-org/material-ui)

```ts
import { Button } from '@material-ui/core'
import { Remove, Refresh, Add } from '@material-ui/icons'
```

```ts
transformerFactory({
  libraryName: '@material-ui/core',
  libraryDirectory: '',
  camel2DashComponentName: false
})

// svg-icons
transformerFactory({
  libraryDirectory: importName => {
    const stringVec = importName.split(/([A-Z][a-z]+|[0-9]*)/)
      .filter(s => s.length)
      .map(s => s.toLocaleLowerCase())

    return stringVec
      .reduce((acc, cur, index) => {
        if (index > 1) {
          return acc + '-' + cur
        } else if (index === 1) {
          return acc + '/' + cur
        }
        return acc + cur
      }, '')
  },
  libraryName: '@material-ui/icons',
  style: false,
  camel2DashComponentName: false
})
```

## [element-ui](https://github.com/ElemeFE/element)

```ts
import { Button } from 'element-ui'
```

```ts
transformerFactory({
    libraryName: 'element-ui',
    libraryDirectory: 'lib',
    camel2DashComponentName: true,
    style: (path: string) =>
        join('element-ui', 'lib', 'theme-chalk', `${
            camel2Dash(basename(path, '.js'))}.css`),
})
```

## [RxJS](https://github.com/reactivex/rxjs)

see [rxjs-webpack-treeshaking-example](https://github.com/Brooooooklyn/rxjs-webpack-treeshaking-example) for more details

> only compatible for 5.5+

- RxJS v5:

```ts
transformerFactory({
  libraryDirectory: '../_esm2015/operators',
  libraryName: 'rxjs/operators',
  style: false,
  camel2DashComponentName: false,
  transformToDefaultImport: false
})
```

- RxJS v6:

```ts
transformerFactory([
  {
    libraryDirectory: '../_esm5/internal/operators',
    libraryName: 'rxjs/operators',
    camel2DashComponentName: false,
    transformToDefaultImport: false
  },
  {
    libraryDirectory: '../_esm5/internal/observable',
    libraryName: 'rxjs',
    camel2DashComponentName: false,
    transformToDefaultImport: false,
  }
])
```

## Contributors

### Code Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/undefined/undefined/graphs/contributors"><img src="https://opencollective.com/ts-import-plugin/contributors.svg?width=890&button=false" /></a>

### Financial Contributors

Become a financial contributor and help us sustain our community. [[Contribute](https://opencollective.com/ts-import-plugin/contribute)]

#### Individuals

<a href="https://opencollective.com/ts-import-plugin"><img src="https://opencollective.com/ts-import-plugin/individuals.svg?width=890"></a>

#### Organizations

Support this project with your organization. Your logo will show up here with a link to your website. [[Contribute](https://opencollective.com/ts-import-plugin/contribute)]

<a href="https://opencollective.com/ts-import-plugin/organization/0/website"><img src="https://opencollective.com/ts-import-plugin/organization/0/avatar.svg"></a>
<a href="https://opencollective.com/ts-import-plugin/organization/1/website"><img src="https://opencollective.com/ts-import-plugin/organization/1/avatar.svg"></a>
<a href="https://opencollective.com/ts-import-plugin/organization/2/website"><img src="https://opencollective.com/ts-import-plugin/organization/2/avatar.svg"></a>
<a href="https://opencollective.com/ts-import-plugin/organization/3/website"><img src="https://opencollective.com/ts-import-plugin/organization/3/avatar.svg"></a>
<a href="https://opencollective.com/ts-import-plugin/organization/4/website"><img src="https://opencollective.com/ts-import-plugin/organization/4/avatar.svg"></a>
<a href="https://opencollective.com/ts-import-plugin/organization/5/website"><img src="https://opencollective.com/ts-import-plugin/organization/5/avatar.svg"></a>
<a href="https://opencollective.com/ts-import-plugin/organization/6/website"><img src="https://opencollective.com/ts-import-plugin/organization/6/avatar.svg"></a>
<a href="https://opencollective.com/ts-import-plugin/organization/7/website"><img src="https://opencollective.com/ts-import-plugin/organization/7/avatar.svg"></a>
<a href="https://opencollective.com/ts-import-plugin/organization/8/website"><img src="https://opencollective.com/ts-import-plugin/organization/8/avatar.svg"></a>
<a href="https://opencollective.com/ts-import-plugin/organization/9/website"><img src="https://opencollective.com/ts-import-plugin/organization/9/avatar.svg"></a>
