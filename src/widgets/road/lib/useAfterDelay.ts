import { useEffect, useState } from 'react'
import { RESULT_MS } from '@/shared/config'

/** True once `active` has held for `ms` within the Round identified by `nonce`. */
export function useAfterDelay(active: boolean, nonce: number | null, ms = RESULT_MS) {
  const [doneFor, setDoneFor] = useState<number | null>(null)
  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setDoneFor(nonce), ms)
    return () => clearTimeout(timer)
  }, [active, nonce, ms])
  return active && doneFor === nonce
}
