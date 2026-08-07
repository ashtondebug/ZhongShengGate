import type { ScreenProps } from '@/App'
import { Hud } from '@/components/Hud'
import { GameButton } from '@/components/ui/GameButton'
import { ResourceBar, ResourceItem } from '@/components/ui/ResourceBar'
import { items, regions } from '@/data'
import { countOf } from '@/systems'

const CATEGORIES = [
  { key: 'consumable', label: '消耗品', icon: 'fa-solid fa-flask', accent: '#38d6f5' },
  { key: 'material', label: '材料', icon: 'fa-solid fa-gem', accent: '#a78bfa' },
  { key: 'relic', label: '遗物', icon: 'fa-solid fa-feather', accent: '#facc15' },
] as const

export function InventoryPage({ state, actions }: ScreenProps) {
  const player = state.player
  if (!player) return null

  const unlockedCount = player.unlockedRegions.length
  const maxRegions = regions.length
  const totalItems = player.inventory.reduce((acc, it) => acc + it.quantity, 0)

  return (
    <div className="min-h-screen pb-8">
      <Hud player={player} onNavigate={actions.navigate} />

      <div className="mx-auto mt-6 max-w-5xl px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-glow-gold text-2xl tracking-[0.15em] text-gold-bright sm:text-3xl sm:tracking-[0.25em]">背包</h2>
            <p className="mt-1 text-xs text-white/50 sm:text-sm">历尽艰险所得的物品与资源。消耗品可即时使用，材料与遗物可换取灵晶。</p>
          </div>
          <GameButton variant="ghost" className="px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm" icon="fa-solid fa-arrow-left" onClick={() => actions.navigate('main')}>
            <span className="hidden sm:inline">返回</span>
          </GameButton>
        </div>

        {/* 资源总览 */}
        <div className="glass mb-5 rounded-2xl p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm uppercase tracking-widest text-white/50">
            <i className="fa-solid fa-coins text-amber-300" /> 资源总览
          </h3>
          <ResourceBar>
            <ResourceItem icon="fa-solid fa-gem" value={player.resources.crystals} label="灵晶" tone="gold" />
            <ResourceItem icon="fa-solid fa-layer-group" value={player.resources.shards} label="灵能碎片" tone="spirit" />
            <ResourceItem icon="fa-solid fa-cube" value={player.resources.cores} label="未知核心" tone="void" />
            <ResourceItem icon="fa-solid fa-bolt" value={player.resources.actionPoints} label="探索点" tone="gold" />
          </ResourceBar>
          <p className="mt-3 text-xs text-white/35">
            已解锁区域 {unlockedCount}/{maxRegions}，背包物品共 {totalItems} 件。
          </p>
        </div>

        {/* 物品分类 */}
        {CATEGORIES.map((cat) => {
          const defs = items.filter((i) => i.category === cat.key)
          const owned = defs.filter((d) => countOf(player.inventory, d.id) > 0)
          return (
            <div key={cat.key} className="mb-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm uppercase tracking-widest text-white/50">
                <i className={cat.icon} style={{ color: cat.accent }} /> {cat.label}
              </h3>
              {owned.length === 0 ? (
                <p className="glass rounded-2xl p-4 text-sm text-white/35">尚无此类物品，深入探索即可获得。</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {owned.map((def) => {
                    const qty = countOf(player.inventory, def.id)
                    return (
                      <div key={def.id} className="glass flex flex-col rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                          <span
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                            style={{ background: `${cat.accent}1f`, border: `1px solid ${cat.accent}55`, color: cat.accent }}
                          >
                            <i className={def.icon} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-display text-base text-white">{def.name}</h4>
                              <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs text-white/60">×{qty}</span>
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-white/45">{def.description}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          {def.category === 'consumable' && (
                            <GameButton
                              variant="spirit"
                              className="flex-1 px-3 py-1.5 text-xs"
                              icon="fa-solid fa-hand-holding-heart"
                              onClick={() => actions.useItem(def.id)}
                            >
                              使用
                            </GameButton>
                          )}
                          <GameButton
                            variant="ghost"
                            className="flex-1 px-3 py-1.5 text-xs"
                            icon="fa-solid fa-sack-dollar"
                            onClick={() => actions.sellItem(def.id)}
                          >
                            出售 {def.sellPrice}
                          </GameButton>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
