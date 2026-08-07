import { describe, it, expect } from 'vitest'
import { createPlayer } from '@/systems'
import { acceptQuest, advanceQuests, availableQuests, claimQuestRewards } from '@/systems'
import { questDef } from '@/systems'

describe('questSystem', () => {
  const player = createPlayer('任务狂', 'human')

  it('availableQuests 排除已接取与等级不足', () => {
    const avail = availableQuests(player)
    expect(avail.some((q) => q.id === 'hunt-wisp')).toBe(true)
    expect(avail.some((q) => q.id === 'hunt-void')).toBe(false) // 需 Lv.6
  })

  it('acceptQuest 接取并初始化进度', () => {
    const accepted = acceptQuest(player, 'hunt-wisp')!
    expect(accepted.quests).toHaveLength(1)
    expect(accepted.quests[0].progress).toBe(0)
    // 重复接取被拒绝
    expect(acceptQuest(accepted, 'hunt-wisp')).toBeNull()
  })

  it('advanceQuests 猎杀任务按击杀推进并封顶', () => {
    const accepted = acceptQuest(player, 'hunt-wisp')!
    const advanced = advanceQuests(accepted.quests, (def) => (def.id === 'hunt-wisp' ? 1 : 0))
    expect(advanced[0].progress).toBe(1)

    const full = advanceQuests(accepted.quests, (def) => (def.id === 'hunt-wisp' ? 999 : 0))
    expect(full[0].progress).toBe(5)
  })

  it('claimQuestRewards 达标发放奖励并锁定', () => {
    let accepted = acceptQuest(player, 'hunt-wisp')!
    accepted = {
      ...accepted,
      quests: advanceQuests(accepted.quests, (def) => (def.id === 'hunt-wisp' ? 999 : 0)),
    }
    const before = accepted.resources.crystals
    const claimed = claimQuestRewards(accepted, 'hunt-wisp')!
    expect(claimed.resources.crystals).toBe(before + 30)
    expect(claimed.quests[0].claimed).toBe(true)
    // 重复领取被拒绝
    expect(claimQuestRewards(claimed, 'hunt-wisp')).toBeNull()
  })

  it('claimQuestRewards 未达标不可领取', () => {
    const accepted = acceptQuest(player, 'hunt-wisp')!
    expect(claimQuestRewards(accepted, 'hunt-wisp')).toBeNull()
  })

  it('questDef 能查到隐藏 BOSS 敌人对应的任务定义', () => {
    expect(questDef('hunt-void')).toBeDefined()
  })
})
