import type { ScreenProps } from '@/App'
import { Hud } from '@/components/Hud'
import { GameButton } from '@/components/ui/GameButton'
import { enemies, regions } from '@/data'
import { availableQuests, questDef } from '@/systems'
import type { QuestDefinition, QuestState } from '@/types'

const RESOURCE_NAMES: Record<string, string> = {
  crystals: '灵晶',
  shards: '灵能碎片',
  cores: '未知核心',
}

function targetName(def: QuestDefinition): string {
  if (def.target.kind === 'enemy') return enemies.find((e) => e.id === def.target.id)?.name ?? def.target.id
  if (def.target.kind === 'region') return regions.find((r) => r.id === def.target.id)?.name ?? def.target.id
  return RESOURCE_NAMES[def.target.id] ?? def.target.id
}

function rewardText(def: QuestDefinition): string {
  const r = def.rewards
  const parts: string[] = []
  if (r.crystals) parts.push(`灵晶×${r.crystals}`)
  if (r.shards) parts.push(`碎片×${r.shards}`)
  if (r.cores) parts.push(`核心×${r.cores}`)
  if (r.exp) parts.push(`经验+${r.exp}`)
  return parts.length ? parts.join('、') : '无'
}

function QuestProgress({ state }: { state: QuestState }) {
  const def = questDef(state.definitionId)
  if (!def) return null
  const pct = Math.min(100, Math.round((state.progress / def.targetCount) * 100))
  return (
    <div className="mt-3">
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-right text-xs text-white/40 tabular-nums">
        {state.progress}/{def.targetCount}
      </p>
    </div>
  )
}

export function QuestsPage({ state, actions }: ScreenProps) {
  const player = state.player
  if (!player) return null

  const board = availableQuests(player)
  const inProgress = player.quests.filter((q) => !q.claimed)
  const completed = player.quests.filter((q) => q.claimed)

  return (
    <div className="min-h-screen pb-8">
      <Hud player={player} onNavigate={actions.navigate} />

      <div className="mx-auto mt-6 max-w-5xl px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-glow-gold text-2xl tracking-[0.15em] text-gold-bright sm:text-3xl sm:tracking-[0.25em]">任务</h2>
            <p className="mt-1 text-xs text-white/50 sm:text-sm">委托板上的悬赏与传说。完成目标即可领取丰厚回报。</p>
          </div>
          <GameButton variant="ghost" className="px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm" icon="fa-solid fa-arrow-left" onClick={() => actions.navigate('main')}>
            <span className="hidden sm:inline">返回</span>
          </GameButton>
        </div>

        {/* 委托板 */}
        <div className="mb-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm uppercase tracking-widest text-white/50">
            <i className="fa-solid fa-bullhorn text-amber-300" /> 委托板
          </h3>
          {board.length === 0 ? (
            <p className="glass rounded-2xl p-4 text-sm text-white/35">委托板空空如也，新的委托会随境界提升而显现。</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {board.map((def) => (
                <div key={def.id} className="glass flex flex-col rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-xl text-violet-300 ring-1 ring-violet-400/40">
                      <i className={def.icon} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-base text-white">{def.title}</h4>
                      <p className="text-xs text-cyan-300">
                        {def.type === 'hunt' ? '猎杀' : def.type === 'collect' ? '收集' : '探索'}：{targetName(def)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-white/45">{def.description}</p>
                  <p className="mt-2 text-xs text-emerald-300/90">奖励：{rewardText(def)}</p>
                  {def.unlockLevel && (
                    <p className="mt-1 text-xs text-amber-300/70">需要 Lv.{def.unlockLevel}</p>
                  )}
                  <GameButton
                    variant="metal"
                    className="mt-3 px-3 py-2 text-xs"
                    icon="fa-solid fa-hand"
                    onClick={() => actions.acceptQuest(def.id)}
                  >
                    接取
                  </GameButton>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 进行中 */}
        <div className="mb-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm uppercase tracking-widest text-white/50">
            <i className="fa-solid fa-scroll text-cyan-300" /> 进行中
          </h3>
          {inProgress.length === 0 ? (
            <p className="glass rounded-2xl p-4 text-sm text-white/35">尚未接取任何任务，去委托板看看吧。</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inProgress.map((q) => {
                const def = questDef(q.definitionId)!
                const ready = q.progress >= def.targetCount
                return (
                  <div key={q.definitionId} className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <i className={`${def.icon} text-lg ${ready ? 'text-emerald-300' : 'text-cyan-300'}`} />
                        <h4 className="font-display truncate text-base text-white">{def.title}</h4>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${ready ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'}`}>
                        {ready ? '可领取' : '进行中'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/40">
                      目标：{def.type === 'hunt' ? '猎杀' : def.type === 'collect' ? '收集' : '探索'} {targetName(def)}
                    </p>
                    <QuestProgress state={q} />
                    {ready && (
                      <GameButton
                        variant="spirit"
                        className="mt-2 w-full px-3 py-2 text-xs"
                        icon="fa-solid fa-gift"
                        onClick={() => actions.claimQuest(q.definitionId)}
                      >
                        领取奖励
                      </GameButton>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 已完成 */}
        {completed.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm uppercase tracking-widest text-white/50">
              <i className="fa-solid fa-circle-check text-emerald-300" /> 已完成
            </h3>
            <div className="flex flex-wrap gap-2">
              {completed.map((q) => {
                const def = questDef(q.definitionId)!
                return (
                  <span key={q.definitionId} className="glass flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-emerald-300/80">
                    <i className={def.icon} /> {def.title}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
