import { BetPanel } from './components/BetPanel'
import { Coin } from './components/Coin'
import { FairnessButton } from './components/Fairness'
import { Road } from './components/Road'
import { formatCoins } from './format'
import { useGame } from './game/store'
import styles from './App.module.css'

export default function App() {
  const balanceCents = useGame((s) => s.balanceCents)

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cluck Strike</h1>
        <span className={styles.subtitle}>Cross the fire, cash out in time</span>
        <FairnessButton />
        <span className={styles.balance} data-testid="balance">
          <Coin /> {formatCoins(balanceCents)}
        </span>
      </header>
      <Road />
      <BetPanel />
    </main>
  )
}
