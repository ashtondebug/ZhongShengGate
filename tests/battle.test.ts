import { describe, it, expect } from 'vitest'
import { createPlayer, resolvePlayerAction, resolveEnemyTurn } from '@/systems'
import { enemies } from '@/data'
import type { BattleState, PlayerState } from '@/types'

function mkBattle(enemyId: string, phase: BattleState['phase'] = 'player'): BattleState {
  const e = enemies.find((x) => x.id === enemyId)!
  return {
    enemyId: e.id,
    enemyName: e.name,
    enemyIcon: e.icon,
    enemyType: e.type,
    enemyHp: e.hp,
    enemyMaxHp: e.hp,
    enemyAttack: e.attack,
    enemyDefense: e.defense,
    turn: 1,
    playerDefending: false,
    phase,
  }
}

describe('半自动实时战斗', () => {
  it('玩家普攻结算后战斗保持进行中（不进入敌方回合）', () => {
    const p: PlayerState = createPlayer('测试', 'human')
    const r = resolvePlayerAction(mkBattle('wisp'), p, { type: 'basic' })
    expect(r.battle.phase).toBe('player')
    expect(r.playerAfter.hp).toBe(p.hp)
    expect(r.battle.enemyHp).toBeLessThan(mkBattle('wisp').enemyHp)
  })

  it('敌方自动攻击扣减玩家生命并回到进行中', () => {
    const p: PlayerState = createPlayer('测试', 'human')
    const hp0 = p.hp
    const r = resolveEnemyTurn(mkBattle('wisp'), p)
    expect(r.playerAfter.hp).toBeLessThan(hp0)
    expect(r.battle.phase).toBe('player')
    expect(r.battle.turn).toBe(2)
    expect(r.log.some((l) => l.text.includes('对你发动攻击'))).toBe(true)
  })

  it('敌方自动攻击打空玩家生命则判定战斗失败', () => {
    const p: PlayerState = { ...createPlayer('测试', 'human'), hp: 1 }
    const r = resolveEnemyTurn(mkBattle('wisp'), p)
    expect(r.battle.phase).toBe('lost')
    expect(r.playerAfter.hp).toBe(0)
  })

  it('玩家防御在敌方自动攻击中减免伤害', () => {
    const p: PlayerState = createPlayer('测试', 'human')
    const normal = resolveEnemyTurn(mkBattle('wisp'), p)
    const guarded = resolveEnemyTurn({ ...mkBattle('wisp'), playerDefending: true }, p)
    const lossNormal = p.hp - normal.playerAfter.hp
    const lossGuarded = p.hp - guarded.playerAfter.hp
    expect(lossGuarded).toBeLessThan(lossNormal)
  })
})
