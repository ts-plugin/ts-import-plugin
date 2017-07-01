const ts = require('typescript')
const fs = require('fs')
const { resolve } = require('path')
const { expect } = require('chai')

const transformerFactory = require('../lib').default

const printer = ts.createPrinter()

const fixtureDir = fs.readdirSync(resolve(__dirname, 'fixtures'))

describe('should compile with less', () => {
  const transformer = transformerFactory({ style: true })

  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [ transformer ])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)

      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'less', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})

describe('should compile with css', () => {
  const transformer = transformerFactory({ style: 'css' })

  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [ transformer ])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)

      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'css', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})

describe('should compile lodash library', () => {
  const transformer = transformerFactory({
    style: false,
    libraryName: 'lodash',
    libraryDirectory: null,
    camel2DashComponentName: false
  })

  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [ transformer ])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)

      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'lodash', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})

describe('should compile lodash library', () => {
  const transformer = transformerFactory({
    style: false,
    libraryName: 'lodash',
    libraryDirectory: null,
    camel2DashComponentName: false
  })

  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [ transformer ])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)

      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'lodash', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})

describe('should compile with camel2UnderlineComponentName', () => {
  const transformer = transformerFactory({
    style: false,
    camel2UnderlineComponentName: true
  })

  fixtureDir.forEach(v => {
    it(`compile ${v}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ES2016, true)

      const result = ts.transform(source, [ transformer ])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)
      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'camel-2-underline', v), 'utf-8')

      expect(resultCode).to.equal(expectCode)

      result.dispose()
    })
  })
})
