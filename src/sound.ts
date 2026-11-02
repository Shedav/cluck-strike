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
function tone(
  ctx: AudioContext,
  frequency: number,
  at: number,
  length: number,
  volume: number,
  type: OscillatorType = 'sine',
) {
  const start = ctx.currentTime + at
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
  osc.connect(gain).connect(ctx.destination)
  osc.start(start)
  osc.stop(start + length + 0.02)
}

let noise: AudioBuffer | null = null

/** A burst of white noise through a filter, with an attack/decay envelope. */
function hiss(
  ctx: AudioContext,
  {
    at = 0,
    length,
    volume,
    filter,
    from,
    to,
  }: {
    at?: number
    length: number
    volume: number
    filter: BiquadFilterType
    from: number
    to: number
  },
) {
  if (!noise) {
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  const start = ctx.currentTime + at
  const source = ctx.createBufferSource()
  source.buffer = noise
  const band = ctx.createBiquadFilter()
  band.type = filter
  band.frequency.setValueAtTime(from, start)
  band.frequency.exponentialRampToValueAtTime(to, start + length)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + length * 0.2)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
  source.connect(band).connect(gain).connect(ctx.destination)
  source.start(start)
  source.stop(start + length + 0.02)
}

/** A sine whose pitch slides from `from` to `to` Hz: thumps and boings. */
function slide(ctx: AudioContext, from: number, to: number, length: number, volume: number) {
  const start = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.setValueAtTime(from, start)
  osc.frequency.exponentialRampToValueAtTime(to, start + length)
  gain.gain.setValueAtTime(volume, start)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
  osc.connect(gain).connect(ctx.destination)
  osc.start(start)
  osc.stop(start + length + 0.02)
}

const EFFECTS = {
  /** The smoke grenade flying: a rising band of noise. */
  throw(ctx: AudioContext) {
    hiss(ctx, { length: 0.35, volume: 0.25, filter: 'bandpass', from: 500, to: 2400 })
  },
  /** The grenade landing: a low puff, then the Smoke's hiss. */
  smoke(ctx: AudioContext) {
    slide(ctx, 160, 60, 0.18, 0.35)
    hiss(ctx, { length: 0.8, volume: 0.18, filter: 'highpass', from: 3000, to: 1200 })
  },
  /** A Hit: the fire bursts up with a low rumble. */
  fire(ctx: AudioContext) {
    slide(ctx, 110, 40, 0.6, 0.4)
    hiss(ctx, { length: 0.9, volume: 0.35, filter: 'lowpass', from: 1400, to: 200 })
  },
  /** The chicken burnt: crackling fat, a low whoomp of flame and a dying char sizzle. */
  roast(ctx: AudioContext) {
    // Fat crackling in the pan: short random pops, nothing like the Smoke's steady hiss...
    for (let i = 0; i < 18; i++) {
      const pitch = 1500 + Math.random() * 3000
      hiss(ctx, {
        at: Math.random() * 0.9,
        length: 0.012 + Math.random() * 0.02,
        volume: 0.15 + Math.random() * 0.2,
        filter: 'bandpass',
        from: pitch,
        to: pitch,
      })
    }
    // ...the flames swallowing it with a low whoomp, then the charring sizzle dying away.
    hiss(ctx, { length: 0.5, volume: 0.4, filter: 'lowpass', from: 700, to: 140 })
    hiss(ctx, { at: 0.2, length: 1.1, volume: 0.07, filter: 'bandpass', from: 2600, to: 1800 })
  },

  /** Finish or Max Win: a quick rising arpeggio. */
  fanfare(ctx: AudioContext) {
    ;[1046.5, 1318.5, 1568, 2093].forEach((note, i) =>
      tone(ctx, note, i * 0.09, i === 3 ? 0.6 : 0.2, 0.16),
    ) // C6 E6 G6 C7
  },
  /** The chicken's hop: a short rising boing. */
  hop(ctx: AudioContext) {
    slide(ctx, 320, 640, 0.12, 0.12)
  },
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
