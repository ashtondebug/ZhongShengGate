import { describe, it, expect } from 'vitest'
import { createPlayer, buildRewards, buyItem, shopPriceOf, countOf } from '@/systems'
import { canAfford, payCost, addRewards } from '@/systems'
import { quests } from '@/data'

function playerWithCoins(coins: number) {
  const p = createPlayer('金币测试', 'human')
  return { ...p, resources: { ...p.resources, coins } }
}

describe('金币系统（任务二）', () => {
  it('createPlayer 初始拥有 100 金币', () => {
    expect(createPlayer('新人', 'human').resources.coins).toBe(100)
  })

  it('资源函数支持金币运算', () => {
    const held = { crystals: 0, shards: 0, cores: 0, actionPoints: 0, coins: 100 }
    expect(canAfford(held, { coins: 80 })).toBe(true)
    expect(canAfford(held, { coins: 120 })).toBe(false)
    expect(payCost(held, { coins: 30 }).coins).toBe(70)
    expect(addRewards(held, { coins: 50 }).coins).toBe(150)
  })

  it('buildRewards 包含金币且 BOSS 额外 +50', () => {
    expect(buildRewards(3).coins).toBe(10 + 3 * 4)
    expect(buildRewards(3, undefined, true).coins).toBe(10 + 3 * 4 + 50)
  })

  it('buyItem 金币充足则扣款并入背包', () => {
    const next = buyItem(playerWithCoins(2000), 'luopan')! // 罗盘 1500
    expect(next.resources.coins).toBe(500)
    expect(countOf(next.inventory, 'luopan')).toBe(1)
  })

  it('buyItem 可购买医疗药品', () => {
    const next = buyItem(playerWithCoins(200), 'qinglingguo')! // 青灵果 100
    expect(next.resources.coins).toBe(100)
    expect(countOf(next.inventory, 'qinglingguo')).toBe(1)
  })

  it('buyItem 金币不足返回 null', () => {
    expect(buyItem(playerWithCoins(100), 'luopan')).toBeNull()
  })

  it('不可购买的剧情物品无法购买', () => {
    expect(shopPriceOf('tianmingzhu')).toBe(0)
    expect(buyItem(playerWithCoins(99999), 'tianmingzhu')).toBeNull()
  })

  it('shopPriceOf 返回正确价格', () => {
    expect(shopPriceOf('luopan')).toBe(1500)
    expect(shopPriceOf('qinglingguo')).toBe(100)
    expect(shopPriceOf('unknown-id')).toBe(0)
  })

  it('所有任务奖励均含金币', () => {
    for (const q of quests) {
      expect(q.rewards.coins ?? 0).toBeGreaterThan(0)
    }
  })
})
