import type { Difficulty } from '@/shared/game-rules'

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
  /** The hash of the Server Seed and the nonce the next Round will use, committed in advance. */
  nextRound(): Promise<{ serverSeedHash: string; nonce: number }>
}

export interface PublicRound {
  difficulty: Difficulty
  betCents: number
  lane: number
  serverSeedHash: string
  clientSeed: string
  nonce: number
}

export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>
