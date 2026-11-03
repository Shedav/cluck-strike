import { expect, test } from 'vitest'
import { formatAmount, formatMultiplier, formatMultiplierFull, parseAmount } from './format'

test('amounts are cents shown with two decimals and thousands separators', () => {
  expect(formatAmount(0)).toBe('0.00')
  expect(formatAmount(123456)).toBe('1,234.56')
})

test('parseAmount accepts plain amounts with at most two decimals and rejects the rest', () => {
  expect(parseAmount('12.5')).toBe(1250)
  expect(parseAmount(' 3 ')).toBe(300)
  expect(parseAmount('0.07')).toBe(7)
  for (const bad of ['', 'abc', '1.234', '-1', '1,000', '1e3']) expect(parseAmount(bad)).toBeNaN()
})

test('Multipliers are compact from 1,000 on; the full form keeps every digit', () => {
  expect(formatMultiplier(1.07)).toBe('1.07x')
  expect(formatMultiplier(999.99)).toBe('999.99x')
  expect(formatMultiplier(41321.43)).toBe('41.3Kx')
  expect(formatMultiplierFull(41321.43)).toBe('41,321.43x')
  expect(formatMultiplierFull(1.1)).toBe('1.10x')
})
