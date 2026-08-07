import { describe, it, expect } from 'vitest'
import { createPlayer, shouldSpawnBoss } from '@/systems'
import { addItem, countOf, removeItem, useItem, sellItems } from '@/systems'
import { items } from '@/data'

describe('inventorySystem', () => {
  const player = createPlayer('背包客', 'human')

  it('addItem 堆叠合并与去重', () => {
    let inv = addItem([], 'linglu')
    expect(inv).toHaveLength(1)
    inv = addItem(inv, 'linglu', 2)
    expect(inv).toHaveLength(1)
    expect(countOf(inv, 'linglu')).toBe(3)
  })

  it('removeItem 数量不足返回 null', () => {
    const inv = addItem([], 'guwen', 2)
    expect(removeItem(inv, 'guwen', 3)).toBeNull()
    const after = removeItem(inv, 'guwen', 2)
    expect(after).not.toBeNull()
    expect(after).toHaveLength(0)
  })

  it('useItem 消耗品恢复生命', () => {
    const wounded = { ...player, hp: 5, inventory: addItem(player.inventory, 'linglu') }
    const after = useItem(wounded, 'linglu')
    expect(after).not.toBeNull()
    expect(after!.hp).toBe(Math.min(wounded.maxHp, 5 + 35))
    expect(countOf(after!.inventory, 'linglu')).toBe(0)
  })

  it('useItem 非消耗品不可用', () => {
    expect(useItem(player, 'guwen')).toBeNull()
  })

  it('sellItems 出售换灵晶', () => {
    const holder = { ...player, inventory: addItem(player.inventory, 'xingsui', 2) }
    const after = sellItems(holder, 'xingsui', 1)
    expect(after).not.toBeNull()
    expect(after!.resources.crystals).toBe(player.resources.crystals + 35)
    expect(countOf(after!.inventory, 'xingsui')).toBe(1)
  })
})

describe('隐藏 BOSS 触发条件', () => {
  it('等级不足不触发', () => {
    expect(shouldSpawnBoss(7, 'voidlands', 0.05)).toBe(false)
  })

  it('非未知领域不触发', () => {
    expect(shouldSpawnBoss(9, 'forest', 0.05)).toBe(false)
  })

  it('未知领域且等级达标且 roll<0.15 触发', () => {
    expect(shouldSpawnBoss(9, 'voidlands', 0.05)).toBe(true)
  })

  it('roll 达到 0.15 不触发', () => {
    expect(shouldSpawnBoss(9, 'voidlands', 0.15)).toBe(false)
  })
})
