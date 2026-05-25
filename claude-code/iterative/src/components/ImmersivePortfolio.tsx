import { useEffect, useRef, useState } from "react";
import { motion, motionValue } from "motion/react";
import type { MotionValue } from "motion/react";

// ─── Constants ───────────────────────────────────────────────────────────────

const HEADING = "WORKS";
const CHARS = HEADING.split("");

const STAGGER = 0.04;    // 40 ms between each character's flip start
const FLIP_DUR = 0.55;   // 550 ms per character flip

const BREATHE_AMP = 8;   // px — vertical oscillation amplitude
const BREATHE_HZ = 1.5;  // wave cycles per second
const PHASE_STEP = 0.65; // radians of phase shift per character index

// Time (seconds) after which the last character has finished entering
const ALL_IN_SEC = (CHARS.length - 1) * STAGGER + FLIP_DUR + 0.15;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Deterministic pseudo-random in [0, 1) for a given integer seed.
 * Uses sin-hash so values are stable across renders for the same index.
 */
function seededRand(seed: number): number {
  const n = Math.sin(seed * 9301 + 49297) * 233280;
  return Math.abs(n - Math.floor(n));
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ImmersivePortfolio() {
  const [subVisible, setSubVisible] = useState(false);
  const rafRef = useRef<number>(0);
  const t0Ref = useRef<number>(0);

  // One MotionValue<number> per character for the breathing Y offset.
  // Lazy-init in a ref so we never call motionValue() conditionally or in a hook loop.
  const charYsRef = useRef<MotionValue<number>[] | null>(null);
  if (!charYsRef.current) {
    charYsRef.current = CHARS.map(() => motionValue(0));
  }
  const charYs = charYsRef.current;

  useEffect(() => {
    // Wait for every character to land before starting the wave + revealing sub-content.
    const timer = setTimeout(() => {
      setSubVisible(true);
      t0Ref.current = performance.now();

      const tick = (now: number) => {
        const t = (now - t0Ref.current) / 1000; // seconds elapsed
        for (let i = 0; i < CHARS.length; i++) {
          charYs[i].set(
            Math.sin(t * BREATHE_HZ * Math.PI * 2 + i * PHASE_STEP) * BREATHE_AMP
          );
        }
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    }, ALL_IN_SEC * 1000);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      {/* ── Heading ─────────────────────────────────────────── */}
      <div
        aria-label={HEADING}
        style={{ display: "flex", alignItems: "center" }}
      >
        {CHARS.map((char, i) => {
          // Each character independently flips from either +90° (floor) or –90° (ceiling).
          const flipFrom = seededRand(i) > 0.5 ? 90 : -90;

          return (
            // Wrapper div owns the perspective so each character has its own
            // vanishing point — flips look uniform regardless of screen position.
            <div
              key={i}
              aria-hidden="true"
              style={{ perspective: "700px" }}
            >
              <motion.span
                initial={{ rotateX: flipFrom, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{
                  duration: FLIP_DUR,
                  delay: i * STAGGER,
                  // Custom spring-like ease: fast deceleration into place
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  display: "block",
                  fontSize: "clamp(4rem, 19vw, 15rem)",
                  fontWeight: 900,
                  color: "#ffffff",
                  lineHeight: 0.88,
                  letterSpacing: "-0.03em",
                  transformOrigin: "50% 50%",
                  // Motion-value Y drives the breathing wave
                  y: charYs[i],
                  paddingInline: "0.025em",
                }}
              >
                {char}
              </motion.span>
            </div>
          );
        })}
      </div>

      {/* ── Subheading ──────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={subVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        style={{
          marginTop: "3rem",
          marginBottom: "2.5rem",
          marginLeft: 0,
          marginRight: 0,
          fontSize: "clamp(0.7rem, 1.8vw, 1.05rem)",
          fontWeight: 300,
          letterSpacing: "0.38em",
          textTransform: "uppercase",
          color: "rgba(255, 255, 255, 0.42)",
        }}
      >
        Selected Works &amp; Experiments
      </motion.p>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={subVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{
          duration: 0.55,
          delay: 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        style={{
          padding: "1rem 3rem",
          fontSize: "0.78rem",
          fontWeight: 500,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#ffffff",
          background: "transparent",
          border: "1px solid rgba(255, 255, 255, 0.45)",
          borderRadius: "1px",
          cursor: "pointer",
          fontFamily: "inherit",
          outline: "none",
        }}
        onClick={() => {
          // placeholder — wire up to router / scroll handler
        }}
      >
        Explore
      </motion.button>
    </div>
  );
}
