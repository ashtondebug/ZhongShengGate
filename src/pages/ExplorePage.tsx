import { motion } from 'framer-motion'
import { events, regions } from '@/data'
import type { ScreenProps } from '@/App'
import { Hud } from '@/components/Hud'
import { BattleLog } from '@/components/BattleLog'
import { GameButton } from '@/components/ui/GameButton'

const EVENT_TONES = {
  resource: { icon: 'fa-solid fa-droplet', cls: 'text-emerald-300' },
  battle: { icon: 'fa-solid fa-bolt', cls: 'text-red-300' },
  story: { icon: 'fa-solid fa-book-open', cls: 'text-violet-300' },
}

const STAT_LABELS: Record<string, string> = {
  spirit: '灵能',
  capacity: '灵力容量',
  perception: '感知',
  control: '控制',
  constitution: '体质',
  luck: '幸运',
}

const DANGER_LABELS: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
}

export function ExplorePage({ state, actions }: ScreenProps) {
  const player = state.player
  if (!player) return null

  const region = regions.find((r) => r.id === player.activeRegionId)
  const event = events.find((e) => e.id === state.activeEventId)
  const report = state.activeReport

  if (!region) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-white/60">没有可探索的区域。</p>
        <GameButton variant="metal" onClick={() => actions.navigate('worldmap')}>
          返回地图
        </GameButton>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      <Hud player={player} onNavigate={actions.navigate} />

      <div className="mx-auto mt-6 max-w-4xl px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-glow-spirit text-xl tracking-[0.1em] text-cyan-100 sm:text-3xl sm:tracking-[0.2em]">
              <i className={`${region.resourceIcon} mr-2 text-gold-bright`} />
              {region.name}
            </h2>
            <p className="mt-1 text-sm text-white/50">{region.description}</p>
          </div>
          <GameButton variant="ghost" className="px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm" icon="fa-solid fa-arrow-left" onClick={actions.leaveExploration}>
            <span className="hidden sm:inline">返回地图</span>
          </GameButton>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-4">
            {/* 事件窗口 */}
            {!report && event && (
              <motion.div
                key={event.id}
                className="glass-strong glow-spirit rounded-2xl p-4 sm:p-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-2xl ring-1 ring-cyan-300/30">
                    <i className={`${EVENT_TONES[event.type].icon} ${EVENT_TONES[event.type].cls}`} />
                  </span>
                  <div>
                    <h3 className="font-display text-xl text-gold-bright">{event.name}</h3>
                    <span className="text-xs uppercase tracking-widest text-white/40">{event.type}</span>
                  </div>
                </div>

                <p className="fade-line mb-6 text-base leading-relaxed text-white/80">
                  <i className="fa-solid fa-quote-left mr-2 text-cyan-300/60" />
                  {event.flavor}
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {event.options.map((o, i) => {
                    const requiresMet = !o.requires || player.stats[o.requires.stat!] >= o.requires.value
                    return (
                      <motion.button
                        key={o.id}
                        className="glass group rounded-xl p-4 text-left transition-all hover:border-cyan-300/40 hover:glow-spirit"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.08 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => actions.resolveOption(o.id)}
                      >
                        <i className={`${o.icon} mb-2 text-xl ${requiresMet ? 'text-cyan-300 group-hover:text-gold-bright' : 'text-white/25'}`} />
                        <div className="font-semibold text-white">{o.label}</div>
                        {o.requires ? (
                          <div className={`mt-1 text-xs ${requiresMet ? 'text-emerald-300' : 'text-red-300'}`}>
                            <i className="fa-solid fa-bolt mr-1" />
                            {STAT_LABELS[o.requires.stat!] ?? o.requires.stat} ≥ {o.requires.value}
                          </div>
                        ) : (
                          <div className="mt-1 text-xs text-white/35">无前置条件</div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* 结算报告 */}
            {report && (
              <motion.div
                className="glass-strong glow-gold rounded-2xl p-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="font-display mb-3 text-xl tracking-[0.15em] text-gold-bright">
                  <i className="fa-solid fa-scroll mr-2" />
                  事件结算
                </h3>
                <p className="mb-4 text-base leading-relaxed text-white/80">{report.text}</p>

                {report.rewards && (
                  <p className="mb-2 text-sm text-emerald-300">
                    <i className="fa-solid fa-circle-check mr-1" />
                    {formatRewardText(report.rewards)}
                  </p>
                )}
                {report.exp ? (
                  <p className="mb-2 text-sm text-cyan-300">
                    <i className="fa-solid fa-star mr-1" />
                    +{report.exp} 经验
                  </p>
                ) : null}
                {report.damage ? (
                  <p className="mb-2 text-sm text-red-300">
                    <i className="fa-solid fa-heart-crack mr-1" />
                    -{report.damage} 生命
                  </p>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  <GameButton
                    variant="metal"
                    icon="fa-solid fa-compass"
                    disabled={player.resources.actionPoints < region.explorationCost}
                    onClick={actions.rollAgain}
                  >
                    继续探索
                  </GameButton>
                  <GameButton variant="ghost" icon="fa-solid fa-door-closed" onClick={actions.leaveExploration}>
                    离开此地
                  </GameButton>
                </div>
              </motion.div>
            )}
          </div>

          {/* 侧栏 */}
          <div className="flex flex-col gap-4">
            <BattleLog entries={state.log.slice(-12)} />
            <div className="glass rounded-xl p-4 text-sm">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
                <i className="fa-solid fa-circle-info text-cyan-300" />
                区域情报
              </div>
              <ul className="space-y-1.5 text-white/60">
                <li>
                  <i className="fa-solid fa-triangle-exclamation mr-2 text-red-300" />
                  危险等级：{DANGER_LABELS[region.danger] ?? region.danger}
                </li>
                <li>
                  <i className="fa-solid fa-gem mr-2 text-amber-300" />
                  潜在资源：{region.resource}
                </li>
                <li>
                  <i className="fa-solid fa-compass mr-2 text-cyan-300" />
                  每次消耗 {region.explorationCost} 探索点
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatRewardText(r: Record<string, number>): string {
  const names: Record<string, string> = {
    crystals: '灵晶',
    shards: '灵能碎片',
    cores: '未知核心',
    actionPoints: '探索点',
  }
  return Object.entries(r)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `获得 ${names[k] ?? k}×${v}`)
    .join('，')
}