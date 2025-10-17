'use client'

import { motion } from 'framer-motion'

export function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      animate={{ y: [0, 10, 0] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop' as const,
      }}
    >
      <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
        <motion.div
          className="w-1 h-2 bg-white/50 rounded-full"
          animate={{
            opacity: [1, 0.3, 1],
            y: [0, 8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop' as const,
          }}
        />
      </div>
    </motion.div>
  )
}
