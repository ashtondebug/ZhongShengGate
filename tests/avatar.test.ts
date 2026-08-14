import { describe, it, expect } from 'vitest'
import { createPlayer } from '@/systems'
import { reducer } from '@/hooks/useGameState'
import type { PlayerState } from '@/types'

describe('头像（avatar）', () => {
  it('createPlayer 不带头像时 avatar 为 undefined', () => {
    const p = createPlayer('测试', 'human')
    expect(p.avatar).toBeUndefined()
  })

  it('createPlayer 支持传入 avatar', () => {
    const p = createPlayer('测试', 'walker', 'data:image/jpeg;base64,xxx')
    expect(p.avatar).toBe('data:image/jpeg;base64,xxx')
  })

  it('CREATE_PLAYER 携带 avatar 写入玩家', () => {
    const st = reducer({ screen: 'character-create', player: null, battle: null, deathRecord: null, log: [], activeEventId: undefined, activeReport: undefined }, {
      type: 'CREATE_PLAYER',
      name: 'A',
      path: 'human',
      avatar: 'data:image/jpeg;base64,abc',
    })
    expect(st.player?.avatar).toBe('data:image/jpeg;base64,abc')
  })

  it('SET_AVATAR 更新玩家头像', () => {
    const st = reducer({ screen: 'character-create', player: null, battle: null, deathRecord: null, log: [], activeEventId: undefined, activeReport: undefined }, {
      type: 'CREATE_PLAYER',
      name: 'A',
      path: 'human',
    })
    const updated = reducer(st, { type: 'SET_AVATAR', avatar: 'data:image/jpeg;base64,def' })
    expect(updated.player?.avatar).toBe('data:image/jpeg;base64,def')
    const removed = reducer(updated, { type: 'SET_AVATAR', avatar: undefined })
    expect(removed.player?.avatar).toBeUndefined()
  })

  it('无头像的旧存档兼容（avatar 缺失不报错）', () => {
    const legacy = {
      name: '老档',
      path: 'human',
      level: 1,
      exp: 0,
      hp: 40,
      maxHp: 40,
      spirit: 10,
      maxSpirit: 10,
      stats: {},
      resources: {},
      skills: [],
      unlockedRegions: ['forest'],
      quests: [],
      inventory: [],
      createdAt: 1,
      lastRestAt: 1,
    } as PlayerState
    expect(legacy.avatar).toBeUndefined()
  })
})