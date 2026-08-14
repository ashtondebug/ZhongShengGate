import { describe, it, expect, beforeEach, vi } from 'vitest'
import { reducer } from '@/hooks/useGameState'
import { createPlayer } from '@/systems'
import type { GameState, PlayerState } from '@/types'

const removeSpy = vi.fn()
const setSpy = vi.fn()

beforeEach(() => {
  removeSpy.mockClear()
  setSpy.mockClear()
  ;(globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: vi.fn(() => null),
    setItem: setSpy,
    removeItem: removeSpy,
  } as unknown as Storage
})

function makeBattleLost(p: PlayerState): GameState {
  return {
    screen: 'battle',
    player: p,
    battle: {
      enemyId: 'wisp',
      enemyName: '灵微',
      enemyIcon: 'fa-solid fa-ghost',
      enemyType: 'spirit',
      enemyHp: 10,
      enemyMaxHp: 10,
      enemyAttack: 3,
      enemyDefense: 1,
      turn: 2,
      playerDefending: false,
      phase: 'lost',
    },
    deathRecord: null,
    log: [],
  }
}

describe('角色死亡（任务一）', () => {
  it('战斗失败且 hp=0：角色被删除，记录死亡信息并清除存档', () => {
    const player = { ...createPlayer('陨落者', 'human'), hp: 0 }
    const next = reducer(makeBattleLost(player), { type: 'CLAIM_DEFEAT' })

    expect(next.player).toBeNull()
    expect(next.battle).toBeNull()
    expect(next.screen).toBe('home')
    expect(next.deathRecord).toMatchObject({ name: '陨落者', level: 1 })
    expect(next.deathRecord!.diedAt).toBeGreaterThan(0)
    expect(removeSpy).toHaveBeenCalledTimes(1)
  })

  it('CLAIM_DEFEAT 且 hp>0：不触发死亡，保留角色并按原逻辑送回复养', () => {
    const player = { ...createPlayer('幸存者', 'human'), hp: 30 }
    const next = reducer(makeBattleLost(player), { type: 'CLAIM_DEFEAT' })

    expect(next.player).not.toBeNull()
    expect(next.player!.hp).toBe(1)
    expect(next.deathRecord).toBeNull()
    expect(removeSpy).not.toHaveBeenCalled()
  })

  it('探索事件伤害将 hp 打空：触发死亡', () => {
    const player = { ...createPlayer('倒霉蛋', 'human'), hp: 3 }
    const state: GameState = {
      screen: 'explore',
      player,
      battle: null,
      activeEventId: 'void-whisper',
      deathRecord: null,
      log: [],
    }
    const next = reducer(state, { type: 'RESOLVE_OPTION', optionId: 'resist' })

    expect(next.player).toBeNull()
    expect(next.deathRecord).toMatchObject({ name: '倒霉蛋' })
    expect(removeSpy).toHaveBeenCalledTimes(1)
  })

  it('探索事件伤害未打空 hp：不触发死亡', () => {
    const player = { ...createPlayer('皮糙肉厚', 'human'), hp: 50 }
    const state: GameState = {
      screen: 'explore',
      player,
      battle: null,
      activeEventId: 'void-whisper',
      deathRecord: null,
      log: [],
    }
    const next = reducer(state, { type: 'RESOLVE_OPTION', optionId: 'resist' })

    expect(next.player).not.toBeNull()
    expect(next.deathRecord).toBeNull()
    expect(removeSpy).not.toHaveBeenCalled()
  })

  it('CREATE_AFTER_DEATH：清除死亡记录并进入角色创建页', () => {
    const player = { ...createPlayer('转世者', 'human'), hp: 0 }
    const dead = reducer(makeBattleLost(player), { type: 'CLAIM_DEFEAT' })
    const next = reducer(dead, { type: 'CREATE_AFTER_DEATH' })

    expect(next.screen).toBe('character-create')
    expect(next.deathRecord).toBeNull()
  })

  it('DISMISS_DEATH：关闭死亡弹窗后死亡记录被清除', () => {
    const player = { ...createPlayer('消散者', 'human'), hp: 0 }
    const dead = reducer(makeBattleLost(player), { type: 'CLAIM_DEFEAT' })
    const next = reducer(dead, { type: 'DISMISS_DEATH' })

    expect(next.deathRecord).toBeNull()
    expect(next.screen).toBe('home')
  })

  it('死亡后直接创建新角色：死亡记录一并清除', () => {
    const player = { ...createPlayer('旧魂', 'human'), hp: 0 }
    const dead = reducer(makeBattleLost(player), { type: 'CLAIM_DEFEAT' })
    const next = reducer(dead, { type: 'CREATE_PLAYER', name: '新魂', path: 'human' })

    expect(next.player?.name).toBe('新魂')
    expect(next.deathRecord).toBeNull()
  })
})
