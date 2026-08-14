import type { Resources } from '@/types'

export const EMPTY_RESOURCES = (): Resources => ({
  crystals: 0,
  shards: 0,
  cores: 0,
  actionPoints: 0,
  coins: 0,
})

export function canAfford(held: Resources, cost: Partial<Resources>): boolean {
  return (Object.keys(cost) as (keyof Resources)[]).every(
    (key) => (held[key] ?? 0) >= (cost[key] ?? 0),
  )
}

export function payCost(held: Resources, cost: Partial<Resources>): Resources {
  const next = { ...held }
  ;(Object.keys(cost) as (keyof Resources)[]).forEach((key) => {
    next[key] = Math.max(0, (next[key] ?? 0) - (cost[key] ?? 0))
  })
  return next
}

export function addRewards(held: Resources, reward: Partial<Resources>): Resources {
  const next = { ...held }
  ;(Object.keys(reward) as (keyof Resources)[]).forEach((key) => {
    next[key] = (next[key] ?? 0) + (reward[key] ?? 0)
  })
  return next
}

/**
 * 统一资源变更入口，便于日后接入同步/校验逻辑。
 */
export function applyResources(held: Resources, delta: Partial<Resources>): Resources {
  return addRewards(held, delta)
}