# @ivanmaxlogiudice/gitignore

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

> Parse .gitignore files into an array of patterns.

[Documentation](https://jsr.io/@ivanmaxlogiudice/gitignore/doc)

## Features

- **Parse .gitignore content**: Extracts patterns from the content of a `.gitignore` file.
- **Parse .gitignore file**: Reads and extracts patterns from a `.gitignore` file at a given path.
- **Dedupe patterns**: Removes duplicate patterns.
- **Convert patterns**: Converts `.gitignore` patterns to minimatch patterns or regular expressions.
- **Flat configuration**: Converts an array of patterns to a flat configuration object.
- **Pattern matching**: Tests if a pattern is ignored based on accept and ignore regular expressions.

## Usage

```bash
bun i -D @ivanmaxlogiudice/gitignore
```

### Parsing `.gitignore` content
```js
import fs from 'node:fs'
import { parse } from '@ivanmaxlogiudice/gitignore'

const patterns = parse(fs.readFileSync('.gitignore', 'utf-8'))
console.log(patterns) // [ "node_modules", "dist" ]
```

### Parsing `.gitignore` file
```js
import { parsePath } from '@ivanmaxlogiudice/gitignore'

const patterns = parsePath('.gitignore')
console.log(patterns) // [ "node_modules", "dist" ]
```

### Deduping Patterns
```js
import { dedupe } from '@ivanmaxlogiudice/gitignore'

const patterns = ['node_modules', 'node_modules', 'dist']
const uniquePatterns = dedupe(patterns)
console.log(uniquePatterns) // ['node_modules', 'dist']
```

### Converting Patterns to Minimatch
```js
import { toFlatConfig } from '@ivanmaxlogiudice/gitignore'

const patterns = ['node_modules', 'dist']
const flatConfig = toFlatConfig(patterns, { name: 'ignore-files' })
console.log(flatConfig) // { name: 'ignore-files', ignores: ['**/node_modules', '**/dist'] }
```

### Check if ignored
```js
import { ignore, toRegex } from '@ivanmaxlogiudice/gitignore'

const patterns = ['.abc/*', '!.abc/d/']
const regex = toRegex(patterns)

console.log(ignore(regex, '.abc/a.js')) // true
console.log(ignore(regex, '.abc/d/e.js')) // false
```

## License

[MIT](./LICENSE) License © 2022-PRESENT [Iván Máximiliano, Lo Giudice](https://github.com/ivanmaxlogiudice)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@ivanmaxlogiudice/gitignore?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@ivanmaxlogiudice/gitignore
[npm-downloads-src]: https://img.shields.io/npm/dm/@ivanmaxlogiudice/gitignore?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@ivanmaxlogiudice/gitignore
[bundle-src]: https://img.shields.io/bundlephobia/minzip/@ivanmaxlogiudice/gitignore?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=@ivanmaxlogiudice/gitignore
[license-src]: https://img.shields.io/github/license/ivanmaxlogiudice/gitignore.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/ivanmaxlogiudice/gitignore/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/@ivanmaxlogiudice/gitignore
