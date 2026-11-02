import { BetPanel } from './components/BetPanel'
import { RecentGames } from './components/RecentGames'
import { Road } from './components/Road'
import { TopBar } from './components/TopBar'
import styles from './App.module.css'

export default function App() {
  return (
    <main className={styles.page}>
      <TopBar />
      <Road />
      <BetPanel />
      <RecentGames />
    </main>
  )
}
