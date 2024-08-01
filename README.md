# @lg/gitignore

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

> Parse .gitignore files into an array of patterns.

## Features

- **Parse .gitignore content**: Extracts patterns from the content of a `.gitignore` file.
- **Parse .gitignore file**: Reads and extracts patterns from a `.gitignore` file at a given path.
- **Dedupe patterns**: Removes duplicate patterns.
- **Convert patterns**: Converts `.gitignore` patterns to minimatch patterns or regular expressions.
- **Flat configuration**: Converts an array of patterns to a flat configuration object.
- **Pattern matching**: Tests if a pattern is ignored based on accept and ignore regular expressions.

## Usage

```bash
bun i -D @lg/gitignore
```

### Parsing `.gitignore` content
```js
import fs from 'node:fs'
import { parse } from '@lg/gitignore'

const patterns = parse(fs.readFileSync('.gitignore', 'utf-8'))
console.log(patterns) // [ "node_modules", "dist" ]
```

### Parsing `.gitignore` file
```js
import { parsePath } from '@lg/gitignore'

const patterns = parsePath('.gitignore')
console.log(patterns) // [ "node_modules", "dist" ]
```

### Deduping Patterns
```js
import { dedupe } from '@lg/gitignore'

const patterns = ['node_modules', 'node_modules', 'dist']
const uniquePatterns = dedupe(patterns)
console.log(uniquePatterns) // ['node_modules', 'dist']
```

### Converting Patterns to Minimatch
```js
import { toFlatConfig } from '@lg/gitignore'

const patterns = ['node_modules', 'dist']
const flatConfig = toFlatConfig(patterns, { name: 'ignore-files' })
console.log(flatConfig) // { name: 'ignore-files', ignores: ['**/node_modules', '**/dist'] }
```

### Check if ignored
```js
import { ignore, toRegex } from '@lg/gitignore'

const patterns = ['.abc/*', '!.abc/d/']
const regex = toRegex(patterns)

console.log(ignore(regex, '.abc/a.js')) // true
console.log(ignore(regex, '.abc/d/e.js')) // false
```

## API

### `parse(content: string, options?: ParseOptions): string[]`

Parses the given content of a `.gitignore` file and extracts the patterns.

- **content**: The content of the `.gitignore` file.
- **options**: Options for parsing.
  - **dedupe**: Whether to remove duplicate patterns.

### `parsePath(filepath: string, options?: ParsePathOptions): string[]`

Reads the contents of the given gitignore filepath and extracts the patterns.

- **filepath**: The path to the `.gitignore` file.
- **options**: Options for parsing the file.
  - **dedupe**: Whether to remove duplicate patterns.
  - **strict**: Whether to throw an error if the file path is invalid.

### `dedupe(patterns: string[]): string[]`

Removes duplicate patterns from the array.

- **patterns**: The array of patterns to dedupe.

### `convertIgnorePatternToMinimatch(pattern: string): string`

Converts a `.gitignore` pattern to a minimatch pattern.

- **pattern**: The `.gitignore` pattern to convert.

### `toFlatConfig(patterns: string[], options?: ParseFlatOptions): { name: string, ignores: string[] }`

Converts an array of `.gitignore` patterns to a flat configuration object.

- **patterns**: The array of `.gitignore` patterns to convert.
- **options**: Options for the flat configuration.
  - **name**: Name of the configuration.

### `toRegex(patterns: string[]): ParsePatternsRegex`

Converts an array of patterns into regular expressions for matching.

- **patterns**: The array of patterns to convert.

### `ignore(regex: ParsePatternsRegex, pattern: string): boolean`

Tests if a pattern is ignored based on the provided accept and ignore regular expressions.

- **regex**: The compiled accept and ignore regular expressions.
- **pattern**: The pattern to test.

## License

[MIT](./LICENSE) License © 2022-PRESENT [Iván Máximiliano, Lo Giudice](https://github.com/ivanmaxlogiudice)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@lg/gitignore?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@lg/gitignore
[npm-downloads-src]: https://img.shields.io/npm/dm/@lg/gitignore?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@lg/gitignore
[bundle-src]: https://img.shields.io/bundlephobia/minzip/@lg/gitignore?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=@lg/gitignore
[license-src]: https://img.shields.io/github/license/antfu/@lg/gitignore.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/antfu/@lg/gitignore/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/@lg/gitignore
