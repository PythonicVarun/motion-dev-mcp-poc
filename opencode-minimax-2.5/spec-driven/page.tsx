'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, type MotionValue } from 'motion/react'

const scenes = [
  {
    id: 1,
    title: 'The Awakening',
    subtitle: 'Where it all begins',
    color: '#0a0a0f',
    accent: '#ff6b35',
    description: 'In the depths of silence, a spark ignites. The first light pierces through the void, awakening dormant possibilities.',
  },
  {
    id: 2,
    title: 'The Journey',
    subtitle: 'Into the unknown',
    color: '#0f1923',
    accent: '#00d4aa',
    description: 'We venture forth into uncharted waters, each step revealing new horizons and hidden truths waiting to be discovered.',
  },
  {
    id: 3,
    title: 'The Challenge',
    subtitle: 'Facing the storm',
    color: '#1a0a1a',
    accent: '#ff3366',
    description: 'The path grows treacherous. Storms rage, but within adversity lies the forge that shapes our true strength.',
  },
  {
    id: 4,
    title: 'The Revelation',
    subtitle: 'Truth unveiled',
    color: '#0a1628',
    accent: '#7b68ee',
    description: 'Layers peel away to reveal the essence beneath. What was hidden now stands illuminated in crystal clarity.',
  },
  {
    id: 5,
    title: 'The Ascending',
    subtitle: 'Beyond the horizon',
    color: '#051015',
    accent: '#ffd700',
    description: 'We transcend the familiar, soaring toward distant dreams. The journey culminates in a new beginning.',
  },
]

const clipPathTransitions = [
  'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
  'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)',
  'polygon(100% 0%, 100% 100%, 0% 100%, 0% 0%)',
  'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
]

const exitClipPaths = [
  'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
  'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
  'polygon(100% 100%, 0% 100%, 0% 0%, 100% 0%)',
  'polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)',
  'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)',
]

function Scene({
  scene,
  index,
  scrollProgress,
}: {
  scene: (typeof scenes)[0]
  index: number
  scrollProgress: MotionValue<number>
}) {
  const sceneRef = useRef<HTMLDivElement>(null)
  
  const sceneStart = index / scenes.length
  const sceneEnd = (index + 1) / scenes.length
  
  const isPast = useTransform(scrollProgress, [sceneEnd, sceneEnd + 0.01], [false, true], { clamp: true })
  
  const progressInScene = useTransform(
    scrollProgress,
    [sceneStart, sceneStart + 0.1, sceneEnd - 0.1, sceneEnd],
    [0, 1, 1, 0]
  )
  
  const enterProgress = useTransform(
    scrollProgress,
    [sceneStart, sceneStart + 0.15],
    [0, 1]
  )
  
  const exitProgress = useTransform(
    scrollProgress,
    [sceneEnd - 0.15, sceneEnd],
    [1, 0]
  )
  
  const combinedProgress = useTransform(() => {
    const enter = enterProgress.get()
    const exit = exitProgress.get()
    return isPast ? exit : enter
  })

  const backgroundY = useTransform(scrollProgress, [0, 1], ['0%', '20%'])
  const foregroundY = useTransform(scrollProgress, [0, 1], ['0%', '-120%'])

  const clipPath = useTransform(
    combinedProgress,
    [0, 0.3, 0.7, 1],
    isPast 
      ? [exitClipPaths[index], exitClipPaths[index], clipPathTransitions[index], exitClipPaths[index]]
      : [exitClipPaths[index], clipPathTransitions[index], clipPathTransitions[index], exitClipPaths[index]]
  )

  const opacity = useTransform(combinedProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(combinedProgress, [0, 0.2], [0.8, 1])
  const rotate = useTransform(combinedProgress, [0, 1], [-5, 0])
  
  const titleY = useTransform(combinedProgress, [0, 1], [50, 0])
  const descY = useTransform(combinedProgress, [0, 1], [80, 0])

  return (
    <motion.div
      ref={sceneRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: scene.color,
        clipPath,
        opacity,
        zIndex: scenes.length - index,
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 30% 70%, ${scene.accent}15 0%, transparent 50%),
                       radial-gradient(circle at 70% 30%, ${scene.accent}10 0%, transparent 40%)`,
          y: backgroundY,
          scale: 1.2,
        }}
      />

      <motion.div
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '80%',
          maxWidth: '800px',
          y: foregroundY,
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '0',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: `${scene.accent}20`,
            filter: 'blur(60px)',
          }}
        />

        <motion.div
          style={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          <motion.div
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 900,
              color: '#fff',
              marginBottom: '0.5rem',
              y: titleY,
              textShadow: `0 0 60px ${scene.accent}50`,
            }}
          >
            {scene.title}
          </motion.div>
          
          <motion.div
            style={{
              fontSize: 'clamp(1rem, 3vw, 1.5rem)',
              color: scene.accent,
              marginBottom: '2rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              opacity: combinedProgress,
            }}
          >
            {scene.subtitle}
          </motion.div>

          <motion.div
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.8,
              maxWidth: '600px',
              y: descY,
            }}
          >
            {scene.description}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          fontSize: '15vw',
          fontWeight: 900,
          color: `${scene.accent}10`,
          y: foregroundY,
          scale: 1.5,
        }}
      >
        {String(scene.id).padStart(2, '0')}
      </motion.div>
    </motion.div>
  )
}

function ProgressBar({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const springProgress = useSpring(scrollProgress, {
    stiffness: 300,
    damping: 30,
    mass: 1,
  })

  const progressWidth = useTransform(springProgress, [0, 1], ['0%', '100%'])
  
  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'rgba(255,255,255,0.1)',
        zIndex: 1000,
      }}
    >
      <motion.div
        style={{
          height: '100%',
          width: progressWidth,
          background: 'linear-gradient(90deg, #ff6b35, #00d4aa, #ff3366, #7b68ee, #ffd700)',
          borderRadius: '2px',
        }}
      />
    </motion.div>
  )
}

function SceneIndicator({ 
  scrollProgress,
  scenesLength 
}: { 
  scrollProgress: MotionValue<number>
  scenesLength: number 
}) {
  const currentScene = useTransform(
    scrollProgress,
    [0, 1],
    [0, scenesLength - 1]
  )

  const springScene = useSpring(currentScene, {
    stiffness: 200,
    damping: 25,
  })

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: '50%',
        right: '30px',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 1000,
      }}
    >
      {scenes.map((scene, i) => (
        <motion.div
          key={scene.id}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            position: 'relative',
          }}
        >
          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: useTransform(springScene, [i - 1, i, i + 1], ['0%', '100%', '0%']),
              height: useTransform(springScene, [i - 1, i, i + 1], ['0%', '100%', '0%']),
              background: scene.accent,
              borderRadius: '50%',
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default function CinematicTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const height = useTransform(scrollYProgress, () => scenes.length * 100)

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <ProgressBar scrollProgress={scrollYProgress} />
      <SceneIndicator scrollProgress={scrollYProgress} scenesLength={scenes.length} />
      
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          height: '500vh',
        }}
      >
        <motion.div
          style={{
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
          }}
        >
          {scenes.map((scene, index) => (
            <Scene
              key={scene.id}
              scene={scene}
              index={index}
              scrollProgress={scrollYProgress}
            />
          ))}
        </motion.div>
      </div>

      <motion.div
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.875rem',
          letterSpacing: '0.2em',
          zIndex: 1000,
        }}
      >
        SCROLL TO EXPLORE
      </motion.div>
    </div>
  )
}