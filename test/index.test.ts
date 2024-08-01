import { describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import { convertIgnorePatternToMinimatch, ignore, parse, parsePath, toFlatConfig, toRegex } from '../src'

function fileFixture(name: string) {
    return path.join(__dirname, 'fixtures', `${name}.txt`)
}

function fixture(name: string) {
    return fs.readFileSync(fileFixture(name), 'utf-8')
}

describe('gitignore parser', () => {
    describe('parse', () => {
        it('should parse a gitignore content and return an array', () => {
            expect(parse(fixture('gitignore'))).toEqual([
                'logs',
                '*.log',
                'npm-debug.log',
                'yarn-debug.log',
                'yarn-error.log',
                'pids',
                '*.pid',
                '*.seed',
                '*.pid.lock',
            ])
        })

        it('should dedupe patterns', () => {
            expect(parse(fixture('gitignore_dupe'), { dedupe: true })).toEqual([
                'logs',
                '*.log',
                'npm-debug.log',
                'yarn-debug.log',
                'yarn-error.log',
                'pids',
                '*.pid',
                '*.seed',
                '*.pid.lock',
            ])
        })
    })

    describe('parsePath', () => {
        it('should parse a gitignore file and return an array', () => {
            expect(parsePath(fileFixture('gitignore'))).toEqual([
                'logs',
                '*.log',
                'npm-debug.log',
                'yarn-debug.log',
                'yarn-error.log',
                'pids',
                '*.pid',
                '*.seed',
                '*.pid.lock',
            ])
        })

        it('should throw an error on invalid file path', () => {
            expect(() => parsePath('invalid-filepath')).toThrowError('invalid file')
        })

        it('should return an empty array on invalid file path', () => {
            expect(parsePath('invalid-path', { strict: false })).toEqual([])
        })
    })

    describe('convertIgnorePatternToMinimatch', () => {
        const tests: [string, string][] = [
            ['', ''],
            ['**', '**'],
            ['/**', '/**'],
            ['**/', '**/'],
            ['src/', '**/src/'],
            ['src', '**/src'],
            ['src/**', 'src/**/*'],
            ['!src/', '!**/src/'],
            ['!src', '!**/src'],
            ['!src/**', '!src/**/*'],
            ['*/foo.js', '*/foo.js'],
            ['*/foo.js/', '*/foo.js/'],
            ['src/{a,b}.js', 'src/\\{a,b}.js'],
            ['src/?(a)b.js', 'src/?\\(a)b.js'],
            ['{.js', '**/\\{.js'],
            ['(.js', '**/\\(.js'],
            ['(.js', '**/\\(.js'],
            ['{(.js', '**/\\{\\(.js'],
            ['{bar}/{baz}', '\\{bar}/\\{baz}'],
            ['\\[foo]/{bar}/{baz}', '\\[foo]/\\{bar}/\\{baz}'],
            ['src/\\{a}', 'src/\\{a}'],
            ['src/\\(a)', 'src/\\(a)'],
            ['src/\\{a}/{b}', 'src/\\{a}/\\{b}'],
            ['src/\\(a)/(b)', 'src/\\(a)/\\(b)'],
            ['a\\bc{de(f\\gh\\{i\\(j{(', '**/a\\bc\\{de\\(f\\gh\\{i\\(j\\{\\('],
        ]

        for (const [pattern, expected] of tests) {
            it(`should convert "${pattern}" to "${expected}"`, () => {
                expect(convertIgnorePatternToMinimatch(pattern as string)).toBe(expected as string)
            })
        }
    })

    describe('toFlatConfig', () => {
        it('should return an object with an `ignores` property', () => {
            const patterns = parse(fixture('gitignore2'))

            expect(toFlatConfig(patterns)).toMatchObject({
                name: 'gitignore',
                ignores: [
                    '**/node_modules',
                    '**/fixtures',
                    '!fixtures/node_modules',
                    'dist',
                    '**/*.log',
                    '**/.cache/',
                    '.vuepress/dist',
                    '*/foo.js',
                    'dir/**/*',
                ],
            })
        })
    })

    describe('toRegex', () => {
        const patterns = parse(fixture('gitignore2'))

        expect(toRegex(patterns)).toMatchObject({
            accepts: /^((\/fixtures\/node_modules))/,
            ignores:
                /^((node_modules)|(\/dist)|(([^/]+)\.log)|(\.cache\/)|(\.vuepress\/dist)|(([^/]+)\/foo\.js)|(dir\/(.+)))/,
        })
    })

    describe('ignore', () => {
        const gitignore2 = toRegex(parse(fixture('gitignore2')))
        const gitignore3 = toRegex(parse(fixture('gitignore3')))

        it('should not ignore the given filenames', () => {
            expect(ignore(gitignore2, 'src/index.ts')).toBeFalse()
            expect(ignore(gitignore2, 'tsconfig.json')).toBeFalse()
            expect(ignore(gitignore2, '/fixtures/node_modules')).toBeFalse()
        })

        it('should ignores the given filenames', () => {
            expect(ignore(gitignore2, '/dist')).toBeTrue()

            expect(ignore(gitignore3, 'node_modules')).toBeTrue()
            expect(ignore(gitignore3, 'dist')).not.toBeTrue()
        })

        it('should not ignore a subfolder in a ignored folder', () => {
            expect(ignore(gitignore2, 'fixtures')).toBeTrue()
            expect(ignore(gitignore2, 'fixtures/test.ts')).toBeTrue()

            expect(ignore(gitignore2, '/fixtures/node_modules')).toBeFalse()
            expect(ignore(gitignore2, 'fixtures/node_modules')).toBeFalse()
        })
    })
})
