import { useSettings } from './settings'

// All effects are synthesized with the Web Audio API: no audio files to load or license.

let context: AudioContext | null = null
let unlocked = false

// Browsers only allow audio after a user gesture; until then every effect is skipped.
if (typeof window !== 'undefined') {
  const unlock = () => {
    unlocked = true
    void audio()?.resume()
  }
  window.addEventListener('pointerdown', unlock, { once: true, capture: true })
  window.addEventListener('keydown', unlock, { once: true, capture: true })
}

function audio(): AudioContext | null {
  if (!context && typeof AudioContext !== 'undefined') {
    try {
      context = new AudioContext()
    } catch {
      return null // no audio device or blocked: the game just stays silent
    }
  }
  return context
}

/** A short sine "ping" at `frequency` Hz starting `at` seconds from now. */
function tone(ctx: AudioContext, frequency: number, at: number, length: number, volume: number) {
  const start = ctx.currentTime + at
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
  osc.connect(gain).connect(ctx.destination)
  osc.start(start)
  osc.stop(start + length + 0.02)
}

const EFFECTS = {
  /** Coin chime: three quick rising notes. */
  cashOut(ctx: AudioContext) {
    tone(ctx, 1318.5, 0, 0.25, 0.18) // E6
    tone(ctx, 1760, 0.07, 0.25, 0.16) // A6
    tone(ctx, 2637, 0.14, 0.4, 0.14) // E7
  },
} satisfies Record<string, (ctx: AudioContext) => void>

export type SoundName = keyof typeof EFFECTS

/** Plays an effect if sound is on and the player has interacted with the page. */
export function playSound(name: SoundName) {
  if (!unlocked || !useSettings.getState().soundOn) return
  const ctx = audio()
  if (ctx) EFFECTS[name](ctx)
}
