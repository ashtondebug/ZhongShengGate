export type ElementType = 'space' | 'spirit' | 'fire' | 'water' | 'wind' | 'thunder' | 'perception'

export type PathId = 'human' | 'awakened' | 'walker'

export interface PathDefinition {
  id: PathId
  name: string
  description: string
  icon: string
  stats: PlayerStats
  startingSkills: string[]
  accent: string
}

export interface PlayerStats {
  spirit: number
  capacity: number
  perception: number
  control: number
  constitution: number
  luck: number
}

export interface SkillDefinition {
  id: string
  name: string
  type: ElementType
  icon: string
  cost: number
  cooldown: number
  description: string
  power: number
  maxLevel: number
  levelRequirement: number
  learnCost: Record<string, number>
  upgradeCost: Record<string, number>
}

export interface SkillState {
  definitionId: string
  level: number
  cooldownLeft: number
}

export interface EnemyDefinition {
  id: string
  name: string
  type: ElementType
  icon: string
  hp: number
  attack: number
  defense: number
  spiritReward: number
  expReward: number
  dropId?: string
  boss?: boolean
}

export interface RegionDefinition {
  id: string
  name: string
  description: string
  danger: 'low' | 'medium' | 'high'
  resource: string
  resourceIcon: string
  unlockCost: number
  explorationCost: number
  unlockRequires?: string
  nodeX: number
  nodeY: number
  encounters: string[]
  events: string[]
}

export interface EventOption {
  id: string
  label: string
  icon: string
  requires?: { stat?: keyof PlayerStats; value: number }
  consequence: EventConsequence
}

export interface EventConsequence {
  successText?: string
  failText?: string
  rewards?: Partial<Resources>
  damage?: number
  exp?: number
  requireBattle?: boolean
}

export interface ExplorationEvent {
  id: string
  name: string
  flavor: string
  type: 'resource' | 'battle' | 'story'
  icon: string
  options: EventOption[]
}

export interface Resources {
  crystals: number
  shards: number
  cores: number
  actionPoints: number
}

export interface ItemDefinition {
  id: string
  name: string
  icon: string
  category: 'consumable' | 'material' | 'relic'
  description: string
  sellPrice: number
  healHp?: number
  restoreSpirit?: number
}

export interface InventoryItem {
  itemId: string
  quantity: number
}

export interface QuestDefinition {
  id: string
  title: string
  description: string
  icon: string
  type: 'hunt' | 'collect' | 'explore'
  target: { kind: 'enemy' | 'resource' | 'region'; id: string }
  targetCount: number
  rewards: {
    crystals?: number
    shards?: number
    cores?: number
    exp?: number
    items?: { itemId: string; quantity: number }[]
  }
  unlockLevel?: number
}

export interface QuestState {
  definitionId: string
  progress: number
  claimed: boolean
}

export interface LogEntry {
  id: number
  text: string
  tone: 'info' | 'player' | 'enemy' | 'success' | 'danger'
}

export type ScreenId =
  | 'home'
  | 'character-create'
  | 'main'
  | 'worldmap'
  | 'explore'
  | 'battle'
  | 'abilities'
  | 'character'
  | 'inventory'
  | 'quests'
  | 'social'

export interface PlayerState {
  name: string
  path: PathId
  level: number
  exp: number
  hp: number
  maxHp: number
  spirit: number
  maxSpirit: number
  stats: PlayerStats
  resources: Resources
  skills: SkillState[]
  unlockedRegions: string[]
  quests: QuestState[]
  inventory: InventoryItem[]
  easterEggFound?: boolean
  activeRegionId?: string
  createdAt: number
  lastRestAt: number
}

export interface BattleSnapshot {
  playerHp: number
  playerSpirit: number
  enemyHp: number
  enemyMaxHp: number
}

export interface GameState {
  screen: ScreenId
  player: PlayerState | null
  battle: BattleState | null
  activeEventId?: string
  activeReport?: ExplorationReport
  log: LogEntry[]
}

export interface BattleState {
  enemyId: string
  enemyName: string
  enemyIcon: string
  enemyType: ElementType
  enemyHp: number
  enemyMaxHp: number
  enemyAttack: number
  enemyDefense: number
  turn: number
  playerDefending: boolean
  phase: 'player' | 'enemy' | 'won' | 'lost'
  rewards?: { crystals: number; shards: number; exp: number; cores?: number }
}

export interface ExplorationReport {
  eventId?: string
  text: string
  rewards?: Partial<Resources>
  exp?: number
  damage?: number
  battle?: boolean
  enemyId?: string
}
