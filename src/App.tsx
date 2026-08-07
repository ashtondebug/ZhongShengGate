import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameState } from '@/hooks/useGameState'
import { audio, type SoundName } from '@/audio'
import type { GameState, LogEntry, ScreenId } from '@/types'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { Footer } from '@/components/ui/Footer'
import { HomePage } from '@/pages/HomePage'
import { CharacterCreatePage } from '@/pages/CharacterCreatePage'
import { MainPage } from '@/pages/MainPage'
import { WorldMapPage } from '@/pages/WorldMapPage'
import { ExplorePage } from '@/pages/ExplorePage'
import { BattlePage } from '@/pages/BattlePage'
import { CharacterPage } from '@/pages/CharacterPage'
import { AbilitiesPage } from '@/pages/AbilitiesPage'
import { InventoryPage } from '@/pages/InventoryPage'
import { QuestsPage } from '@/pages/QuestsPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

export interface GameActions {
  createPlayer: (name: string, path: 'human' | 'awakened' | 'walker') => void
  navigate: (screen: ScreenId) => void
  explore: (regionId: string) => void
  rollAgain: () => void
  resolveOption: (optionId: string) => void
  leaveExploration: () => void
  basicAttack: () => void
  defend: () => void
  castSkill: (skillId: string) => void
  claimVictory: () => void
  claimDefeat: () => void
  retreatBattle: () => void
  unlockRegion: (regionId: string) => void
  upgradeSkill: (skillId: string) => void
  learnSkill: (skillId: string) => void
  rest: () => void
  reset: () => void
  acceptQuest: (questId: string) => void
  claimQuest: (questId: string) => void
  useItem: (itemId: string) => void
  sellItem: (itemId: string) => void
  triggerEasterEgg: () => void
}

type ScreenProps = {
  state: GameState
  actions: GameActions
}

/** 根据日志条目映射游戏事件音效 */
function soundForEntry(e: LogEntry): SoundName | null {
  const { text, tone } = e
  if (tone === 'danger') {
    if (text.includes('被打倒在地')) return 'defeat'
    return 'hit'
  }
  if (tone === 'success') {
    if (text.includes('被击败了')) return 'victory'
    if (text.includes('获得')) return 'discover'
    if (text.includes('习得')) return 'unlock'
    if (text.includes('解锁')) return 'unlock'
    if (text.includes('升级成功')) return 'levelup'
    if (text.includes('调息')) return 'rest'
    if (text.includes('彩蛋') || text.includes('任务')) return 'levelup'
    return 'discover'
  }
  if (tone === 'info') {
    if (text.includes('进入【')) return 'open'
    if (text.includes('解锁')) return 'unlock'
  }
  return null
}

export default function App() {
  const { state, actions } = useGameState()

  // 游戏事件音效：监听状态变化（升级/进入战斗/日志）驱动
  const prevRef = useRef(state)
  useEffect(() => {
    const prev = prevRef.current

    if (state.player && prev.player && state.player.level > prev.player.level) {
      audio.play('levelup')
    }

    const enteredBattle = state.screen === 'battle' && prev.screen !== 'battle'
    if (enteredBattle) {
      audio.play('battle')
    }

    const newEntries = state.log.slice(prev.log.length)
    if (!enteredBattle) {
      const played = new Set<SoundName>()
      for (const e of newEntries) {
        const s = soundForEntry(e)
        if (!s) continue
        if (s === 'victory' || s === 'defeat') {
          audio.play(s)
          break
        }
        if (!played.has(s)) {
          audio.play(s)
          played.add(s)
        }
      }
    }

    prevRef.current = state
  }, [state])

  const renderScreen = () => {
    switch (state.screen) {
      case 'home':
        return <HomePage state={state} actions={actions} />
      case 'character-create':
        return <CharacterCreatePage state={state} actions={actions} />
      case 'main':
        return <MainPage state={state} actions={actions} />
      case 'worldmap':
        return <WorldMapPage state={state} actions={actions} />
      case 'explore':
        return <ExplorePage state={state} actions={actions} />
      case 'battle':
        return <BattlePage state={state} actions={actions} />
      case 'character':
        return <CharacterPage state={state} actions={actions} />
      case 'abilities':
        return <AbilitiesPage state={state} actions={actions} />
      case 'inventory':
        return <InventoryPage state={state} actions={actions} />
      case 'quests':
        return <QuestsPage state={state} actions={actions} />
      case 'social':
        return <PlaceholderPage state={state} actions={actions} title="社交" icon="fa-solid fa-user-group" description="灵脉感应与道友交流功能正在开发中，多人世界即将开启。" />
      default:
        return <HomePage state={state} actions={actions} />
    }
  }

  return (
    <div className="min-h-screen">
      <ParticleBackground />
      <AnimatePresence mode="wait">
        <motion.div
          key={state.screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="relative z-10"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
      <Footer />
    </div>
  )
}

export type { ScreenProps }
