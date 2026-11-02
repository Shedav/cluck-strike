import { useMemo, type CSSProperties } from 'react'
import { spriteSheet, type Frame } from '@/shared/lib'
import styles from './PixelSprite.module.css'

type Props = {
  frames: readonly Frame[]
  /** How long all the frames take to play once. */
  ms: number
  loop?: boolean
  /** Rendered width; a whole multiple of the frame width keeps every pixel the same size. */
  width: number
  alt?: string
  className?: string
}

/**
 * Plays pixel frames as a sprite sheet stepped by CSS. A one-off animation stays on its last
 * frame; to replay it, remount the sprite (give it a new key). Reduced motion shows the first frame.
 */
export function PixelSprite({ frames, ms, loop = false, width, alt = '', className = '' }: Props) {
  const src = useMemo(() => spriteSheet(frames), [frames])
  const style = {
    width,
    aspectRatio: `${frames[0][0].length} / ${frames[0].length}`,
    '--frames': frames.length,
    '--ms': `${ms}ms`,
    '--iterations': loop ? 'infinite' : 1,
  } as CSSProperties
  return (
    <img
      className={`${frames.length > 1 ? styles.sprite : ''} ${className}`}
      src={src}
      alt={alt}
      style={style}
    />
  )
}
