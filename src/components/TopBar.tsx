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
  const [dialog, setDialog] = useState<'rules' | 'settings' | null>(null)

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
        <button className={styles.pill} onClick={() => setDialog('rules')}>
          {t('rules')}
        </button>
        <button
          className={styles.pill}
          onClick={() => setSoundOn(!soundOn)}
          aria-label={t('sound')}
          aria-pressed={soundOn}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
        <button
          className={styles.pill}
          onClick={() => setDialog('settings')}
          aria-label={t('settings')}
        >
          ⚙
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
        <span className={styles.balance} data-testid="balance" aria-label={t('balance')}>
          <Coin /> {formatCoins(balanceCents)}
        </span>
      </nav>

      <Dialog open={dialog === 'rules'} onClose={() => setDialog(null)} title={t('rules')}>
        <Rules />
      </Dialog>
      <Dialog open={dialog === 'settings'} onClose={() => setDialog(null)} title={t('settings')}>
        <SettingsForm />
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

function SettingsForm() {
  const t = useT()
  const autoReset = useSettings((s) => s.autoReset)
  const setAutoReset = useSettings((s) => s.setAutoReset)
  return (
    <label className={styles.toggle}>
      <input type="checkbox" checked={autoReset} onChange={(e) => setAutoReset(e.target.checked)} />
      <span>
        <strong>{t('autoReset')}</strong>
        <small>{t('autoResetHint')}</small>
      </span>
    </label>
  )
}
