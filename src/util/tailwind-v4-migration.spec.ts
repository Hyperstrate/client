import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (path.includes('node_modules') || path.includes('dist')) return []
    if (statSync(path).isDirectory()) return sourceFiles(path)
    if (!/\.(css|ts|vue)$/.test(path)) return []
    if (path.endsWith('tailwind-v4-migration.spec.ts')) return []
    return [path]
  })
}

function tokenPattern(token: string): RegExp {
  return new RegExp(`(^|[\\s'"\\\`:[\\]])${token.replaceAll('-', '\\-')}($|[\\s'"\\\`\\]])`)
}

describe('Tailwind v4 migration', () => {
  it('does not keep v3 utility names that Tailwind v4 renamed', () => {
    const renamedUtilities = ['shadow' + '-sm', 'drop-shadow' + '-sm', 'backdrop-blur' + '-sm', 'rounded' + '-sm', 'outline' + '-none']
    const offenders = sourceFiles(join(root, 'src')).flatMap((file) => {
      const source = readFileSync(file, 'utf8')
      return renamedUtilities.filter((utility) => tokenPattern(utility).test(source)).map((utility) => `${relative(root, file)} uses ${utility}`)
    })

    expect(offenders).toEqual([])
  })

  it('keeps the AppView scenario dot as a non-shrinking square', () => {
    const source = readFileSync(join(root, 'src/features/app-home/views/app/AppView.vue'), 'utf8')
    const match = source.match(/v-if="i === currentScenarioIdx" class="([^"]+)"/)

    expect(match?.[1]).toContain('shrink-0')
    expect(match?.[1]).toContain('size-1.5')
  })

  it('uses the Tailwind v4 Vite setup without stale PostCSS scaffolding', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
      devDependencies?: Record<string, string>
    }
    const readme = readFileSync(join(root, 'README.md'), 'utf8')

    expect(pkg.devDependencies?.tailwindcss).toMatch(/^\^4\./)
    expect(pkg.devDependencies).not.toHaveProperty('@tailwindcss/postcss')
    expect(existsSync(join(root, 'postcss.config.cjs'))).toBe(false)
    expect(readme).toContain('Tailwind CSS](https://tailwindcss.com) 4')
  })
})
