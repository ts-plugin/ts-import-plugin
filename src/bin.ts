const ts = new Proxy(
  {},
  {
    set(obj, prop, value) {
      if (prop === 'sys') {
        value.getExecutingFilePath = function getExecutingFilePath() {
          return require.resolve('typescript/lib/tsc.js')
        }
      }
      return Reflect.set(obj, prop, value)
    },
  },
)
