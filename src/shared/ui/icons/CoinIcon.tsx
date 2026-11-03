export function CoinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7.5" fill="var(--coin)" />
      <circle cx="8" cy="8" r="5" fill="none" stroke="#c47f00" strokeWidth="1.5" />
    </svg>
  )
}
