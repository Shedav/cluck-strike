import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type Language = 'en' | 'ru'

interface Settings {
  language: Language
  soundOn: boolean
  setLanguage(language: Language): void
  setSoundOn(soundOn: boolean): void
}

export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      language: 'en',
      soundOn: true,
      setLanguage: (language) => set({ language }),
      setSoundOn: (soundOn) => set({ soundOn }),
    }),
    {
      name: 'cluck-strike:settings',
      // v0 saved a language guessed from the browser; drop it so everyone starts in English.
      version: 1,
      migrate: (saved, version) => (version < 1 ? { ...(saved as object), language: 'en' } : saved),
      // shortcut: browsers without localStorage (private modes) just don't keep settings.
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ language, soundOn }) => ({ language, soundOn }),
      merge: (saved, current) => {
        const s = (saved ?? {}) as Partial<Settings>
        return {
          ...current,
          ...(s.language === 'en' || s.language === 'ru' ? { language: s.language } : {}),
          ...(typeof s.soundOn === 'boolean' ? { soundOn: s.soundOn } : {}),
        }
      },
    },
  ),
)
