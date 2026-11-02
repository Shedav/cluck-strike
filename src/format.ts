const coins = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 123456 cents → "1,234.56" */
export const formatCoins = (cents: number) => coins.format(cents / 100)

/** "12.5" → 1250 cents; NaN for anything that isn't a plain amount with at most 2 decimals. */
export const parseCoins = (text: string) =>
  /^\d+(\.\d{1,2})?$/.test(text.trim()) ? Math.round(parseFloat(text) * 100) : NaN
