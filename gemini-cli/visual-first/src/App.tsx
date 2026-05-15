import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, animate } from 'motion/react';
import './index.css';

const navItems = [
  { title: "HOME", href: "#" },
  { title: "WORK", href: "#" },
  { title: "STUDIO", href: "#" },
  { title: "CONTACT", href: "#" }
];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  // Cursor following logic
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  // low stiffness / high damping for smooth, mercury-like drag
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 10); // Center the 20px circle
      mouseY.set(e.clientY - 10);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Background morphing using animate() on CSS variable
  useEffect(() => {
    // Animate the html element so the variable is available globally for the menu overlay
    const controls = animate(
      document.documentElement,
      { "--morph-bg": ["#050505", "#2a2a2a", "#050505"] } as any,
      { duration: 8, repeat: Infinity, ease: "easeInOut" }
    );
    return controls.stop;
  }, []);

  return (
    <div className="app-container">
      {/* Custom Cursor */}
      <motion.div
        className="cursor"
        style={{
          x: springX,
          y: springY,
        }}
      />

      {/* Main Content */}
      <main className="content">
        <h1>BRUTAL FLUIDITY</h1>
        <p>A demonstration of liquid motion.</p>
      </main>

      {/* Toggle Button */}
      <button 
        className="menu-toggle" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          {isOpen ? "CLOSE" : "MENU"}
        </motion.div>
      </button>

      {/* Fullscreen Menu */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            className="menu-overlay"
            initial={{ y: "-100%" }}
            animate={{ 
              y: "0%",
              transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } 
            }}
            exit={{ 
              y: "-100%",
              transition: { duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.4 } 
            }}
          >
            <div className="menu-inner">
              {navItems.map((item, i) => (
                <MenuItem 
                  key={i} 
                  title={item.title} 
                  index={i} 
                  total={navItems.length}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const MenuItem = ({ title, index, total }: { title: string, index: number, total: number }) => {
  return (
    <motion.div
      className="menu-item-container"
      initial={{ rotateX: 90, opacity: 0, y: 50 }}
      animate={{ 
        rotateX: 0, 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1], 
          delay: 0.4 + index * 0.08 // 80ms stagger, offset by container entry
        }
      }}
      exit={{ 
        rotateX: -90, 
        opacity: 0, 
        y: -50,
        transition: {
          duration: 0.4,
          ease: [0.76, 0, 0.24, 1],
          delay: (total - 1 - index) * 0.08 // 80ms reverse stagger
        }
      }}
    >
      <motion.a 
        href="#"
        className="menu-item"
        initial="idle"
        whileHover="hover"
      >
        <span className="menu-text">{title}</span>
        <motion.div 
          className="underline"
          variants={{
            idle: { scaleX: 0, originX: 0 },
            hover: { scaleX: 1, originX: 0 }
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </motion.a>
    </motion.div>
  );
};