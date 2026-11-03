import { isWin, useGame } from '@/entities/round'
import { useT } from '@/shared/i18n'
import { formatAmount, formatMultiplier } from '@/shared/lib'
import { CoinIcon } from '@/shared/ui'
import { useAfterDelay } from '../lib/useAfterDelay'
import styles from './Road.module.css'

/** Shows the Multiplier and payout of a won Round for a moment, then hides. */
export function WinPopup({ show }: { show: boolean }) {
  const round = useGame((s) => s.round)
  const hidden = useAfterDelay(show, round.nonce)

  const t = useT()
  if (!show || !isWin(round.phase) || hidden) return null
  const title = t(
    ({ cashedOut: 'youWin', finished: 'finish', maxWin: 'maxWinReached' } as const)[round.phase],
  )
  return (
    // Screen readers hear the result from the Bet panel's live region instead.
    <div className={styles.popup} aria-hidden="true" data-testid="win-popup">
      <span className={styles.popupTitle}>{title}</span>
      <span className={styles.popupMultiplier}>
        {formatMultiplier(round.payoutCents / round.betCents)}
      </span>
      <span className={styles.popupAmount}>
        <CoinIcon size={20} /> {formatAmount(round.payoutCents)}
      </span>
    </div>
  )
}
