/** One frame: equal-length rows, one character per pixel; '.' (or any key missing from the palette) is transparent. */
export type Frame = readonly string[]

/** Pixel colours shared by every sprite, so they all read as one 8-bit set. */
export const PALETTE: Record<string, string> = {
  k: '#1b1426', // outline
  w: '#ffffff',
  g: '#c9c4d9', // feather shade
  r: '#ef4444',
  o: '#f59e0b',
  d: '#c2410c',
  s: '#cbd5e1', // grenade body
  v: '#7d2efa', // grenade band, cs2skin's violet
  m: '#6b7280', // grenade cap
  y: '#fde047', // flame core
  b: '#e7e5e4', // bone
  h: '#4a3226', // charred feathers
  c: '#2b1d16', // charred shade
  u: '#a16207', // gold shade
}

/** Draws `top` over `base`; the '.' pixels of `top` let `base` show through. */
export const overlay = (base: Frame, top: Frame): Frame =>
  base.map((row, y) => [...row].map((pixel, x) => (top[y][x] === '.' ? pixel : top[y][x])).join(''))

/**
 * Lays frames side by side into one SVG sprite sheet (a data URL). Each run of same-coloured
 * pixels in a row becomes one rect, and crispEdges keeps the pixels sharp at any scale.
 */
export function spriteSheet(frames: readonly Frame[], palette = PALETTE): string {
  const height = frames[0].length
  const width = frames[0][0].length
  let rects = ''
  frames.forEach((frame, f) => {
    if (frame.length !== height || frame.some((row) => row.length !== width)) {
      throw new Error(`Frame ${f} is not ${width}x${height}`)
    }
    frame.forEach((row, y) => {
      for (let x = 0; x < width;) {
        let end = x + 1
        while (row[end] === row[x]) end++
        const fill = palette[row[x]]
        if (fill)
          rects += `<rect x="${f * width + x}" y="${y}" width="${end - x}" height="1" fill="${fill}"/>`
        x = end
      }
    })
  })
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width * frames.length} ${height}" shape-rendering="crispEdges">${rects}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
