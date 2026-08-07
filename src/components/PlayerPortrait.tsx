import type { PathId } from '@/types'
import { paths } from '@/data'

interface PlayerPortraitProps {
  path: PathId
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  sm: 'w-10 h-10 text-xl',
  md: 'w-16 h-16 text-3xl',
  lg: 'w-20 h-20 text-3xl sm:w-28 sm:h-28 sm:text-5xl',
  xl: 'w-32 h-32 text-5xl sm:w-40 sm:h-40 sm:text-6xl',
}

export function PlayerPortrait({ path, size = 'md', className = '' }: PlayerPortraitProps) {
  const def = paths.find((p) => p.id === path)!
  return (
    <div
      className={`relative flex items-center justify-center rounded-full ${SIZES[size]} ${className}`}
      style={{
        background: `radial-gradient(circle at 30% 25%, ${def.accent}44, transparent 60%), linear-gradient(160deg, rgba(20,32,58,0.9), rgba(8,14,30,0.95))`,
        border: `1px solid ${def.accent}66`,
        boxShadow: `0 0 24px ${def.accent}33, inset 0 0 18px ${def.accent}22`,
      }}
    >
      <i className={`${def.icon} text-white/90`} style={{ textShadow: `0 0 14px ${def.accent}` }} />
      <span className="pulse-dot absolute inset-0 rounded-full ring-1 ring-white/10" />
    </div>
  )
}