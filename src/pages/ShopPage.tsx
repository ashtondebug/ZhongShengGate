import { useState } from 'react'
import type { ScreenProps } from '@/App'
import { Hud } from '@/components/Hud'
import { GameButton } from '@/components/ui/GameButton'
import { ResourceBar, ResourceItem } from '@/components/ui/ResourceBar'
import { items, equipment } from '@/data'
import { countOf } from '@/systems'
import type { EquipmentCategory, Rarity } from '@/types'

type CatKey = EquipmentCategory | 'medical'

const CATEGORIES: { key: CatKey; label: string; icon: string; accent: string }[] = [
  { key: 'explore', label: '探索', icon: 'fa-solid fa-binoculars', accent: '#38d6f5' },
  { key: 'space', label: '空间', icon: 'fa-solid fa-star-of-life', accent: '#a78bfa' },
  { key: 'defense', label: '防护', icon: 'fa-solid fa-shield-halved', accent: '#fb923c' },
  { key: 'medical', label: '医疗', icon: 'fa-solid fa-kit-medical', accent: '#34d399' },
  { key: 'storage', label: '储存', icon: 'fa-solid fa-warehouse', accent: '#facc15' },
  { key: 'special', label: '特殊', icon: 'fa-solid fa-gem', accent: '#f472b6' },
]

const RARITY_COLOR: Record<Rarity, string> = {
  普通: '#e5e7eb',
  稀有: '#38d6f5',
  史诗: '#a78bfa',
  传说: '#f59e0b',
  神话: '#f472b6',
  剧情: '#f87171',
}

interface GoodCard {
  id: string
  name: string
  icon: string
  rarity?: Rarity
  description: string
  price: number
  purchasable: boolean
  lines: string[]
}

function medicalGoods(): GoodCard[] {
  return items
    .filter((i) => i.price)
    .map((i) => ({
      id: i.id,
      name: i.name,
      icon: i.icon,
      rarity: undefined,
      description: i.description,
      price: i.price!,
      purchasable: true,
      lines: [
        i.healHp ? `恢复生命 ${i.healHp}` : '',
        i.restoreSpirit ? `回复灵力 ${i.restoreSpirit}` : '',
      ].filter(Boolean),
    }))
}

function equipmentGoods(cat: EquipmentCategory): GoodCard[] {
  return equipment
    .filter((e) => e.category === cat)
    .map((e) => ({
      id: e.id,
      name: e.name,
      icon: e.icon,
      rarity: e.rarity,
      description: e.description,
      price: e.price,
      purchasable: e.purchasable,
      lines: [
        e.defense ? `防护 ${e.defense}` : '',
        e.damageReduction ? `伤害减免 ${e.damageReduction}%` : '',
        e.durability ? `耐久 ${e.durability}` : '',
        e.specialEffect ? `特殊 · ${e.specialEffect}` : '',
      ].filter(Boolean),
    }))
}

export function ShopPage({ state, actions }: ScreenProps) {
  const player = state.player
  const [cat, setCat] = useState<CatKey>('explore')
  if (!player) return null

  const goods = cat === 'medical' ? medicalGoods() : equipmentGoods(cat)

  return (
    <div className="min-h-screen pb-8">
      <Hud player={player} onNavigate={actions.navigate} />

      <div className="mx-auto mt-6 max-w-5xl px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-glow-gold text-2xl tracking-[0.15em] text-gold-bright sm:text-3xl sm:tracking-[0.25em]">
              商城
            </h2>
            <p className="mt-1 text-xs text-white/50 sm:text-sm">
              以金币换取法宝与丹药，助你走得更远、看得更多。装备穿戴系统即将开放。
            </p>
          </div>
          <GameButton
            variant="ghost"
            className="px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm"
            icon="fa-solid fa-arrow-left"
            onClick={() => actions.navigate('main')}
          >
            <span className="hidden sm:inline">返回</span>
          </GameButton>
        </div>

        <div className="glass mb-5 rounded-2xl p-4">
          <ResourceBar>
            <ResourceItem
              icon="fa-solid fa-coins"
              value={player.resources.coins}
              label="金币"
              tone="gold"
            />
            <ResourceItem
              icon="fa-solid fa-gem"
              value={player.resources.crystals}
              label="灵晶"
              tone="gold"
            />
          </ResourceBar>
        </div>

        {/* 分类标签 */}
        <div className="mb-5 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-all ${
                cat === c.key
                  ? 'glow-spirit border-cyan-300/60 bg-cyan-400/10 text-white'
                  : 'border-white/10 text-white/55 hover:border-white/30 hover:text-white'
              }`}
            >
              <i className={c.icon} style={{ color: c.accent }} />
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {goods.map((g) => {
            const owned = countOf(player.inventory, g.id)
            const affordable = g.purchasable && player.resources.coins >= g.price
            return (
              <div key={g.id} className="glass flex flex-col rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{
                      background: `${g.rarity ? RARITY_COLOR[g.rarity] : '#34d399'}1f`,
                      border: `1px solid ${g.rarity ? RARITY_COLOR[g.rarity] : '#34d399'}55`,
                      color: g.rarity ? RARITY_COLOR[g.rarity] : '#34d399',
                    }}
                  >
                    <i className={g.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display text-base text-white">{g.name}</h4>
                      {g.rarity && (
                        <span
                          className="rounded-full border px-2 py-0.5 text-[10px]"
                          style={{ borderColor: `${RARITY_COLOR[g.rarity]}66`, color: RARITY_COLOR[g.rarity] }}
                        >
                          {g.rarity}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-white/45">{g.description}</p>
                    {g.lines.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {g.lines.map((l) => (
                          <span key={l} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/55">
                            {l}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-white/40">
                    {owned > 0 ? (
                      <>
                        持有 <span className="text-amber-300">×{owned}</span>
                      </>
                    ) : (
                      '未拥有'
                    )}
                  </span>
                  {!g.purchasable ? (
                    <span className="rounded-lg border border-red-400/40 px-3 py-1.5 text-xs text-red-300">
                      剧情物品 · 不出售
                    </span>
                  ) : (
                    <GameButton
                      variant="metal"
                      className="px-3 py-1.5 text-xs"
                      icon="fa-solid fa-coins"
                      disabled={!affordable}
                      onClick={() => actions.buyItem(g.id)}
                    >
                      {affordable ? `购买 ${g.price}` : `需 ${g.price}`}
                    </GameButton>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
