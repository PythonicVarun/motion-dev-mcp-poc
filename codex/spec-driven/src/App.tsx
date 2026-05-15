import type { CSSProperties } from 'react'
import { useRef } from 'react'
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import './App.css'

type ClipMode =
  | 'left-to-right'
  | 'radial'
  | 'diagonal-forward'
  | 'diagonal-reverse'

type Scene = {
  id: string
  index: string
  eyebrow: string
  title: string
  description: string
  caption: string
  metrics: Array<{ value: string; label: string }>
  clipMode: ClipMode
  palette: {
    surface: string
    surfaceStrong: string
    accent: string
    accentSoft: string
    glow: string
  }
  alignment: 'left' | 'right'
}

const scenes: Scene[] = [
  {
    id: 'scene-01',
    index: '01',
    eyebrow: 'Opening Frame',
    title: 'Dawn hangs over a city still learning its own rhythm.',
    description:
      'The first scene reveals itself with a measured left-to-right wipe. Every line, stat, and atmosphere layer is pinned to scene-local scroll, so nothing moves until the frame actually arrives.',
    caption: 'Scroll-guided reveal, anchored to viewport entry.',
    metrics: [
      { value: '0.20x', label: 'background drift' },
      { value: '1.20x', label: 'foreground drift' },
      { value: '01 / 05', label: 'timeline beat' },
    ],
    clipMode: 'left-to-right',
    alignment: 'left',
    palette: {
      surface: '#142126',
      surfaceStrong: '#1d3137',
      accent: '#f6c85f',
      accentSoft: 'rgba(246, 200, 95, 0.18)',
      glow: 'rgba(246, 200, 95, 0.32)',
    },
  },
  {
    id: 'scene-02',
    index: '02',
    eyebrow: 'Expansion',
    title: 'Signals widen into a radial pulse that lights the horizon.',
    description:
      'The second panel grows from the center outward. Soft orbital layers travel on the slow parallax rail while foreground marks overtake the scene at a much faster cadence.',
    caption: 'Radial transition with layered depth and restrained pacing.',
    metrics: [
      { value: '360deg', label: 'orbital sweep' },
      { value: '62%', label: 'viewport fill' },
      { value: '2.4s', label: 'felt cadence' },
    ],
    clipMode: 'radial',
    alignment: 'right',
    palette: {
      surface: '#1d162a',
      surfaceStrong: '#2a223b',
      accent: '#ff8a65',
      accentSoft: 'rgba(255, 138, 101, 0.18)',
      glow: 'rgba(255, 138, 101, 0.28)',
    },
  },
  {
    id: 'scene-03',
    index: '03',
    eyebrow: 'Crossfade',
    title: 'A diagonal cut drags the eye across the frame like a hard edit.',
    description:
      'This beat leans on angular clip geometry and a denser foreground ribbon. The content stack lands in sequence, but only after the scene crosses into the viewport and the gate opens.',
    caption: 'Diagonal-forward wipe with delayed content orchestration.',
    metrics: [
      { value: '18vw', label: 'content stagger span' },
      { value: '74vh', label: 'sticky frame height' },
      { value: '03 / 05', label: 'timeline beat' },
    ],
    clipMode: 'diagonal-forward',
    alignment: 'left',
    palette: {
      surface: '#0d1a2a',
      surfaceStrong: '#17293e',
      accent: '#8fd6ff',
      accentSoft: 'rgba(143, 214, 255, 0.18)',
      glow: 'rgba(143, 214, 255, 0.26)',
    },
  },
  {
    id: 'scene-04',
    index: '04',
    eyebrow: 'Echo',
    title: 'The next transition answers with a mirrored diagonal retreat.',
    description:
      'Scroll progress now pulls highlights from the opposite edge. Background motion remains calm and distant while the foreground plane snaps forward with deliberate urgency.',
    caption: 'Mirrored wipe direction to keep the visual rhythm alternating.',
    metrics: [
      { value: '4', label: 'overlay planes' },
      { value: '88%', label: 'panel reveal' },
      { value: '1.2x', label: 'foreground speed' },
    ],
    clipMode: 'diagonal-reverse',
    alignment: 'right',
    palette: {
      surface: '#1f2020',
      surfaceStrong: '#2b2c2c',
      accent: '#b5f07a',
      accentSoft: 'rgba(181, 240, 122, 0.18)',
      glow: 'rgba(181, 240, 122, 0.24)',
    },
  },
  {
    id: 'scene-05',
    index: '05',
    eyebrow: 'Finale',
    title: 'The timeline resolves into a full-width reveal and a steady horizon.',
    description:
      'The closing scene reuses the lateral wipe, but with the highest contrast and the clearest typography. By the time the final caption settles, the global progress bar has completed its spring-eased travel.',
    caption: 'A controlled finish for the last scene of the sequence.',
    metrics: [
      { value: '100%', label: 'scroll completion' },
      { value: '05 / 05', label: 'timeline beat' },
      { value: 'spring', label: 'progress easing' },
    ],
    clipMode: 'left-to-right',
    alignment: 'left',
    palette: {
      surface: '#231410',
      surfaceStrong: '#331d17',
      accent: '#ffd39a',
      accentSoft: 'rgba(255, 211, 154, 0.2)',
      glow: 'rgba(255, 211, 154, 0.26)',
    },
  },
]

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function rangeProgress(value: number, start: number, end: number) {
  if (end <= start) {
    return value >= end ? 1 : 0
  }

  return clamp01((value - start) / (end - start))
}

function mix(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

function eased(progress: number) {
  const value = clamp01(progress)
  return 1 - (1 - value) * (1 - value)
}

function clipPathFor(mode: ClipMode, progress: number) {
  const reveal = eased(progress)

  switch (mode) {
    case 'left-to-right':
      return `inset(0 ${100 - reveal * 100}% 0 0 round 2rem)`
    case 'radial':
      return `circle(${mix(8, 120, reveal)}% at 50% 50%)`
    case 'diagonal-forward': {
      const lead = mix(0, 130, reveal)
      return `polygon(0 0, ${lead}% 0, ${lead - 30}% 100%, 0 100%)`
    }
    case 'diagonal-reverse': {
      const lead = mix(100, -30, reveal)
      return `polygon(${lead}% 0, 100% 0, 100% 100%, ${lead + 30}% 100%)`
    }
  }
}

function useMetricWindow(progress: MotionValue<number>, index: number) {
  return useTransform(progress, (value) => rangeProgress(value, 0.24 + index * 0.11, 0.56 + index * 0.11))
}

function MetricCard({
  metric,
  index,
  progress,
}: {
  metric: Scene['metrics'][number]
  index: number
  progress: MotionValue<number>
}) {
  const cardProgress = useMetricWindow(progress, index)
  const opacity = useTransform(cardProgress, [0, 1], [0, 1])
  const y = useTransform(cardProgress, [0, 1], [54, 0])
  const scale = useTransform(cardProgress, [0, 1], [0.9, 1])

  return (
    <motion.li className="scene__metric" style={{ opacity, y, scale }}>
      <span className="scene__metric-value">{metric.value}</span>
      <span className="scene__metric-label">{metric.label}</span>
    </motion.li>
  )
}

function ScenePanel({ scene }: { scene: Scene }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const revealProgress = useTransform(scrollYProgress, (value) =>
    rangeProgress(value, 0.08, 0.34),
  )
  const contentProgress = useTransform(scrollYProgress, (value) =>
    rangeProgress(value, 0.16, 0.68),
  )
  const shadeProgress = useTransform(scrollYProgress, (value) =>
    rangeProgress(value, 0.42, 1),
  )

  const clipPath = useTransform(revealProgress, (value) =>
    clipPathFor(scene.clipMode, value),
  )
  const panelOpacity = useTransform(revealProgress, [0, 1], [0.45, 1])

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['10vh', '-10vh'])
  const foregroundY = useTransform(scrollYProgress, [0, 1], ['60vh', '-60vh'])
  const foregroundX = useTransform(scrollYProgress, [0, 1], ['-6vw', '6vw'])
  const gridRotate = useTransform(scrollYProgress, [0, 1], ['-6deg', '6deg'])

  const eyebrowOpacity = useTransform(contentProgress, [0, 1], [0, 1])
  const eyebrowY = useTransform(contentProgress, [0, 1], [36, 0])

  const titleProgress = useTransform(contentProgress, (value) =>
    rangeProgress(value, 0.08, 0.64),
  )
  const titleOpacity = useTransform(titleProgress, [0, 1], [0, 1])
  const titleY = useTransform(titleProgress, [0, 1], [52, 0])

  const copyProgress = useTransform(contentProgress, (value) =>
    rangeProgress(value, 0.18, 0.76),
  )
  const copyOpacity = useTransform(copyProgress, [0, 1], [0, 1])
  const copyY = useTransform(copyProgress, [0, 1], [48, 0])

  const metaProgress = useTransform(contentProgress, (value) =>
    rangeProgress(value, 0.34, 0.94),
  )
  const metaOpacity = useTransform(metaProgress, [0, 1], [0, 1])
  const metaY = useTransform(metaProgress, [0, 1], [38, 0])

  const panelShade = useTransform(
    shadeProgress,
    [0, 1],
    ['rgba(4, 6, 8, 0.08)', 'rgba(4, 6, 8, 0.26)'],
  )

  const style = {
    '--scene-surface': scene.palette.surface,
    '--scene-surface-strong': scene.palette.surfaceStrong,
    '--scene-accent': scene.palette.accent,
    '--scene-accent-soft': scene.palette.accentSoft,
    '--scene-glow': scene.palette.glow,
  } as CSSProperties

  return (
    <section
      ref={ref}
      className={`scene scene--${scene.alignment}`}
      style={style}
      aria-label={`${scene.index}. ${scene.eyebrow}`}
    >
      <div className="scene__sticky">
        <motion.div
          className="scene__frame"
          style={{ clipPath, opacity: panelOpacity }}
        >
          <motion.div className="scene__backdrop scene__backdrop--a" style={{ y: backgroundY }} />
          <motion.div className="scene__backdrop scene__backdrop--b" style={{ y: backgroundY, rotate: gridRotate }} />
          <motion.div
            className="scene__foreground scene__foreground--a"
            style={{ x: foregroundX, y: foregroundY }}
          />
          <motion.div
            className="scene__foreground scene__foreground--b"
            style={{ x: foregroundX, y: foregroundY }}
          />
          <motion.div className="scene__shade" style={{ background: panelShade }} />

          <div className="scene__content">
            <motion.div className="scene__header" style={{ opacity: eyebrowOpacity, y: eyebrowY }}>
              <span className="scene__index">{scene.index}</span>
              <span className="scene__eyebrow">{scene.eyebrow}</span>
            </motion.div>

            <motion.h2 className="scene__title" style={{ opacity: titleOpacity, y: titleY }}>
              {scene.title}
            </motion.h2>

            <motion.p className="scene__description" style={{ opacity: copyOpacity, y: copyY }}>
              {scene.description}
            </motion.p>

            <motion.div className="scene__meta" style={{ opacity: metaOpacity, y: metaY }}>
              <p className="scene__caption">{scene.caption}</p>
              <ul className="scene__metrics">
                {scene.metrics.map((metric, index) => (
                  <MetricCard
                    key={`${scene.id}-${metric.label}`}
                    metric={metric}
                    index={index}
                    progress={contentProgress}
                  />
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function App() {
  const { scrollYProgress } = useScroll()
  const progressScaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    mass: 0.18,
  })

  return (
    <div className="app-shell">
      <header className="progress-shell" aria-label="Timeline progress">
        <div className="progress-shell__track">
          <motion.div
            className="progress-shell__indicator"
            style={{ scaleX: progressScaleX }}
          />
        </div>
        <div className="progress-shell__labels">
          <span>Scroll-driven cinematic timeline</span>
          <span>Motion.dev + React</span>
        </div>
      </header>

      <main className="timeline">
        {scenes.map((scene) => (
          <ScenePanel key={scene.id} scene={scene} />
        ))}
      </main>
    </div>
  )
}

export default App
