import {
  DIFFICULTIES,
  laneCount,
  MAX_WIN_CENTS,
  payoutCents,
  randomSeed,
  sha256,
  verifyRound,
  type Difficulty,
} from '@/shared/game-rules'
import type { GameServer, KeyValueStorage, PublicRound } from './types'

interface ServerRound extends PublicRound {
  serverSeed: string
  hitLane: number | null
}

interface ServerState {
  nonce: number
  /** Drawn ahead of time so its hash can be shown before the player picks a Client Seed. */
  nextServerSeed: string
  round: ServerRound | null
}

const STORAGE_KEY = 'cluck-strike:server'

export function createMockServer({
  newSeed = randomSeed,
  storage,
}: { newSeed?: () => string; storage?: KeyValueStorage } = {}): GameServer {
  const state = load(storage, newSeed)
  // Every mutation is saved before the method returns, with no await in between, so a reload
  // can't land between the server's state and the client's.
  const save = () => storage?.setItem(STORAGE_KEY, JSON.stringify(state))
  save() // a freshly drawn next Server Seed must survive a reload, or its shown hash would change

  function active(): ServerRound {
    if (!state.round) throw new Error('No Round in progress')
    return state.round
  }

  function end() {
    state.round = null
    save()
  }

  return {
    async startRound({ betCents, difficulty, clientSeed }) {
      if (state.round) throw new Error('A Round is already in progress')
      const serverSeed = state.nextServerSeed
      const nonce = state.nonce
      const hitLane = await verifyRound(serverSeed, clientSeed, nonce, difficulty)
      const serverSeedHash = await sha256(serverSeed)
      if (state.round) throw new Error('A Round is already in progress')
      state.nonce++
      state.nextServerSeed = newSeed()
      state.round = {
        serverSeed,
        serverSeedHash,
        clientSeed,
        nonce,
        difficulty,
        betCents,
        hitLane,
        lane: 0,
      }
      save()
      return { serverSeedHash, nonce }
    },

    async step() {
      const r = active()
      const lane = ++r.lane
      save()
      if (lane === r.hitLane) {
        end()
        return { outcome: 'hit', lane, serverSeed: r.serverSeed }
      }
      const payout = payoutCents(r.betCents, r.difficulty, lane)
      // Max Win before Finish: the payout is capped either way, but the player should see why.
      const ending =
        payout >= MAX_WIN_CENTS ? 'maxWin' : lane === laneCount(r.difficulty) ? 'finish' : null
      if (ending) {
        end()
        return { outcome: ending, lane, payoutCents: payout, serverSeed: r.serverSeed }
      }
      return { outcome: 'safe', lane }
    },

    async cashOut() {
      const r = active()
      if (r.lane === 0) throw new Error('Nothing to cash out before the first Step')
      end()
      return {
        lane: r.lane,
        payoutCents: payoutCents(r.betCents, r.difficulty, r.lane),
        serverSeed: r.serverSeed,
      }
    },

    async nextRound() {
      return { serverSeedHash: await sha256(state.nextServerSeed), nonce: state.nonce }
    },

    async currentRound() {
      if (!state.round) return null
      const { difficulty, betCents, lane, serverSeedHash, clientSeed, nonce } = state.round
      return { difficulty, betCents, lane, serverSeedHash, clientSeed, nonce }
    },
  }
}

const isInt = (x: unknown, min = 0): x is number => Number.isInteger(x) && (x as number) >= min

function isServerRound(r: unknown): r is ServerRound {
  if (typeof r !== 'object' || r === null) return false
  const x = r as Record<string, unknown>
  return (
    typeof x.serverSeed === 'string' &&
    typeof x.serverSeedHash === 'string' &&
    typeof x.clientSeed === 'string' &&
    DIFFICULTIES.includes(x.difficulty as Difficulty) &&
    isInt(x.nonce) &&
    isInt(x.betCents, 1) &&
    (x.hitLane === null || isInt(x.hitLane, 1)) &&
    isInt(x.lane) &&
    (x.lane as number) < laneCount(x.difficulty as Difficulty)
  )
}

/** Saved state, or a fresh one when it is missing or unreadable. */
function load(storage: KeyValueStorage | undefined, newSeed: () => string): ServerState {
  try {
    const saved = JSON.parse(storage?.getItem(STORAGE_KEY) ?? 'null') as Partial<ServerState>
    if (
      isInt(saved?.nonce) &&
      typeof saved.nextServerSeed === 'string' &&
      (saved.round === null || isServerRound(saved.round))
    ) {
      return { nonce: saved.nonce, nextServerSeed: saved.nextServerSeed, round: saved.round }
    }
  } catch {
    // Corrupted JSON: start fresh below.
  }
  return { nonce: 0, nextServerSeed: newSeed(), round: null }
}
