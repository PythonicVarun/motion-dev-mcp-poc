import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import styles from './MagneticDock.module.css';
import { Home, Search, Mail, Settings, User, Bell } from 'lucide-react';

const icons = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'mail', icon: Mail, label: 'Mail' },
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'user', icon: User, label: 'Profile' },
  { id: 'bell', icon: Bell, label: 'Notifications' },
];

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      ease: "easeOut",
      duration: 0.5
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function DockItem({ item, mouseX }) {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Calculate distance from cursor to this item's center
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Gaussian falloff for width scaling (simulating macOS dock scale)
  const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 400); // Reset after keyframe animation
  };

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      className={styles.dockItem}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      variants={itemVariants}
      animate={isClicked ? { scale: [1, 0.7, 1.15, 0.95, 1] } : { scale: 1 }}
      transition={isClicked ? { duration: 0.4 } : undefined}
    >
      <motion.div
        className={styles.label}
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? -50 : 10, scale: isHovered ? 1 : 0.8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {item.label}
      </motion.div>
      <div className={styles.iconContainer}>
        <item.icon size="50%" />
      </div>
    </motion.div>
  );
}

export default function MagneticDock() {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className={styles.dockWrapper}>
      <motion.div
        className={styles.dock}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {icons.map((item) => (
          <DockItem key={item.id} item={item} mouseX={mouseX} />
        ))}
      </motion.div>
    </div>
  );
}
