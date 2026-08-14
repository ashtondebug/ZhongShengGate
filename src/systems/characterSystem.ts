import type { ElementType, PathId, PlayerState, Resources, SkillState } from '@/types'
import { paths } from '@/data'
import { skills } from '@/data'
import { EMPTY_RESOURCES } from './resourceSystem'

export const PATH_BONUS: Record<PathId, ElementType[]> = {
  human: ['spirit'],
  awakened: ['fire', 'thunder'],
  walker: ['space'],
}

/**
 * 等级上限。达到 150 级后不再升级。
 */
export const MAX_LEVEL = 150

/**
 * 根据属性推算最大生命。
 */
export function maxHpFor(constitution: number): number {
  return 20 + constitution * 8
}

/**
 * 升级所需累计/单级经验曲线。
 */
export function expForNextLevel(level: number): number {
  return Math.floor(40 + 40 * level * (1 + level * 0.25))
}

export function createPlayer(name: string, path: PathId, avatar?: string): PlayerState {
  const def = paths.find((p) => p.id === path)!
  const starter: PlayerState = {
    name,
    path,
    avatar,
    level: 1,
    exp: 0,
    hp: maxHpFor(def.stats.constitution),
    maxHp: maxHpFor(def.stats.constitution),
    spirit: def.stats.capacity,
    maxSpirit: def.stats.capacity,
    stats: { ...def.stats },
    resources: { ...EMPTY_RESOURCES(), crystals: 10, actionPoints: 5, coins: 100 },
    skills: def.startingSkills.map((id) => ({ definitionId: id, level: 1, cooldownLeft: 0 })),
    unlockedRegions: ['forest'],
    quests: [],
    inventory: [],
    createdAt: Date.now(),
    lastRestAt: Date.now(),
  }
  return starter
}

/**
 * 处理经验获取并尝试升级。
 * 达到等级上限 MAX_LEVEL 后封顶，多余经验丢弃。
 */
export function grantExp(player: PlayerState, amount: number): PlayerState {
  if (amount <= 0) return player
  if (player.level >= MAX_LEVEL) return player
  let next = { ...player, exp: player.exp + amount }
  let leveled = false
  while (next.exp >= expForNextLevel(next.level) && next.level < MAX_LEVEL) {
    next.exp -= expForNextLevel(next.level)
    next.level += 1
    leveled = true
  }
  if (next.level >= MAX_LEVEL) {
    next.exp = 0
  }
  if (leveled) {
    // 升级基础属性与生命。
    next.stats = {
      spirit: next.stats.spirit + 1,
      capacity: next.stats.capacity + 2,
      perception: next.stats.perception + 1,
      control: next.stats.control + 1,
      constitution: next.stats.constitution + 1,
      luck: next.stats.luck,
    }
    next.maxHp = maxHpFor(next.stats.constitution)
    next.maxSpirit = next.stats.capacity
    next.hp = next.maxHp
    next.spirit = Math.min(next.maxSpirit, next.spirit + 10)
  }
  return next
}

/**
 * 判断能力是否可升级（满级 + 资源足够）。
 */
export function canUpgradeSkill(
  player: PlayerState,
  defId: string,
  cost: { shards: number },
): boolean {
  const skill = player.skills.find((s) => s.definitionId === defId)
  if (!skill) return false
  const def = skills.find((s) => s.id === defId)!
  if (skill.level >= def.maxLevel) return false
  return player.resources.shards >= cost.shards
}

/**
 * 返回升级某个能力所需的资源成本。
 */
export function upgradeCostFor(_defId: string, level: number): { shards: number } {
  return { shards: 3 + (level > 1 ? Math.floor(level * 2.5) : 0) }
}

/**
 * 修改后的能力列表（等级提升、冷却清零）。
 */
export function upgradeSkill(skills: SkillState[], defId: string): SkillState[] {
  return skills.map((s) =>
    s.definitionId === defId ? { ...s, level: s.level + 1, cooldownLeft: 0 } : s,
  )
}

/**
 * 判断是否已掌握某项能力。
 */
export function hasSkill(player: PlayerState, defId: string): boolean {
  return player.skills.some((s) => s.definitionId === defId)
}

/**
 * 判断是否满足学习条件：等级 + 资源 + 未掌握。
 */
export function canLearnSkill(player: PlayerState, defId: string): boolean {
  if (hasSkill(player, defId)) return false
  const def = skills.find((s) => s.id === defId)
  if (!def) return false
  if (player.level < def.levelRequirement) return false
  return (Object.keys(def.learnCost) as (keyof Resources)[]).every(
    (key) => (player.resources[key] ?? 0) >= (def.learnCost[key] ?? 0),
  )
}

/**
 * 学习新能力。
 */
export function learnSkill(skills: SkillState[], defId: string): SkillState[] {
  if (skills.some((s) => s.definitionId === defId)) return skills
  return [...skills, { definitionId: defId, level: 1, cooldownLeft: 0 }]
}

/**
 * 单步推进完成冷却。
 */
export function tickCooldowns(skills: SkillState[]): SkillState[] {
  return skills.map((s) => ({
    ...s,
    cooldownLeft: Math.max(0, s.cooldownLeft - 1),
  }))
}

/**
 * 调息恢复：生命、灵力全额回复，并随时间缓慢回复探索点。
 */
export function restPlayer(player: PlayerState): PlayerState {
  const now = Date.now()
  const elapsedMin = (now - player.lastRestAt) / 60000
  const recoveredAP = Math.min(5, Math.floor(elapsedMin / 5))
  return {
    ...player,
    hp: player.maxHp,
    spirit: player.maxSpirit,
    resources: {
      ...player.resources,
      actionPoints: Math.min(8, player.resources.actionPoints + Math.max(1, recoveredAP)),
    },
    lastRestAt: now,
  }
}