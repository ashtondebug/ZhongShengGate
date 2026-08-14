import { useEffect, useMemo, useReducer } from 'react'
import type { DeathRecord, GameState, LogEntry, PathId, PlayerState, QuestState, ScreenId } from '@/types'
import { regions, enemies, events, skills, quests, items, equipment } from '@/data'
import { createPlayer, resolvePlayerAction, resolveEnemyTurn, buildRewards, resolveOption, shouldSpawnBoss } from '@/systems'
import {
  canAfford,
  payCost,
  addRewards,
  upgradeSkill,
  upgradeCostFor,
  grantExp,
  canLearnSkill,
  learnSkill,
  restPlayer,
} from '@/systems'
import { acceptQuest, advanceQuests, claimQuestRewards, questDef } from '@/systems'
import { addItems, useItem, sellItems } from '@/systems'
import { buyItem, shopPriceOf } from '@/systems'

const SAVE_KEY = 'zhongshenggate-save-v1'

let logCounter = 0
function entry(text: string, tone: LogEntry['tone']): LogEntry {
  logCounter += 1
  return { id: logCounter, text, tone }
}

type Action =
  | { type: 'CREATE_PLAYER'; name: string; path: PathId; avatar?: string }
  | { type: 'NAVIGATE'; screen: ScreenId }
  | { type: 'START_EXPLORATION'; regionId: string; eventId: string }
  | { type: 'ROLL_AGAIN'; eventId: string }
  | { type: 'RESOLVE_OPTION'; optionId: string }
  | { type: 'LEAVE_EXPLORATION' }
  | { type: 'BEGIN_BATTLE'; enemyId: string }
  | { type: 'BASIC_ATTACK' }
  | { type: 'DEFEND' }
  | { type: 'CAST_SKILL'; skillId: string }
  | { type: 'RESOLVE_ENEMY_TURN' }
  | { type: 'CLAIM_VICTORY' }
  | { type: 'CLAIM_DEFEAT' }
  | { type: 'RETREAT_BATTLE' }
  | { type: 'UNLOCK_REGION'; regionId: string }
  | { type: 'UPGRADE_SKILL'; skillId: string }
  | { type: 'LEARN_SKILL'; skillId: string }
  | { type: 'REST' }
  | { type: 'RESET' }
  | { type: 'ACCEPT_QUEST'; questId: string }
  | { type: 'CLAIM_QUEST'; questId: string }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'SELL_ITEM'; itemId: string }
  | { type: 'BUY_ITEM'; itemId: string }
  | { type: 'TRIGGER_EASTER_EGG' }
  | { type: 'DISMISS_DEATH' }
  | { type: 'CREATE_AFTER_DEATH' }
  | { type: 'SET_AVATAR'; avatar?: string }

function initialState(): GameState {
  return { screen: 'home', player: null, battle: null, log: [], deathRecord: null }
}

/** 清除本地存档（Node 测试环境下安全降级）。 */
function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    // 忽略
  }
}

/** 角色是否已死亡（血条耗尽）。 */
function isDead(player: PlayerState): boolean {
  return player.hp <= 0
}

/**
 * 角色死亡：永久清除存档与角色数据，记录死亡信息用于弹窗。
 */
function applyDeath(state: GameState, player: PlayerState): GameState {
  clearSave()
  const record: DeathRecord = {
    name: player.name,
    level: player.level,
    path: player.path,
    createdAt: player.createdAt,
    diedAt: Date.now(),
  }
  const log = [
    ...state.log,
    entry(`探索者「${player.name}」被打倒在地，灵息断绝，就此陨落。`, 'danger'),
    entry('尘归尘，土归土。等级、任务与遗物尽数消散，宛如从未存在。', 'danger'),
  ]
  return { screen: 'home', player: null, battle: null, deathRecord: record, log }
}

function loadSavedPlayer(): PlayerState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    return migratePlayer(JSON.parse(raw) as PlayerState)
  } catch {
    return null
  }
}

/**
 * 旧存档迁移：quests string[] → QuestState[]，补齐 inventory。
 */
function migratePlayer(p: PlayerState): PlayerState {
  const knownQuestIds = new Set(quests.map((q) => q.id))
  const questList: QuestState[] = Array.isArray(p.quests)
    ? p.quests
        .map((q) =>
          typeof q === 'string'
            ? { definitionId: q, progress: 0, claimed: false }
            : (q as QuestState),
        )
        .filter((q) => knownQuestIds.has(q.definitionId))
    : []
  return {
    ...p,
    resources: { ...p.resources, coins: p.resources?.coins ?? 0 },
    quests: questList,
    inventory: Array.isArray(p.inventory) ? p.inventory : [],
  }
}

function initState(): GameState {
  const saved = loadSavedPlayer()
  return { ...initialState(), player: saved, screen: 'home' }
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'CREATE_PLAYER': {
      const player = createPlayer(action.name.trim() || '无名探索者', action.path, action.avatar)
      const log = [
        entry(`探索者「${player.name}」踏入众生界。`, 'info'),
        entry('灵能森林已解锁，请从地图开始你的旅程。', 'success'),
      ]
      return { screen: 'main', player, battle: null, deathRecord: null, log }
    }

    case 'NAVIGATE':
      return { ...state, screen: action.screen }

    case 'SET_AVATAR': {
      if (!state.player) return state
      return { ...state, player: { ...state.player, avatar: action.avatar } }
    }

    case 'START_EXPLORATION': {
      if (!state.player) return state
      const region = regions.find((r) => r.id === action.regionId)
      if (!region || state.player.resources.actionPoints < region.explorationCost) return state
      const player: PlayerState = {
        ...state.player,
        resources: payCost(state.player.resources, { actionPoints: region.explorationCost }),
        activeRegionId: action.regionId,
        quests: advanceQuests(state.player.quests, (def) =>
          def.type === 'explore' && def.target.kind === 'region' && def.target.id === action.regionId
            ? 1
            : 0,
        ),
      }
      const event = events.find((e) => e.id === action.eventId)!
      const log = [...state.log, entry(`进入【${region.name}】，${event.name}……`, 'info')]
      return {
        ...state,
        player,
        screen: 'explore',
        activeEventId: action.eventId,
        activeReport: undefined,
        log,
      }
    }

    case 'ROLL_AGAIN': {
      const p = state.player
      if (!p) return state
      const region = regions.find((r) => r.id === p.activeRegionId)
      if (!region || p.resources.actionPoints < region.explorationCost) return state
      const player = {
        ...p,
        resources: payCost(p.resources, { actionPoints: region.explorationCost }),
      }
      return {
        ...state,
        player,
        activeEventId: action.eventId,
        activeReport: undefined,
      }
    }

    case 'RESOLVE_OPTION': {
      if (!state.player || !state.activeEventId) return state
      const event = events.find((e) => e.id === state.activeEventId)
      if (!event) return state
      const option = event.options.find((o) => o.id === action.optionId)
      if (!option) return state

      const { report, playerAfter } = resolveOption(state.player, option)

      let nextState: GameState = {
        ...state,
        player: playerAfter,
        activeReport: report,
      }

      if (report.battle) {
        const enemy = pickEnemyFor(state.player.activeRegionId)
        nextState = {
          ...nextState,
          battle: buildBattleState(enemy.id),
          screen: 'battle',
          log: [...state.log, entry(report.text, 'danger')],
        }
      } else {
        const log: LogEntry[] = [...state.log, entry(report.text, 'info')]
        if (report.rewards) {
          log.push(entry(`获得资源：${formatRewards(report.rewards)}`, 'success'))
          nextState = {
            ...nextState,
            player: {
              ...playerAfter,
              quests: advanceQuests(playerAfter.quests, (def) => {
                if (def.type !== 'collect' || def.target.kind !== 'resource') return 0
                const gained = report.rewards?.[def.target.id as keyof typeof report.rewards] ?? 0
                return gained > 0 ? gained : 0
              }),
            },
          }
        }
        if (report.exp) {
          log.push(entry(`获得 ${report.exp} 点经验。`, 'success'))
        }
        if (report.damage) {
          log.push(entry(`受到 ${report.damage} 点伤害。`, 'danger'))
        }
        nextState = { ...nextState, log }
      }
      if (nextState.player && isDead(nextState.player)) {
        return applyDeath(nextState, nextState.player)
      }
      return nextState
    }

    case 'LEAVE_EXPLORATION':
      return {
        ...state,
        screen: 'worldmap',
        activeEventId: undefined,
        activeReport: undefined,
      }

    case 'BEGIN_BATTLE': {
      return {
        ...state,
        battle: buildBattleState(action.enemyId),
        screen: 'battle',
      }
    }

    case 'BASIC_ATTACK':
    case 'DEFEND':
    case 'CAST_SKILL': {
      if (!state.player || !state.battle || state.battle.phase !== 'player') return state
      const payload =
        action.type === 'CAST_SKILL'
          ? { type: 'skill' as const, skillId: action.skillId }
          : action.type === 'DEFEND'
            ? { type: 'defend' as const }
            : { type: 'basic' as const }
      const { battle, playerAfter, log } = resolvePlayerAction(
        state.battle,
        state.player,
        payload,
      )
      return {
        ...state,
        battle,
        player: playerAfter,
        log: [...state.log, ...log.map((l) => entry(l.text, l.tone))],
      }
    }

    case 'RESOLVE_ENEMY_TURN': {
      if (!state.player || !state.battle || state.battle.phase !== 'player') return state
      const { battle, playerAfter, log } = resolveEnemyTurn(state.battle, state.player)
      return {
        ...state,
        battle,
        player: playerAfter,
        log: [...state.log, ...log.map((l) => entry(l.text, l.tone))],
      }
    }

    case 'CLAIM_VICTORY': {
      const p = state.player
      const battle = state.battle
      if (!p || !battle) return state
      const def = enemies.find((e) => e.id === battle.enemyId)!
      const rewards = buildRewards(p.level, def.dropId, !!def.boss)
      let player: PlayerState = {
        ...p,
        resources: addRewards(p.resources, rewards),
        spirit: Math.min(p.maxSpirit, p.spirit + p.maxSpirit * 0.3),
      }
      if (def.boss) {
        player = {
          ...player,
          inventory: addItems(player.inventory, [{ itemId: 'chuanshuo', quantity: 1 }]),
        }
      }
      player = grantExp(player, rewards.exp)
      player = {
        ...player,
        quests: advanceQuests(player.quests, (qd) => {
          if (qd.type === 'hunt' && qd.target.kind === 'enemy' && qd.target.id === def.id) return 1
          if (qd.type === 'collect' && qd.target.kind === 'resource') {
            return rewards[qd.target.id as keyof typeof rewards] ?? 0
          }
          return 0
        }),
      }
      const log = [
        ...state.log,
        entry('战斗胜利！', 'success'),
        entry(`获得 ${rewards.crystals} 灵晶、${rewards.shards} 灵能碎片、${rewards.coins} 金币。`, 'success'),
        entry(`获得 ${rewards.exp} 点经验。`, 'success'),
      ]
      if (rewards.cores) log.push(entry('额外获得 1 枚未知核心！', 'success'))
      if (def.boss) log.push(entry('你击败了隐藏的【无相虚空主】，拾得传说余烬！', 'success'))
      return { ...state, player, battle: null, screen: 'worldmap', activeReport: undefined, log }
    }

    case 'CLAIM_DEFEAT': {
      if (!state.player) return state
      if (isDead(state.player)) {
        return applyDeath(state, state.player)
      }
      const player: PlayerState = {
        ...state.player,
        hp: 1,
        resources: { ...state.player.resources, actionPoints: Math.max(0, state.player.resources.actionPoints - 1) },
      }
      const log = [...state.log, entry('战败……你被送回城市休养，损失 1 点探索点。', 'danger')]
      return { ...state, player, battle: null, screen: 'worldmap', activeReport: undefined, log }
    }

    case 'RETREAT_BATTLE':
      return { ...state, battle: null, screen: 'worldmap', activeReport: undefined }

    case 'UNLOCK_REGION': {
      if (!state.player) return state
      const region = regions.find((r) => r.id === action.regionId)
      if (!region || state.player.unlockedRegions.includes(region.id)) return state
      if (!canAfford(state.player.resources, { crystals: region.unlockCost })) return state
      const player: PlayerState = {
        ...state.player,
        resources: payCost(state.player.resources, { crystals: region.unlockCost }),
        unlockedRegions: [...state.player.unlockedRegions, region.id],
      }
      const log = [...state.log, entry(`已解锁新区域：【${region.name}】。`, 'success')]
      return { ...state, player, log }
    }

    case 'UPGRADE_SKILL': {
      if (!state.player) return state
      const skill = state.player.skills.find((s) => s.definitionId === action.skillId)
      if (!skill) return state
      const cost = upgradeCostFor(action.skillId, skill.level)
      if (!canAfford(state.player.resources, cost)) return state
      const player: PlayerState = {
        ...state.player,
        resources: payCost(state.player.resources, cost),
        skills: upgradeSkill(state.player.skills, action.skillId),
      }
      const log = [...state.log, entry(`能力「${skill.definitionId}」升级成功。`, 'success')]
      return { ...state, player, log }
    }

    case 'LEARN_SKILL': {
      if (!state.player) return state
      const def = skills.find((s) => s.id === action.skillId)
      if (!def || !canLearnSkill(state.player, action.skillId)) return state
      const player: PlayerState = {
        ...state.player,
        resources: payCost(state.player.resources, def.learnCost),
        skills: learnSkill(state.player.skills, action.skillId),
      }
      const log = [...state.log, entry(`你习得了新能力【${def.name}】！`, 'success')]
      return { ...state, player, log }
    }

    case 'REST': {
      const p = state.player
      if (!p) return state
      const player = restPlayer(p)
      const log = [...state.log, entry('你调息凝神，生命与灵力尽数恢复，探索点亦有所回复。', 'success')]
      return { ...state, player, log }
    }

    case 'ACCEPT_QUEST': {
      if (!state.player) return state
      const player = acceptQuest(state.player, action.questId)
      if (!player) return state
      const def = questDef(action.questId)
      const log = [...state.log, entry(`接取任务【${def?.title ?? action.questId}】。`, 'info')]
      return { ...state, player, log }
    }

    case 'CLAIM_QUEST': {
      if (!state.player) return state
      const player = claimQuestRewards(state.player, action.questId)
      if (!player) return state
      const def = questDef(action.questId)
      const log = [...state.log, entry(`任务【${def?.title ?? action.questId}】完成，奖励已领取。`, 'success')]
      return { ...state, player, log }
    }

    case 'USE_ITEM': {
      if (!state.player) return state
      const player = useItem(state.player, action.itemId)
      if (!player) return state
      const log = [...state.log, entry('你使用了消耗品。', 'success')]
      return { ...state, player, log }
    }

    case 'SELL_ITEM': {
      if (!state.player) return state
      const player = sellItems(state.player, action.itemId)
      if (!player) return state
      const log = [...state.log, entry('物品已出售，换取灵晶。', 'success')]
      return { ...state, player, log }
    }

    case 'BUY_ITEM': {
      if (!state.player) return state
      const player = buyItem(state.player, action.itemId)
      if (!player) return state
      const item = items.find((i) => i.id === action.itemId)
      const eq = equipment.find((e) => e.id === action.itemId)
      const name = item?.name ?? eq?.name ?? action.itemId
      const log = [
        ...state.log,
        entry(`你购得了【${name}】，花费 ${shopPriceOf(action.itemId)} 金币。`, 'success'),
      ]
      return { ...state, player, log }
    }

    case 'TRIGGER_EASTER_EGG': {
      const p = state.player
      if (!p || p.easterEggFound) return state
      let player: PlayerState = { ...p, easterEggFound: true, hp: p.maxHp, spirit: p.maxSpirit }
      player = grantExp(player, 120)
      player = { ...player, resources: addRewards(player.resources, { crystals: 30 }) }
      const log = [
        ...state.log,
        entry('你连击了众生界的大门——门后传来感谢的回响：谢谢你一直以来的支持！', 'success'),
        entry('彩蛋奖励：经验 +120、生命回满、灵晶 +30。', 'success'),
      ]
      return { ...state, player, log }
    }

    case 'RESET':
      clearSave()
      return initialState()

    case 'DISMISS_DEATH':
      return { ...state, deathRecord: null }

    case 'CREATE_AFTER_DEATH':
      return { ...state, screen: 'character-create', deathRecord: null }

    default:
      return state
  }
}

function pickEnemyFor(regionId?: string) {
  const region = regions.find((r) => r.id === regionId)
  const pool = region && region.encounters.length > 0 ? region.encounters : ['wisp']
  const id = pool[Math.floor(Math.random() * pool.length)]
  return enemies.find((e) => e.id === id) ?? enemies[0]
}

function buildBattleState(enemyId: string) {
  const def = enemies.find((e) => e.id === enemyId) ?? enemies[0]
  return {
    enemyId: def.id,
    enemyName: def.name,
    enemyIcon: def.icon,
    enemyType: def.type,
    enemyHp: def.hp,
    enemyMaxHp: def.hp,
    enemyAttack: def.attack,
    enemyDefense: def.defense,
    turn: 1,
    playerDefending: false,
    phase: 'player' as const,
  }
}

function formatRewards(r: Record<string, number>): string {
  const names: Record<string, string> = {
    crystals: '灵晶',
    shards: '灵能碎片',
    cores: '未知核心',
    actionPoints: '探索点',
    coins: '金币',
  }
  return Object.entries(r)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${names[k] ?? k}×${v}`)
    .join('、')
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, undefined, initState)

  // 存档持久化
  useEffect(() => {
    if (state.player) {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state.player))
      } catch {
        // 忽略存储失败
      }
    }
  }, [state.player])

  const actions = useMemo(
    () => ({
      createPlayer: (name: string, path: PathId, avatar?: string) =>
        dispatch({ type: 'CREATE_PLAYER', name, path, avatar }),
      navigate: (screen: ScreenId) => dispatch({ type: 'NAVIGATE', screen }),
      setAvatar: (avatar?: string) => dispatch({ type: 'SET_AVATAR', avatar }),
      explore: (regionId: string) => {
        const region = regions.find((r) => r.id === regionId)
        if (!region) return
        let pool = importEventIdsFor(region.id)
        const level = state.player?.level ?? 0
        if (shouldSpawnBoss(level, regionId, Math.random())) {
          pool = [...pool, 'void-boss']
        }
        const eventId = pool[Math.floor(Math.random() * pool.length)]
        dispatch({ type: 'START_EXPLORATION', regionId, eventId })
      },
      rollAgain: () => {
        const regionId = state.player?.activeRegionId
        const region = regions.find((r) => r.id === regionId)
        if (!region) return
        let pool = importEventIdsFor(region.id)
        const level = state.player?.level ?? 0
        if (shouldSpawnBoss(level, regionId, Math.random())) {
          pool = [...pool, 'void-boss']
        }
        const eventId = pool[Math.floor(Math.random() * pool.length)]
        dispatch({ type: 'ROLL_AGAIN', eventId })
      },
      resolveOption: (optionId: string) => dispatch({ type: 'RESOLVE_OPTION', optionId }),
      leaveExploration: () => dispatch({ type: 'LEAVE_EXPLORATION' }),
      basicAttack: () => dispatch({ type: 'BASIC_ATTACK' }),
      defend: () => dispatch({ type: 'DEFEND' }),
      castSkill: (skillId: string) => dispatch({ type: 'CAST_SKILL', skillId }),
      resolveEnemyTurn: () => dispatch({ type: 'RESOLVE_ENEMY_TURN' }),
      claimVictory: () => dispatch({ type: 'CLAIM_VICTORY' }),
      claimDefeat: () => dispatch({ type: 'CLAIM_DEFEAT' }),
      retreatBattle: () => dispatch({ type: 'RETREAT_BATTLE' }),
      unlockRegion: (regionId: string) => dispatch({ type: 'UNLOCK_REGION', regionId }),
      upgradeSkill: (skillId: string) => dispatch({ type: 'UPGRADE_SKILL', skillId }),
      learnSkill: (skillId: string) => dispatch({ type: 'LEARN_SKILL', skillId }),
      rest: () => dispatch({ type: 'REST' }),
      reset: () => dispatch({ type: 'RESET' }),
      acceptQuest: (questId: string) => dispatch({ type: 'ACCEPT_QUEST', questId }),
      claimQuest: (questId: string) => dispatch({ type: 'CLAIM_QUEST', questId }),
      useItem: (itemId: string) => dispatch({ type: 'USE_ITEM', itemId }),
      sellItem: (itemId: string) => dispatch({ type: 'SELL_ITEM', itemId }),
      buyItem: (itemId: string) => dispatch({ type: 'BUY_ITEM', itemId }),
      triggerEasterEgg: () => dispatch({ type: 'TRIGGER_EASTER_EGG' }),
      dismissDeath: () => dispatch({ type: 'DISMISS_DEATH' }),
      createAfterDeath: () => dispatch({ type: 'CREATE_AFTER_DEATH' }),
    }),
    [state.player?.activeRegionId, state.player?.level],
  )

  return { state, actions }
}

function importEventIdsFor(regionId: string): string[] {
  const region = regions.find((r) => r.id === regionId)
  return region ? region.events : []
}
