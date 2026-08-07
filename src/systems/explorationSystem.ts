import type { ExplorationReport, ExplorationEvent, PlayerState, RegionDefinition } from '@/types'
import { events } from '@/data'
import { addRewards } from './resourceSystem'
import { grantExp } from './characterSystem'

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 获取区域可触发的事件集合。
 */
export function eventsForRegion(region: RegionDefinition): ExplorationEvent[] {
  return events.filter((e) => region.events.includes(e.id))
}

/**
 * 随机抽取一次探索事件。
 */
export function rollEvent(region: RegionDefinition): ExplorationEvent {
  return pickRandom(eventsForRegion(region))
}

/**
 * 判断隐藏 BOSS 是否应当出现。
 * 条件：位于未知领域（voidlands）、玩家等级 ≥ 8、roll 值 < 0.15（15% 概率）。
 * roll 不传时视为允许出现（用于注入事件池）。
 */
export function shouldSpawnBoss(level: number, regionId?: string, roll?: number): boolean {
  if (regionId !== 'voidlands') return false
  if (level < 8) return false
  if (roll !== undefined) return roll < 0.15
  return true
}

export interface OptionResolution {
  report: ExplorationReport
  playerAfter: PlayerState
}

/**
 * 判定玩家某项属性是否满足选项要求。
 */
function passesCheck(player: PlayerState, stat?: keyof PlayerState['stats'], value?: number): boolean {
  if (!stat || !value) return true
  return player.stats[stat] >= value
}

/**
 * 结算探索选项。返回报告与结算后的玩家状态。
 */
export function resolveOption(
  player: PlayerState,
  option: ExplorationEvent['options'][number],
): OptionResolution {
  const pass = passesCheck(player, option.requires?.stat, option.requires?.value)
  const c = option.consequence

  let report: ExplorationReport = { text: '' }
  let next: PlayerState = player

  if (c.requireBattle) {
    report = {
      text: `选择【${option.label}】，遭遇战中……`,
      battle: true,
    }
    return { report, playerAfter: next }
  }

  if (pass) {
    report.text = c.successText ?? '行动成功。'
    if (c.rewards) {
      next = { ...next, resources: addRewards(next.resources, c.rewards) }
      report.rewards = c.rewards
    }
    if (c.exp) {
      next = grantExp(next, c.exp)
      report.exp = c.exp
    }
    if (c.damage) {
      next = { ...next, hp: Math.max(0, next.hp - c.damage) }
      report.damage = c.damage
    }
  } else {
    report.text = c.failText ?? '你的能力不足，未能如愿。'
    if (c.damage) {
      next = { ...next, hp: Math.max(0, next.hp - c.damage) }
      report.damage = c.damage
    }
  }
  return { report, playerAfter: next }
}
