import { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'motion/react';

const menuItems = [
  { label: 'INDEX', href: '#' },
  { label: 'PROJECTS', href: '#' },
  { label: 'ABOUT', href: '#' },
  { label: 'CONTACT', href: '#' },
  { label: 'ARCHIVE', href: '#' },
];

const COLORS = {
  closed: '#0a0a0a',
  open: '#1a1a2e',
};

function CursorFollower() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = {
    stiffness: 150,
    damping: 15,
    mass: 0.5,
  };

  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 10);
      cursorY.set(e.clientY - 10);
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: cursorXSpring,
        top: cursorYSpring,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'difference',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5 }}
    />
  );
}

function MenuItem({ 
  item, 
  index, 
  isOpen, 
  onHover 
}: { 
  item: { label: string; href: string };
  index: number;
  isOpen: boolean;
  onHover: (label: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    hidden: {
      opacity: 0,
      rotateX: 90,
      y: 80,
      filter: 'blur(10px)',
    },
    visible: {
      opacity: 1,
      rotateX: 0,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      rotateX: -90,
      y: -40,
      filter: 'blur(8px)',
      transition: {
        duration: 0.4,
        delay: (menuItems.length - 1 - index) * 0.05,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const underlineVariants = {
    rest: { scaleX: 0, opacity: 0 },
    hover: { 
      scaleX: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }
    },
  };

  return (
    <motion.li
      variants={variants}
      initial="hidden"
      animate={isOpen ? 'visible' : 'exit'}
      exit="exit"
      style={{ position: 'relative', listStyle: 'none' }}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover(item.label);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.a
        href={item.href}
        style={{
          fontFamily: '"Bebas Neue", "Oswald", sans-serif',
          fontSize: 'clamp(3rem, 12vw, 8rem)',
          fontWeight: 400,
          letterSpacing: '0.05em',
          color: '#fff',
          textDecoration: 'none',
          display: 'inline-block',
          position: 'relative',
          textTransform: 'uppercase',
          lineHeight: 1,
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
      >
        {item.label}
        <motion.span
          variants={underlineVariants}
          initial="rest"
          animate={isHovered ? 'hover' : 'rest'}
          style={{
            position: 'absolute',
            bottom: '-0.1em',
            left: 0,
            width: '100%',
            height: '0.08em',
            background: 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb)',
            borderRadius: '0.1em',
            transformOrigin: 'center',
          }}
        />
      </motion.a>
    </motion.li>
  );
}

function BackgroundMorph({ isOpen }: { isOpen: boolean }) {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bgRef.current) {
      const targetColor = isOpen ? COLORS.open : COLORS.closed;
      bgRef.current.style.setProperty('--bg-color', targetColor);
    }
  }, [isOpen]);

  return (
    <motion.div
      animate={{
        backgroundColor: isOpen ? COLORS.open : COLORS.closed,
      }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
      }}
    />
  );
}

function MenuToggle({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      style={{
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        width: 60,
        height: 60,
        background: 'transparent',
        border: '2px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '50%',
        cursor: 'pointer',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Bebas Neue", sans-serif',
        fontSize: '1rem',
        color: '#fff',
        letterSpacing: '0.1em',
      }}
      whileHover={{ scale: 1.1, borderColor: '#fff' }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        style={{ position: 'absolute' }}
      >
        MENU
      </motion.span>
      <motion.span
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ position: 'absolute' }}
      >
        CLOSE
      </motion.span>
      <motion.span
        style={{
          position: 'absolute',
          width: 20,
          height: 2,
          background: '#fff',
          borderRadius: 1,
        }}
        animate={{
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 0 : -6,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.span
        style={{
          position: 'absolute',
          width: 20,
          height: 2,
          background: '#fff',
          borderRadius: 1,
        }}
        animate={{
          rotate: isOpen ? -45 : 0,
          y: isOpen ? 0 : 6,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.button>
  );
}

export default function LiquidMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('');

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <CursorFollower />
      <BackgroundMorph isOpen={isOpen} />
      <MenuToggle isOpen={isOpen} onClick={toggleMenu} />

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <motion.ul
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5em',
                padding: 0,
                margin: 0,
              }}
            >
              {menuItems.map((item, index) => (
                <MenuItem
                  key={item.label}
                  item={item}
                  index={index}
                  isOpen={isOpen}
                  onHover={setActiveItem}
                />
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              style={{
                position: 'absolute',
                bottom: '3rem',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.4)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              SELECT TO NAVIGATE
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '2rem',
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.6)',
            letterSpacing: '0.15em',
          }}
        >
          LIQUID MENU
        </motion.div>
      )}
    </>
  );
}