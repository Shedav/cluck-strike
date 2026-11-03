import { useEffect, useState } from 'react'
import { useGame } from '@/entities/round'
import { FairnessButton } from '@/features/verify-round'
import { DIFFICULTIES, laneCount, MAX_WIN_CENTS, MULTIPLIERS } from '@/shared/game-rules'
import { useT } from '@/shared/i18n'
import { formatAmount, formatMultiplier } from '@/shared/lib'
import { useSettings, type Language } from '@/shared/settings'
import { BookIcon, CoinIcon, Dialog, SoundIcon } from '@/shared/ui'
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
        <button
          className="link"
          onClick={() => setSoundOn(!soundOn)}
          aria-label={t('sound')}
          aria-pressed={soundOn}
        >
          <SoundIcon on={soundOn} />
        </button>
        <FairnessButton />
        <button className="link" onClick={() => setRulesOpen(true)}>
          <BookIcon />
          {t('rules')}
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
        <CoinIcon /> {formatAmount(balanceCents)}
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
        <li>{t('rulesKeys')}</li>
      </ol>
      <h3>{t('rulesOdds')}</h3>
      <p>{t('rulesRtp')}</p>
      <p>{t('rulesMaxWin', { amount: formatAmount(MAX_WIN_CENTS) })}</p>
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
