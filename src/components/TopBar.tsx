import { useEffect, useState } from 'react'
import { formatCoins, formatMultiplier } from '../format'
import { DIFFICULTIES, laneCount, MAX_WIN_CENTS, MULTIPLIERS } from '../game/odds'
import { useGame } from '../game/store'
import { useT } from '../i18n'
import { useSettings, type Language } from '../settings'
import { Coin } from './Coin'
import { Dialog, FairnessButton } from './Fairness'
import styles from './TopBar.module.css'

/** The game page header, in the layout of a cs2skin game page: name left, tools and Balance right. */
export function TopBar() {
  const balanceCents = useGame((s) => s.balanceCents)
  const language = useSettings((s) => s.language)
  const setLanguage = useSettings((s) => s.setLanguage)
  const soundOn = useSettings((s) => s.soundOn)
  const setSoundOn = useSettings((s) => s.setSoundOn)
  const t = useT()
  const [rulesOpen, setRulesOpen] = useState(false)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        <img className={styles.logo} src="/favicon.svg" alt="" />
        <div>
          <h1 className={styles.title}>Cluck Strike</h1>
          <span className={styles.tagline}>{t('tagline')}</span>
        </div>
      </div>

      <nav className={styles.tools}>
        <FairnessButton />
        <button className={styles.pill} onClick={() => setRulesOpen(true)}>
          {t('rules')}
        </button>
        <button
          className={styles.pill}
          onClick={() => setSoundOn(!soundOn)}
          aria-label={t('sound')}
          aria-pressed={soundOn}
        >
          <SoundIcon on={soundOn} />
        </button>
        <div className={styles.languages} role="group" aria-label={t('language')}>
          {(['en', 'ru'] as Language[]).map((l) => (
            <button
              key={l}
              className={styles.language}
              aria-pressed={language === l}
              onClick={() => setLanguage(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>
      <span className={styles.balance} data-testid="balance" aria-label={t('balance')}>
        <Coin /> {formatCoins(balanceCents)}
      </span>

      <Dialog open={rulesOpen} onClose={() => setRulesOpen(false)} title={t('rules')}>
        <Rules />
      </Dialog>
    </header>
  )
}

function Rules() {
  const t = useT()
  return (
    <div className={styles.rules}>
      <h3>{t('rulesHowTo')}</h3>
      <ol>
        <li>{t('rulesStep1')}</li>
        <li>{t('rulesStep2')}</li>
        <li>{t('rulesStep3')}</li>
      </ol>
      <h3>{t('rulesOdds')}</h3>
      <p>{t('rulesRtp')}</p>
      <p>{t('rulesMaxWin', { amount: formatCoins(MAX_WIN_CENTS) })}</p>
      <h3>{t('rulesTables')}</h3>
      {DIFFICULTIES.map((d) => (
        <section key={d} className={styles.table}>
          <h4>
            {t(d)} · {t('lanes', { count: laneCount(d) })}
          </h4>
          <ol className={styles.multipliers}>
            {MULTIPLIERS[d].map((m, i) => (
              <li key={i} title={`${m.toLocaleString('en-US', { minimumFractionDigits: 2 })}x`}>
                {formatMultiplier(m)}
              </li>
            ))}
          </ol>
        </section>
      ))}
      <h3>{t('rulesDemo')}</h3>
      <p>{t('rulesDemoText')}</p>
    </div>
  )
}

/** Line icon in the cs2skin header style: a speaker with waves, or crossed out when muted. */
function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H3v6h3l5 4z" />
      {on ? (
        <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
      ) : (
        <path d="m16 9 6 6M22 9l-6 6" />
      )}
    </svg>
  )
}
