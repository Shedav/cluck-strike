import { useStore } from 'zustand'
import { createStore, type StoreApi } from 'zustand/vanilla'
import { canPlay, gameStore, type GameState } from '@/entities/round'
import { CASE_MS, LANDED_PAUSE_MS, RESULT_MS, STEP_MS } from '@/shared/config'

export interface AutoplaySettings {
  rounds: number
  /** The Lane to cash out on; the Round may end sooner on a Hit, or at Max Win or the Finish. */
  cashOutLane: number
}

export interface AutoplayState {
  running: boolean
  /** Stop was pressed: the current Round plays out, then no more start. */
  stopping: boolean
  /** The Round being played, from 1. */
  current: number
  total: number
  start(settings: AutoplaySettings): void
  stop(): void
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Plays Rounds on the game store like a player would, on the scene's timings: Play, GO until the
 * Cash Out Lane, Cash Out, then a pause while the result shows.
 */
export function createAutoplay(game: StoreApi<GameState>, wait = sleep) {
  const store = createStore<AutoplayState>()((set, get) => {
    async function run({ rounds, cashOutLane }: AutoplaySettings) {
      for (let n = 1; n <= rounds && !get().stopping && canPlay(game.getState()); n++) {
        set({ current: n })
        await game.getState().play()
        await wait(STEP_MS)
        while (
          game.getState().round.phase === 'playing' &&
          game.getState().round.lane < cashOutLane
        ) {
          await game.getState().go()
          await wait(STEP_MS)
        }
        if (game.getState().round.phase === 'playing') await game.getState().cashOut()
        if (n === rounds || get().stopping) break
        // The scene celebrates a Finish after the case opens and a Max Win after a pause.
        const { phase } = game.getState().round
        await wait(
          RESULT_MS + (phase === 'finished' ? CASE_MS : phase === 'maxWin' ? LANDED_PAUSE_MS : 0),
        )
      }
    }

    return {
      running: false,
      stopping: false,
      current: 0,
      total: 0,
      start(settings) {
        if (get().running || !canPlay(game.getState())) return
        set({ running: true, stopping: false, current: 0, total: settings.rounds })
        void run(settings).finally(() => set({ running: false, stopping: false }))
      },
      stop() {
        if (get().running) set({ stopping: true })
      },
    }
  })
  return store
}

export const autoplayStore = createAutoplay(gameStore)

export const useAutoplay = <T>(selector: (s: AutoplayState) => T) =>
  useStore(autoplayStore, selector)
