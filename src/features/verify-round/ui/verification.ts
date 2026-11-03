import { useEffect, useState } from 'react'
import { sha256, verifyRound, type Difficulty } from '@/shared/game-rules'
import type { useT } from '@/shared/i18n'

export interface Verification {
  /** SHA-256 of the Server Seed, to compare with the hash committed before the Round. */
  hash: string
  hitLane: number | null
}

/**
 * Recomputes a Round from its seeds in the browser; null while a value is missing or the result
 * for these exact values isn't ready yet.
 */
export function useVerification(
  serverSeed: string | null,
  clientSeed: string | null,
  nonce: number | null,
  difficulty: Difficulty,
): Verification | null {
  const key = JSON.stringify([serverSeed, clientSeed, nonce, difficulty])
  const [result, setResult] = useState<{ key: string; value: Verification } | null>(null)
  useEffect(() => {
    if (serverSeed === null || clientSeed === null || nonce === null) return
    let live = true
    void Promise.all([
      sha256(serverSeed),
      verifyRound(serverSeed, clientSeed, nonce, difficulty),
    ]).then(([hash, hitLane]) => live && setResult({ key, value: { hash, hitLane } }))
    return () => {
      live = false
    }
  }, [key, serverSeed, clientSeed, nonce, difficulty])
  return result?.key === key ? result.value : null
}

/** "Recomputed: Hit on Lane 4" or "Recomputed: no Hit on any Lane". */
export const recomputedText = (t: ReturnType<typeof useT>, hitLane: number | null) =>
  t('recomputed', { result: hitLane === null ? t('noHit') : t('hitOnLane', { lane: hitLane }) })
