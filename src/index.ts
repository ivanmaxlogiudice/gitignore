import fs from 'node:fs'

interface ParseOptions {
    /**
     * Whether to remove duplicate patterns.
     *
     * @default true
     */
    dedupe?: boolean
}

interface ParsePathOptions extends ParseOptions {
    /**
     * Whether to throw an error if the file path is invalid.
     */
    strict?: boolean
}

interface ParseFlatOptions {
    /**
     * Name of the configuration.
     *
     * @default 'gitignore'
     */
    name?: string
}

interface ParsePatternsRegex {
    accepts: RegExp
    ignores: RegExp
}

/**
 * Parses the given content of a .gitignore file and extracts the patterns.
 *
 * @param {string} content - The content of the .gitignore file.
 * @param {ParseOptions} [options] - Options for parsing.
 *
 * @returns {string[]} An array of patterns extracted from the .gitignore file.
 */
export function parse(content: string, options: ParseOptions = {}): string[] {
    const patterns = []
    const lines = content.split(/\r?\n/)

    for (const line of lines) {
        const value = line.trim()

        if (value && !value.startsWith('#'))
            patterns.push(value)
    }

    if (options.dedupe ?? true)
        return dedupe(patterns)

    return patterns
}

/**
 * Reads the contents of the given gitignore filepath and extracts the patterns.
 *
 * @param {string} filepath - The path to the .gitignore file.
 * @param {ParsePathOptions} [options] - Options for parsing the file.
 *
 * @returns {string[]} An array of patterns extracted from given file.
 *
 * @throws Will throw an error if the file path is invalid and `strict` is true.
 */
export function parsePath(filepath: string, options: ParsePathOptions = {}): string[] {
    const { strict = true } = options

    if (!fs.existsSync(filepath)) {
        if (strict)
            throw new Error(`"${filepath}": invalid file path.`)

        return []
    }

    return parse(fs.readFileSync(filepath, 'utf-8'), options)
}

/**
 * Removes duplicate patterns from the array.
 *
 * @param {string[]} patterns - The array of patterns to dedupe.
 *
 * @returns {string[]} An array of unique patterns.
 */
export function dedupe(patterns: string[]): string[] {
    return [...new Set(patterns)]
}

/**
 * Converts a .gitignore pattern to a minimatch pattern.
 *
 * @param {string} pattern - The .gitignore pattern to convert.
 * @returns {string} The converted minimatch pattern.
 */
export function convertIgnorePatternToMinimatch(pattern: string): string {
    const isNegated = pattern.startsWith('!')
    const negatedPrefix = isNegated ? '!' : ''
    const patternToTest = (isNegated ? pattern.slice(1) : pattern).trimEnd()

    // Special cases
    if (['', '**', '/**', '**/'].includes(patternToTest))
        return `${negatedPrefix}${patternToTest}`

    const firstIndexOfSlash = patternToTest.indexOf('/')

    const matchEverywherePrefix = firstIndexOfSlash < 0 || firstIndexOfSlash === patternToTest.length - 1 ? '**/' : ''
    const patternWithoutLeadingSlash = firstIndexOfSlash === 0 ? patternToTest.slice(1) : patternToTest

    /*
     * Escape `{` and `(` because in gitignore patterns they are just
     * literal characters without any specific syntactic meaning,
     * while in minimatch patterns they can form brace expansion or extglob syntax.
     *
     * For example, gitignore pattern `src/{a,b}.js` ignores file `src/{a,b}.js`.
     * But, the same minimatch pattern `src/{a,b}.js` ignores files `src/a.js` and `src/b.js`.
     * Minimatch pattern `src/\{a,b}.js` is equivalent to gitignore pattern `src/{a,b}.js`.
     */
    const escapedPatternWithoutLeadingSlash = patternWithoutLeadingSlash.replaceAll(
        /(?=((?:\\.|[^{(])*))\1([{(])/guy,
        '$1\\$2',
    )

    const matchInsideSuffix = patternToTest.endsWith('/**') ? '/*' : ''

    return `${negatedPrefix}${matchEverywherePrefix}${escapedPatternWithoutLeadingSlash}${matchInsideSuffix}`
}

/**
 * Converts an array of .gitignore patterns to a flat configuration object.
 *
 * @param {string[]} patterns - The array of .gitignore patterns to convert.
 * @param {ParseFlatOptions} [options] - Options for the flat configuration.
 *
 * @returns {{ name: string, ignores: string[] }} The flat configuration object.
 */
export function toFlatConfig(patterns: string[], options: ParseFlatOptions = {}): { name: string, ignores: string[] } {
    const { name = 'gitignore' } = options

    const ignores = patterns.map(pattern => convertIgnorePatternToMinimatch(pattern))

    return {
        name,
        ignores,
    }
}

/**
 * Converts an array of patterns into regular expressions for matching.
 * Patterns starting with '!' are treated as accept patterns, while others are ignore patterns.
 *
 * @param {string[]} patterns - The array of patterns to convert.
 *
 * @returns {ParsePatternsRegex} An object containing the compiled accept and ignore regular expressions.
 */
export function toRegex(patterns: string[]): ParsePatternsRegex {
    const accepts = []
    const ignores = []

    for (let pattern of patterns) {
        const withExclamation = pattern.startsWith('!')

        if (withExclamation)
            pattern = pattern.slice(1)

        if (pattern.startsWith('/'))
            pattern = pattern.slice(1)

        if (withExclamation)
            accepts.push(pattern)
        else
            ignores.push(pattern)
    }

    return {
        accepts: accepts.length > 0 ? new RegExp(`^(${accepts.map(pattern => prepareRegexPattern(pattern)).join(')|(')})`) : /$^/,
        ignores: ignores.length > 0 ? new RegExp(`^(${ignores.map(pattern => prepareRegexPattern(pattern)).join(')|(')})`) : /$^/,
    }
}

/**
 * Tests if a pattern is ignored based on the provided accept and ignore regular expressions.
 *
 * @param {ParsePatternsRegex} regex - The compiled accept and ignore regular expressions.
 * @param {string} pattern - The pattern to test.
 *
 * @returns {boolean} True if the pattern is ignored, false otherwise.
 */
export function ignore({ accepts, ignores }: ParsePatternsRegex, pattern: string): boolean {
    const value = pattern.startsWith('/') ? pattern.slice(1) : pattern

    return ignores.test(value) && !accepts.test(value)
}

/**
 * Converts a given pattern into a regular expression string.
 *
 * The conversion includes:
 * - Escaping special regex characters.
 * - Replacing '**' with '(.+)' to match any sequence of characters including directory separators.
 * - Replacing '*' with '([^\\/]+)' to match any sequence of characters except directory separators.
 *
 * @param {string} pattern - The pattern to convert.
 *
 * @returns {string} The converted regex pattern.
 */
function prepareRegexPattern(pattern: string): string {
    return pattern
        .replaceAll(/[$()+./?[\\\]^{|}\-]/g, '\\$&')
        .replace('**', '(.+)')
        .replace('*', '([^\\/]+)')
}
