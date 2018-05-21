import * as ts from 'typescript'
import { join } from 'path'

export interface Options {
  libraryName?: string
  style?: boolean | 'css'
  libraryDirectory?: ((name: string) => string) | string
  camel2DashComponentName?: boolean
  camel2UnderlineComponentName?: boolean
  styleExt?: string
  transformToDefaultImport?: boolean
}

export interface ImportedStruct {
  importName: string
  variableName?: string
}

// camel2Dash camel2Underline
// borrow from https://github.com/ant-design/babel-plugin-import
function camel2Dash(_str: string) {
  const str = _str[0].toLowerCase() + _str.substr(1)
  return str.replace(/([A-Z])/g, ($1) => `-${$1.toLowerCase()}`)
}

function camel2Underline(_str: string) {
  const str = _str[0].toLowerCase() + _str.substr(1)
  return str.replace(/([A-Z])/g, ($1) => `_${$1.toLowerCase()}`)
}

function getImportedStructs(node: ts.Node) {
  const structs = new Set<ImportedStruct>()
  node.forEachChild(importChild => {
    if (importChild.kind === ts.SyntaxKind.ImportClause) {
      importChild.getChildAt(0).forEachChild(child => {
        const childCount = child.getChildCount()
        if (!childCount) {
          return
        }
        if (childCount !== 1) {
          const importName = child.getChildAt(0).getText()
          const variableName = child.getChildAt(2).getText()
          structs.add({
            importName,
            variableName
          })
        } else {
          const name = child.getText()
          structs.add({ importName: name })
        }
      })
    }
  })
  return structs
}

function createDistAst(struct: ImportedStruct, options: Options) {
  const astNodes: ts.Node[] = []

  const { libraryName } = options
  const _importName = struct.importName
  const importName = options.camel2UnderlineComponentName ?
    camel2Underline(_importName) :
    options.camel2DashComponentName ?
      camel2Dash(_importName) :
      _importName

  const libraryDirectory = typeof options.libraryDirectory === 'function' ?
    options.libraryDirectory(_importName) :
    join((options.libraryDirectory || ''), importName)

  /* istanbul ignore next  */
  if (process.env.NODE_ENV !== 'production') {
    if (libraryDirectory == null) {
      console.warn(`custom libraryDirectory resolve a ${ libraryDirectory } path`)
    }
  }

  const importPath = join(libraryName!, libraryDirectory)

  const scriptNode = ts.createImportDeclaration(
    undefined,
    undefined,
    ts.createImportClause(
      struct.variableName || !options.transformToDefaultImport ? undefined : ts.createIdentifier(struct.importName),
      struct.variableName ? ts.createNamedImports([
        ts.createImportSpecifier(
          options.transformToDefaultImport ? ts.createIdentifier('default') : ts.createIdentifier(struct.importName),
          ts.createIdentifier(struct.variableName)
        )
      ]) : options.transformToDefaultImport ? undefined : ts.createNamedImports([
        ts.createImportSpecifier(
          undefined,
          ts.createIdentifier(struct.importName)
        )
      ])
    ),
    ts.createLiteral(importPath)
  )

  astNodes.push(scriptNode)

  if (options.style) {
    const { style, styleExt } = options
    const styleNode = ts.createImportDeclaration(
      undefined,
      undefined,
      undefined,
      ts.createLiteral(
        `${ importPath }/style/${ style === 'css' ? (styleExt ? styleExt : 'css') : 'index' }.js`
      )
    )

    astNodes.push(styleNode)
  }
  return astNodes
}

const defaultOptions = {
  libraryName: 'antd',
  libraryDirectory: 'lib',
  style: false,
  camel2DashComponentName: true,
  transformToDefaultImport: true
}

export function createTransformer(_options: Partial<Options> | Array<Partial<Options>> = { }) {
  const mergeDefault = (options: Partial<Options>) => ({ ...defaultOptions, ...options })
  const optionsArray: Options[] = Array.isArray(_options) ? _options.map(options => mergeDefault(options)) : [mergeDefault(_options)]

  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visitor: ts.Visitor = (node) => {

      if (ts.isSourceFile(node)) {
        return ts.visitEachChild(node, visitor, context)
      }

      if (!ts.isImportDeclaration(node)) {
        return node
      }

      const importedLibName = (<ts.StringLiteral>node.moduleSpecifier).text

      const options = optionsArray.find(_ => _.libraryName === importedLibName)

      if (!options) {
        return node
      }

      const structs = getImportedStructs(node)
      if (structs.size === 0) {
        return node
      }

      return Array
        .from(structs)
        .reduce((acc, struct) => {
          const nodes = createDistAst(struct, options)
          return acc.concat(nodes)
        }, <ts.Node[]>[])
    }

    return (node) => ts.visitNode(node, visitor)
  }
  return transformer
}

export default createTransformer
