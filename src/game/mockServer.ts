import { randomSeed, sha256, verifyRound } from './fairness'
import { laneCount, payoutCents, type Difficulty } from './odds'

export type StepResult =
  | { outcome: 'safe'; lane: number }
  | { outcome: 'hit'; lane: number; serverSeed: string }
  | { outcome: 'finish'; lane: number; payoutCents: number; serverSeed: string }

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
}

interface ServerRound {
  serverSeed: string
  difficulty: Difficulty
  betCents: number
  hitLane: number | null
  lane: number
}

export function createMockServer({ newSeed = randomSeed } = {}): GameServer {
  let nonce = 0
  let round: ServerRound | null = null

  function active(): ServerRound {
    if (!round) throw new Error('No Round in progress')
    return round
  }

  return {
    async startRound({ betCents, difficulty, clientSeed }) {
      if (round) throw new Error('A Round is already in progress')
      const serverSeed = newSeed()
      const roundNonce = nonce++
      const hitLane = await verifyRound(serverSeed, clientSeed, roundNonce, difficulty)
      round = { serverSeed, difficulty, betCents, hitLane, lane: 0 }
      return { serverSeedHash: await sha256(serverSeed), nonce: roundNonce }
    },

    async step() {
      const r = active()
      const lane = ++r.lane
      if (lane === r.hitLane) {
        round = null
        return { outcome: 'hit', lane, serverSeed: r.serverSeed }
      }
      if (lane === laneCount(r.difficulty)) {
        round = null
        return {
          outcome: 'finish',
          lane,
          payoutCents: payoutCents(r.betCents, r.difficulty, lane),
          serverSeed: r.serverSeed,
        }
      }
      return { outcome: 'safe', lane }
    },

    async cashOut() {
      const r = active()
      if (r.lane === 0) throw new Error('Nothing to cash out before the first Step')
      round = null
      return {
        lane: r.lane,
        payoutCents: payoutCents(r.betCents, r.difficulty, r.lane),
        serverSeed: r.serverSeed,
      }
    },
  }
}
