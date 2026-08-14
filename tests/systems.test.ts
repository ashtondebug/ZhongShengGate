import { describe, it, expect } from 'vitest'
import { createPlayer, grantExp, canLearnSkill, upgradeCostFor, restPlayer, enemyAttackDamage, buildRewards, MAX_LEVEL } from '@/systems'
import type { PlayerState } from '@/types'
import { resolveOption } from '@/systems'
import { events } from '@/data'
import { canAfford, payCost, addRewards } from '@/systems'

describe('经验获取链路', () => {
  it('战斗胜利经验流入 player.exp', () => {
    const p = createPlayer('测试', 'human')
    const rewards = buildRewards(p.level)
    expect(rewards.exp).toBeGreaterThan(0)
    const after = grantExp(p, rewards.exp)
    expect(after.exp).toBe(p.exp + rewards.exp)
  })

  it('探索事件经验流入 player.exp', () => {
    const p = createPlayer('测试', 'human')
    const relic = events.find((e) => e.id === 'ruins-relic')!
    const inspect = relic.options.find((o) => o.id === 'inspect')!
    const { report, playerAfter } = resolveOption(p, inspect)
    expect(report.exp).toBeGreaterThan(0)
    expect(playerAfter.exp).toBe(p.exp + (report.exp ?? 0))
  })
})

describe('resourceSystem', () => {
  it('canAfford / payCost / addRewards', () => {
    const held = { crystals: 10, shards: 3, cores: 0, actionPoints: 5 }
    expect(canAfford(held, { crystals: 10 })).toBe(true)
    expect(canAfford(held, { crystals: 11 })).toBe(false)
    expect(payCost(held, { crystals: 10 })).toMatchObject({ crystals: 0 })
    expect(payCost(held, { cores: 5 })).toMatchObject({ cores: 0 })
    expect(addRewards(held, { shards: 2 })).toMatchObject({ shards: 5 })
  })
})

describe('characterSystem', () => {
  const player = createPlayer('测试者', 'human')

  it('createPlayer 初始化基础属性与能力', () => {
    expect(player.level).toBe(1)
    expect(player.skills).toHaveLength(1)
    expect(player.skills[0].definitionId).toBe('object-manipulation')
    expect(player.unlockedRegions).toContain('forest')
    expect(player.maxHp).toBe(20 + player.stats.constitution * 8)
  })

  it('grantExp 升级并提升属性', () => {
    const leveled = grantExp(player, 1000)
    expect(leveled.level).toBeGreaterThan(1)
    expect(leveled.stats.capacity).toBeGreaterThan(player.stats.capacity)
    expect(leveled.hp).toBe(leveled.maxHp)
  })

  it('canLearnSkill 等级不足时不可学习', () => {
    const player2 = createPlayer('低等级', 'walker')
    expect(canLearnSkill(player2, 'fold')).toBe(false) // fold 需要 Lv.5
  })

  it('upgradeCostFor 随等级递增', () => {
    expect(upgradeCostFor('spark', 1).shards).toBeLessThan(upgradeCostFor('spark', 4).shards)
  })

  it('restPlayer 恢复生命并回复探索点', () => {
    const wounded = { ...player, hp: 1, spirit: 0, lastRestAt: Date.now() - 30 * 60 * 1000 }
    const rested = restPlayer(wounded)
    expect(rested.hp).toBe(rested.maxHp)
    expect(rested.spirit).toBe(rested.maxSpirit)
    expect(rested.resources.actionPoints).toBeGreaterThan(player.resources.actionPoints)
  })

  it('等级上限为 150，达到后不再升级且经验清零', () => {
    expect(MAX_LEVEL).toBe(150)
    const maxed: PlayerState = {
      ...createPlayer('满级', 'human'),
      level: MAX_LEVEL,
      exp: 0,
    }
    const after = grantExp(maxed, 10_000)
    expect(after.level).toBe(MAX_LEVEL)
    expect(after.exp).toBe(0)
  })

  it('150 级可学习灵质空间（levelRequirement = 150）', () => {
    const maxed: PlayerState = {
      ...createPlayer('满级', 'walker'),
      level: MAX_LEVEL,
    }
    expect(canLearnSkill(maxed, 'spirit-space')).toBe(true)
    const low = createPlayer('低等级', 'walker')
    expect(canLearnSkill(low, 'spirit-space')).toBe(false)
  })
})

describe('explorationSystem', () => {
  const player = createPlayer('探索者', 'awakened')

  it('resolveOption 资源奖励结算', () => {
    const forestSpring = events.find((e) => e.id === 'forest-spring')!
    const take = forestSpring.options[0]
    const { report, playerAfter } = resolveOption(player, take)
    expect(report.rewards?.crystals).toBeGreaterThan(0)
    expect(playerAfter.resources.crystals).toBeGreaterThan(player.resources.crystals)
  })

  it('resolveOption 战斗选项进入战斗', () => {
    const anomaly = events.find((e) => e.id === 'forest-anomaly')!
    const fight = anomaly.options.find((o) => o.id === 'fight')!
    const { report } = resolveOption(player, fight)
    expect(report.battle).toBe(true)
  })
})

describe('battleSystem', () => {
  const player = createPlayer('斗士', 'human')

  it('防御状态大幅降低伤害', () => {
    const normal = enemyAttackDamage(14, player, false)
    const guarded = enemyAttackDamage(14, player, true)
    expect(guarded).toBeLessThan(normal)
  })
})
