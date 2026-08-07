import { useState } from 'react'
import { motion } from 'framer-motion'
import type { RegionDefinition } from '@/types'
import { regions } from '@/data'
import type { ScreenProps } from '@/App'
import { Hud } from '@/components/Hud'
import { Modal } from '@/components/ui/Modal'
import { GameButton } from '@/components/ui/GameButton'

const DANGER_META = {
  low: { label: '低', cls: 'text-emerald-300 border-emerald-300/40', dot: 'bg-emerald-400/70', glow: 'rgba(52,211,153,0.5)' },
  medium: { label: '中', cls: 'text-amber-300 border-amber-300/40', dot: 'bg-amber-400/70', glow: 'rgba(251,191,36,0.5)' },
  high: { label: '高', cls: 'text-red-300 border-red-300/40', dot: 'bg-red-400/70', glow: 'rgba(248,113,113,0.5)' },
}

// 地图连接线
const LINKS: [string, string][] = [
  ['city', 'forest'],
  ['forest', 'ruins'],
  ['ruins', 'voidlands'],
  ['ruins', 'spiritrealm'],
]

export function WorldMapPage({ state, actions }: ScreenProps) {
  const player = state.player
  const [selected, setSelected] = useState<RegionDefinition | null>(null)
  if (!player) return null

  const unlocked = (id: string) => player.unlockedRegions.includes(id)

  return (
    <div className="min-h-screen pb-8">
      <Hud player={player} onNavigate={actions.navigate} />

      <div className="mx-auto mt-6 max-w-6xl px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-glow-gold text-xl tracking-[0.12em] text-gold-bright sm:text-3xl sm:tracking-[0.25em]">
              众生界 · 战略地图
            </h2>
            <p className="mt-1 text-xs text-white/50 sm:text-sm">选择区域，消耗探索点进行深入。</p>
          </div>
          <div className="flex gap-2">
            <GameButton variant="ghost" className="px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm" icon="fa-solid fa-hands-praying" onClick={actions.rest}>
              <span className="hidden sm:inline">调息</span>
            </GameButton>
            <GameButton variant="ghost" className="px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm" icon="fa-solid fa-arrow-left" onClick={() => actions.navigate('main')}>
              <span className="hidden sm:inline">返回</span>
            </GameButton>
          </div>
        </div>

        <div className="glass-strong relative aspect-[4/3] w-full overflow-hidden rounded-2xl sm:aspect-[16/10]">
          {/* 背景纹理 */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(43,86,140,0.15),transparent_70%)]" />

          {/* 连接线 */}
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            {LINKS.map(([a, b], i) => {
              const ra = regions.find((r) => r.id === a)!
              const rb = regions.find((r) => r.id === b)!
              const active = unlocked(a) && unlocked(b)
              return (
                <line
                  key={i}
                  x1={ra.nodeX}
                  y1={ra.nodeY}
                  x2={rb.nodeX}
                  y2={rb.nodeY}
                  stroke={active ? 'rgba(56,214,245,0.45)' : 'rgba(255,255,255,0.12)'}
                  strokeWidth={0.5}
                  strokeDasharray={active ? 'none' : '1 1.5'}
                />
              )
            })}
          </svg>

          {/* 区域节点 */}
          {regions.map((r, i) => {
            const isUnlocked = unlocked(r.id)
            const dm = DANGER_META[r.danger]
            return (
              <motion.button
                key={r.id}
                className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: `${r.nodeX}%`, top: `${r.nodeY}%` }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 220, damping: 18 }}
                whileHover={{ scale: 1.15 }}
                onClick={() => setSelected(r)}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-xl sm:h-20 sm:w-20 sm:text-3xl ${
                    isUnlocked ? 'text-cyan-100' : 'text-white/40'
                  }`}
                  style={{
                    background: isUnlocked
                      ? `radial-gradient(circle at 35% 30%, ${dm.glow}, rgba(10,18,36,0.9))`
                      : 'radial-gradient(circle, rgba(60,60,80,0.5), rgba(10,14,26,0.95))',
                    border: `1px solid ${isUnlocked ? 'rgba(56,214,245,0.6)' : 'rgba(255,255,255,0.15)'}`,
                    boxShadow: isUnlocked ? `0 0 20px ${dm.glow}` : 'none',
                  }}
                >
                  <i className={r.resourceIcon} />
                </span>
                <span
                  className={`mt-1 max-w-[4.5rem] truncate rounded-full border px-1.5 py-0.5 text-[10px] backdrop-blur sm:max-w-none sm:px-2 sm:py-0.5 sm:text-xs ${dm.cls} ${
                    isUnlocked ? '' : 'opacity-50'
                  }`}
                >
                  {isUnlocked ? r.name : '???'}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* 图例 */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-circle text-emerald-400/60" /> 已解锁
          </span>
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-circle text-white/20" /> 未解锁
          </span>
          {(Object.keys(DANGER_META) as (keyof typeof DANGER_META)[]).map((d) => (
            <span key={d} className="flex items-center gap-1.5">
              <span className={`inline-block h-2 w-2 rounded-full ${DANGER_META[d].dot}`} />
              危险 {DANGER_META[d].label}
            </span>
          ))}
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? selected.name : ''}>
        {selected && (
          <div>
            <p className="mb-4 text-sm leading-relaxed text-white/70">{selected.description}</p>
            <div className="mb-4 grid grid-cols-3 gap-2 text-center">
              <div className="glass rounded-lg p-2">
                <div className="text-[10px] text-white/40 sm:text-xs">危险</div>
                <div className={`text-xs font-semibold sm:text-sm ${DANGER_META[selected.danger].cls}`}>
                  {DANGER_META[selected.danger].label}
                </div>
              </div>
              <div className="glass rounded-lg p-2">
                <div className="text-[10px] text-white/40 sm:text-xs">资源</div>
                <div className="truncate text-xs font-semibold text-amber-300 sm:text-sm">
                  <i className={`${selected.resourceIcon} mr-1`} />
                  {selected.resource}
                </div>
              </div>
              <div className="glass rounded-lg p-2">
                <div className="text-[10px] text-white/40 sm:text-xs">消耗</div>
                <div className="text-xs font-semibold text-cyan-300 sm:text-sm">
                  <i className="fa-solid fa-compass mr-1" />
                  {selected.explorationCost} 探索点
                </div>
              </div>
            </div>

            {unlocked(selected.id) ? (
              <div className="flex justify-end gap-2">
                <GameButton variant="ghost" onClick={() => setSelected(null)}>
                  关闭
                </GameButton>
                <GameButton
                  variant="metal"
                  icon="fa-solid fa-compass"
                  disabled={player.resources.actionPoints < selected.explorationCost}
                  onClick={() => {
                    actions.explore(selected.id)
                    setSelected(null)
                  }}
                >
                  {player.resources.actionPoints < selected.explorationCost
                    ? '探索点不足'
                    : '开始探索'}
                </GameButton>
              </div>
            ) : (
              <div>
                <p className="mb-3 text-xs text-white/50">
                  解锁需要 <span className="text-amber-300">{selected.unlockCost} 灵晶</span>
                  {selected.unlockRequires && `，并先探索 ${regions.find((r) => r.id === selected.unlockRequires)?.name}。`}
                </p>
                <div className="flex justify-end gap-2">
                  <GameButton variant="ghost" onClick={() => setSelected(null)}>
                    关闭
                  </GameButton>
                  <GameButton
                    variant="void"
                    icon="fa-solid fa-lock-open"
                    disabled={
                      player.resources.crystals < selected.unlockCost ||
                      (!!selected.unlockRequires && !unlocked(selected.unlockRequires))
                    }
                    onClick={() => {
                      actions.unlockRegion(selected.id)
                      setSelected(null)
                    }}
                  >
                    解锁区域
                  </GameButton>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}