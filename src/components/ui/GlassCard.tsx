import type { CSSProperties, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: ReactNode
  className?: string
  strong?: boolean
  glow?: 'spirit' | 'gold' | 'void' | 'none'
  onClick?: () => void
  style?: CSSProperties
}

export function GlassCard({ children, className = '', strong, glow = 'none', onClick, style }: GlassCardProps) {
  const glowClass = glow === 'spirit' ? ' glow-spirit' : glow === 'gold' ? ' glow-gold' : glow === 'void' ? ' glow-void' : ''
  const base = strong ? 'glass-strong' : 'glass'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onClick={onClick}
      style={style}
      className={`rounded-2xl p-5 ${base}${glowClass} ${onClick ? 'cursor-pointer transition-transform hover:scale-[1.01]' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}