import type { PlayerState, ScreenId } from '@/types'
import { paths } from '@/data'
import { expForNextLevel } from '@/systems'
import { audio } from '@/audio'
import { useState } from 'react'
import { PlayerPortrait } from './PlayerPortrait'
import { StatBar } from './ui/StatBar'
import { ResourceItem } from './ui/ResourceBar'
import { GameButton } from './ui/GameButton'

interface HudProps {
  player: PlayerState
  onNavigate: (screen: ScreenId) => void
}

export function Hud({ player, onNavigate }: HudProps) {
  const pathDef = paths.find((p) => p.id === player.path)!
  const [muted, setMuted] = useState(audio.muted)
  return (
    <header className="glass-frost sticky top-3 z-40 mx-3 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 lg:mx-6">
      <div className="flex items-center gap-3">
        <PlayerPortrait path={player.path} avatar={player.avatar} size="sm" />
        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg text-gold-bright">{player.name}</span>
            <span className="rounded bg-cyan-400/15 px-1.5 py-0.5 text-xs text-cyan-300">
              Lv.{player.level}
            </span>
          </div>
          <span className="text-xs text-white/50">
            {pathDef.name} · 体质 {player.stats.constitution}
          </span>
        </div>
      </div>

      <div className="grid min-w-0 flex-1 grid-cols-2 gap-1.5 sm:flex sm:flex-col">
        <StatBar label="生命" value={player.hp} max={player.maxHp} color="hp" />
        <StatBar label="灵力" value={player.spirit} max={player.maxSpirit} color="spirit" />
        <StatBar
          label="经验"
          value={player.exp}
          max={expForNextLevel(player.level)}
          color="exp"
          className="hidden sm:block"
        />
      </div>

      <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:flex-wrap sm:gap-2 lg:gap-3">
        <ResourceItem icon="fa-solid fa-coins" value={player.resources.coins} label="金币" tone="gold" />
        <ResourceItem icon="fa-solid fa-gem" value={player.resources.crystals} label="灵晶" tone="gold" />
        <ResourceItem icon="fa-solid fa-cubes" value={player.resources.shards} label="碎片" />
        <ResourceItem icon="fa-solid fa-spinner" value={player.resources.cores} label="核心" tone="void" />
        <ResourceItem icon="fa-solid fa-compass" value={player.resources.actionPoints} label="探索点" />
      </div>

      <button
        aria-label={muted ? '开启声音' : '静音'}
        title={muted ? '开启声音' : '静音'}
        onClick={() => setMuted(audio.toggleMuted())}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-all ${
          muted
            ? 'border-white/10 text-white/35 hover:text-white/60'
            : 'border-cyan-300/30 text-cyan-300 hover:glow-spirit'
        }`}
      >
        <i className={`fa-solid ${muted ? 'fa-volume-xmark' : 'fa-volume-high'}`} />
      </button>
      <GameButton
        variant="ghost"
        className="px-3 py-2 text-xs"
        icon="fa-solid fa-rotate-right"
        onClick={() => onNavigate('home')}
      >
        <span className="hidden sm:inline">返回</span>
      </GameButton>
    </header>
  )
}
