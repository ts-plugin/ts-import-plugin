import typescript from 'rollup-plugin-typescript2'
import createTransformer from './index'

const transformer = createTransformer({
  libraryDirectory: 'es',
  libraryName: 'antd',
  style: true,
})

export default {
  input: `./test/fixtures/index.tsx`,
  plugins: [
    typescript({
      clean: true,
      transformers: [
        () => ({
          before: transformer,
        }),
      ],
    }),
  ],
  output: [
    {
      file: `./dist/rollup.dist.js`,
      format: 'esm',
    },
  ],
}
