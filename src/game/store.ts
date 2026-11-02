import { useStore } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'
import { randomSeed } from './fairness'
import { createMockServer, type GameServer, type KeyValueStorage } from './mockServer'
import { DIFFICULTIES, laneCount, payoutCents, type Difficulty } from './odds'
import { cashedOut, idleRound, started, stepped, type Phase, type Round } from './round'

export interface GameState {
  balanceCents: number
  betCents: number
  clientSeed: string
  /** Commitment for the next Round: the hash of its Server Seed and its nonce. */
  next: { serverSeedHash: string; nonce: number } | null
  round: Round
  /** The player's last finished Rounds, newest first, with their revealed seeds. */
  recentGames: Round[]
  /** A server call is in flight; further actions are ignored until it settles. */
  pending: boolean
  setBet(betCents: number): void
  setDifficulty(difficulty: Difficulty): void
  topUp(): void
  /** Changes the Client Seed for the next Round; ignored mid-Round or when blank. */
  setClientSeed(clientSeed: string): void
  play(): Promise<void>
  go(): Promise<void>
  cashOut(): Promise<void>
  /** Re-syncs the Round with the server after a reload; the server's Round wins. */
  resume(): Promise<void>
}

export const MIN_BET_CENTS = 1
export const MAX_BET_CENTS = 15_000
export const START_BALANCE_CENTS = 100_000

export type BetError = 'invalid' | 'belowMin' | 'aboveMax' | 'aboveBalance'

/** Why the current Bet can't be placed, or null when it can. */
export function betError({ betCents, balanceCents }: GameState): BetError | null {
  if (!Number.isInteger(betCents)) return 'invalid'
  if (betCents < MIN_BET_CENTS) return 'belowMin'
  if (betCents > MAX_BET_CENTS) return 'aboveMax'
  if (betCents > balanceCents) return 'aboveBalance'
  return null
}

/** The Balance can't cover even the minimum Bet, so the demo offers a top-up. */
export const canTopUp = (s: GameState) =>
  s.round.phase !== 'playing' && s.balanceCents < MIN_BET_CENTS

// Rules without the `pending` lock, so actions can re-check them once they hold the lock.
const startAllowed = (s: GameState) => s.round.phase !== 'playing' && betError(s) === null
const cashOutAllowed = (s: GameState) => s.round.phase === 'playing' && s.round.lane > 0

export const canPlay = (s: GameState) => !s.pending && startAllowed(s)
export const canGo = (s: GameState) => !s.pending && s.round.phase === 'playing'
export const canCashOut = (s: GameState) => !s.pending && cashOutAllowed(s)

/** What a Cash Out would pay right now. */
export const cashOutCents = (s: GameState) =>
  s.round.lane > 0 ? payoutCents(s.round.betCents, s.round.difficulty, s.round.lane) : 0

const PHASES: readonly Phase[] = ['idle', 'playing', 'hit', 'cashedOut', 'finished', 'maxWin']
const isInt = (x: unknown, min = 0) => Number.isInteger(x) && (x as number) >= min

const RECENT_GAMES = 10

function isRound(x: unknown): x is Round {
  if (typeof x !== 'object' || x === null) return false
  const r = x as Record<string, unknown>
  return (
    PHASES.includes(r.phase as Phase) &&
    DIFFICULTIES.includes(r.difficulty as Difficulty) &&
    isInt(r.betCents) &&
    isInt(r.payoutCents) &&
    isInt(r.lane) &&
    (r.lane as number) <= laneCount(r.difficulty as Difficulty)
  )
}

/** Persisted fields that are safe to restore; anything else falls back to defaults. */
function validSaved(saved: unknown): Partial<GameState> {
  if (typeof saved !== 'object' || saved === null) return {}
  const x = saved as Record<string, unknown>
  return {
    ...(isInt(x.balanceCents) && { balanceCents: x.balanceCents as number }),
    ...(isInt(x.betCents) && { betCents: x.betCents as number }),
    ...(typeof x.clientSeed === 'string' && { clientSeed: x.clientSeed }),
    ...(isRound(x.round) && { round: x.round }),
    ...(Array.isArray(x.recentGames) && {
      recentGames: x.recentGames.filter(isRound).slice(0, RECENT_GAMES),
    }),
  }
}

/** Adds a just-finished Round to the front of Recent Games. */
const withRecent = (recentGames: Round[], round: Round) =>
  round.phase === 'playing' || round.phase === 'idle'
    ? recentGames
    : [round, ...recentGames].slice(0, RECENT_GAMES)

const STORAGE_KEY = 'cluck-strike:game'

const memoryStorage = (): KeyValueStorage & Pick<Storage, 'removeItem'> => {
  const items = new Map<string, string>()
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
  }
}

export function createGameStore({
  server = createMockServer(),
  clientSeed = randomSeed(),
  balanceCents = START_BALANCE_CENTS,
  storage = memoryStorage(),
}: {
  server?: GameServer
  clientSeed?: string
  balanceCents?: number
  storage?: KeyValueStorage & Pick<Storage, 'removeItem'>
} = {}) {
  const store = createStore<GameState>()(
    persist(
      (set, get) => {
        async function exclusive(task: () => Promise<void>) {
          if (get().pending) return
          set({ pending: true })
          try {
            await task()
            if (get().round.phase !== 'playing') await refreshNext()
          } finally {
            set({ pending: false })
          }
        }

        async function refreshNext() {
          set({ next: await server.nextRound() })
        }

        async function step() {
          if (get().round.phase !== 'playing') return
          const result = await server.step()
          set((s) => {
            const round = stepped(s.round, result)
            return {
              round,
              recentGames: withRecent(s.recentGames, round),
              balanceCents:
                'payoutCents' in result ? s.balanceCents + result.payoutCents : s.balanceCents,
            }
          })
        }

        return {
          balanceCents,
          betCents: 300,
          clientSeed,
          next: null,
          round: idleRound('easy'),
          recentGames: [],
          pending: false,

          setBet(betCents) {
            if (get().round.phase !== 'playing') set({ betCents })
          },

          setClientSeed(clientSeed) {
            const seed = clientSeed.trim()
            if (seed && get().round.phase !== 'playing') set({ clientSeed: seed })
          },

          topUp() {
            if (canTopUp(get())) set({ balanceCents: START_BALANCE_CENTS })
          },

          setDifficulty(difficulty) {
            if (get().round.phase !== 'playing') set({ round: idleRound(difficulty) })
          },

          play: () =>
            exclusive(async () => {
              const s = get()
              if (!startAllowed(s)) return
              const { difficulty } = s.round
              const { serverSeedHash, nonce } = await server.startRound({
                betCents: s.betCents,
                difficulty,
                clientSeed: s.clientSeed,
              })
              set((s) => ({
                balanceCents: s.balanceCents - s.betCents,
                round: started(s.round, {
                  difficulty,
                  betCents: s.betCents,
                  serverSeedHash,
                  clientSeed: s.clientSeed,
                  nonce,
                }),
              }))
              await step()
            }),

          go: () => exclusive(step),

          cashOut: () =>
            exclusive(async () => {
              if (!cashOutAllowed(get())) return
              const result = await server.cashOut()
              set((s) => {
                const round = cashedOut(s.round, result)
                return {
                  balanceCents: s.balanceCents + result.payoutCents,
                  round,
                  recentGames: withRecent(s.recentGames, round),
                }
              })
            }),

          async resume() {
            // Not behind `pending`: it must not block a click; it backs off if the Round moved on.
            const before = get().round
            const [live] = await Promise.all([server.currentRound(), refreshNext()])
            if (get().round !== before) return
            if (live) {
              set({ round: { ...started(idleRound(live.difficulty), live), lane: live.lane } })
            } else if (before.phase === 'playing') {
              // The server has no Round (its storage was lost): the client's copy is stale.
              set({ round: idleRound(before.difficulty) })
            }
          },
        }
      },
      {
        name: STORAGE_KEY,
        version: 1,
        storage: createJSONStorage(() => storage),
        partialize: ({ balanceCents, betCents, clientSeed, round, recentGames }) => ({
          recentGames,
          balanceCents,
          betCents: Number.isInteger(betCents) ? betCents : 300,
          clientSeed,
          // A finished Round's result was already shown; a reload starts from the start line.
          round: round.phase === 'playing' ? round : idleRound(round.difficulty),
        }),
        merge: (saved, current) => ({ ...current, ...validSaved(saved) }),
      },
    ),
  )
  void store.getState().resume()
  return store
}

/** localStorage when the browser allows it (private modes and sandboxes may throw). */
function browserStorage() {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

const storage = browserStorage()
export const gameStore = createGameStore({ server: createMockServer({ storage }), storage })

export const useGame = <T>(selector: (s: GameState) => T) => useStore(gameStore, selector)
