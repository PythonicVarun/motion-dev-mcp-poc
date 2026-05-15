import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, animate } from 'motion/react'

const MENU_ITEMS = [
  { label: 'Work',     num: '01' },
  { label: 'About',    num: '02' },
  { label: 'Services', num: '03' },
  { label: 'Contact',  num: '04' },
  { label: 'Lab',      num: '05' },
]

const BG_CLOSED = '#070707'
const BG_OPEN   = '#0f0c29'

// Stagger container — open staggers forward, close staggers in reverse
const listVariants = {
  open: {
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
  closed: {
    transition: {
      staggerChildren: 0.06,
      staggerDirection: -1,
      // Children exit with a tight custom ease (cubic-bezier)
    },
  },
}

// Each item flips in via rotateX (3D card drop), collapses upward on exit
const itemVariants = {
  open: {
    rotateX: 0,
    opacity: 1,
    y: 0,
    transition: { ease: [0.22, 1, 0.36, 1], duration: 0.65 },
  },
  closed: {
    rotateX: -80,
    opacity: 0,
    y: -28,
    // Custom cubic-bezier for the "collapsing upward" feel
    transition: { ease: [0.76, 0, 0.24, 1], duration: 0.42 },
  },
}

function MenuItem({ item }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      className="menu-item"
      variants={itemVariants}
      style={{ originY: 0 }}            // flip from top edge
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div className="menu-item-inner">
        <span className="item-num">{item.num}</span>

        {/* Label shifts slightly right on hover */}
        <motion.span
          className="item-label"
          animate={{ x: hovered ? 14 : 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        >
          {item.label}
        </motion.span>

        {/* Arrow that slides in on hover */}
        <motion.span
          className="item-arrow"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -8 }}
          transition={{ ease: 'easeOut', duration: 0.2 }}
        >
          ↗
        </motion.span>
      </div>

      {/* Liquid underline — scaleX spring stretches to full width */}
      <motion.div
        className="liquid-line"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, mass: 0.9 }}
        style={{ originX: 0 }}
      />
    </motion.div>
  )
}

export default function LiquidMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef(null)

  // ─── Background morph via Motion's animate() on a CSS variable ───
  useEffect(() => {
    if (!rootRef.current) return
    animate(
      rootRef.current,
      { '--menu-bg': isOpen ? BG_OPEN : BG_CLOSED },
      { duration: 0.9, ease: [0.4, 0, 0.2, 1] },
    )
  }, [isOpen])

  return (
    <div
      ref={rootRef}
      className="root"
      style={{ '--menu-bg': BG_CLOSED }}
    >
      {/* ─── Header ─── */}
      <header className="site-header">
        <div className="logo">FLUX</div>

        <button
          className="menu-btn"
          onClick={() => setIsOpen(v => !v)}
          aria-expanded={isOpen}
          aria-label="Toggle menu"
        >
          <motion.span
            className="btn-label"
            key={isOpen ? 'close' : 'menu'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? 'CLOSE' : 'MENU'}
          </motion.span>

          <div className="burger">
            <motion.span
              animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : 0 }}
              transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
            />
            <motion.span
              animate={{ scaleX: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            />
            <motion.span
              animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 0 }}
              transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
            />
          </div>
        </button>
      </header>

      {/* ─── Hero ─── */}
      <main className="hero">
        <div className="hero-eyebrow">Creative Studio — Est. 2024</div>
        <h1 className="hero-title">
          <span>MERCURY</span>
          <span>IN MOTION</span>
        </h1>
        <p className="hero-sub">Digital experiences that feel alive</p>
      </main>

      {/* ─── Fullscreen Menu Overlay ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.3,
                // Delay disappearance until children finish their exit stagger
                delay: MENU_ITEMS.length * 0.06 + 0.15,
              },
            }}
          >
            {/* Items list — drives stagger via listVariants */}
            <motion.ul
              className="items-list"
              initial="closed"
              animate="open"
              exit="closed"
              variants={listVariants}
              style={{ perspective: '1100px' }}
            >
              {MENU_ITEMS.map((item) => (
                <MenuItem key={item.label} item={item} />
              ))}
            </motion.ul>

            {/* Footer row inside overlay */}
            <div className="overlay-footer">
              <span>©2024 FLUX STUDIO</span>
              <div className="socials">
                <a href="#" className="social-link">TW</a>
                <a href="#" className="social-link">IG</a>
                <a href="#" className="social-link">LI</a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}
