import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { expect, test } from 'vitest'

// Feature-Sliced Design (ADR 0002): a layer may import only from layers below it, and another
// slice only through its public index.ts.
const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']
const SLICED = new Set(['pages', 'widgets', 'features', 'entities'])
const SRC = resolve(import.meta.dirname, '..')

const sources = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
  .filter((f) => /\.tsx?$/.test(f))
  .map((f) => join(SRC, f))

/** layer and slice of a path inside src, e.g. ['widgets', 'road'] */
function locate(file: string) {
  const [layer, slice] = relative(SRC, file).split(/[\\/]/)
  return { layer, slice: SLICED.has(layer) ? slice : undefined }
}

function violations(file: string) {
  const from = locate(file)
  const found: string[] = []
  for (const [, spec] of readFileSync(file, 'utf8').matchAll(/from '([^']+)'/g)) {
    if (!spec.startsWith('@/') && !spec.startsWith('.')) continue // a package
    const target = spec.startsWith('@/') ? join(SRC, spec.slice(2)) : resolve(dirname(file), spec)
    const to = locate(target)
    const sameSlice = to.layer === from.layer && to.slice === from.slice
    if (sameSlice) continue
    if (LAYERS.indexOf(to.layer) <= LAYERS.indexOf(from.layer) && to.layer !== 'shared') {
      found.push(`${spec}: ${from.layer} may not import ${to.layer}`)
    } else if (to.slice && relative(SRC, target).split(/[\\/]/).length > 2) {
      found.push(`${spec}: import ${to.layer}/${to.slice} through its index.ts`)
    } else if (spec.startsWith('.')) {
      found.push(`${spec}: use '@/${relative(SRC, target)}' to cross a slice`)
    }
  }
  return found.map((v) => `${relative(SRC, file)} → ${v}`)
}

test('every file lives in a Feature-Sliced Design layer', () => {
  const stray = sources.map((f) => locate(f).layer).filter((l) => !LAYERS.includes(l))
  expect(stray).toEqual([])
})

test('imports respect layer order and slice public APIs', () => {
  expect(sources.flatMap(violations)).toEqual([])
})
