const fs = require('fs')
const path = require('path')

const tscContent = fs.readFileSync(require.resolve('typescript/lib/tsc.js'), 'utf8')

const snippet = `#!/usr/bin/env node



`

fs.writeFileSync(path.join(__dirname, 'bin', 'ttsc'), snippet + tscContent)
