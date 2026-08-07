import type { LogEntry } from '@/types'

interface BattleLogProps {
  entries: LogEntry[]
  className?: string
}

const TONE_CLASS: Record<LogEntry['tone'], string> = {
  info: 'text-white/70',
  player: 'text-cyan-300',
  enemy: 'text-orange-300',
  success: 'text-emerald-300',
  danger: 'text-red-300',
}

export function BattleLog({ entries, className = '' }: BattleLogProps) {
  return (
    <div className={`glass rounded-xl p-4 ${className}`}>
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
        <i className="fa-solid fa-scroll text-gold-bright" />
        事件日志
      </div>
      <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1 text-sm">
        {entries.length === 0 && <p className="text-white/40">等待事件发生……</p>}
        {entries.map((e) => (
          <p key={e.id} className={`fade-line leading-relaxed ${TONE_CLASS[e.tone]}`}>
            <span className="mr-1.5 text-white/30">·</span>
            {e.text}
          </p>
        ))}
      </div>
    </div>
  )
}