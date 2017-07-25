import * as ts from 'typescript'

export interface Options {
  libraryName?: string
  style?: boolean | 'css'
  libraryDirectory?: string
  camel2DashComponentName?: boolean
  camel2UnderlineComponentName?: boolean
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

function getImportedLibName (node: ts.Node): string | void {
  const childCount = node.getChildCount()
  let lastChild = node.getChildAt(childCount - 1)
  if (lastChild.kind === ts.SyntaxKind.SemicolonToken) {
    lastChild = node.getChildAt(childCount - 2)
  }
  return lastChild.getText()
}

function getImportedStructs(node: ts.Node) {
  const structs = new Set<ImportedStruct>()
  node.forEachChild(importChild => {
    if (importChild.kind === ts.SyntaxKind.ImportClause) {
      importChild.getChildAt(0).forEachChild(child => {
        const childCount = child.getChildCount()
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
  const scriptNode = ts.createImportDeclaration(
    undefined,
    undefined,
    ts.createImportClause(
      !struct.variableName ? ts.createIdentifier(struct.importName) : undefined,
      struct.variableName ? ts.createNamedImports([
        ts.createImportSpecifier(
          ts.createIdentifier('default'),
          ts.createIdentifier(struct.variableName)
        )
      ]) : undefined
    ),
    ts.createLiteral(
      `${libraryName}/${options.libraryDirectory ? options.libraryDirectory + '/' : '' }${importName}`
    )
  )

  astNodes.push(scriptNode)

  if (options.style) {
    const { style } = options
    const styleNode = ts.createImportDeclaration(
      undefined,
      undefined,
      undefined,
      ts.createLiteral(
        `${libraryName}/lib/${importName}/style/index.${ style === 'css' ? style : 'js' }`
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
  camel2DashComponentName: true
}

export function createTransformer(_options: Partial<Options> = { }) {
  const options = { ...defaultOptions, ..._options }

  const { libraryName } = options

  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visitor: ts.Visitor = (node) => {

      if (node.kind === ts.SyntaxKind.SourceFile) {
        return ts.visitEachChild(node, visitor, context)
      }

      if (node.kind !== ts.SyntaxKind.ImportDeclaration) {
        return node
      }

      const importedLibName = getImportedLibName(node)

      if (importedLibName !== `'${ libraryName }'`) {
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
