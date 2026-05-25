import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame } from 'motion/react';

// Pseudo-random based on index
const random = (seed: number) => {
  const x = Math.sin(seed + 1.1) * 10000;
  return x - Math.floor(x);
};

export const ImmersivePortfolio: React.FC = () => {
  const text = "WORKS";
  const letters = text.split("");
  const [hasEntered, setHasEntered] = useState(false);
  const time = useMotionValue(0);

  // useAnimationFrame from motion/react provides (time, delta)
  useAnimationFrame((t) => {
    if (hasEntered) {
      time.set(t);
    }
  });

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#0a0a0a', 
      color: 'white', 
      overflow: 'hidden',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ display: 'flex', perspective: '1200px' }}>
        {letters.map((char, i) => (
          <AnimatedLetter 
            key={i} 
            char={char} 
            index={i} 
            isLast={i === letters.length - 1} 
            setHasEntered={setHasEntered} 
            time={time} 
            hasEntered={hasEntered} 
          />
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={hasEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        style={{ 
          marginTop: '4rem', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '2rem', 
          fontWeight: 300, 
          color: '#a0a0a0',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          Explore our latest projects
        </p>
        <button style={{ 
          padding: '1rem 2.5rem', 
          fontSize: '1rem', 
          cursor: 'pointer', 
          borderRadius: '50px', 
          border: 'none', 
          backgroundColor: '#fff', 
          color: '#000', 
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          transition: 'transform 0.2s',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          View All
        </button>
      </motion.div>
    </div>
  )
}

const AnimatedLetter = ({ 
  char, 
  index, 
  isLast, 
  setHasEntered, 
  time, 
  hasEntered 
}: { 
  char: string, 
  index: number, 
  isLast: boolean, 
  setHasEntered: (v: boolean) => void, 
  time: any, 
  hasEntered: boolean 
}) => {
  // Determine start direction deterministically based on index
  const isFromTop = random(index) > 0.5;
  const initialRotateX = isFromTop ? 90 : -90;
  
  const breathingY = useMotionValue(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hasEntered) return;
    
    const unsubscribe = time.on("change", (latestTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = latestTime;
      }
      const elapsed = latestTime - startTimeRef.current;
      
      const speed = 0.0015;
      const phase = index * 0.4; // offset per character
      
      // smoothly blend the oscillation in over 1.5 seconds to avoid jump
      const blend = Math.min(elapsed / 1500, 1);
      
      const y = Math.sin(latestTime * speed + phase) * 15 * blend;
      breathingY.set(y);
    });
    
    return () => unsubscribe();
  }, [hasEntered, index, time, breathingY]);

  return (
    <motion.span
      initial={{ opacity: 0, rotateX: initialRotateX, y: isFromTop ? -60 : 60, z: -100 }}
      animate={{ opacity: 1, rotateX: 0, y: 0, z: 0 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.04, 
        type: 'spring', 
        damping: 14, 
        stiffness: 100 
      }}
      onAnimationComplete={() => {
        if (isLast) {
          setHasEntered(true);
        }
      }}
      style={{
        display: 'inline-block',
        fontSize: 'clamp(4rem, 10vw, 10rem)', // responsive large font
        fontWeight: 900,
        // Only apply breathingY when it has entered to avoid conflicting with entrance animation
        y: hasEntered ? breathingY : undefined, 
        transformStyle: 'preserve-3d',
        transformOrigin: 'center center'
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  );
}
