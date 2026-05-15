import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from 'motion/react'

// ─── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar() {
  const { scrollYProgress } = useScroll()
  // Spring-eased indicator lags slightly behind raw scroll for a fluid feel
  const springX = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 22,
    restDelta: 0.001,
  })

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'rgba(255,255,255,0.07)',
          zIndex: 1000,
        }}
      />
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: 4,
          width: '100%',
          background:
            'linear-gradient(90deg, #4fc3f7 0%, #ce93d8 45%, #ffd54f 100%)',
          scaleX: springX,
          transformOrigin: '0%',
          zIndex: 1001,
          boxShadow: '0 0 14px rgba(206,147,216,0.65)',
        }}
      />
    </>
  )
}

// ─── Scene Data ────────────────────────────────────────────────────────────────
type WipeType = 'ltr' | 'radial' | 'diagonal'

interface SceneConfig {
  id: string
  title: string
  eyebrow: string
  description: string
  gradient: string
  accent: string
  wipe: WipeType
  glyphs: string[]
}

const SCENES: SceneConfig[] = [
  {
    id: 'genesis',
    title: 'Genesis',
    eyebrow: 'I — Origin',
    description:
      'A universe born from a single point of infinite density. Before light, before time — only potential.',
    gradient:
      'radial-gradient(ellipse 80% 100% at 50% 60%, #0a0a2e 0%, #05051a 65%, #000 100%)',
    accent: '#4fc3f7',
    wipe: 'ltr',
    glyphs: ['✦', '·', '∗', '⊕', '✧'],
  },
  {
    id: 'ascension',
    title: 'Ascension',
    eyebrow: 'II — Rise',
    description:
      'Matter coalesces into structure. From hydrogen to stars, from stars to everything.',
    gradient:
      'radial-gradient(ellipse 100% 80% at 40% 70%, #130a28 0%, #09061a 65%, #000 100%)',
    accent: '#ce93d8',
    wipe: 'ltr',
    glyphs: ['◈', '◇', '⬡', '△', '⬟'],
  },
  {
    id: 'convergence',
    title: 'Convergence',
    eyebrow: 'III — Merge',
    description:
      'Separate streams of causality weave into a single, irreversible thread of fate.',
    gradient:
      'radial-gradient(ellipse 90% 90% at 60% 40%, #0a2214 0%, #061510 65%, #000 100%)',
    accent: '#66bb6a',
    wipe: 'radial',
    glyphs: ['⊗', '⊕', '◉', '⊙', '○'],
  },
  {
    id: 'fracture',
    title: 'Fracture',
    eyebrow: 'IV — Break',
    description:
      'Reality splinters at the seams. Each shard refracts a different frequency of truth.',
    gradient:
      'radial-gradient(ellipse 80% 90% at 30% 60%, #280a0a 0%, #1a0505 65%, #000 100%)',
    accent: '#ef5350',
    wipe: 'diagonal',
    glyphs: ['⟨', '⟩', '⌁', '⌀', '⌬'],
  },
  {
    id: 'transcendence',
    title: 'Transcendence',
    eyebrow: 'V — Beyond',
    description:
      'What remains when everything else is stripped away is pure signal — the final frequency.',
    gradient:
      'radial-gradient(ellipse 100% 80% at 50% 50%, #1a1200 0%, #0d0900 65%, #000 100%)',
    accent: '#ffd54f',
    wipe: 'ltr',
    glyphs: ['∞', '◌', '◍', '◎', '⊛'],
  },
]

// ─── Nav Dot (extracted to honour hook rules) ──────────────────────────────────
function NavDot({
  index,
  total,
  scrollYProgress,
}: {
  index: number
  total: number
  scrollYProgress: MotionValue<number>
}) {
  const start = index / total
  const end = (index + 1) / total
  const clampedStart = Math.max(0, start - 0.05)
  const clampedEnd = Math.min(1, end + 0.05)

  const dotOpacity = useTransform(
    scrollYProgress,
    [clampedStart, start, end, clampedEnd],
    [0.25, 1, 1, 0.25],
  )
  const dotScale = useTransform(
    scrollYProgress,
    [clampedStart, start, end, clampedEnd],
    [1, 1.5, 1.5, 1],
  )

  return (
    <motion.div
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#fff',
        opacity: dotOpacity,
        scale: dotScale,
      }}
    />
  )
}

// ─── Scene Navigator Dots ──────────────────────────────────────────────────────
function NavDots({ count }: { count: number }) {
  const { scrollYProgress } = useScroll()

  return (
    <div
      style={{
        position: 'fixed',
        right: '1.5rem',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        zIndex: 999,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <NavDot key={i} index={i} total={count} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  )
}

// ─── Scene Component ───────────────────────────────────────────────────────────
function Scene({ config, index }: { config: SceneConfig; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isFirst = index === 0

  // Wipe progress: 0 = scene top at viewport bottom, 1 = scene top at viewport top
  const { scrollYProgress: wipeProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start start'],
  })

  // Parallax progress: full scene travel through viewport
  const { scrollYProgress: parallaxProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Reveal progress: scene enters at 80% viewport to fully in at 10%
  const { scrollYProgress: revealProgress } = useScroll({
    target: ref,
    offset: ['start 80%', 'start 10%'],
  })

  // ── Clip-path transforms — all defined unconditionally (hooks rule) ──────────
  const clipLTR = useTransform(
    wipeProgress,
    [0.05, 0.95],
    ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
  )
  const clipRadial = useTransform(
    wipeProgress,
    [0.05, 0.95],
    ['circle(0% at 50% 50%)', 'circle(150% at 50% 50%)'],
  )
  const clipDiag = useTransform(
    wipeProgress,
    [0.05, 0.95],
    [
      'polygon(0 0, 0% 0, 0% 100%, 0 100%)',
      'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    ],
  )

  const clipPath: MotionValue<string> | undefined = isFirst
    ? undefined
    : config.wipe === 'radial'
    ? clipRadial
    : config.wipe === 'diagonal'
    ? clipDiag
    : clipLTR

  // ── Parallax ────────────────────────────────────────────────────────────────
  // Background ~0.2× speed: slow, subtle drift
  const bgY = useTransform(parallaxProgress, [0, 1], ['-8vh', '8vh'])
  // Foreground ~1.2× speed: faster movement creates depth
  const fgY = useTransform(parallaxProgress, [0, 1], ['-20vh', '20vh'])

  // ── Orchestrated content reveal ──────────────────────────────────────────────
  // No element animates before its scene enters the viewport
  const revealOpacity = useTransform(revealProgress, [0, 0.45], [0, 1])
  const revealY = useTransform(revealProgress, [0, 0.55], ['55px', '0px'])

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {/* Background layer — 0.2× parallax (extends beyond scene to cover drift) */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '-8vh',
          bottom: '-8vh',
          y: bgY,
          background: config.gradient,
          zIndex: 0,
        }}
      />

      {/* Clip-path wipe container — scene 1 has no clip */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath,
          zIndex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Gradient layer inside wipe so the full scene reveals together */}
        {!isFirst && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: config.gradient,
            }}
          />
        )}

        {/* Foreground layer — 1.2× parallax (extends to cover drift) */}
        <motion.div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '-20vh',
            bottom: '-20vh',
            y: fgY,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
            gap: '1.5rem',
          }}
        >
          {/* Eyebrow */}
          <motion.div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              opacity: isFirst ? 1 : revealOpacity,
              y: isFirst ? 0 : revealY,
            }}
          >
            <div
              style={{ width: 48, height: 1, background: config.accent, opacity: 0.7 }}
            />
            <span
              style={{
                fontSize: '0.68rem',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: config.accent,
                fontWeight: 600,
              }}
            >
              {config.eyebrow}
            </span>
            <div
              style={{ width: 48, height: 1, background: config.accent, opacity: 0.7 }}
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            style={{
              fontSize: 'clamp(3.5rem, 9vw, 7rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 0.95,
              color: '#fff',
              textShadow: `0 0 100px ${config.accent}50, 0 2px 8px rgba(0,0,0,0.6)`,
              opacity: isFirst ? 1 : revealOpacity,
              y: isFirst ? 0 : revealY,
            }}
          >
            {config.title}
          </motion.h1>

          {/* Description */}
          <motion.p
            style={{
              fontSize: 'clamp(0.85rem, 1.6vw, 1rem)',
              maxWidth: '38ch',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.8,
              fontStyle: 'italic',
              opacity: isFirst ? 1 : revealOpacity,
              y: isFirst ? 0 : revealY,
            }}
          >
            {config.description}
          </motion.p>

          {/* Vertical accent line */}
          <motion.div
            style={{
              width: 1,
              height: 72,
              background: `linear-gradient(to bottom, ${config.accent}80, transparent)`,
              opacity: isFirst ? 1 : revealOpacity,
            }}
          />
        </motion.div>
      </motion.div>

      {/* Decorative floating glyphs */}
      {config.glyphs.map((glyph, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: 'absolute',
            top: `${10 + i * 17}%`,
            left: `${6 + i * 19}%`,
            color: config.accent,
            opacity: 0.07,
            fontSize: `${1.1 + (i % 3) * 0.7}rem`,
            userSelect: 'none',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          {glyph}
        </div>
      ))}

      {/* Large index numeral watermark */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '-6%',
          right: '-1%',
          fontSize: 'clamp(10rem, 26vw, 20rem)',
          fontWeight: 900,
          lineHeight: 1,
          color: config.accent,
          opacity: 0.04,
          userSelect: 'none',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {index + 1}
      </div>

      {/* Bottom separator glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${config.accent}50 50%, transparent 100%)`,
          zIndex: 10,
        }}
      />
    </div>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ background: '#000' }}>
      <ProgressBar />
      <NavDots count={SCENES.length} />
      {SCENES.map((scene, index) => (
        <Scene key={scene.id} config={scene} index={index} />
      ))}
    </div>
  )
}
