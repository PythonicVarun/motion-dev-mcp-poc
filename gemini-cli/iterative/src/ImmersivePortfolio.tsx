import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame, useSpring, useTransform } from 'motion/react';

const MotionFeTurbulence = motion.create("feTurbulence");
const MotionFeDisplacementMap = motion.create("feDisplacementMap");

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

  const baseFreqX = useMotionValue(0.02);
  const displacementScale = useMotionValue(0);

  const springConfig = { stiffness: 60, damping: 20 };
  const smoothBaseFreqX = useSpring(baseFreqX, springConfig);
  const smoothScale = useSpring(displacementScale, springConfig);

  const baseFrequencyString = useTransform(smoothBaseFreqX, (v) => `${v} 0.02`);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width;
    const y = (clientY - top) / height;

    baseFreqX.set(0.01 + x * 0.07);
    displacementScale.set(y * 40);
  };

  const handleMouseLeave = () => {
    baseFreqX.set(0.02);
    displacementScale.set(0);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        backgroundColor: '#0a0a0a', 
        color: 'white', 
        overflow: 'hidden',
        fontFamily: 'sans-serif',
        position: 'relative'
      }}
    >
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="liquid">
          <MotionFeTurbulence 
            type="fractalNoise" 
            baseFrequency={baseFrequencyString} 
            numOctaves={3} 
            result="noise" 
          />
          <MotionFeDisplacementMap 
            in="SourceGraphic" 
            in2="noise" 
            scale={smoothScale} 
            xChannelSelector="R" 
            yChannelSelector="G" 
          />
        </filter>
      </svg>
      
      {/* Background Image with Filter */}
      <motion.div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        filter: 'url(#liquid)',
        backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.5
      }} />

      <div style={{ display: 'flex', perspective: '1200px', zIndex: 1 }}>
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
          alignItems: 'center',
          zIndex: 1
        }}
      >
        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '2rem', 
          fontWeight: 300, 
          color: '#e0e0e0',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
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
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
        }}
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
      const phase = index * 0.4;
      
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
        fontSize: 'clamp(4rem, 10vw, 10rem)',
        fontWeight: 900,
        y: hasEntered ? breathingY : undefined, 
        transformStyle: 'preserve-3d',
        transformOrigin: 'center center',
        textShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  );
}
