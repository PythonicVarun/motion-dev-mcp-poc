import { useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  animate,
  AnimatePresence,
} from 'motion/react'
import styles from './MagneticDock.module.css'

const ICONS = [
  { id: 'finder', label: 'Finder',   emoji: '📁', color: '#2d9cff' },
  { id: 'safari', label: 'Safari',   emoji: '🧭', color: '#34c759' },
  { id: 'mail',   label: 'Mail',     emoji: '✉️',  color: '#4a90ff' },
  { id: 'music',  label: 'Music',    emoji: '🎵', color: '#ff2d78' },
  { id: 'photos', label: 'Photos',   emoji: '🌸', color: '#ff6b35' },
  { id: 'trash',  label: 'Trash',    emoji: '🗑️',  color: '#8e8e93' },
]

const GAUSSIAN_SIGMA = 88  // px — governs neighbour-falloff spread

const containerVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.07,
      delayChildren: 0.18,
    },
  },
}

const iconVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.5 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 380, damping: 22 },
  },
}

function DockIcon({ icon, mouseX }) {
  const ref = useRef(null)
  const [hovered, setHovered] = useState(false)
  const clickScale = useMotionValue(1)

  // Signed distance from cursor to this icon's centre (pixels)
  const distance = useTransform(mouseX, (mx) => {
    if (!ref.current) return Infinity
    const { left, width } = ref.current.getBoundingClientRect()
    return Math.abs(mx - (left + width / 2))
  })

  // Gaussian: peaks at 1.85× when cursor is directly over the icon,
  // falls off smoothly to 1× for distant neighbours
  const gaussScale = useTransform(distance, (d) => {
    return 1 + 0.85 * Math.exp(-(d * d) / (2 * GAUSSIAN_SIGMA * GAUSSIAN_SIGMA))
  })

  // Spring wrapping gaussian gives the lag-and-settle feel
  const springScale = useSpring(gaussScale, { stiffness: 300, damping: 24, mass: 0.8 })

  // Multiply proximity scale × click squish scale
  const finalScale = useTransform([springScale, clickScale], ([s, c]) => s * c)

  const handleClick = () => {
    animate(clickScale, [1, 0.72, 1.22, 0.96, 1], {
      duration: 0.48,
      times: [0, 0.15, 0.42, 0.70, 1],
      ease: 'easeOut',
    })
  }

  return (
    // Outer wrapper: entrance animation via staggerChildren variants
    <motion.div className={styles.iconWrapper} variants={iconVariants}>
      {/* Label: spring-animated, appears above the dock slot */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="label"
            className={styles.label}
            style={{ x: '-50%' }}
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {icon.label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon: magnetic scale via motion value, squish on click */}
      <motion.div
        ref={ref}
        className={styles.icon}
        style={{
          scale: finalScale,
          transformOrigin: 'bottom center',
          background: `radial-gradient(circle at 32% 28%, ${icon.color}dd, ${icon.color}55)`,
        }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={handleClick}
      >
        <span className={styles.emoji}>{icon.emoji}</span>
      </motion.div>
    </motion.div>
  )
}

export function MagneticDock() {
  // Single shared motion value drives ALL icon scales simultaneously
  const mouseX = useMotionValue(Infinity)

  return (
    <div className={styles.scene}>
      <motion.div
        className={styles.dock}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {ICONS.map((icon) => (
          <DockIcon key={icon.id} icon={icon} mouseX={mouseX} />
        ))}
      </motion.div>
    </div>
  )
}
