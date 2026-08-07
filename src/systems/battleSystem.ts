import type { BattleSnapshot, BattleState, ElementType, PlayerState } from '@/types'
import { skills } from '@/data'
import type { SkillDefinition } from '@/types'

const ELEMENT_MATRIX: Record<ElementType, Record<ElementType, number>> = {
  fire: { fire: 1, water: 0.8, wind: 1.1, thunder: 1.2, space: 1, spirit: 1, perception: 1 },
  water: { fire: 1.2, water: 1, wind: 0.9, thunder: 1, space: 1.1, spirit: 1, perception: 1 },
  wind: { fire: 0.9, water: 1.1, wind: 1, thunder: 1.1, space: 1, spirit: 1.2, perception: 1 },
  thunder: { fire: 1.1, water: 0.9, wind: 1, thunder: 1, space: 0.9, spirit: 1.3, perception: 1 },
  space: { fire: 1, water: 1, wind: 1, thunder: 1.1, space: 1, spirit: 1.1, perception: 0.9 },
  spirit: { fire: 1, water: 1, wind: 0.9, thunder: 1.1, space: 1, spirit: 1, perception: 1 },
  perception: { fire: 1, water: 1, wind: 1, thunder: 1, space: 1.1, spirit: 1.1, perception: 1 },
}

export function damageMultiplier(attacker: ElementType, defender: ElementType): number {
  return ELEMENT_MATRIX[attacker]?.[defender] ?? 1
}

export interface BasicAttackResult {
  damage: number
  crit: boolean
}

export function basicAttackDamage(player: PlayerState, defense: number): BasicAttackResult {
  const base = 6 + player.stats.control * 1.4
  const crit = Math.random() < 0.08 + player.stats.luck * 0.01
  const raw = base * (crit ? 1.8 : 1)
  return { damage: Math.max(1, Math.round(raw - defense * 0.6)), crit }
}

export function skillDamage(
  def: SkillDefinition,
  level: number,
  player: PlayerState,
  defenderType: ElementType,
): number {
  const base = def.power + level * 4 + player.stats.spirit * 1.2
  const mult = damageMultiplier(def.type, defenderType)
  return Math.max(1, Math.round(base * mult))
}

export function enemyAttackDamage(enemyAttack: number, player: PlayerState, defending: boolean): number {
  const base = enemyAttack - player.stats.constitution * 0.5
  const mitigated = defending ? base * 0.35 : base
  return Math.max(1, Math.round(mitigated))
}

/**
 * 玩家释放能力的完整结算。
 */
export function resolvePlayerAction(
  state: BattleState,
  player: PlayerState,
  action: { type: 'basic' | 'defend' | 'skill'; skillId?: string },
): { battle: BattleState; playerAfter: PlayerState; log: { text: string; tone: 'info' | 'player' | 'danger' | 'success' }[] } {
  const log: { text: string; tone: 'info' | 'player' | 'danger' | 'success' }[] = []

  let battle = { ...state, playerDefending: false }
  let p = { ...player }

  if (action.type === 'defend') {
    battle.playerDefending = true
    log.push({ text: '你架起灵力防御，凝神戒备。', tone: 'player' })
  } else if (action.type === 'basic') {
    const { damage, crit } = basicAttackDamage(player, battle.enemyDefense)
    battle.enemyHp = Math.max(0, battle.enemyHp - damage)
    log.push({
      text: crit
        ? `普通攻击命中要害，造成 ${damage} 点伤害。`
        : `普通攻击命中，造成 ${damage} 点伤害。`,
      tone: 'player',
    })
  } else if (action.type === 'skill' && action.skillId) {
    const st = player.skills.find((s) => s.definitionId === action.skillId)
    const def = skills.find((s) => s.id === action.skillId)
    if (!st || !def) {
      log.push({ text: '技能无效。', tone: 'danger' })
    } else if (st.cooldownLeft > 0 || p.spirit < def.cost) {
      log.push({ text: '灵力不足或冷却未完成，无法释放。', tone: 'danger' })
    } else {
      const dmg = skillDamage(def, st.level, player, battle.enemyType)
      battle.enemyHp = Math.max(0, battle.enemyHp - dmg)
      p.spirit -= def.cost
      battle.playerDefending = false
      // 本技能进入冷却，其余技能冷却推进。
      p.skills = player.skills.map((s) => {
        if (s.definitionId === action.skillId) return { ...s, cooldownLeft: def.cooldown }
        return { ...s, cooldownLeft: Math.max(0, s.cooldownLeft - 1) }
      })
      log.push({ text: `你释放【${def.name}】，造成 ${dmg} 点伤害。`, tone: 'player' })
    }
  } else {
    // 普通攻击/防御同样推进冷却。
    p.skills = player.skills.map((s) => ({ ...s, cooldownLeft: Math.max(0, s.cooldownLeft - 1) }))
  }

  // 敌人行动阶段判定
  if (battle.enemyHp <= 0) {
    // 战斗胜利，由外部决定奖励
    battle = { ...battle, phase: 'won' }
    log.push({ text: `【${battle.enemyName}】被击败了！`, tone: 'success' })
  } else {
    const dmg = enemyAttackDamage(battle.enemyAttack, p, battle.playerDefending)
    p.hp = Math.max(0, p.hp - dmg)
    if (p.hp <= 0) {
      battle = { ...battle, phase: 'lost' }
      log.push({ text: '你被灵力打倒在地，意识渐渐远去……', tone: 'danger' })
    } else {
      battle = {
        ...battle,
        turn: battle.turn + 1,
        playerDefending: false,
        phase: 'player',
      }
      log.push({ text: `【${battle.enemyName}】对你发动攻击，造成 ${dmg} 点伤害。`, tone: 'danger' })
    }
  }

  return { battle, playerAfter: p, log }
}

export function snapshotOf(battle: BattleState, player: PlayerState): BattleSnapshot {
  return {
    playerHp: player.hp,
    playerSpirit: player.spirit,
    enemyHp: battle.enemyHp,
    enemyMaxHp: battle.enemyMaxHp,
  }
}

export function buildRewards(level: number, dropId?: string) {
  const shards = dropId ? 2 + level : 1 + level
  const crystals = 8 + level * 4
  return { crystals, shards, cores: dropId === 'cores' ? 1 : 0, exp: 15 + level * 12 }
}
