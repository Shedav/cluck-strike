import { expect, test } from 'vitest'
import { translate } from './i18n'
import { detectLanguage } from './settings'

test('Russian browsers get Russian, everyone else English', () => {
  expect(detectLanguage('ru-RU')).toBe('ru')
  expect(detectLanguage('RU')).toBe('ru')
  expect(detectLanguage('en-US')).toBe('en')
  expect(detectLanguage('de')).toBe('en')
  expect(detectLanguage(undefined)).toBe('en')
})

test('messages fill in their placeholders in both languages', () => {
  expect(translate('en', 'betAboveMax', { amount: '150.00' })).toBe('Maximum Bet is 150.00')
  expect(translate('ru', 'betAboveMax', { amount: '150.00' })).toBe('Максимальная ставка 150.00')
  expect(translate('en', 'hitAnnouncement', { lane: 3 })).toBe('Hit on Lane 3. Bet lost.')
})
