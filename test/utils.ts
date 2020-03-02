import * as ts from 'typescript'
import * as fs from 'fs'
import { resolve } from 'path'
import test from 'ava'

import transformerFactory, { Options } from '../src'

export function createSpec(title: string, config: Options | Options[]) {
  const printer = ts.createPrinter()

  const fixtureDir = fs.readdirSync(resolve(__dirname, 'fixtures'))

  const transformer = transformerFactory(config)
  fixtureDir.forEach(v => {
    test(`${title} ${v}`, (t) => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', v), 'utf-8')

      const source = ts.createSourceFile(v, sourceCode, ts.ScriptTarget.ESNext, true)

      const result = ts.transform(source, [transformer])

      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile as ts.SourceFile)

      t.snapshot(resultCode)

      result.dispose()
    })
  })
}
