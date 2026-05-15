import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'motion/react';

const scenes = [
  { id: 0, title: "The Awakening", bg: "#1a1a2e", fg: "#16213e", decor: "✧" },
  { id: 1, title: "Into the Unknown", bg: "#0f3460", fg: "#e94560", decor: "✦" },
  { id: 2, title: "Radial Core", bg: "#222831", fg: "#393e46", decor: "❂" },
  { id: 3, title: "Diagonal Shift", bg: "#2c3e50", fg: "#e74c3c", decor: "⬡" },
  { id: 4, title: "The Resolution", bg: "#111111", fg: "#f39c12", decor: "✺" },
];

function Scene({
  index,
  scrollYProgress,
}: {
  index: number;
  scrollYProgress: MotionValue<number>;
}) {
  const wipeStart = index * 0.25 - 0.1;
  const wipeEnd = index * 0.25;

  const clipPathMap = {
    0: useTransform(scrollYProgress, [0, 1], ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]),
    1: useTransform(
      scrollYProgress,
      [wipeStart, wipeEnd],
      ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"]
    ),
    2: useTransform(
      scrollYProgress,
      [wipeStart, wipeEnd],
      ["circle(0% at 50% 50%)", "circle(150% at 50% 50%)"]
    ),
    3: useTransform(
      scrollYProgress,
      [wipeStart, wipeEnd],
      ["circle(0% at 100% 0%)", "circle(150% at 100% 0%)"]
    ),
    4: useTransform(
      scrollYProgress,
      [wipeStart, wipeEnd],
      ["inset(0% 0% 0% 100%)", "inset(0% 0% 0% 0%)"]
    ),
  };

  const clipPath = clipPathMap[index as keyof typeof clipPathMap];

  const contentStart = wipeEnd;
  const contentEnd = wipeEnd + 0.05;

  const contentOpacity = useTransform(
    scrollYProgress,
    [index === 0 ? 0 : contentStart, index === 0 ? 0.05 : contentEnd],
    [0, 1]
  );
  
  const contentScale = useTransform(
    scrollYProgress,
    [index === 0 ? 0 : contentStart, index === 0 ? 0.05 : contentEnd],
    [0.8, 1]
  );

  const activeCenter = index * 0.25;
  
  // Parallax: background layers move at 0.2x scroll speed
  const bgYLocal = useTransform(
    scrollYProgress,
    [activeCenter - 0.25, activeCenter + 0.25],
    ["20vh", "-20vh"]
  );
  
  // Parallax: foreground layers move at 1.2x scroll speed
  const fgYLocal = useTransform(
    scrollYProgress,
    [activeCenter - 0.25, activeCenter + 0.25],
    ["120vh", "-120vh"]
  );

  const scene = scenes[index];

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        clipPath,
        zIndex: index,
        overflow: 'hidden',
        backgroundColor: scene.bg,
      }}
    >
      {/* Background Layer (0.2x) */}
      <motion.div
        style={{
          position: 'absolute',
          top: '-20vh',
          left: 0,
          width: '100%',
          height: '140vh',
          backgroundColor: scene.bg,
          y: bgYLocal,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.8,
          fontSize: '30rem',
          color: 'rgba(255,255,255,0.02)',
          userSelect: 'none',
        }}
      >
        {scene.decor}
      </motion.div>

      {/* Foreground Layer (1.2x) */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          y: fgYLocal,
          pointerEvents: 'none',
        }}
      >
        <motion.div
          style={{
            opacity: contentOpacity,
            scale: contentScale,
            textAlign: 'center',
            padding: '4rem',
            backgroundColor: scene.fg,
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            pointerEvents: 'auto',
          }}
        >
          <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', color: '#ffffff', letterSpacing: '-0.05em' }}>
            {scene.title}
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', maxWidth: '500px', lineHeight: 1.6 }}>
            Scene {index + 1} of 5. As you scroll, this foreground element moves at 1.2x speed, while the background moves at 0.2x.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} style={{ height: '500vh', position: 'relative', backgroundColor: '#000' }}>
      {/* Fixed Progress Bar */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          backgroundColor: '#ffffff',
          transformOrigin: '0%',
          scaleX,
          zIndex: 100,
          boxShadow: '0 0 10px rgba(255,255,255,0.5)'
        }}
      />

      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        {scenes.map((_, index) => (
          <Scene key={index} index={index} scrollYProgress={scrollYProgress} />
        ))}
      </div>
    </div>
  );
}