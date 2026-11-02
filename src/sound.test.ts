import { expect, test } from 'vitest'
import { useSettings } from './settings'
import { playSound } from './sound'

test('sound is on by default', () => {
  expect(useSettings.getState().soundOn).toBe(true)
})

test('playing a sound without Web Audio or a user gesture is a silent no-op', () => {
  expect(() => playSound('cashOut')).not.toThrow()
})
