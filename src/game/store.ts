import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'
import { randomSeed } from './fairness'
import { createMockServer, type GameServer } from './mockServer'
import { payoutCents } from './odds'
import { cashedOut, idleRound, started, stepped, type Round } from './round'

export interface GameState {
  balanceCents: number
  betCents: number
  clientSeed: string
  round: Round
  /** A server call is in flight; further actions are ignored until it settles. */
  pending: boolean
  setBet(betCents: number): void
  play(): Promise<void>
  go(): Promise<void>
  cashOut(): Promise<void>
}

// Rules without the `pending` lock, so actions can re-check them once they hold the lock.
const startAllowed = (s: GameState) =>
  s.round.phase !== 'playing' &&
  Number.isInteger(s.betCents) &&
  s.betCents >= 1 &&
  s.betCents <= s.balanceCents
const cashOutAllowed = (s: GameState) => s.round.phase === 'playing' && s.round.lane > 0

export const canPlay = (s: GameState) => !s.pending && startAllowed(s)
export const canGo = (s: GameState) => !s.pending && s.round.phase === 'playing'
export const canCashOut = (s: GameState) => !s.pending && cashOutAllowed(s)

/** What a Cash Out would pay right now. */
export const cashOutCents = (s: GameState) =>
  s.round.lane > 0 ? payoutCents(s.round.betCents, s.round.difficulty, s.round.lane) : 0

export function createGameStore({
  server = createMockServer(),
  clientSeed = randomSeed(),
  balanceCents = 100_000,
}: { server?: GameServer; clientSeed?: string; balanceCents?: number } = {}) {
  return createStore<GameState>()((set, get) => {
    async function exclusive(task: () => Promise<void>) {
      if (get().pending) return
      set({ pending: true })
      try {
        await task()
      } finally {
        set({ pending: false })
      }
    }

    async function step() {
      if (get().round.phase !== 'playing') return
      const result = await server.step()
      set((s) => ({
        round: stepped(s.round, result),
        balanceCents:
          result.outcome === 'finish' ? s.balanceCents + result.payoutCents : s.balanceCents,
      }))
    }

    return {
      balanceCents,
      betCents: 300,
      clientSeed,
      round: idleRound('easy'),
      pending: false,

      setBet(betCents) {
        if (get().round.phase !== 'playing') set({ betCents })
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
          set((s) => ({
            balanceCents: s.balanceCents + result.payoutCents,
            round: cashedOut(s.round, result),
          }))
        }),
    }
  })
}

export const gameStore = createGameStore()

export const useGame = <T>(selector: (s: GameState) => T) => useStore(gameStore, selector)
