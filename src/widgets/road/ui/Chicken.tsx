import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { HOP_MS, STEP_MS, THROW_MS } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { PixelSprite } from '@/shared/ui'
import { FADE } from '../config'
import { CHICKEN } from '../pixel/chicken'
import styles from './Road.module.css'

export type Move = { kind: 'step'; distance: number } | { kind: 'reset' } | { kind: 'stay' }

/**
 * The chicken is drawn in its own cell. On a Step it starts where the previous cell was and hops
 * over once its grenade has landed; on a reset (win or Hit) the old one fades out and this one
 * fades in at the start. A burning chicken vanishes as it lands, where the burn takes over.
 */
export function Chicken({ move, burning }: { move: Move; burning: boolean }) {
  const t = useT()
  const hop = { delay: THROW_MS / 1000, duration: HOP_MS / 1000, ease: 'easeOut' } as const
  // On a Step the chicken throws, then hops, then idles; otherwise it just idles.
  const [pose, setPose] = useState<keyof typeof CHICKEN>(move.kind === 'step' ? 'throw' : 'idle')
  useEffect(() => {
    if (move.kind !== 'step') return
    const hopping = setTimeout(() => setPose('hop'), THROW_MS)
    const idling = setTimeout(() => setPose('idle'), STEP_MS)
    return () => {
      clearTimeout(hopping)
      clearTimeout(idling)
    }
  }, [move.kind])
  return (
    <motion.div
      className={styles.chicken}
      custom={move}
      variants={{
        // The leaving chicken vanishes at once on a Step (the new one takes its place) and fades on
        // a reset.
        leave: (m: Move) => ({
          opacity: 0,
          transition: m.kind === 'reset' ? FADE : { duration: 0 },
        }),
      }}
      exit="leave"
      initial={
        move.kind === 'step'
          ? { x: -move.distance, y: 0, opacity: 1 }
          : { x: 0, y: 0, opacity: move.kind === 'reset' ? 0 : 1 }
      }
      animate={{
        x: 0,
        y: move.kind === 'step' ? [0, -44, 0] : 0,
        opacity: burning ? 0 : 1,
      }}
      transition={{
        x: hop,
        y: hop,
        opacity: burning
          ? { delay: STEP_MS / 1000, duration: 0 }
          : move.kind === 'reset'
            ? { ...FADE, delay: FADE.duration }
            : FADE,
      }}
    >
      <PixelSprite
        key={pose}
        frames={CHICKEN[pose]}
        ms={POSE_MS[pose]}
        loop={pose === 'idle'}
        width={96}
        alt={t('chicken')}
      />
    </motion.div>
  )
}

const POSE_MS = { idle: 900, throw: THROW_MS, hop: HOP_MS }
