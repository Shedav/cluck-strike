import { useState } from 'react'
import { formatCoins, formatMultiplier } from '../format'
import { isWin, type Round } from '../game/round'
import { useGame } from '../game/store'
import { useT } from '../i18n'
import { Coin } from './Coin'
import { Dialog, RoundProof } from './Fairness'
import styles from './RecentGames.module.css'

const PAGE = 10

/** The player's recent Rounds, 10 at a time; each row opens that Round's fairness proof. */
export function RecentGames() {
  const recentGames = useGame((s) => s.recentGames)
  const [selected, setSelected] = useState<Round | null>(null)
  const [shown, setShown] = useState(PAGE)
  const t = useT()

  return (
    <section className={`${styles.panel} surface`} aria-labelledby="recent-games">
      <h2 id="recent-games" className={styles.title}>
        {t('recentGames')}
      </h2>
      {recentGames.length === 0 ? (
        <p className={styles.empty}>{t('recentEmpty')}</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('difficulty')}</th>
              <th>{t('bet')}</th>
              <th>{t('multiplier')}</th>
              <th>{t('payout')}</th>
              <th>
                <span className={styles.srOnly}>{t('fairness')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {recentGames.slice(0, shown).map((round) => {
              const won = isWin(round.phase)
              return (
                <tr
                  key={`${round.serverSeedHash}-${round.nonce}`}
                  className={won ? styles.win : styles.hit}
                  onClick={() => setSelected(round)}
                >
                  <td>{t(round.difficulty)}</td>
                  <td>
                    <Coin size={14} /> {formatCoins(round.betCents)}
                  </td>
                  <td className={styles.result}>
                    {won ? formatMultiplier(round.payoutCents / round.betCents) : '0.00x'}
                  </td>
                  <td className={styles.result}>
                    <Coin size={14} /> {won ? formatCoins(round.payoutCents) : '0.00'}
                  </td>
                  <td>
                    <button
                      className={`${styles.verify} secondary`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelected(round)
                      }}
                    >
                      {t('verify')}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      {recentGames.length > shown && (
        <button className={`${styles.more} secondary`} onClick={() => setShown(shown + PAGE)}>
          {t('loadMore')}
        </button>
      )}
      <Dialog open={selected !== null} onClose={() => setSelected(null)} title={t('roundFairness')}>
        {selected && <RoundProof round={selected} />}
      </Dialog>
    </section>
  )
}
