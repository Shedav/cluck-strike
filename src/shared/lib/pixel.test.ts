import { describe, expect, it } from 'vitest'
import { overlay, spriteSheet } from './pixel'

const svgOf = (url: string) => decodeURIComponent(url.replace('data:image/svg+xml,', ''))

describe('spriteSheet', () => {
  it('lays frames side by side and merges runs of one colour into a rect', () => {
    const svg = svgOf(
      spriteSheet(
        [
          ['kk.', '.r.'],
          ['...', 'k..'],
        ],
        { k: '#000', r: '#f00' },
      ),
    )
    expect(svg).toContain('viewBox="0 0 6 2"')
    expect(svg.match(/<rect /g)).toHaveLength(3)
    expect(svg).toContain('<rect x="0" y="0" width="2" height="1" fill="#000"/>')
    expect(svg).toContain('<rect x="1" y="1" width="1" height="1" fill="#f00"/>')
    expect(svg).toContain('<rect x="3" y="1" width="1" height="1" fill="#000"/>')
  })

  it('rejects a frame of the wrong size', () => {
    expect(() => spriteSheet([['kk'], ['k']])).toThrow('Frame 1 is not 2x1')
  })
})

describe('overlay', () => {
  it('draws the top frame over the base where it is not transparent', () => {
    expect(overlay(['kk', 'ww'], ['.r', 'o.'])).toEqual(['kr', 'ow'])
  })
})
