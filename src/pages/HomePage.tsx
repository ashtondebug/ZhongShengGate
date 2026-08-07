import { motion } from 'framer-motion'
import type { ScreenProps } from '@/App'
import { GameButton } from '@/components/ui/GameButton'

export function HomePage({ actions }: ScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <motion.div
        className="relative mb-10 flex h-52 w-52 items-center justify-center sm:mb-12 sm:h-80 sm:w-80"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        {/* 众-生-之-门 */}
        <div className="gate-ring absolute inset-0" />
        <div className="gate-ring absolute inset-7 sm:inset-8" style={{ animationDirection: 'reverse', animationDuration: '16s' }} />
        <motion.div
          className="glass glow-spirit absolute inset-12 flex items-center justify-center rounded-full sm:inset-16"
          animate={{ boxShadow: ['0 0 30px rgba(56,214,245,0.35)', '0 0 60px rgba(139,92,246,0.5)', '0 0 30px rgba(56,214,245,0.35)'] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <i className="fa-solid fa-om text-5xl text-spirit text-glow-spirit sm:text-8xl" />
        </motion.div>
      </motion.div>

      <motion.h1
        className="font-display gradient-text mb-3 text-center text-5xl font-bold tracking-[0.15em] sm:text-7xl sm:tracking-[0.35em]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        众生界
      </motion.h1>

      <motion.p
        className="mb-8 text-center text-base tracking-[0.25em] text-cyan-200/70 sm:mb-10 sm:text-xl sm:tracking-[0.5em]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        连接万物，探索未知。
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.6 }}>
        <GameButton
          variant="metal"
          className="px-8 py-3.5 text-base sm:px-12 sm:py-4 sm:text-lg"
          icon="fa-solid fa-door-open"
          onClick={() => actions.navigate('character-create')}
        >
          进入众生界
        </GameButton>
      </motion.div>
    </div>
  )
}