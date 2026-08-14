import { motion } from 'framer-motion'
import { skills } from '@/data'
import { expForNextLevel } from '@/systems'
import type { ScreenProps } from '@/App'
import { Hud } from '@/components/Hud'
import { PlayerPortrait } from '@/components/PlayerPortrait'
import { AvatarUploader } from '@/components/AvatarUploader'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatBar } from '@/components/ui/StatBar'
import { GameButton } from '@/components/ui/GameButton'
import { paths } from '@/data'

const ELEMENT_LABEL: Record<string, string> = {
  space: '空间系',
  spirit: '御灵系',
  fire: '元素·火',
  water: '元素·水',
  wind: '元素·风',
  thunder: '元素·雷',
  perception: '感知系',
}

export function CharacterPage({ state, actions }: ScreenProps) {
  const player = state.player
  if (!player) return null
  const pathDef = paths.find((p) => p.id === player.path)!
  const mySkills = player.skills.map((s) => skills.find((d) => d.id === s.definitionId)!)

  return (
    <div className="min-h-screen pb-8">
      <Hud player={player} onNavigate={actions.navigate} />

      <div className="mx-auto mt-6 max-w-6xl px-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-glow-gold text-2xl tracking-[0.15em] text-gold-bright sm:text-3xl sm:tracking-[0.25em]">角色档案</h2>
          <GameButton variant="ghost" className="px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm" icon="fa-solid fa-arrow-left" onClick={() => actions.navigate('main')}>
            <span className="hidden sm:inline">返回</span>
          </GameButton>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_1fr_1fr]">
          {/* 左：角色展示 */}
          <GlassCard strong className="flex flex-col items-center text-center">
            <div className="relative mb-5">
              <PlayerPortrait path={player.path} avatar={player.avatar} size="xl" />
              <span className="pulse-dot absolute -right-1 -bottom-1 h-4 w-4 rounded-full bg-emerald-400" />
            </div>
            <AvatarUploader current={player.avatar} onChange={actions.setAvatar} />
            <h3 className="font-display text-2xl text-gold-bright">{player.name}</h3>
            <p className="mt-1 text-sm text-cyan-300">{pathDef.name}</p>
            <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-black/25 py-2">
              <span className="text-sm text-white/50">等级</span>
              <span className="font-display text-2xl text-gold-bright">Lv.{player.level}</span>
            </div>
            <div className="mt-4 w-full space-y-3">
              <StatBar label="生命" value={player.hp} max={player.maxHp} color="hp" />
              <StatBar label="灵力" value={player.spirit} max={player.maxSpirit} color="spirit" />
              <StatBar label="经验" value={player.exp} max={expForNextLevel(player.level)} color="exp" />
            </div>
          </GlassCard>

          {/* 中：属性面板 */}
          <GlassCard>
            <h3 className="mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-white/50">
              <i className="fa-solid fa-bolt text-gold-bright" />
              基础属性
            </h3>
            <div className="space-y-3">
              {[
                { key: 'spirit', label: '灵能', icon: 'fa-solid fa-hand-sparkles', desc: '影响技能威力与伤害' },
                { key: 'capacity', label: '灵力容量', icon: 'fa-solid fa-water', desc: '决定灵力上限' },
                { key: 'perception', label: '感知', icon: 'fa-solid fa-eye', desc: '提升探查与事件成功率' },
                { key: 'control', label: '控制', icon: 'fa-solid fa-hands', desc: '提升普通攻击与机关操控' },
                { key: 'constitution', label: '体质', icon: 'fa-solid fa-heart', desc: '决定生命上限与减伤' },
                { key: 'luck', label: '幸运', icon: 'fa-solid fa-clover', desc: '暴击率与随机收益' },
              ].map((s) => (
                <div key={s.key} className="flex items-center gap-3">
                  <i className={`${s.icon} w-6 text-center text-cyan-300`} />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">{s.label}</span>
                      <span className="font-semibold text-cyan-300">{player.stats[s.key as keyof typeof player.stats]}</span>
                    </div>
                    <p className="text-xs text-white/35">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 右：能力概览 */}
          <GlassCard>
            <h3 className="mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-white/50">
              <i className="fa-solid fa-wand-magic-sparkles text-gold-bright" />
              已掌握能力
            </h3>
            <div className="space-y-2">
              {mySkills.map((def) => {
                const st = player.skills.find((s) => s.definitionId === def.id)!
                return (
                  <motion.div
                    key={def.id}
                    className="glass flex items-center gap-3 rounded-xl p-3"
                    whileHover={{ x: 4 }}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-lg text-cyan-300 ring-1 ring-cyan-300/30">
                      <i className={def.icon} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{def.name}</span>
                        <span className="text-xs text-gold-bright">Lv.{st.level}</span>
                      </div>
                      <p className="truncate text-xs text-white/40">
                        {ELEMENT_LABEL[def.type]} · 消耗 {def.cost}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <div className="mt-4">
              <GameButton variant="spirit" icon="fa-solid fa-wand-magic-sparkles" onClick={() => actions.navigate('abilities')}>
                前往能力树修炼
              </GameButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}