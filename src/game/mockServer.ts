import { randomSeed, sha256, verifyRound } from './fairness'
import { DIFFICULTIES, laneCount, MAX_WIN_CENTS, payoutCents, type Difficulty } from './odds'

export type StepResult =
  | { outcome: 'safe'; lane: number }
  | { outcome: 'hit'; lane: number; serverSeed: string }
  | { outcome: 'finish' | 'maxWin'; lane: number; payoutCents: number; serverSeed: string }

export interface CashOutResult {
  lane: number
  payoutCents: number
  serverSeed: string
}

/** Backend-shaped API. The Server Seed never leaves it until the Round ends (ADR 0001). */
export interface GameServer {
  startRound(request: {
    betCents: number
    difficulty: Difficulty
    clientSeed: string
  }): Promise<{ serverSeedHash: string; nonce: number }>
  step(): Promise<StepResult>
  cashOut(): Promise<CashOutResult>
  /** The unfinished Round, without its Server Seed, so a reloaded client can continue it. */
  currentRound(): Promise<PublicRound | null>
}

export interface PublicRound {
  difficulty: Difficulty
  betCents: number
  lane: number
  serverSeedHash: string
  clientSeed: string
  nonce: number
}

interface ServerRound extends PublicRound {
  serverSeed: string
  hitLane: number | null
}

interface ServerState {
  nonce: number
  round: ServerRound | null
}

export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>

const STORAGE_KEY = 'cluck-strike:server'

export function createMockServer({
  newSeed = randomSeed,
  storage,
}: { newSeed?: () => string; storage?: KeyValueStorage } = {}): GameServer {
  const state = load(storage)
  // Every mutation is saved before the method returns, with no await in between, so a reload
  // can't land between the server's state and the client's.
  const save = () => storage?.setItem(STORAGE_KEY, JSON.stringify(state))

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
      const serverSeed = newSeed()
      const nonce = state.nonce
      const hitLane = await verifyRound(serverSeed, clientSeed, nonce, difficulty)
      const serverSeedHash = await sha256(serverSeed)
      if (state.round) throw new Error('A Round is already in progress')
      state.nonce++
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
function load(storage?: KeyValueStorage): ServerState {
  try {
    const saved = JSON.parse(storage?.getItem(STORAGE_KEY) ?? 'null') as Partial<ServerState>
    if (isInt(saved?.nonce) && (saved.round === null || isServerRound(saved.round))) {
      return { nonce: saved.nonce, round: saved.round }
    }
  } catch {
    // Corrupted JSON: start fresh below.
  }
  return { nonce: 0, round: null }
}
