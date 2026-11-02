import { useState } from 'react'
import { formatCoins, formatMultiplier } from '../format'
import { isWin, type Round } from '../game/round'
import { useGame } from '../game/store'
import { Coin } from './Coin'
import { Dialog, RoundProof } from './Fairness'
import styles from './RecentGames.module.css'

const DIFFICULTY = { easy: 'Easy', medium: 'Medium', hard: 'Hard', hardcore: 'Hardcore' }

/** The player's last 10 Rounds; each row opens that Round's fairness proof. */
export function RecentGames() {
  const recentGames = useGame((s) => s.recentGames)
  const [selected, setSelected] = useState<Round | null>(null)

  return (
    <section className={styles.panel} aria-labelledby="recent-games">
      <h2 id="recent-games" className={styles.title}>
        Recent Games
      </h2>
      {recentGames.length === 0 ? (
        <p className={styles.empty}>Your finished Rounds will show up here.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Difficulty</th>
              <th>Bet</th>
              <th>Multiplier</th>
              <th>Payout</th>
              <th>
                <span className={styles.srOnly}>Fairness</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {recentGames.map((round) => {
              const won = isWin(round.phase)
              return (
                <tr
                  key={`${round.serverSeedHash}-${round.nonce}`}
                  className={won ? styles.win : styles.hit}
                  onClick={() => setSelected(round)}
                >
                  <td>{DIFFICULTY[round.difficulty]}</td>
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
                      className={styles.verify}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelected(round)
                      }}
                    >
                      Verify
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      <Dialog open={selected !== null} onClose={() => setSelected(null)} title="Round fairness">
        {selected && <RoundProof round={selected} />}
      </Dialog>
    </section>
  )
}
