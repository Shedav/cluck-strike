import { useSettings } from '@/shared/settings'

// All effects are synthesized with the Web Audio API: no audio files to load or license.

let context: AudioContext | null = null
let unlocked = false

// Browsers only allow audio after a user gesture; until then every effect is skipped. A touch
// counts as a gesture on release, not on pointerdown, so phones (iOS Safari above all) need
// pointerup/touchend, and the context is resumed on every gesture until it actually runs.
if (typeof window !== 'undefined') {
  const unlock = () => {
    unlocked = true
    // Also after a return from the background, when the silent loop was paused.
    keepPlaybackSession()
    const ctx = audio()
    if (!ctx || ctx.state === 'running') return
    void ctx.resume()
    // Older iOS only starts audio once something plays inside the gesture: a silent sample.
    const silence = ctx.createBufferSource()
    silence.buffer = ctx.createBuffer(1, 1, 22_050)
    silence.connect(ctx.destination)
    silence.start()
  }
  // Pausing in the background keeps iOS from listing the page as playing media.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) mediaSession?.pause()
  })
  for (const type of ['pointerup', 'touchend', 'keydown']) {
    window.addEventListener(type, unlock, { capture: true })
  }
}

/** 25 ms of silence as a WAV (8 kHz, 8-bit mono). */
const SILENT_WAV =
  'data:audio/wav;base64,UklGRuwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YcgAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA=='

let mediaSession: HTMLAudioElement | null = null

/**
 * iOS browsers without `navigator.audioSession` (Chrome, Firefox: WKWebView) mute Web Audio with the
 * silent switch. A looping silent <audio> element, started in a gesture, moves the page to the
 * media "playback" session so the effects are heard; it is not needed (or started) elsewhere.
 */
function keepPlaybackSession() {
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform))
  if (!ios || 'audioSession' in navigator) return
  if (!mediaSession) {
    mediaSession = new Audio(SILENT_WAV)
    mediaSession.loop = true
  }
  if (mediaSession.paused) void mediaSession.play().catch(() => {})
}

function audio(): AudioContext | null {
  if (!context && typeof AudioContext !== 'undefined') {
    try {
      // iOS treats Web Audio as "ambient" and mutes it with the ring/silent switch; "playback"
      // plays like a media app, and the in-game toggle stays the way to mute (Safari 16.4+).
      const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession
      if (session) session.type = 'playback'
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

/**
 * A chicken squawk: a buzzy tone that jerks up in pitch and sags, shaken by fast vibrato and shaped
 * by two nasal formants.
 */
function squawk(ctx: AudioContext, at: number, length: number, pitch: number, volume: number) {
  const start = ctx.currentTime + at
  const voice = ctx.createOscillator()
  voice.type = 'sawtooth'
  voice.frequency.setValueAtTime(pitch * 0.8, start)
  voice.frequency.exponentialRampToValueAtTime(pitch * 1.5, start + length * 0.15)
  voice.frequency.exponentialRampToValueAtTime(pitch * 0.7, start + length)
  const vibrato = ctx.createOscillator()
  const depth = ctx.createGain()
  vibrato.frequency.value = 38
  depth.gain.value = pitch * 0.12
  vibrato.connect(depth).connect(voice.frequency)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02)
  gain.gain.setValueAtTime(volume, start + length * 0.6)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
  for (const [frequency, q] of [
    [1300, 6],
    [2700, 8],
  ]) {
    const formant = ctx.createBiquadFilter()
    formant.type = 'bandpass'
    formant.frequency.value = frequency
    formant.Q.value = q
    voice.connect(formant).connect(gain)
  }
  gain.connect(ctx.destination)
  for (const osc of [voice, vibrato]) {
    osc.start(start)
    osc.stop(start + length + 0.02)
  }
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
  /** The chicken burnt: crackling fat under its scream. */
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
    // ...under the chicken's scream: a short "bok" and a long "BAAWK".
    squawk(ctx, 0.05, 0.16, 650, 0.18)
    squawk(ctx, 0.28, 0.5, 820, 0.24)
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
