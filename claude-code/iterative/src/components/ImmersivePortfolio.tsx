import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import {
  motion,
  motionValue,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
} from "motion/react";
import type { MotionValue } from "motion/react";

// ─── Constants ───────────────────────────────────────────────────────────────

const HEADING = "WORKS";
const CHARS = HEADING.split("");

const STAGGER = 0.04;
const FLIP_DUR = 0.55;

const BREATHE_AMP = 8;
const BREATHE_HZ = 1.5;
const PHASE_STEP = 0.65;

const ALL_IN_SEC = (CHARS.length - 1) * STAGGER + FLIP_DUR + 0.15;

// SVG filter neutral values (mouse leave snaps back to these)
const FREQ_NEUTRAL = 0.02;
const SCALE_NEUTRAL = 0;

const SPRING_CFG = { stiffness: 60, damping: 20 };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function seededRand(seed: number): number {
  const n = Math.sin(seed * 9301 + 49297) * 233280;
  return Math.abs(n - Math.floor(n));
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ImmersivePortfolio() {
  const [subVisible, setSubVisible] = useState(false);
  const rafRef = useRef<number>(0);
  const t0Ref = useRef<number>(0);

  // ── Character breathing Y offsets ───────────────────────────────────────
  const charYsRef = useRef<MotionValue<number>[] | null>(null);
  if (!charYsRef.current) {
    charYsRef.current = CHARS.map(() => motionValue(0));
  }
  const charYs = charYsRef.current;

  // ── SVG filter element refs ──────────────────────────────────────────────
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);

  // ── Cursor-to-filter pipeline ────────────────────────────────────────────
  // Raw targets set directly from mousemove; springs handle the interpolation
  // and the spring-back on mouse leave.
  const targetFreq = useMotionValue(FREQ_NEUTRAL);
  const targetScale = useMotionValue(SCALE_NEUTRAL);

  const freqSpring = useSpring(targetFreq, SPRING_CFG);
  const scaleSpring = useSpring(targetScale, SPRING_CFG);

  // Write spring values straight into SVG attributes — bypasses React's
  // render cycle entirely so there is zero jank on the character wave RAF.
  useMotionValueEvent(freqSpring, "change", (v) => {
    turbRef.current?.setAttribute("baseFrequency", `${v.toFixed(4)} 0.04`);
  });
  useMotionValueEvent(scaleSpring, "change", (v) => {
    dispRef.current?.setAttribute("scale", v.toFixed(2));
  });

  // ── Mouse handlers ───────────────────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;   // 0 → 1 (left → right)
      const y = (e.clientY - rect.top) / rect.height;    // 0 → 1 (top → bottom)
      targetFreq.set(0.01 + x * 0.07);  // maps to 0.01 … 0.08
      targetScale.set(y * 40);           // maps to 0 … 40
    },
    [targetFreq, targetScale]
  );

  const handleMouseLeave = useCallback(() => {
    targetFreq.set(FREQ_NEUTRAL);
    targetScale.set(SCALE_NEUTRAL);
  }, [targetFreq, targetScale]);

  // ── Breathing wave ───────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setSubVisible(true);
      t0Ref.current = performance.now();

      const tick = (now: number) => {
        const t = (now - t0Ref.current) / 1000;
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

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        userSelect: "none",
        background: "#0a0a0a",
      }}
    >
      {/* ── Inline SVG filter definition ────────────────────── */}
      {/*
        The SVG is 0×0 and lives outside the visual flow.
        Both filter primitives are driven via ref attribute mutations,
        not React re-renders, keeping this path off the main thread budget.
      */}
      <svg
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      >
        <defs>
          <filter
            id="liquid-distort"
            x="-25%"
            y="-25%"
            width="150%"
            height="150%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.02 0.04"
              numOctaves="4"
              seed="3"
              result="noise"
            />
            <feDisplacementMap
              ref={dispRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* ── Background "image" layer ─────────────────────────── */}
      {/*
        Multi-stop radial gradient acts as the hero image.
        CSS filter references the inline SVG filter by ID.
        willChange: filter tells the GPU to composite this layer
        separately so liquid warping never touches the text layer.
      */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse at 22% 38%, rgba(139, 92, 246, 0.90) 0%, transparent 52%),
            radial-gradient(ellipse at 80% 65%, rgba(236, 72, 153, 0.75) 0%, transparent 48%),
            radial-gradient(ellipse at 58% 18%, rgba(16, 185, 129, 0.55) 0%, transparent 42%),
            radial-gradient(ellipse at 12% 88%, rgba(245, 158, 11, 0.45) 0%, transparent 38%),
            radial-gradient(ellipse at 90% 10%, rgba(59, 130, 246, 0.50) 0%, transparent 40%),
            linear-gradient(148deg, #0f0c29 0%, #302b63 52%, #24243e 100%)
          `,
          filter: "url(#liquid-distort)",
          willChange: "filter",
        }}
      />

      {/* Vignette — dims edges, keeps text legible over bright distortion */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(10,10,10,0.30) 0%, rgba(10,10,10,0.70) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Content layer (z above filter) ──────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* ── Heading ─────────────────────────────────────── */}
        <div aria-label={HEADING} style={{ display: "flex", alignItems: "center" }}>
          {CHARS.map((char, i) => {
            const flipFrom = seededRand(i) > 0.5 ? 90 : -90;
            return (
              <div key={i} aria-hidden="true" style={{ perspective: "700px" }}>
                <motion.span
                  initial={{ rotateX: flipFrom, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={{
                    duration: FLIP_DUR,
                    delay: i * STAGGER,
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
                    y: charYs[i],
                    paddingInline: "0.025em",
                    textShadow: "0 2px 40px rgba(255,255,255,0.12)",
                  }}
                >
                  {char}
                </motion.span>
              </div>
            );
          })}
        </div>

        {/* ── Subheading ──────────────────────────────────── */}
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
            color: "rgba(255, 255, 255, 0.55)",
          }}
        >
          Selected Works &amp; Experiments
        </motion.p>

        {/* ── CTA ─────────────────────────────────────────── */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={subVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
          onClick={() => {}}
        >
          Explore
        </motion.button>
      </div>
    </div>
  );
}
