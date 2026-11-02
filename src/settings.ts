import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type Language = 'en' | 'ru'

interface Settings {
  language: Language
  /** After a Hit, return the chicken to the start after a moment instead of keeping the result. */
  autoReset: boolean
  setLanguage(language: Language): void
  setAutoReset(autoReset: boolean): void
}

export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      language: 'en',
      autoReset: true,
      setLanguage: (language) => set({ language }),
      setAutoReset: (autoReset) => set({ autoReset }),
    }),
    {
      name: 'cluck-strike:settings',
      // v0 saved a language guessed from the browser; drop it so everyone starts in English.
      version: 1,
      migrate: (saved, version) => (version < 1 ? { ...(saved as object), language: 'en' } : saved),
      // shortcut: browsers without localStorage (private modes) just don't keep settings.
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ language, autoReset }) => ({ language, autoReset }),
      merge: (saved, current) => {
        const s = (saved ?? {}) as Partial<Settings>
        return {
          ...current,
          ...(s.language === 'en' || s.language === 'ru' ? { language: s.language } : {}),
          ...(typeof s.autoReset === 'boolean' ? { autoReset: s.autoReset } : {}),
        }
      },
    },
  ),
)
