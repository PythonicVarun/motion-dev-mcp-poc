import { type CSSProperties, type ReactNode, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  type MotionValue,
  type Variants,
  motion,
  stagger,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import styles from "./MagneticDock.module.css";

type DockItem = {
  id: string;
  label: string;
  icon: ReactNode;
  accent: string;
};

const SIGMA = 92;
const BASE_SCALE = 1;
const MAX_SCALE_BOOST = 0.9;
const MAX_LIFT = 18;

const dockItems: DockItem[] = [
  { id: "finder", label: "Finder", icon: <FinderIcon />, accent: "#4aa8ff" },
  { id: "launchpad", label: "Launchpad", icon: <LaunchpadIcon />, accent: "#ff9a62" },
  { id: "music", label: "Music", icon: <MusicIcon />, accent: "#ff5f96" },
  { id: "messages", label: "Messages", icon: <MessagesIcon />, accent: "#5fd286" },
  { id: "photos", label: "Photos", icon: <PhotosIcon />, accent: "#8d71ff" },
  { id: "settings", label: "Settings", icon: <SettingsIcon />, accent: "#93a1b8" },
];

const dockVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 26,
    scale: 0.94,
    filter: "blur(12px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 28,
      mass: 0.9,
      delayChildren: stagger(0.06),
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.86,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 360,
      damping: 24,
    },
  },
};

const rowVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: stagger(0.06),
    },
  },
};

export function MagneticDock() {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      className={styles.scene}
      initial="hidden"
      animate="visible"
      variants={dockVariants}
    >
      <motion.div
        className={styles.dock}
        onMouseMove={(event) => mouseX.set(event.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        <div className={styles.glow} aria-hidden="true" />
        <div className={styles.reflection} aria-hidden="true" />
        <motion.div className={styles.iconRow} variants={rowVariants}>
          {dockItems.map((item) => (
            <MagneticDockIcon key={item.id} item={item} mouseX={mouseX} />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

type MagneticDockIconProps = {
  item: DockItem;
  mouseX: MotionValue<number>;
};

function MagneticDockIcon({ item, mouseX }: MagneticDockIconProps) {
  const iconRef = useRef<HTMLButtonElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rawScale = useTransform(mouseX, (currentMouseX) => {
    if (!iconRef.current || !Number.isFinite(currentMouseX)) {
      return BASE_SCALE;
    }

    const bounds = iconRef.current.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const distance = currentMouseX - centerX;
    const gaussian = Math.exp(-(distance * distance) / (2 * SIGMA * SIGMA));

    return BASE_SCALE + gaussian * MAX_SCALE_BOOST;
  });

  const rawLift = useTransform(rawScale, (scale) => {
    const progress = (scale - BASE_SCALE) / MAX_SCALE_BOOST;
    return -Math.max(0, progress) * MAX_LIFT;
  });

  const rawShadow = useTransform(rawScale, (scale) => {
    const strength = ((scale - BASE_SCALE) / MAX_SCALE_BOOST) * 0.3;
    return `0 ${18 + strength * 10}px ${32 + strength * 20}px rgba(15, 23, 42, ${0.16 + strength})`;
  });

  const scale = useSpring(rawScale, { stiffness: 380, damping: 30, mass: 0.24 });
  const y = useSpring(rawLift, { stiffness: 420, damping: 32, mass: 0.28 });
  const boxShadow = useSpringShadow(rawShadow);

  const accentStyle = useMemo(
    () =>
      ({
        "--dock-accent": item.accent,
      }) as CSSProperties,
    [item.accent],
  );

  return (
    <motion.div className={styles.itemWrap} variants={itemVariants}>
      <AnimatePresence>
        {isHovered ? (
          <motion.div
            className={styles.label}
            initial={{ opacity: 0, y: 10, scale: 0.82 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 520,
                damping: 30,
              },
            }}
            exit={{
              opacity: 0,
              y: 8,
              scale: 0.88,
              transition: {
                type: "spring",
                stiffness: 420,
                damping: 34,
              },
            }}
          >
            {item.label}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        ref={iconRef}
        type="button"
        className={styles.iconButton}
        style={{
          ...accentStyle,
          scale,
          y,
          boxShadow,
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileTap={{
          scaleX: [null, 1.15, 0.92, 1.03],
          scaleY: [null, 0.84, 1.12, 0.98],
          y: [null, 2, -2, 0],
          transition: {
            duration: 0.32,
            times: [0, 0.22, 0.62, 1],
            ease: "easeOut",
          },
        }}
        aria-label={item.label}
      >
        <span className={styles.iconSurface}>{item.icon}</span>
      </motion.button>
    </motion.div>
  );
}

function useSpringShadow(value: MotionValue<string>) {
  return useSpring(value, {
    stiffness: 340,
    damping: 32,
    mass: 0.26,
  });
}

function FinderIcon() {
  return (
    <svg viewBox="0 0 64 64" className={styles.glyph} aria-hidden="true">
      <defs>
        <linearGradient id="finderSplit" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c9f1ff" />
          <stop offset="100%" stopColor="#5eb7ff" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="48" height="48" rx="14" fill="url(#finderSplit)" />
      <path d="M32 8v48" stroke="#0b2744" strokeWidth="2.75" opacity="0.28" />
      <circle cx="24" cy="27" r="3.4" fill="#0b2744" />
      <circle cx="39.5" cy="27" r="3.4" fill="#0b2744" />
      <path
        d="M21 40c2.8-3.2 6.2-4.8 11-4.8S40.2 36.8 43 40"
        fill="none"
        stroke="#0b2744"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LaunchpadIcon() {
  return (
    <svg viewBox="0 0 64 64" className={styles.glyph} aria-hidden="true">
      <rect x="8" y="8" width="48" height="48" rx="14" fill="#1f2430" />
      {[
        [22, 22],
        [32, 22],
        [42, 22],
        [22, 32],
        [32, 32],
        [42, 32],
        [22, 42],
        [32, 42],
        [42, 42],
      ].map(([cx, cy], index) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={index === 4 ? 4.8 : 3.6}
          fill={index === 4 ? "#ff9a62" : "#ffd7c2"}
        />
      ))}
    </svg>
  );
}

function MusicIcon() {
  return (
    <svg viewBox="0 0 64 64" className={styles.glyph} aria-hidden="true">
      <defs>
        <linearGradient id="musicGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff9ec7" />
          <stop offset="100%" stopColor="#ff4e91" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="48" height="48" rx="14" fill="url(#musicGlow)" />
      <path
        d="M38 18v22.4a6.8 6.8 0 1 1-3.2-5.8V24.6l-13 2.8v16a6.8 6.8 0 1 1-3.2-5.8V25.1a3 3 0 0 1 2.38-2.93l14.84-3.2A1.9 1.9 0 0 1 38 18Z"
        fill="#fff7fb"
      />
    </svg>
  );
}

function MessagesIcon() {
  return (
    <svg viewBox="0 0 64 64" className={styles.glyph} aria-hidden="true">
      <rect x="8" y="8" width="48" height="48" rx="14" fill="#4fd57d" />
      <path
        d="M20 20h24a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H31l-8.8 7.2c-.9.74-2.2.1-2.2-1.06V42h0a6 6 0 0 1-6-6V26a6 6 0 0 1 6-6Z"
        fill="#f8fff9"
      />
      <circle cx="26" cy="31" r="2.2" fill="#4fd57d" />
      <circle cx="32" cy="31" r="2.2" fill="#4fd57d" />
      <circle cx="38" cy="31" r="2.2" fill="#4fd57d" />
    </svg>
  );
}

function PhotosIcon() {
  return (
    <svg viewBox="0 0 64 64" className={styles.glyph} aria-hidden="true">
      <rect x="8" y="8" width="48" height="48" rx="14" fill="#ffffff" />
      {[
        "#ff6b6b",
        "#ffb347",
        "#ffe66d",
        "#72ddf7",
        "#8093f1",
        "#d65db1",
      ].map((color, index) => (
        <path
          key={color}
          d={`M32 32 L32 ${14 + index * 0.35} A18 18 0 0 1 ${47.6 - index * 3.1} ${
            23.5 + index * 4.1
          } Z`}
          fill={color}
          transform={`rotate(${index * 60} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="7.2" fill="#ffffff" stroke="#dbe2f0" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="3.4" fill="#f5c451" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 64 64" className={styles.glyph} aria-hidden="true">
      <defs>
        <linearGradient id="settingsShell" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cfd8e7" />
          <stop offset="100%" stopColor="#7a889c" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="48" height="48" rx="14" fill="url(#settingsShell)" />
      <path
        d="M35 18.8h-6l-1.3 4-3.8 1.6-3.8-1.8-4.2 4.2 1.8 3.8-1.6 3.8-4 1.3v6l4 1.3 1.6 3.8-1.8 3.8 4.2 4.2 3.8-1.8 3.8 1.6 1.3 4h6l1.3-4 3.8-1.6 3.8 1.8 4.2-4.2-1.8-3.8 1.6-3.8 4-1.3v-6l-4-1.3-1.6-3.8 1.8-3.8-4.2-4.2-3.8 1.8-3.8-1.6-1.3-4Z"
        fill="#eff3f9"
      />
      <circle cx="32" cy="32" r="8" fill="#8d9aad" />
      <circle cx="32" cy="32" r="4" fill="#eef3f8" />
    </svg>
  );
}
