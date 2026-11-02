import { BetPanel } from '@/widgets/bet-panel'
import { RecentGames } from '@/widgets/recent-games'
import { Road } from '@/widgets/road'
import { TopBar } from '@/widgets/top-bar'
import styles from './GamePage.module.css'

export function GamePage() {
  return (
    <main className={styles.page}>
      <TopBar />
      <Road />
      <BetPanel />
      <RecentGames />
    </main>
  )
}
