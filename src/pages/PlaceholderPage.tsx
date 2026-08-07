import type { ScreenProps } from '@/App'
import { Hud } from '@/components/Hud'
import { GameButton } from '@/components/ui/GameButton'

interface PlaceholderPageProps extends ScreenProps {
  title: string
  icon: string
  description: string
}

export function PlaceholderPage({ state, actions, title, icon, description }: PlaceholderPageProps) {
  const player = state.player
  if (!player) return null

  return (
    <div className="min-h-screen pb-8">
      <Hud player={player} onNavigate={actions.navigate} />
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="glass-strong glow-void mb-6 flex h-28 w-28 items-center justify-center rounded-2xl">
          <i className={`${icon} text-5xl text-violet-300 text-glow-spirit`} />
        </div>
        <h2 className="font-display text-glow-gold mb-3 text-4xl tracking-[0.3em] text-gold-bright">{title}</h2>
        <p className="mb-8 max-w-md text-white/60">{description}</p>
        <div className="flex gap-3">
          <GameButton variant="metal" icon="fa-solid fa-arrow-left" onClick={() => actions.navigate('main')}>
            返回主界面
          </GameButton>
          <GameButton variant="spirit" icon="fa-solid fa-compass" onClick={() => actions.navigate('worldmap')}>
            去探索
          </GameButton>
        </div>
      </div>
    </div>
  )
}