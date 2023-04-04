import * as ts from 'typescript'
import { join as pathJoin, sep } from 'path'

export interface Options {
  libraryName?: string
  style?: boolean | 'css' | 'css.web' | string | ((name: string) => string | false)
  libraryDirectory?: ((name: string) => string) | string
  libraryOverride?: boolean
  camel2DashComponentName?: boolean
  camel2UnderlineComponentName?: boolean
  transformToDefaultImport?: boolean
  resolveContext?: string[]
  failIfNotFound?: boolean
}

export interface ImportedStruct {
  importName: string
  variableName?: string
}

function join(...params: string[]) {
  /* istanbul ignore if  */
  if (sep === '\\') {
    const ret = pathJoin(...params)
    return ret.replace(/\\/g, '/')
  }
  /* istanbul ignore next  */
  return pathJoin(...params)
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
  node.forEachChild((importChild) => {
    if (!ts.isImportClause(importChild)) {
      return
    }

    // not allow default import, or mixed default and named import
    // e.g. import foo from 'bar'
    // e.g. import foo, { bar as baz } from 'x'
    // and must namedBindings exist
    if (importChild.name || !importChild.namedBindings) {
      return
    }

    // not allow namespace import
    // e.g. import * as _ from 'lodash'
    if (!ts.isNamedImports(importChild.namedBindings)) {
      return
    }

    importChild.namedBindings.forEachChild((namedBinding) => {
      // ts.NamedImports.elements will always be ts.ImportSpecifier
      const importSpecifier = <ts.ImportSpecifier>namedBinding

      // import { foo } from 'bar'
      if (!importSpecifier.propertyName) {
        structs.add({ importName: importSpecifier.name.text })
        return
      }

      // import { foo as bar } from 'baz'
      structs.add({
        importName: importSpecifier.propertyName.text,
        variableName: importSpecifier.name.text,
      })
    })
  })
  return structs
}

function createDistAst(context: ts.TransformationContext, struct: ImportedStruct, options: Options) {
  const astNodes: ts.Node[] = []

  const { libraryName, libraryOverride } = options
  const _importName = struct.importName
  const importName = options.camel2UnderlineComponentName
    ? camel2Underline(_importName)
    : options.camel2DashComponentName
    ? camel2Dash(_importName)
    : _importName

  const libraryDirectory =
    typeof options.libraryDirectory === 'function'
      ? options.libraryDirectory(_importName)
      : join(options.libraryDirectory || '', importName)

  /* istanbul ignore next  */
  if (process.env.NODE_ENV !== 'production' && libraryDirectory == null) {
    console.warn(`custom libraryDirectory resolve a ${libraryDirectory} path`)
  }

  const importPath = !libraryOverride ? join(libraryName!, libraryDirectory) : libraryDirectory

  let canResolveImportPath = true

  try {
    require.resolve(importPath, {
      paths: [process.cwd(), ...options.resolveContext!],
    })
  } catch (e) {
    canResolveImportPath = false
    if (options.failIfNotFound) {
      throw new Error(`Can not find component for library: ${options.libraryName} in ${importPath}`)
    }

    astNodes.push(
      context.factory.createImportDeclaration(
        undefined,
        context.factory.createImportClause(
          false,
          undefined,
          context.factory.createNamedImports([
            context.factory.createImportSpecifier(false, undefined, context.factory.createIdentifier(_importName)),
          ]),
        ),
        context.factory.createStringLiteral(libraryName!),
      ),
    )
  }

  if (canResolveImportPath) {
    const scriptNode = context.factory.createImportDeclaration(
      undefined,
      context.factory.createImportClause(
        false,
        struct.variableName || !options.transformToDefaultImport
          ? undefined
          : context.factory.createIdentifier(struct.importName),
        struct.variableName
          ? context.factory.createNamedImports([
              context.factory.createImportSpecifier(
                false,
                options.transformToDefaultImport
                  ? context.factory.createIdentifier('default')
                  : context.factory.createIdentifier(struct.importName),
                context.factory.createIdentifier(struct.variableName),
              ),
            ])
          : options.transformToDefaultImport
          ? undefined
          : context.factory.createNamedImports([
              context.factory.createImportSpecifier(
                false,
                undefined,
                context.factory.createIdentifier(struct.importName),
              ),
            ]),
      ),
      context.factory.createStringLiteral(importPath),
    )

    astNodes.push(scriptNode)

    if (options.style) {
      const { style } = options
      let stylePath: string | boolean
      if (typeof style === 'function') {
        stylePath = style(importPath)
      } else {
        // eslint-disable-next-line no-restricted-syntax
        stylePath = `${importPath}/style/${style === true ? 'index' : style}.js`
      }

      if (stylePath) {
        const styleNode = context.factory.createImportDeclaration(
          undefined,
          undefined,
          context.factory.createStringLiteral(stylePath),
        )
        astNodes.push(styleNode)
      }
    }
  }

  return astNodes
}

const defaultOptions: Required<Options> = {
  libraryName: 'antd',
  libraryDirectory: 'lib',
  style: false,
  camel2DashComponentName: true,
  camel2UnderlineComponentName: false,
  transformToDefaultImport: true,
  resolveContext: [],
  libraryOverride: false,
  failIfNotFound: false,
}

export function createTransformer(_options: Partial<Options> | Array<Partial<Options>> = {}) {
  const mergeDefault = (options: Partial<Options>) => ({ ...defaultOptions, ...options })
  const optionsArray: Options[] = Array.isArray(_options)
    ? _options.map((options) => mergeDefault(options))
    : [mergeDefault(_options)]

  return (context: ts.TransformationContext) => {
    const visitor: ts.Visitor = (node) => {
      if (ts.isSourceFile(node)) {
        return ts.visitEachChild(node, visitor, context)
      }

      if (!ts.isImportDeclaration(node)) {
        return node
      }

      const importedLibName = (<ts.StringLiteral>node.moduleSpecifier).text

      const options = optionsArray.find((_) => _.libraryName === importedLibName)

      if (!options) {
        return node
      }

      const structs = getImportedStructs(node)
      if (structs.size === 0) {
        return node
      }

      return Array.from(structs).reduce((acc, struct) => {
        const nodes = createDistAst(context, struct, options)
        return acc.concat(nodes)
      }, <ts.Node[]>[])
    }

    return (node: ts.Node) => ts.visitNode(node, visitor)
  }
}

export default createTransformer
