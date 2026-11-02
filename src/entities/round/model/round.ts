import type { CashOutResult, StepResult } from '@/shared/api'
import type { Difficulty } from '@/shared/game-rules'

export type Phase = 'idle' | 'playing' | 'hit' | 'cashedOut' | 'finished' | 'maxWin'

/** The Round ended with a payout: a Cash Out, the Finish or Max Win. */
export const isWin = (phase: Phase): phase is 'cashedOut' | 'finished' | 'maxWin' =>
  phase === 'cashedOut' || phase === 'finished' || phase === 'maxWin'

/** The client's view of a Round. Each transition returns the Round unchanged when the phase doesn't allow it. */
export interface Round {
  phase: Phase
  difficulty: Difficulty
  betCents: number
  /** Lane the chicken stands on; 0 is the start. */
  lane: number
  payoutCents: number
  serverSeedHash: string | null
  clientSeed: string | null
  nonce: number | null
  /** Revealed only after the Round ends. */
  serverSeed: string | null
}

export const idleRound = (difficulty: Difficulty): Round => ({
  phase: 'idle',
  difficulty,
  betCents: 0,
  lane: 0,
  payoutCents: 0,
  serverSeedHash: null,
  clientSeed: null,
  nonce: null,
  serverSeed: null,
})

export function started(
  round: Round,
  start: {
    difficulty: Difficulty
    betCents: number
    serverSeedHash: string
    clientSeed: string
    nonce: number
  },
): Round {
  if (round.phase === 'playing') return round
  return { ...idleRound(start.difficulty), ...start, phase: 'playing' }
}

export function stepped(round: Round, result: StepResult): Round {
  if (round.phase !== 'playing') return round
  switch (result.outcome) {
    case 'safe':
      return { ...round, lane: result.lane }
    case 'hit':
      return { ...round, phase: 'hit', lane: result.lane, serverSeed: result.serverSeed }
    case 'finish':
    case 'maxWin':
      return {
        ...round,
        phase: result.outcome === 'finish' ? 'finished' : 'maxWin',
        lane: result.lane,
        payoutCents: result.payoutCents,
        serverSeed: result.serverSeed,
      }
  }
}

export function cashedOut(round: Round, result: CashOutResult): Round {
  if (round.phase !== 'playing' || round.lane === 0) return round
  return {
    ...round,
    phase: 'cashedOut',
    payoutCents: result.payoutCents,
    serverSeed: result.serverSeed,
  }
}
