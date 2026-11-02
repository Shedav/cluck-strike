import styles from './App.module.css'

export default function App() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cluck Strike</h1>
        <span className={styles.subtitle}>Cross the fire, cash out in time</span>
      </header>
      <section className={styles.panel}>Game coming soon</section>
    </main>
  )
}
