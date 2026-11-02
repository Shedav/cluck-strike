import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type Language = 'en' | 'ru'

interface Settings {
  language: Language
  /** After a Hit, return the chicken to the start after a moment instead of keeping the result. */
  autoReset: boolean
  soundOn: boolean
  setLanguage(language: Language): void
  setAutoReset(autoReset: boolean): void
  setSoundOn(soundOn: boolean): void
}

export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      language: 'en',
      autoReset: true,
      soundOn: true,
      setLanguage: (language) => set({ language }),
      setAutoReset: (autoReset) => set({ autoReset }),
      setSoundOn: (soundOn) => set({ soundOn }),
    }),
    {
      name: 'cluck-strike:settings',
      // v0 saved a language guessed from the browser; drop it so everyone starts in English.
      version: 1,
      migrate: (saved, version) => (version < 1 ? { ...(saved as object), language: 'en' } : saved),
      // shortcut: browsers without localStorage (private modes) just don't keep settings.
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ language, autoReset, soundOn }) => ({ language, autoReset, soundOn }),
      merge: (saved, current) => {
        const s = (saved ?? {}) as Partial<Settings>
        return {
          ...current,
          ...(s.language === 'en' || s.language === 'ru' ? { language: s.language } : {}),
          ...(typeof s.autoReset === 'boolean' ? { autoReset: s.autoReset } : {}),
          ...(typeof s.soundOn === 'boolean' ? { soundOn: s.soundOn } : {}),
        }
      },
    },
  ),
)
