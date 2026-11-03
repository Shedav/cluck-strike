const coins = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 123456 cents → "1,234.56" */
export const formatAmount = (cents: number) => coins.format(cents / 100)

/** "12.5" → 1250 cents; NaN for anything that isn't a plain amount with at most 2 decimals. */
export const parseAmount = (text: string) =>
  /^\d+(\.\d{1,2})?$/.test(text.trim()) ? Math.round(parseFloat(text) * 100) : NaN

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumSignificantDigits: 3 })

/** 1.07 → "1.07x"; from 1,000 on, compact so badges stay readable: 41321.43 → "41.3Kx". */
export const formatMultiplier = (multiplier: number) =>
  `${multiplier < 1000 ? multiplier.toFixed(2) : compact.format(multiplier)}x`
