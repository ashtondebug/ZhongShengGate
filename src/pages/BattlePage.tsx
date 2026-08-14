import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { skills } from '@/data'
import type { ScreenProps } from '@/App'
import { audio, type SoundName } from '@/audio'
import { Hud } from '@/components/Hud'
import { PlayerPortrait } from '@/components/PlayerPortrait'
import { BattleLog } from '@/components/BattleLog'
import { StatBar } from '@/components/ui/StatBar'
import { GameButton } from '@/components/ui/GameButton'

export function BattlePage({ state, actions }: ScreenProps) {
  const player = state.player
  const battle = state.battle

  // 敌方自动攻击：战斗中每隔 0.3~1 秒（随机）敌方主动攻击一次，直至战斗结束（无需玩家操作）
  useEffect(() => {
    if (!battle || battle.phase !== 'player') return
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => {
        actions.resolveEnemyTurn()
        schedule()
      }, 300 + Math.random() * 700)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [battle?.phase])

  if (!player || !battle) return null

  const skillDefs = player.skills
    .map((s) => ({ state: s, def: skills.find((d) => d.id === s.definitionId)! }))
    .filter((x) => !!x.def)

  const over = battle.phase === 'won' || battle.phase === 'lost'

  return (
    <div className="min-h-screen pb-8">
      <Hud player={player} onNavigate={actions.navigate} />

      <div className="mx-auto mt-6 max-w-5xl px-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-glow-gold text-lg tracking-[0.15em] text-gold-bright sm:text-2xl sm:tracking-[0.2em]">
            灵能对决 · 回合 {battle.turn}
          </h2>
          {!over && (
            <GameButton variant="danger" className="px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm" icon="fa-solid fa-person-running" onClick={actions.retreatBattle}>
              撤退
            </GameButton>
          )}
        </div>

        {/* 顶部双方状态 */}
        <div className="glass-strong mb-4 grid gap-4 rounded-2xl p-4 sm:grid-cols-2">
          <StatBar label="生命" value={player.hp} max={player.maxHp} color="hp" />
          <StatBar label="敌方生命" value={battle.enemyHp} max={battle.enemyMaxHp} color="spirit" />
        </div>

        {/* 战场 */}
        <div className="glass-strong relative mb-4 overflow-hidden rounded-2xl p-4 sm:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(139,92,246,0.12),transparent_60%)]" />
          <div className="relative grid grid-cols-3 items-center gap-2 py-4 sm:gap-4 sm:py-6">
            {/* 左：玩家 */}
            <motion.div
              key={player.hp}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-3"
            >
              <PlayerPortrait path={player.path} avatar={player.avatar} size="lg" />
              <div className="text-center">
                <div className="font-display text-lg text-white">{player.name}</div>
                <div className="text-xs text-cyan-300">Lv.{player.level}</div>
              </div>
            </motion.div>

            {/* 中：对战标识 */}
            <div className="flex flex-col items-center gap-2 text-center">
              <motion.i
                className="fa-solid fa-bolt text-4xl text-gold-bright text-glow-gold"
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.15, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              <span className="font-display text-sm tracking-[0.3em] text-white/40">VS</span>
            </div>

            {/* 右：敌人 */}
            <motion.div
              key={`${battle.enemyHp}-${battle.turn}`}
              animate={over ? {} : { x: [0, -10, 8, -6, 4, 0] }}
              transition={{ duration: 0.45 }}
              className="flex flex-col items-center gap-3"
            >
              <div
                className="relative flex h-20 w-20 items-center justify-center rounded-2xl text-5xl sm:h-36 sm:w-36 sm:text-7xl"
                style={{
                  background:
                    'radial-gradient(circle at 35% 30%, rgba(139,92,246,0.35), rgba(20,10,40,0.9))',
                  border: '1px solid rgba(139,92,246,0.5)',
                  boxShadow: '0 0 30px rgba(139,92,246,0.4)',
                }}
              >
                <i className={`${battle.enemyIcon} text-violet-200`} />
                {battle.phase === 'won' && (
                  <motion.i
                    className="fa-solid fa-skull absolute -top-3 -right-3 text-3xl text-red-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                  />
                )}
              </div>
              <div className="text-center">
                <div className="font-display text-lg text-violet-200">{battle.enemyName}</div>
                <div className="text-xs text-red-300/80">
                  攻 {battle.enemyAttack} · 防 {battle.enemyDefense}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 技能栏 */}
        {!over && (
          <div className="mb-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm uppercase tracking-widest text-white/50">
              <i className="fa-solid fa-wand-magic-sparkles text-gold-bright" />
              行动
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <ActionButton
                icon="fa-solid fa-gun"
                label="普通攻击"
                detail={`${player.stats.control * 1.4 + 6} 伤害`}
                tone="spirit"
                onSound="attack"
                onClick={actions.basicAttack}
              />
              <ActionButton
                icon="fa-solid fa-shield-halved"
                label="防御"
                detail="减免 65% 伤害"
                tone="ghost"
                onSound="defend"
                onClick={actions.defend}
              />
              {skillDefs.map(({ state: s, def }) => {
                const onCooldown = s.cooldownLeft > 0
                const notEnough = player.spirit < def.cost
                return (
                  <ActionButton
                    key={def.id}
                    icon={def.icon}
                    label={def.name}
                    detail={
                      onCooldown
                        ? `冷却 ${s.cooldownLeft}`
                        : notEnough
                          ? `灵力不足`
                          : `消耗 ${def.cost} · ${def.power + s.level * 4} 伤`
                    }
                    tone="void"
                    disabled={onCooldown || notEnough}
                    onSound="skill"
                    onClick={() => actions.castSkill(def.id)}
                  />
                )
              })}
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
          <BattleLog entries={state.log.slice(-16)} className="md:col-span-1" />
          <div className="flex flex-col gap-2">
            <div className="glass rounded-xl p-4 text-sm">
              <div className="mb-2 text-xs uppercase tracking-widest text-white/50">
                <i className="fa-solid fa-gem mr-1 text-amber-300" /> 灵力
              </div>
              <StatBar value={player.spirit} max={player.maxSpirit} color="spirit" showText />
            </div>
            {over && (
              <motion.div
                className={`glass-strong glow-gold rounded-2xl p-5 text-center ${battle.phase === 'won' ? 'glow-spirit' : 'glow-void'}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <i
                  className={`fa-solid ${battle.phase === 'won' ? 'fa-award' : 'fa-heart-crack'} mb-2 text-4xl ${
                    battle.phase === 'won' ? 'text-gold-bright' : 'text-red-300'
                  }`}
                />
                <h3 className="font-display mb-3 text-2xl text-white">
                  {battle.phase === 'won' ? '战斗胜利' : '战斗失败'}
                </h3>
                {battle.phase === 'won' ? (
                  <GameButton variant="metal" icon="fa-solid fa-hand-holding-heart" onClick={actions.claimVictory}>
                    领取战利品
                  </GameButton>
                ) : (
                  <GameButton variant="void" icon="fa-solid fa-feather" onClick={actions.claimDefeat}>
                    接受命运
                  </GameButton>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ActionButtonProps {
  icon: string
  label: string
  detail: string
  tone: 'spirit' | 'ghost' | 'void'
  onClick?: () => void
  disabled?: boolean
  onSound?: SoundName
}

function ActionButton({ icon, label, detail, tone, onClick, disabled, onSound }: ActionButtonProps) {
  const toneCls =
    tone === 'spirit'
      ? 'border-cyan-300/30 hover:border-cyan-300/70 hover:glow-spirit'
      : tone === 'void'
        ? 'border-violet-300/30 hover:border-violet-300/70 hover:glow-void'
        : 'border-white/15 hover:border-white/40'
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.04, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      onClick={
        disabled
          ? undefined
          : () => {
              if (onSound) audio.play(onSound)
              onClick?.()
            }
      }
      disabled={disabled}
      className={`glass group flex flex-col items-center gap-1 rounded-xl p-4 transition-all ${toneCls} ${
        disabled ? 'cursor-not-allowed opacity-40 saturate-0' : 'cursor-pointer'
      }`}
    >
      <i className={`${icon} text-2xl ${disabled ? 'text-white/30' : tone === 'void' ? 'text-violet-300 group-hover:text-gold-bright' : 'text-cyan-300'}`} />
      <span className="text-sm font-semibold text-white">{label}</span>
      <span className="text-[10px] text-white/40">{detail}</span>
    </motion.button>
  )
}