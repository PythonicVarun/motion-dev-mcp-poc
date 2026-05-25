'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, Variants } from 'motion/react';
import styles from './MagneticDock.module.css';

const dockItems = [
  { icon: '🚀', label: 'Launchpad' },
  { icon: '📁', label: 'Finder' },
  { icon: '💬', label: 'Messages' },
  { icon: '🖼️', label: 'Photos' },
  { icon: '🎵', label: 'Music' },
  { icon: '⚙️', label: 'Settings' },
];

const springConfig = { stiffness: 300, damping: 20 };

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.5 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

interface DockIconProps {
  icon: string;
  label: string;
  index: number;
  mouseX: ReturnType<typeof useMotionValue<number>>;
}

function DockIcon({ icon, label, index, mouseX }: DockIconProps) {
  const iconRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const distance = useTransform(mouseX, (x) => {
    if (!iconRef.current) return 100;
    const rect = iconRef.current.getBoundingClientRect();
    const iconCenter = rect.left + rect.width / 2;
    return Math.abs(x - iconCenter);
  });

  const gaussianScale = useTransform(distance, (d) => {
    const sigma = 55;
    const maxScale = 0.7;
    const baseScale = 1;
    const gaussian = maxScale * Math.exp(-(d * d) / (2 * sigma * sigma));
    return baseScale + gaussian;
  });

  const smoothScale = useSpring(gaussianScale, springConfig);

  const labelVariants: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      },
    },
  };

  return (
    <motion.div
      className={styles.dockItem}
      ref={iconRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      variants={itemVariants}
    >
      <motion.div
        className={styles.iconWrapper}
        style={{ scale: smoothScale }}
        whileTap={{
          scale: [1, 0.7, 1.15, 0.9, 1.05, 0.98, 1],
          transition: { duration: 0.4 },
        }}
      >
        <span className={styles.icon}>{icon}</span>
      </motion.div>

      <motion.span
        className={styles.label}
        variants={labelVariants}
        initial="hidden"
        animate={isHovered ? 'visible' : 'hidden'}
      >
        {label}
      </motion.span>
    </motion.div>
  );
}

export default function MagneticDock() {
  const mouseX = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseX.set(e.clientX);
  };

  return (
    <motion.div
      className={styles.dockContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onMouseMove={handleMouseMove}
    >
      {dockItems.map((item, index) => (
        <DockIcon
          key={item.label}
          icon={item.icon}
          label={item.label}
          index={index}
          mouseX={mouseX}
        />
      ))}
    </motion.div>
  );
}