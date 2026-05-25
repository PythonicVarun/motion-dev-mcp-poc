import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame, useSpring, useTransform, AnimatePresence, useScroll, animate } from 'motion/react';

const MotionFeTurbulence = motion.create("feTurbulence");
const MotionFeDisplacementMap = motion.create("feDisplacementMap");

// Pseudo-random based on index
const random = (seed: number) => {
  const x = Math.sin(seed + 1.1) * 10000;
  return x - Math.floor(x);
};

const projectsData = [
  { id: '1', title: 'Quantum Shift', category: 'Web App', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop', description: 'A revolutionary approach to distributed computing interface design. Bridging the gap between classical systems and future paradigms.', tags: ['React', 'WebGL'] },
  { id: '2', title: 'Nebula', category: 'Mobile App', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop', description: 'Explore the universe from the palm of your hand. A deeply immersive mobile experience built with performance in mind.', tags: ['React Native', 'Three.js'] },
  { id: '3', title: 'Echo', category: 'Audio Visualizer', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop', description: 'See your music in real-time with stunning visuals. Procedurally generated particles driven by raw frequency data.', tags: ['WebAudio API', 'Canvas'] },
  { id: '4', title: 'Flow State', category: 'Productivity', image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&auto=format&fit=crop', description: 'Maintain your focus with this minimal task manager. Eliminates distractions and emphasizes deep work.', tags: ['TypeScript', 'Tailwind'] },
  { id: '5', title: 'Aura', category: 'Branding', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop', description: 'A complete identity overhaul for a next-gen wellness company. Incorporating liquid aesthetics and calm tones.', tags: ['Figma', 'Illustrator'] },
  { id: '6', title: 'Nexus', category: 'Platform', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop', description: 'Connecting creators with their true audience. A decentralized platform built on cutting-edge web technologies.', tags: ['Next.js', 'Node.js'] },
];

export const ImmersivePortfolio: React.FC = () => {
  const text = "WORKS";
  const letters = text.split("");
  const [hasEntered, setHasEntered] = useState(false);
  const time = useMotionValue(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: 'white', overflowX: 'hidden', fontFamily: 'sans-serif' }}>
      
      {/* Hero Section */}
      <motion.div 
        layout
        animate={{ height: selectedId ? '40vh' : '100vh' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          position: 'relative',
          overflow: 'hidden'
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
      </motion.div>

      {/* Grid Section */}
      <motion.div layout style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '2rem' 
        }}>
          {projectsData.map(project => {
            const isAnotherSelected = selectedId !== null && selectedId !== project.id;
            
            return (
              <motion.div
                key={project.id}
                layoutId={`card-${project.id}`}
                onClick={() => setSelectedId(project.id)}
                animate={{
                  scale: isAnotherSelected ? 0.9 : 1,
                  filter: isAnotherSelected ? 'blur(8px)' : 'blur(0px)',
                  opacity: isAnotherSelected ? 0.4 : 1
                }}
                transition={{ duration: 0.4 }}
                style={{ 
                  cursor: 'pointer', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  backgroundColor: '#1a1a1a', 
                  display: 'flex', 
                  flexDirection: 'column' 
                }}
              >
                <motion.img 
                  layoutId={`image-${project.id}`} 
                  src={project.image} 
                  alt={project.title} 
                  style={{ width: '100%', height: '250px', objectFit: 'cover' }} 
                />
                <div style={{ padding: '1.5rem' }}>
                  <motion.h3 
                    layoutId={`title-${project.id}`} 
                    style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}
                  >
                    {project.title}
                  </motion.h3>
                  <motion.p 
                    layoutId={`category-${project.id}`} 
                    style={{ margin: 0, color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}
                  >
                    {project.category}
                  </motion.p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            key="overlay"
            style={{ 
              position: 'fixed', 
              inset: 0, 
              zIndex: 50, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '2rem', 
              pointerEvents: 'none' 
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              style={{ 
                position: 'absolute', 
                inset: 0, 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                pointerEvents: 'auto' 
              }}
            />
            <FullscreenCardContent 
              project={projectsData.find(p => p.id === selectedId)!} 
              onClose={() => setSelectedId(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ProcessSection />
      <ClientsCarousel />
    </div>
  )
}

const FullscreenCardContent = ({ project, onClose }: { project: any, onClose: () => void }) => {
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  
  return (
    <motion.div
      layoutId={`card-${project.id}`}
      onLayoutAnimationComplete={() => setIsLayoutReady(true)}
      style={{ 
        width: '100%', 
        maxWidth: '900px', 
        backgroundColor: '#1a1a1a', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        pointerEvents: 'auto', 
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
    >
      <motion.img 
        layoutId={`image-${project.id}`} 
        src={project.image} 
        alt={project.title} 
        style={{ width: '100%', height: '400px', objectFit: 'cover' }} 
      />
      <div style={{ padding: '3rem' }}>
        <motion.h3 
          layoutId={`title-${project.id}`} 
          style={{ margin: '0 0 0.5rem 0', fontSize: '3rem' }}
        >
          {project.title}
        </motion.h3>
        <motion.p 
          layoutId={`category-${project.id}`} 
          style={{ margin: '0 0 2rem 0', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1rem' }}
        >
          {project.category}
        </motion.p>
        
        <AnimatePresence initial={false}>
          {isLayoutReady && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <p style={{ fontSize: '1.2rem', lineHeight: 1.6, color: '#d0d0d0', marginBottom: '2rem' }}>
                {project.description}
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {project.tags.map((tag: string) => (
                  <span key={tag} style={{ padding: '0.5rem 1rem', backgroundColor: '#333', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 600 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence initial={false}>
        {isLayoutReady && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onClose}
            style={{ 
              position: 'absolute', 
              top: '1.5rem', 
              right: '1.5rem', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              color: 'white', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '1.2rem',
              backdropFilter: 'blur(4px)'
            }}
          >
            ✕
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
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

const ProcessSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const clipPath = useTransform(
    scrollYProgress, 
    [0, 0.2], 
    ["polygon(0% 0%, 0% 0%, -20% 100%, 0% 100%)", "polygon(0% 0%, 120% 0%, 100% 100%, 0% 100%)"]
  );

  const pathOffset = useTransform(scrollYProgress, [0.2, 0.8], [1, 0]);

  const steps = [
    { title: "Discovery", desc: "Unearthing the core problems.", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop" },
    { title: "Strategy", desc: "Defining the trajectory.", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop" },
    { title: "Design", desc: "Crafting the visual language.", img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop" },
    { title: "Development", desc: "Building the robust architecture.", img: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&auto=format&fit=crop" },
    { title: "Deployment", desc: "Launching into the universe.", img: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop" }
  ];

  return (
    <motion.div 
      ref={containerRef}
      style={{
        height: '400vh',
        position: 'relative',
        clipPath,
        backgroundColor: '#050505',
        overflow: 'hidden',
        marginTop: '10vh'
      }}
    >
      <div style={{ position: 'absolute', left: '15%', top: '15%', bottom: '15%', width: '4px', transform: 'translateX(-50%)', zIndex: 10 }}>
         <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
           <line 
             x1="50%" y1="0%" x2="50%" y2="100%" 
             stroke="rgba(255,255,255,0.2)" 
             strokeWidth="2"
           />
           <motion.line 
             x1="50%" y1="0%" x2="50%" y2="100%" 
             stroke="#fff" 
             strokeWidth="4"
             pathLength={1}
             strokeDasharray="1"
             style={{
               strokeDashoffset: pathOffset
             }}
           />
         </svg>
      </div>

      {steps.map((step, i) => {
        const stepP = 0.2 + (i * 0.6 / 4); 
        
        const nodeScale = useTransform(scrollYProgress, [stepP - 0.02, stepP, stepP + 0.02], [1, 2, 1]);
        const nodeGlow = useTransform(scrollYProgress, [stepP - 0.02, stepP, stepP + 0.02], [0, 1, 0]);
        const boxShadow = useTransform(nodeGlow, (v) => `0 0 ${v * 30}px ${v * 15}px rgba(255,255,255,0.8)`);

        const bgY = useTransform(scrollYProgress, (v) => `${(v - stepP) * 350}vh`);
        const midY = useTransform(scrollYProgress, (v) => `${(v - stepP) * 150}vh`);
        const fgY = useTransform(scrollYProgress, (v) => `${(v - stepP) * -75}vh`);

        return (
          <React.Fragment key={i}>
            <motion.div style={{
              position: 'absolute',
              left: '15%',
              top: `${stepP * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              scale: nodeScale,
              boxShadow,
              zIndex: 20
            }} />

            <div style={{
              position: 'absolute',
              top: `${stepP * 100}%`,
              left: '25%',
              right: '10%',
              height: '60vh',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              borderRadius: '24px',
              backgroundColor: '#111'
            }}>
              <motion.div style={{
                position: 'absolute',
                inset: "-1000px", 
                backgroundImage: `url(${step.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.3,
                y: bgY
              }} />
              
              <motion.div style={{
                position: 'absolute',
                y: midY,
                fontSize: '15rem',
                fontWeight: 900,
                color: 'rgba(255,255,255,0.05)',
                zIndex: 5,
                userSelect: 'none'
              }}>
                0{i+1}
              </motion.div>

              <motion.div style={{
                position: 'relative',
                y: fgY,
                zIndex: 10,
                textAlign: 'center',
                padding: '2rem'
              }}>
                <h2 style={{ fontSize: '4rem', margin: '0 0 1rem 0', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>{step.title}</h2>
                <p style={{ fontSize: '1.5rem', color: '#ccc', margin: 0 }}>{step.desc}</p>
              </motion.div>
            </div>
          </React.Fragment>
        )
      })}
    </motion.div>
  )
}

const itemWidth = 300 + 40; // 300px card + 40px gap
const totalWidth = itemWidth * 10;

const ClientsCarousel = () => {
  const x = useMotionValue(0);
  const isDragging = useRef(false);
  const pointerHistory = useRef<{time: number, x: number}[]>([]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    pointerHistory.current = [{ time: performance.now(), x: e.clientX }];
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const currentX = e.clientX;
    const last = pointerHistory.current[pointerHistory.current.length - 1];
    const delta = currentX - last.x;
    x.set(x.get() + delta);
    
    pointerHistory.current.push({ time: performance.now(), x: currentX });
    if (pointerHistory.current.length > 5) {
      pointerHistory.current.shift();
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    let v = 0;
    if (pointerHistory.current.length >= 2) {
      const first = pointerHistory.current[0];
      const last = pointerHistory.current[pointerHistory.current.length - 1];
      const dt = performance.now() - first.time;
      if (dt > 0) {
        v = ((last.x - first.x) / dt) * 16.66;
      }
    }
    
    const decay = () => {
      if (isDragging.current) return;
      if (Math.abs(v) >= 0.5) {
        x.set(x.get() + v);
        v *= 0.95;
        requestAnimationFrame(decay);
      } else {
        const currentX = x.get();
        const remainder = currentX % itemWidth;
        let snapX = currentX - remainder;
        if (remainder > itemWidth / 2) snapX += itemWidth;
        else if (remainder < -itemWidth / 2) snapX -= itemWidth;
        
        animate(x, snapX, { type: 'spring', stiffness: 300, damping: 30 });
      }
    };
    
    requestAnimationFrame(decay);
  };

  return (
    <div style={{ padding: '10vh 0', backgroundColor: '#050505', overflow: 'hidden' }}>
      <h2 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '4rem', color: '#fff' }}>Our Clients</h2>
      <div 
        style={{ 
          position: 'relative', 
          height: '250px', 
          width: '100%', 
          touchAction: 'pan-y', 
          perspective: '1200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <ClientCard key={i} index={i} x={x} />
        ))}
      </div>
    </div>
  );
}

const ClientCard = ({ index, x }: { index: number, x: any }) => {
  const basePosition = index * itemWidth;
  
  const distance = useTransform(x, (currentX: number) => {
    const globalPos = currentX + basePosition;
    const halfTotal = totalWidth / 2;
    let wrappedOffset = globalPos % totalWidth;
    if (wrappedOffset > halfTotal) wrappedOffset -= totalWidth;
    if (wrappedOffset < -halfTotal) wrappedOffset += totalWidth;
    return wrappedOffset;
  });

  const scale = useTransform(distance, [-itemWidth * 1.5, 0, itemWidth * 1.5], [0.8, 1.2, 0.8], { clamp: true });
  const opacity = useTransform(distance, [-itemWidth * 2, 0, itemWidth * 2], [0, 1, 0], { clamp: true });
  const rotateY = useTransform(distance, [-itemWidth, 0, itemWidth], [15, 0, -15], { clamp: true });
  
  return (
    <motion.div 
      style={{ 
        position: 'absolute', 
        x: distance, 
        scale, 
        opacity, 
        rotateY,
        width: 300,
        height: 180,
        backgroundColor: '#1a1a1a',
        borderRadius: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transformStyle: 'preserve-3d',
        left: '50%',
        marginLeft: -150, 
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
        userSelect: 'none',
        pointerEvents: 'none'
      }}
    >
      <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#555' }}>LOGO {index + 1}</span>
    </motion.div>
  )
}
