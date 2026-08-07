import type { ReactNode } from 'react'

interface ResourceBarProps {
  children: ReactNode
  className?: string
}

export function ResourceBar({ children, className = '' }: ResourceBarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {children}
    </div>
  )
}

interface ResourceItemProps {
  icon: string
  value: number
  label: string
  tone?: 'spirit' | 'gold' | 'void'
  className?: string
}

const TONES = {
  spirit: 'text-cyan-300',
  gold: 'text-amber-300',
  void: 'text-violet-300',
}

export function ResourceItem({ icon, value, label, tone = 'spirit', className = '' }: ResourceItemProps) {
  return (
    <div
      className={`glass flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${className}`}
      title={label}
    >
      <i className={`${icon} ${TONES[tone]} text-base`} />
      <span className="font-semibold text-white/90 tabular-nums">{value}</span>
      <span className="hidden text-xs text-white/45 sm:inline">{label}</span>
    </div>
  )
}