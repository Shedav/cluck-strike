import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { BURN_MS, STEP_MS, THROW_MS } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { PixelSprite } from '@/shared/ui'
import { FADE, LANE_PX } from '../config'
import { BURN } from '../pixel/burn'
import { FIRE, GRENADE, SMOKE } from '../pixel/props'
import styles from './Road.module.css'

// What a Step shows on its Lane besides the chicken: the throw, then Smoke or the burn.

/** A Hit: the chicken lands in the Lane's fire and burns down to a pile of bones that stays there. */
export function Burn() {
  const t = useT()
  const [lit, setLit] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setLit(true), STEP_MS)
    return () => clearTimeout(timer)
  }, [])
  // Until the chicken lands, the Lane's fire keeps burning as on any Lane ahead.
  if (!lit) return <LaneFire />
  return (
    <PixelSprite
      className={styles.burn}
      frames={BURN}
      ms={BURN_MS}
      width={96}
      alt={t('roastedChicken')}
    />
  )
}

/** The smoke grenade arcs from the chicken's Lane: onto this Lane's fire, or past it on a Hit. */
export function Grenade({ miss }: { miss: boolean }) {
  return (
    <motion.div
      className={styles.grenade}
      initial={{ x: -LANE_PX, y: -40, rotate: 0, opacity: 0 }}
      animate={{
        x: [-LANE_PX, miss ? LANE_PX * 0.2 : -LANE_PX / 2, miss ? LANE_PX * 1.1 : 0],
        y: [-40, -150, miss ? -20 : 0],
        rotate: [0, 270, 540],
        // Hidden while the chicken's wind-up frame still holds the grenade (the first of three).
        opacity: [0, 0, 1, 1, 0],
      }}
      transition={{
        duration: THROW_MS / 1000,
        ease: 'easeIn',
        times: [0, 0.5, 1],
        opacity: { duration: THROW_MS / 1000, times: [0, 0.33, 0.34, 0.5, 1] },
      }}
    >
      <PixelSprite frames={GRENADE} ms={0} width={24} />
    </motion.div>
  )
}

/** A safe Step: the Lane's fire dies as the grenade lands... */
export function DousedFire() {
  return (
    <motion.div
      className={styles.doused}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 0, scale: 0.4 }}
      transition={{ delay: THROW_MS / 1000, ...FADE }}
    >
      <LaneFire />
    </motion.div>
  )
}

/** ...and a Smoke cloud bursts out, billows and drifts away. */
export function SmokePuff() {
  return (
    <motion.div
      className={styles.smoke}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0], y: [0, -10, -20, -40] }}
      transition={{ duration: SMOKE_MS / 1000, times: [0, 0.1, 0.7, 1], delay: THROW_MS / 1000 }}
    >
      <PixelSprite frames={SMOKE} ms={SMOKE_MS} delay={THROW_MS} width={120} />
    </motion.div>
  )
}

const FIRE_MS = 600
const SMOKE_MS = 1200

/** The fire burning on a Lane ahead of the chicken. */
export function LaneFire({ className }: { className?: string }) {
  return <PixelSprite className={className} frames={FIRE} ms={FIRE_MS} loop width={64} />
}
