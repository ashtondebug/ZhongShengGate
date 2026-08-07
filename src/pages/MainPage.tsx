import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ScreenId } from '@/types'
import type { ScreenProps } from '@/App'
import { Hud } from '@/components/Hud'
import { PlayerPortrait } from '@/components/PlayerPortrait'
import { GlassCard } from '@/components/ui/GlassCard'
import { GameButton } from '@/components/ui/GameButton'
import { StatBar } from '@/components/ui/StatBar'
import { Modal } from '@/components/ui/Modal'
import { paths, regions } from '@/data'
import { expForNextLevel } from '@/systems'
import mainBg from '@/assets/images/main-bg.png'

interface FeedbackChannel {
  id: string
  icon: string
  name: string
  desc: string
  href?: string
  accent: string
}

const FEEDBACK_CHANNELS: FeedbackChannel[] = [
  {
    id: 'bili',
    icon: 'fa-brands fa-bilibili',
    name: '哔哩哔哩',
    desc: '来翻制作者的摸鱼日常，一键三连可回复灵力上限。',
    href: 'https://space.bilibili.com/3537122176797008',
    accent: '#fb7299',
  },
  {
    id: 'github',
    icon: 'fa-brands fa-github',
    name: 'GitHub Issues',
    desc: '在众生界发现裂缝或奇想？到 Issues 提交，作者逐条翻牌。',
    href: 'https://github.com/ashtondebug/ZhongShengGate/issues',
    accent: '#a5b4c8',
  },
  {
    id: 'email',
    icon: 'fa-solid fa-envelope',
    name: '邮箱',
    desc: '把你的奇思妙想倒进这个邮箱，作者不定期翻牌。',
    href: 'mailto:debug_life@qq.com',
    accent: '#38d6f5',
  },
  {
    id: 'qq',
    icon: 'fa-brands fa-qq',
    name: 'QQ 群',
    desc: 'QQ 群 971155138，点击复制群号，去 QQ 搜索加入。',
    accent: '#4aa3ff',
  },
]

const MENU: { id: ScreenId; icon: string; label: string; sub: string }[] = [
  { id: 'worldmap', icon: 'fa-solid fa-map', label: '探索', sub: '踏入未知区域' },
  { id: 'abilities', icon: 'fa-solid fa-wand-magic-sparkles', label: '能力', sub: '修炼灵能之力' },
  { id: 'character', icon: 'fa-solid fa-user', label: '角色', sub: '查看自身状态' },
  { id: 'inventory', icon: 'fa-solid fa-box-open', label: '背包', sub: '资源与物品' },
  { id: 'quests', icon: 'fa-solid fa-scroll', label: '任务', sub: '委托与传说' },
  { id: 'social', icon: 'fa-solid fa-user-group', label: '社交', sub: '灵脉相会' },
]

export function MainPage({ state, actions }: ScreenProps) {
  const player = state.player
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [needRest, setNeedRest] = useState(false)
  const [copied, setCopied] = useState(false)
  const [eggClicks, setEggClicks] = useState(0)
  const [eggOpen, setEggOpen] = useState(false)
  if (!player) return null
  const pathDef = paths.find((p) => p.id === player.path)!

  const quickExplore = () => {
    const target = player.activeRegionId ?? player.unlockedRegions[0]
    const region = target ? regions.find((r) => r.id === target) : undefined
    if (!region) {
      actions.navigate('worldmap')
      return
    }
    if (player.resources.actionPoints < region.explorationCost) {
      setNeedRest(true)
      return
    }
    actions.explore(region.id)
  }

  return (
    <div
      className="min-h-screen pb-8"
      style={{
        backgroundImage: `linear-gradient(rgba(4, 8, 18, 0.55), rgba(4, 8, 18, 0.78)), url(${mainBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Hud player={player} onNavigate={actions.navigate} />

      <div className="mx-auto mt-6 grid max-w-6xl gap-5 px-4 lg:grid-cols-[300px_1fr_300px]">
        {/* 左：角色档案 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="order-2 flex flex-col gap-4 lg:order-1"
        >
          <GlassCard className="flex flex-col items-center text-center">
            <PlayerPortrait path={player.path} size="xl" className="mb-4" />
            <h2 className="font-display text-2xl text-gold-bright">{player.name}</h2>
            <p className="mt-1 text-sm text-cyan-300">{pathDef.name}</p>
            <div className="mt-4 w-full space-y-3">
              <StatBar label="生命" value={player.hp} max={player.maxHp} color="hp" />
              <StatBar label="灵力" value={player.spirit} max={player.maxSpirit} color="spirit" />
              <StatBar label="经验" value={player.exp} max={expForNextLevel(player.level)} color="exp" />
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="mb-3 flex items-center gap-2 text-sm uppercase tracking-widest text-white/50">
              <i className="fa-solid fa-bolt text-gold-bright" />
              基础属性
            </h3>
            <div className="space-y-2 text-sm">
              {[
                ['灵能', player.stats.spirit],
                ['灵力容量', player.stats.capacity],
                ['感知', player.stats.perception],
                ['控制', player.stats.control],
                ['体质', player.stats.constitution],
                ['幸运', player.stats.luck],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-white/60">{label}</span>
                  <span className="font-semibold text-cyan-300">{value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* 中：众生界/地图入口 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="order-3 flex flex-col gap-4 lg:order-2"
        >
          <div
            className="glass-frost relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl p-8"
            style={{
              background: 'linear-gradient(160deg, rgba(56, 214, 245, 0.03), rgba(29, 78, 216, 0.05))',
              border: '1px solid rgba(147, 197, 253, 0.1)',
            }}
          >
            <div className="gate-ring absolute inset-6 opacity-100" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-black/30 ring-1 ring-cyan-300/30">
                <i className="fa-solid fa-om text-5xl text-spirit text-glow-spirit" />
              </div>
              <h3
                className="font-display cursor-pointer text-3xl tracking-[0.25em] text-gold-bright select-none"
                title={player.easterEggFound ? '彩蛋已发掘' : '连击十次，或许有惊喜……'}
                onClick={() => {
                  if (player.easterEggFound) return
                  const next = eggClicks + 1
                  setEggClicks(next)
                  if (next >= 10) {
                    setEggClicks(0)
                    setEggOpen(true)
                  }
                }}
              >
                众生界
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/60">
                门后的世界广袤而危险。选择一条道路深入探索，收集资源，强化自身，挑战更凶险的领域。
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <GameButton variant="metal" icon="fa-solid fa-map" onClick={() => actions.navigate('worldmap')}>
                  打开世界地图
                </GameButton>
                <GameButton variant="spirit" icon="fa-solid fa-compass" onClick={quickExplore}>
                  快速探索
                </GameButton>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm uppercase tracking-widest text-white/50">
                <i className="fa-solid fa-circle-info text-cyan-300" />
                灵能简讯
              </h3>
              <GameButton
                variant="ghost"
                className="px-3 py-1.5 text-xs"
                icon="fa-solid fa-hands-praying"
                onClick={actions.rest}
              >
                调息
              </GameButton>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              已解锁区域 <span className="text-cyan-300">{player.unlockedRegions.length}</span> 处，
              掌握能力 <span className="text-cyan-300">{player.skills.length}</span> 项。
              探索点每日会自然回复，也可在冒险中拾获。若负伤疲乏，可在此调息休整。
            </p>
          </div>
        </motion.div>

        {/* 右：功能菜单 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="order-1 grid grid-cols-2 content-start gap-3 lg:order-3"
        >
          {MENU.map((m) => (
            <GlassCard
              key={m.id}
              className="group cursor-pointer p-4 text-center transition-transform hover:scale-[1.03]"
              onClick={() => actions.navigate(m.id)}
            >
              <i
                className={`${m.icon} mb-2 text-2xl text-cyan-300 transition-all group-hover:text-gold-bright group-hover:text-glow-gold`}
              />
              <h4 className="font-display text-base text-white">{m.label}</h4>
              <p className="mt-0.5 text-xs text-white/40">{m.sub}</p>
            </GlassCard>
          ))}

          <button
            className="glass group col-span-2 flex items-center justify-center gap-2 rounded-xl p-3 transition-all hover:border-gold-bright/40 hover:glow-gold"
            onClick={() => setFeedbackOpen(true)}
          >
            <i className="fa-solid fa-comment-dots text-lg text-gold-bright transition-transform group-hover:rotate-12" />
            <span className="font-display text-base text-gold-bright">我要反馈</span>
            <span className="text-xs text-white/35">给制作人的留言</span>
          </button>
        </motion.div>
      </div>

      <Modal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} title="我要反馈">
        <p className="mb-5 text-sm leading-relaxed text-white/60">
          在众生界遇到裂缝、掉帧、还是纯粹的灵能堵塞？又或是一肚子奇思妙想无处安放？
          把声音穿越世界之壁，送到制作人耳边。
        </p>
        <div className="grid gap-3">
          {FEEDBACK_CHANNELS.map((c) => {
            const inner = (
              <>
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ background: `${c.accent}1f`, border: `1px solid ${c.accent}55`, color: c.accent }}
                >
                  <i className={c.icon} />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base text-white">{c.name}</span>
                    {!c.href && c.id !== 'qq' && (
                      <span className="rounded-full border border-white/20 px-1.5 py-0.5 text-[10px] text-white/40">
                        敬请期待
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-white/45">{c.desc}</p>
                </div>
                {c.id === 'qq' ? (
                  <span className={`text-xs ${copied ? 'text-emerald-300' : 'text-white/30'}`}>
                    <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} />
                  </span>
                ) : (
                  c.href && <i className="fa-solid fa-chevron-right text-sm text-white/30" />
                )}
              </>
            )
            const cls =
              'glass flex w-full items-center gap-3 rounded-xl p-3 transition-all hover:scale-[1.01]'
            return c.id === 'qq' ? (
              <button
                key={c.id}
                className={`${cls} cursor-pointer hover:border-white/30`}
                onClick={() => {
                  navigator.clipboard?.writeText('971155138')
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                }}
              >
                {inner}
              </button>
            ) : c.href ? (
              <a
                key={c.id}
                className={`${cls} cursor-pointer hover:border-white/30`}
                href={c.href}
                target="_blank"
                rel="noreferrer"
              >
                {inner}
              </a>
            ) : (
              <div key={c.id} className={`${cls} opacity-70`}>
                {inner}
              </div>
            )
          })}
        </div>
        <p className="mt-5 text-xs text-white/30">
          你的每一条反馈，都会化作众生界下一次进化的灵力。
        </p>
      </Modal>
      <Modal open={needRest} onClose={() => setNeedRest(false)} title="灵力暂歇">
        <p className="text-sm leading-relaxed text-white/70">
          探索点不足，此刻无法即刻出发。先「调息」凝神恢复些许，再踏上旅程。
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <GameButton variant="ghost" onClick={() => setNeedRest(false)}>
            稍后再说
          </GameButton>
          <GameButton
            variant="metal"
            icon="fa-solid fa-hands-praying"
            onClick={() => {
              setNeedRest(false)
              actions.rest()
            }}
          >
            立即调息
          </GameButton>
        </div>
      </Modal>
      <Modal open={eggOpen} onClose={() => setEggOpen(false)} title="众生界 · 彩蛋">
        <div className="mb-4 flex flex-col items-center text-center">
          <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/20 text-3xl text-violet-300 ring-1 ring-violet-400/40">
            <i className="fa-solid fa-om" />
          </span>
          <p className="text-sm leading-relaxed text-white/70">
            你连击了众生界的大门十次，门后传来一阵温和的回响：
          </p>
          <p className="font-display mt-3 text-base italic text-gold-bright">
            「谢谢你一直以来的支持。愿你的每一次探索，都有灵光相伴。」
          </p>
          <p className="mt-3 text-xs text-emerald-300/90">奖励：经验 +120 · 生命回满 · 灵晶 +30</p>
        </div>
        <div className="flex justify-end gap-2">
          <GameButton variant="ghost" onClick={() => setEggOpen(false)}>
            稍后再取
          </GameButton>
          <GameButton
            variant="metal"
            icon="fa-solid fa-gift"
            onClick={() => {
              setEggOpen(false)
              actions.triggerEasterEgg()
            }}
          >
            收下这份心意
          </GameButton>
        </div>
      </Modal>
    </div>
  )
}