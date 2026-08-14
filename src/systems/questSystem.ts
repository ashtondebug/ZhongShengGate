import type { PlayerState, QuestDefinition, QuestState } from '@/types'
import { quests } from '@/data'
import { addRewards } from './resourceSystem'
import { grantExp } from './characterSystem'
import { addItems } from './inventorySystem'

/**
 * 获取任务定义。
 */
export function questDef(id: string): QuestDefinition | undefined {
  return quests.find((q) => q.id === id)
}

/**
 * 可接取任务：未接受 + 满足等级门槛。
 */
export function availableQuests(player: PlayerState): QuestDefinition[] {
  return quests.filter(
    (q) =>
      !player.quests.some((s) => s.definitionId === q.id) &&
      (q.unlockLevel === undefined || player.level >= q.unlockLevel),
  )
}

/**
 * 接取任务。
 */
export function acceptQuest(player: PlayerState, questId: string): PlayerState | null {
  const def = questDef(questId)
  if (!def) return null
  if (player.quests.some((s) => s.definitionId === questId)) return null
  if (def.unlockLevel !== undefined && player.level < def.unlockLevel) return null
  return {
    ...player,
    quests: [...player.quests, { definitionId: questId, progress: 0, claimed: false }],
  }
}

/**
 * 推进任务进度（advanceBy 返回每个任务的增量，>=target 封顶）。
 */
export function advanceQuests(
  questStates: QuestState[],
  advanceBy: (def: QuestDefinition, state: QuestState) => number,
): QuestState[] {
  return questStates.map((s) => {
    const def = questDef(s.definitionId)
    if (!def || s.claimed || s.progress >= def.targetCount) return s
    const delta = advanceBy(def, s)
    if (delta <= 0) return s
    return { ...s, progress: Math.min(def.targetCount, s.progress + delta) }
  })
}

/**
 * 领取任务奖励（进度达标且未领取）。
 */
export function claimQuestRewards(player: PlayerState, questId: string): PlayerState | null {
  const s = player.quests.find((q) => q.definitionId === questId)
  if (!s || s.claimed) return null
  const def = questDef(questId)
  if (!def || s.progress < def.targetCount) return null

  let next: PlayerState = {
    ...player,
    quests: player.quests.map((q) =>
      q.definitionId === questId ? { ...q, claimed: true } : q,
    ),
  }
  const r = def.rewards
  if (r.crystals || r.shards || r.cores || r.coins) {
    next = {
      ...next,
      resources: addRewards(next.resources, {
        crystals: r.crystals ?? 0,
        shards: r.shards ?? 0,
        cores: r.cores ?? 0,
        coins: r.coins ?? 0,
      }),
    }
  }
  if (r.exp) next = grantExp(next, r.exp)
  if (r.items?.length) {
    next = { ...next, inventory: addItems(next.inventory, r.items) }
  }
  return next
}
