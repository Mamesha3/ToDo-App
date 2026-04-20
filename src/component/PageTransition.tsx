"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

const pageVariants = {
  initial: { opacity: 0, scale: 0.8 },
  enter: { opacity: 1, scale: 1 },
  // exit: { opacity: 0, x: 20, scale: 0.95 }
}

const pageTransition = {
  type: "tween" as const,
  ease: "anticipate" as const,
  duration: 1
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        // exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        style={{ position: 'relative', width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
