import { motion } from 'framer-motion'
import { skills } from '@/data'
import { canLearnSkill, hasSkill, upgradeCostFor } from '@/systems'
import type { ScreenProps } from '@/App'
import { Hud } from '@/components/Hud'
import { GameButton } from '@/components/ui/GameButton'

const TYPE_GROUPS = [
  { type: 'space', label: '空间系', icon: 'fa-solid fa-arrows-to-dot', accent: '#38d6f5', cls: 'text-cyan-300' },
  { type: 'spirit', label: '御灵系', icon: 'fa-solid fa-arrow-up-right-dots', accent: '#a78bfa', cls: 'text-violet-300' },
  { type: 'fire', label: '元素 · 火', icon: 'fa-solid fa-fire-flame-curved', accent: '#fb7185', cls: 'text-rose-300' },
  { type: 'thunder', label: '元素 · 雷', icon: 'fa-solid fa-bolt', accent: '#facc15', cls: 'text-yellow-300' },
  { type: 'perception', label: '感知系', icon: 'fa-solid fa-eye', accent: '#34d399', cls: 'text-emerald-300' },
] as const

function costText(cost: Record<string, number>): string {
  const names: Record<string, string> = { shards: '碎片', cores: '核心', crystals: '灵晶' }
  return Object.entries(cost)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${names[k] ?? k}×${v}`)
    .join(' + ')
}

export function AbilitiesPage({ state, actions }: ScreenProps) {
  const player = state.player
  if (!player) return null

  return (
    <div className="min-h-screen pb-8">
      <Hud player={player} onNavigate={actions.navigate} />

      <div className="mx-auto mt-6 max-w-5xl px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-glow-gold text-2xl tracking-[0.15em] text-gold-bright sm:text-3xl sm:tracking-[0.25em]">能力树</h2>
            <p className="mt-1 text-xs text-white/50 sm:text-sm">点亮节点，掌握灵能奥义。已解锁的能力将散发灵力微光。</p>
          </div>
          <GameButton variant="ghost" className="px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm" icon="fa-solid fa-arrow-left" onClick={() => actions.navigate('main')}>
            <span className="hidden sm:inline">返回</span>
          </GameButton>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {TYPE_GROUPS.map((group) => {
            const groupSkills = skills.filter((s) => s.type === group.type)
            return (
              <motion.section
                key={group.type}
                className="glass-strong rounded-2xl p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="mb-4 flex items-center gap-2">
                  <i className={`${group.icon} text-xl ${group.cls}`} />
                  <span className="font-display text-lg text-white">{group.label}</span>
                </h3>
                <div className="space-y-3">
                  {groupSkills.map((def) => {
                    const owned = hasSkill(player, def.id)
                    const st = player.skills.find((s) => s.definitionId === def.id)
                    const learnable = canLearnSkill(player, def.id)
                    const locked = player.level < def.levelRequirement
                    return (
                      <div
                        key={def.id}
                        className={`glass rounded-xl p-3 transition-all ${
                          owned ? 'glow-spirit' : locked ? 'opacity-50' : ''
                        }`}
                        style={owned ? { borderColor: `${group.accent}66` } : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg"
                            style={{
                              background: `${group.accent}1f`,
                              border: `1px solid ${owned ? group.accent : 'rgba(255,255,255,0.15)'}`,
                              color: owned ? group.accent : '#ffffff55',
                              boxShadow: owned ? `0 0 14px ${group.accent}55` : 'none',
                            }}
                          >
                            <i className={def.icon} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">{def.name}</span>
                              {owned && <span className="text-xs text-gold-bright">Lv.{st!.level}</span>}
                            </div>
                            <p className="mt-0.5 text-xs leading-snug text-white/45">
                              {def.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2">
                          <div className="text-xs text-white/40">
                            <span className="mr-2">
                              <i className="fa-solid fa-bolt mr-1" />
                              消耗 {def.cost}
                            </span>
                            <span>
                              <i className="fa-solid fa-clock mr-1" />
                              冷却 {def.cooldown}
                            </span>
                          </div>

                          {!owned ? (
                            locked ? (
                              <span className="text-xs text-white/40">需 Lv.{def.levelRequirement}</span>
                            ) : (
                              <GameButton
                                variant="void"
                                className="px-3 py-1.5 text-xs"
                                disabled={!learnable}
                                onClick={() => actions.learnSkill(def.id)}
                              >
                                学习 · {costText(def.learnCost)}
                              </GameButton>
                            )
                          ) : st!.level >= def.maxLevel ? (
                            <span className="text-xs text-emerald-300">已至臻境</span>
                          ) : (
                            <GameButton
                              variant="metal"
                              className="px-3 py-1.5 text-xs"
                              disabled={player.resources.shards < upgradeCostFor(def.id, st!.level).shards}
                              onClick={() => actions.upgradeSkill(def.id)}
                            >
                              升级 · {costText(def.upgradeCost)}
                            </GameButton>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.section>
            )
          })}
        </div>
      </div>
    </div>
  )
}