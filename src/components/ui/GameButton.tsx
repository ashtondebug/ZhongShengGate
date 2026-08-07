import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { audio } from '@/audio'

type Variant = 'metal' | 'spirit' | 'ghost' | 'danger' | 'void'

interface GameButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: Variant
  disabled?: boolean
  className?: string
  icon?: string
}

const VARIANTS: Record<Variant, string> = {
  metal: 'metal-button text-gold-bright font-display tracking-[0.2em]',
  spirit: 'bg-gradient-to-br from-cyan-500/30 to-sky-700/30 text-cyan-100 border border-cyan-300/40 hover:glow-spirit',
  ghost: 'bg-white/5 text-white/80 border border-white/15 hover:bg-white/10 hover:text-white',
  danger: 'bg-gradient-to-br from-red-500/30 to-rose-800/30 text-red-100 border border-red-300/40 hover:shadow-[0_0_18px_rgba(244,63,94,0.4)]',
  void: 'bg-gradient-to-br from-violet-500/30 to-purple-800/30 text-violet-100 border border-violet-300/40 hover:glow-void',
}

export function GameButton({
  children,
  onClick,
  variant = 'metal',
  disabled,
  className = '',
  icon,
}: GameButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={disabled ? undefined : () => { audio.play('click'); onClick?.() }}
      disabled={disabled}
      className={`relative rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200 ${
        VARIANTS[variant]
      } ${disabled ? 'cursor-not-allowed opacity-40 saturate-0' : 'cursor-pointer'} ${className}`}
    >
      {icon && <i className={`${icon} mr-2`} />}
      {children}
    </motion.button>
  )
}