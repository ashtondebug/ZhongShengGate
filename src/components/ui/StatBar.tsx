import { motion } from 'framer-motion'

interface StatBarProps {
  label?: string
  value: number
  max: number
  color?: 'hp' | 'spirit' | 'exp' | 'gold'
  showText?: boolean
  className?: string
}

const COLORS = {
  hp: 'from-emerald-400 to-teal-300',
  spirit: 'from-sky-400 to-cyan-300',
  exp: 'from-amber-400 to-yellow-200',
  gold: 'from-yellow-500 to-amber-300',
}

export function StatBar({ label, value, max, color = 'hp', showText = true, className = '' }: StatBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const textColor =
    color === 'hp'
      ? 'text-emerald-300'
      : color === 'spirit'
        ? 'text-cyan-300'
        : color === 'exp'
          ? 'text-amber-300'
          : 'text-yellow-300'
  return (
    <div className={`min-w-0 ${className}`}>
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="uppercase tracking-wider text-white/50">{label}</span>
          {showText && (
            <span className={textColor}>
              {Math.round(value)} / {Math.round(max)}
            </span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/40 ring-1 ring-white/10">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${COLORS[color]}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ boxShadow: '0 0 8px rgba(56,214,245,0.5)' }}
        />
      </div>
    </div>
  )
}