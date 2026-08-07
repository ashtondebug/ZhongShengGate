import { useState } from 'react'
import { motion } from 'framer-motion'
import type { PathId } from '@/types'
import { paths } from '@/data'
import type { ScreenProps } from '@/App'
import { GlassCard } from '@/components/ui/GlassCard'
import { GameButton } from '@/components/ui/GameButton'

const STAT_LABELS: { key: keyof (typeof paths)[0]['stats']; label: string }[] = [
  { key: 'spirit', label: '灵能' },
  { key: 'capacity', label: '容量' },
  { key: 'perception', label: '感知' },
  { key: 'control', label: '控制' },
  { key: 'constitution', label: '体质' },
  { key: 'luck', label: '幸运' },
]

export function CharacterCreatePage({ actions }: ScreenProps) {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<PathId>('human')

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-10">
      <motion.h2
        className="font-display text-glow-gold mb-6 text-center text-3xl tracking-[0.2em] text-gold-bright sm:text-4xl sm:tracking-[0.3em]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        选择你的道
      </motion.h2>
      <motion.p
        className="mb-8 text-center text-sm tracking-widest text-cyan-200/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        第一次跨过众生界，你将踏上哪条命运之途？
      </motion.p>

      <div className="mb-8 w-full max-w-md">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={12}
          placeholder="输入探索者之名……"
          className="glass w-full rounded-xl px-4 py-3 text-center font-display text-lg text-gold-bright placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-cyan-300/60"
        />
      </div>

      <div className="grid w-full gap-4 md:grid-cols-3">
        {paths.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
          >
            <GlassCard
              strong={selected === p.id}
              glow={selected === p.id ? 'spirit' : 'none'}
              className={`h-full transition-all ${selected === p.id ? 'ring-1 ring-cyan-300/50' : 'hover:border-white/30'}`}
              onClick={() => setSelected(p.id)}
            >
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl text-white/90"
                  style={{ background: `${p.accent}22`, border: `1px solid ${p.accent}55` }}
                >
                  <i className={p.icon} />
                </span>
                <div>
                  <h3 className="font-display text-xl text-white">{p.name}</h3>
                  {selected === p.id && (
                    <span className="text-xs text-cyan-300">✓ 已选择</span>
                  )}
                </div>
              </div>
              <p className="mb-4 min-h-[3.5rem] text-sm leading-relaxed text-white/65">{p.description}</p>
              <div className="grid grid-cols-3 gap-2">
                {STAT_LABELS.map((s) => (
                  <div key={s.key} className="rounded-lg bg-black/25 px-2 py-1.5 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-white/40">{s.label}</div>
                    <div className="text-sm font-semibold" style={{ color: p.accent }}>
                      {p.stats[s.key]}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <GameButton variant="ghost" onClick={() => actions.navigate('home')}>
          <i className="fa-solid fa-arrow-left mr-2" />
          返回
        </GameButton>
        <GameButton
          variant="metal"
          icon="fa-solid fa-key"
          onClick={() => actions.createPlayer(name, selected)}
        >
          踏入众生界
        </GameButton>
      </div>
    </div>
  )
}