import type { ReactNode } from 'react'

/** A 24×24 line icon in the cs2skin header style, drawn in the text colour. */
function LineIcon({
  size = 18,
  strokeWidth = 2,
  children,
}: {
  size?: number
  strokeWidth?: number
  children: ReactNode
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const ShieldCheckIcon = () => (
  <LineIcon>
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </LineIcon>
)

export const BookIcon = () => (
  <LineIcon>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
    <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
  </LineIcon>
)

/** A speaker with waves, or crossed out when muted. */
export const SoundIcon = ({ on }: { on: boolean }) => (
  <LineIcon>
    <path d="M11 5 6 9H3v6h3l5 4z" />
    {on ? (
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
    ) : (
      <path d="m16 9 6 6M22 9l-6 6" />
    )}
  </LineIcon>
)

/** Circular arrows around a play triangle. */
export const AutoplayIcon = () => (
  <LineIcon size={20}>
    <path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3" />
    <path d="M18 3v4h-4M6 21v-4h4" />
    <path d="m10 9 5 3-5 3z" fill="currentColor" />
  </LineIcon>
)

export const CloseIcon = () => (
  <LineIcon size={24} strokeWidth={2.5}>
    <path d="M6 6l12 12M18 6 6 18" />
  </LineIcon>
)
