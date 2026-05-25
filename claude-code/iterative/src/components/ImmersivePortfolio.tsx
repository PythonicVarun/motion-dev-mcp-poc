import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import {
  motion,
  motionValue,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
  AnimatePresence,
  useScroll,
  useTransform,
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

const FREQ_NEUTRAL = 0.02;
const SCALE_NEUTRAL = 0;
const SPRING_CFG = { stiffness: 60, damping: 20 };

// ─── Project data ────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  category: string;
  gradient: string;
  description: string;
  tags: string[];
}

const PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Echo Chamber",
    category: "Interactive",
    gradient: "linear-gradient(135deg,#667eea,#764ba2)",
    description:
      "A spatial audio installation that responds to visitor movement, creating personalized soundscapes from ambient city noise captured over eighteen months.",
    tags: ["WebGL", "Web Audio API", "Sensor Fusion"],
  },
  {
    id: "p2",
    name: "Tidal Memory",
    category: "Data Viz",
    gradient: "linear-gradient(135deg,#f093fb,#f5576c)",
    description:
      "Ocean temperature data spanning 40 years rendered as a living tide chart. Each frame breathes with the rhythm of seasonal change at 12 global stations.",
    tags: ["D3.js", "Canvas 2D", "Climate Data"],
  },
  {
    id: "p3",
    name: "Formless",
    category: "Brand",
    gradient: "linear-gradient(135deg,#4facfe,#00f2fe)",
    description:
      "Identity system for a generative-art studio. The logo morphs through 1,000+ parametric states — every printed piece and screen render is unique.",
    tags: ["Identity", "Generative", "Variable Font"],
  },
  {
    id: "p4",
    name: "Depth Index",
    category: "Editorial",
    gradient: "linear-gradient(135deg,#43e97b,#38f9d7)",
    description:
      "Annual report for a marine research foundation, designed as a submarine dive. Each section descends further into the data, pressure rising as you scroll.",
    tags: ["Editorial", "Scroll FX", "Typography"],
  },
  {
    id: "p5",
    name: "Threshold",
    category: "Web",
    gradient: "linear-gradient(135deg,#fa709a,#fee140)",
    description:
      "E-commerce platform for a luxury fashion label built around controlled access and anticipation. Inventory is intentionally obscured until a visitor qualifies.",
    tags: ["Next.js", "Commerce", "Motion"],
  },
  {
    id: "p6",
    name: "Parallax Hours",
    category: "Installation",
    gradient: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
    description:
      "Time-based installation using 96 suspended LED columns to chart daylight hours throughout a year at 60°N latitude. Shown at two biennales.",
    tags: ["Hardware", "Arduino", "Light Design"],
  },
];

// ─── Process section data ─────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    title: "Discover",
    body: "Map the terrain before drawing the road. We immerse in context, users, and competitors through research sprints and field observation sessions.",
  },
  {
    num: "02",
    title: "Define",
    body: "From signal to structure. Synthesis turns raw findings into a ranked brief — priorities named, constraints surfaced, success criteria agreed.",
  },
  {
    num: "03",
    title: "Design",
    body: "Iterative form-giving at every scale. Each decision traces back to a principle; each pixel earns its place through prototyping and real friction.",
  },
  {
    num: "04",
    title: "Develop",
    body: "Code as craft. Motion, performance, and accessibility ship as first-class concerns — never retrofitted after the fact.",
  },
  {
    num: "05",
    title: "Deploy",
    body: "Launch is the opening move, not the final one. We instrument, observe, and iterate continuously through the first ninety days live.",
  },
];

const PROCESS_PATH =
  "M 50 50 C 64 90 36 110 50 150 C 64 190 36 210 50 250 C 64 290 36 310 50 350 C 64 390 36 410 50 450";
const NODE_CYS = [50, 150, 250, 350, 450];

// ─── Process section component ────────────────────────────────────────────────

function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(420);
  const strokeDashoffset = useMotionValue(420);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Horizontal clip-path wipe: section reveals left→right as it enters
  const wipePct = useTransform(scrollYProgress, [0, 0.1], [100, 0]);
  const clipPath = useTransform(wipePct, (v) => `inset(0 ${v.toFixed(1)}% 0 0)`);

  // 3-layer section-wide parallax (different speeds → depth)
  const bgY = useTransform(scrollYProgress, [0, 1], [40, -40]);    // 0.3× relative
  const midY = useTransform(scrollYProgress, [0, 1], [100, -100]); // 0.7× relative
  const fgY = useTransform(scrollYProgress, [0, 1], [160, -160]);  // 1.15× relative

  // Node pulse MotionValues — driven by runtime-measured thresholds (viewport-independent)
  const ns0 = useMotionValue(1), ns1 = useMotionValue(1), ns2 = useMotionValue(1);
  const ns3 = useMotionValue(1), ns4 = useMotionValue(1);
  const no0 = useMotionValue(0.3), no1 = useMotionValue(0.3), no2 = useMotionValue(0.3);
  const no3 = useMotionValue(0.3), no4 = useMotionValue(0.3);
  const nodeScales = [ns0, ns1, ns2, ns3, ns4];
  const nodeOpacities = [no0, no1, no2, no3, no4];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const len = pathRef.current?.getTotalLength() ?? 420;
    setPathLen(len);
    strokeDashoffset.set(len);

    // Measure each step's center scroll-progress threshold from live DOM positions.
    // Recomputed on resize so viewport-height changes don't break alignment.
    const computeThresholds = (): number[] => {
      const vpH = window.innerHeight;
      const sectionDocTop =
        section.getBoundingClientRect().top + window.scrollY;
      const sectionH = section.scrollHeight;
      const scrollStart = sectionDocTop - vpH;           // progress = 0
      const range = sectionDocTop + sectionH - scrollStart; // total range

      const h3s = [...section.querySelectorAll("h3")] as HTMLElement[];
      return ["Discover", "Define", "Design", "Develop", "Deploy"].map((title) => {
        const h3 = h3s.find((el) => el.textContent?.trim() === title);
        if (!h3) return 0.5;
        // Walk up to the step container (first ancestor that has an inline minHeight)
        let el: HTMLElement | null = h3;
        while (el && !el.style?.minHeight) el = el.parentElement as HTMLElement | null;
        if (!el) return 0.5;
        const r = el.getBoundingClientRect();
        const centerDocY = r.top + r.height / 2 + window.scrollY;
        return (centerDocY - vpH / 2 - scrollStart) / range;
      });
    };

    let thresholds = computeThresholds();
    const scales = [ns0, ns1, ns2, ns3, ns4];
    const opacities = [no0, no1, no2, no3, no4];
    const HALF = 0.06;

    const unsub = scrollYProgress.on("change", (p) => {
      // Stroke: draws from first-step threshold to last-step threshold
      const t = Math.max(
        0,
        Math.min(1, (p - thresholds[0]) / (thresholds[4] - thresholds[0]))
      );
      strokeDashoffset.set(len * (1 - t));

      // Node pulses: peak at each step's threshold
      thresholds.forEach((center, i) => {
        const frac = Math.max(0, 1 - Math.abs(p - center) / HALF);
        scales[i].set(1 + frac * 0.85);
        opacities[i].set(0.3 + frac * 0.7);
      });
    });

    const onResize = () => { thresholds = computeThresholds(); };
    window.addEventListener("resize", onResize);

    return () => {
      unsub();
      window.removeEventListener("resize", onResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.section
      ref={sectionRef}
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "400vh",
        clipPath,
        overflow: "hidden",
      }}
    >
      {/* Section label */}
      <div
        style={{
          padding: "5rem 3rem 2rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.35)",
            margin: "0 0 0.75rem",
          }}
        >
          How We Work
        </p>
        <h2
          style={{
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            fontWeight: 900,
            color: "#ffffff",
            margin: 0,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          Process
        </h2>
      </div>

      {/* Path column + steps column */}
      <div
        style={{
          display: "flex",
          padding: "0 3rem",
          maxWidth: "1200px",
          margin: "0 auto",
          gap: "2.5rem",
        }}
      >
        {/* Full-height timeline column — spans entire steps column via flex stretch */}
        <div style={{ width: "80px", flexShrink: 0, position: "relative", alignSelf: "stretch" }}>
          {/* Path-only SVG — preserveAspectRatio="none" to span full height */}
          <svg
            viewBox="0 0 100 500"
            preserveAspectRatio="none"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}
          >
            <path
              d={PROCESS_PATH}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="2"
              fill="none"
            />
            <motion.path
              ref={pathRef}
              d={PROCESS_PATH}
              stroke="rgba(139,92,246,0.8)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={pathLen}
              style={{ strokeDashoffset }}
            />
          </svg>

          {/* HTML node circles — percentage-positioned so they stay circular
              despite the SVG being stretched. cy/500 maps viewBox y → column %. */}
          {NODE_CYS.map((cy, i) => (
            <div key={i}>
              {/* Glow ring */}
              <motion.div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: `${(cy / 500) * 100}%`,
                  width: "28px",
                  height: "28px",
                  marginLeft: "-14px",
                  marginTop: "-14px",
                  borderRadius: "50%",
                  border: "1px solid rgba(139,92,246,0.4)",
                  scale: nodeScales[i],
                  opacity: nodeOpacities[i],
                  pointerEvents: "none",
                }}
              />
              {/* Node */}
              <motion.div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: `${(cy / 500) * 100}%`,
                  width: "12px",
                  height: "12px",
                  marginLeft: "-6px",
                  marginTop: "-6px",
                  borderRadius: "50%",
                  background: "rgba(10,10,10,0.95)",
                  border: "1.5px solid rgba(255,255,255,0.6)",
                  scale: nodeScales[i],
                  opacity: nodeOpacities[i],
                  pointerEvents: "none",
                }}
              />
            </div>
          ))}
        </div>

        {/* Steps */}
        <div style={{ flex: 1 }}>
          {STEPS.map((step, i) => (
            <div
              key={i}
              style={{
                minHeight: "76vh",
                display: "flex",
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Background layer — 0.3× parallax */}
              <motion.div
                style={{
                  position: "absolute",
                  inset: "-30%",
                  y: bgY,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(ellipse at ${18 + i * 14}% 50%, rgba(139,92,246,0.09) 0%, transparent 65%)`,
                  }}
                />
              </motion.div>

              {/* Mid layer — 0.7× parallax, ghost step number */}
              <motion.div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  pointerEvents: "none",
                  y: midY,
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(7rem, 20vw, 17rem)",
                    fontWeight: 900,
                    color: "rgba(255,255,255,0.028)",
                    lineHeight: 1,
                    letterSpacing: "-0.05em",
                    userSelect: "none",
                  }}
                >
                  {step.num}
                </span>
              </motion.div>

              {/* Foreground layer — 1.15× parallax, actual content */}
              <motion.div
                style={{ position: "relative", zIndex: 2, y: fgY }}
              >
                <p
                  style={{
                    fontSize: "0.62rem",
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.35)",
                    margin: "0 0 1rem",
                  }}
                >
                  {step.num}
                </p>
                <h3
                  style={{
                    fontSize: "clamp(2rem, 4vw, 3.2rem)",
                    fontWeight: 900,
                    color: "#ffffff",
                    lineHeight: 1.0,
                    letterSpacing: "-0.03em",
                    margin: "0 0 1.4rem",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.94rem",
                    lineHeight: 1.8,
                    color: "rgba(255,255,255,.52)",
                    margin: 0,
                    maxWidth: "42ch",
                  }}
                >
                  {step.body}
                </p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function seededRand(seed: number): number {
  const n = Math.sin(seed * 9301 + 49297) * 233280;
  return Math.abs(n - Math.floor(n));
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ImmersivePortfolio() {
  // ── Card selection state ─────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  // Ref mirror used inside stable callbacks without adding selectedId to deps
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;

  const selectedProject = PROJECTS.find((p) => p.id === selectedId) ?? null;

  // ── Hero breathing wave ──────────────────────────────────────────────────
  const [subVisible, setSubVisible] = useState(false);
  const rafRef = useRef<number>(0);
  const t0Ref = useRef<number>(0);

  const charYsRef = useRef<MotionValue<number>[] | null>(null);
  if (!charYsRef.current) {
    charYsRef.current = CHARS.map(() => motionValue(0));
  }
  const charYs = charYsRef.current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSubVisible(true);
      t0Ref.current = performance.now();
      const tick = (now: number) => {
        const t = (now - t0Ref.current) / 1000;
        for (let i = 0; i < CHARS.length; i++) {
          charYs[i].set(
            Math.sin(t * BREATHE_HZ * Math.PI * 2 + i * PHASE_STEP) *
              BREATHE_AMP
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

  // ── SVG filter ──────────────────────────────────────────────────────────
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);

  const targetFreq = useMotionValue(FREQ_NEUTRAL);
  const targetScale = useMotionValue(SCALE_NEUTRAL);
  const freqSpring = useSpring(targetFreq, SPRING_CFG);
  const scaleSpring = useSpring(targetScale, SPRING_CFG);

  useMotionValueEvent(freqSpring, "change", (v) => {
    turbRef.current?.setAttribute("baseFrequency", `${v.toFixed(4)} 0.04`);
  });
  useMotionValueEvent(scaleSpring, "change", (v) => {
    dispRef.current?.setAttribute("scale", v.toFixed(2));
  });

  // Reset filter to neutral when a card opens so distortion doesn't bleed
  // through the overlay.
  useEffect(() => {
    if (selectedId) {
      targetFreq.set(FREQ_NEUTRAL);
      targetScale.set(SCALE_NEUTRAL);
    }
  }, [selectedId, targetFreq, targetScale]);

  // ── Mouse handlers ───────────────────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (selectedIdRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      targetFreq.set(0.01 + x * 0.07);
      targetScale.set(y * 40);
    },
    [targetFreq, targetScale]
  );

  const handleMouseLeave = useCallback(() => {
    targetFreq.set(FREQ_NEUTRAL);
    targetScale.set(SCALE_NEUTRAL);
  }, [targetFreq, targetScale]);

  // ── Card interaction ─────────────────────────────────────────────────────
  const handleCardClick = useCallback((id: string) => {
    if (selectedIdRef.current) return;
    setDetailVisible(false);
    setSelectedId(id);
  }, []);

  const handleClose = useCallback(() => {
    setDetailVisible(false);
    setSelectedId(null);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        userSelect: "none",
        background: "#0a0a0a",
      }}
    >
      {/* ── Inline SVG filter ─────────────────────────────── */}
      <svg
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      >
        <defs>
          <filter
            id="liquid-distort"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.02 0.04"
              numOctaves="6"
              seed="3"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0.14 0 0 0 0.43
                      0 0.14 0 0 0.43
                      0 0 0.14 0 0.43
                      0 0    0  1 0"
              result="subtleNoise"
            />
            <feBlend
              in="SourceGraphic"
              in2="subtleNoise"
              mode="soft-light"
              result="textured"
            />
            <feDisplacementMap
              ref={dispRef}
              in="textured"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* ── Background image layer (fixed so it covers on scroll) ─ */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: "-5%",
          background: `
            radial-gradient(ellipse at 22% 38%,rgba(139,92,246,.90) 0%,transparent 52%),
            radial-gradient(ellipse at 80% 65%,rgba(236,72,153,.75) 0%,transparent 48%),
            radial-gradient(ellipse at 58% 18%,rgba(16,185,129,.55) 0%,transparent 42%),
            radial-gradient(ellipse at 12% 88%,rgba(245,158,11,.45) 0%,transparent 38%),
            radial-gradient(ellipse at 90% 10%,rgba(59,130,246,.50) 0%,transparent 40%),
            linear-gradient(148deg,#0f0c29 0%,#302b63 52%,#24243e 100%)
          `,
          filter: "url(#liquid-distort)",
          willChange: "filter",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%,rgba(10,10,10,.30) 0%,rgba(10,10,10,.72) 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <motion.section
        layout
        transition={{ type: "spring", stiffness: 100, damping: 28 }}
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: selectedId ? "38vh" : "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Heading */}
        <div aria-label={HEADING} style={{ display: "flex", alignItems: "center" }}>
          {CHARS.map((char, i) => {
            const flipFrom = seededRand(i) > 0.5 ? 90 : -90;
            return (
              <div key={i} aria-hidden="true" style={{ perspective: "700px" }}>
                <motion.span
                  initial={{ rotateX: flipFrom, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={{ duration: FLIP_DUR, delay: i * STAGGER, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    display: "block",
                    fontSize: selectedId
                      ? "clamp(2rem, 8vw, 6rem)"
                      : "clamp(4rem, 19vw, 15rem)",
                    fontWeight: 900,
                    color: "#ffffff",
                    lineHeight: 0.88,
                    letterSpacing: "-0.03em",
                    transformOrigin: "50% 50%",
                    y: charYs[i],
                    paddingInline: "0.025em",
                    textShadow: "0 2px 40px rgba(255,255,255,.12)",
                  }}
                >
                  {char}
                </motion.span>
              </div>
            );
          })}
        </div>

        {/* Subheading */}
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
            color: "rgba(255,255,255,.55)",
          }}
        >
          Selected Works &amp; Experiments
        </motion.p>

        {/* CTA */}
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
            border: "1px solid rgba(255,255,255,.45)",
            borderRadius: "1px",
            cursor: "pointer",
            fontFamily: "inherit",
            outline: "none",
          }}
          onClick={() => {}}
        >
          Explore
        </motion.button>
      </motion.section>

      {/* ── Project grid ─────────────────────────────────────── */}
      <motion.section
        layout
        style={{
          position: "relative",
          zIndex: 1,
          padding: "5rem 3rem 6rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.25rem",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {PROJECTS.map((project) => (
            <motion.div
              key={project.id}
              layoutId={`${project.id}-card`}
              onClick={() => handleCardClick(project.id)}
              animate={{
                scale: selectedId && selectedId !== project.id ? 0.94 : 1,
                opacity: selectedId && selectedId !== project.id ? 0.45 : 1,
                filter:
                  selectedId && selectedId !== project.id
                    ? "blur(3px) brightness(0.55)"
                    : "blur(0px) brightness(1)",
              }}
              transition={{ type: "spring", stiffness: 200, damping: 28 }}
              style={{
                cursor: selectedId ? "default" : "pointer",
                borderRadius: "10px",
                overflow: "hidden",
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.10)",
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Image */}
              <motion.div
                layoutId={`${project.id}-image`}
                style={{
                  height: "180px",
                  background: project.gradient,
                  flexShrink: 0,
                }}
              />

              {/* Text */}
              <div style={{ padding: "1.1rem 1.25rem 1.4rem" }}>
                <motion.p
                  layoutId={`${project.id}-category`}
                  style={{
                    margin: 0,
                    fontSize: "0.62rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.45)",
                    fontWeight: 400,
                  }}
                >
                  {project.category}
                </motion.p>
                <motion.p
                  layoutId={`${project.id}-name`}
                  style={{
                    margin: "0.4rem 0 0",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "#ffffff",
                    lineHeight: 1.2,
                  }}
                >
                  {project.name}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Process section ──────────────────────────────────── */}
      <ProcessSection />

      {/* ── Fullscreen detail overlay ─────────────────────────── */}
      <AnimatePresence>
        {selectedId && selectedProject && (
          <>
            {/* Scrim */}
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handleClose}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.80)",
                zIndex: 99,
                cursor: "pointer",
              }}
            />

            {/* Expanded card — shares layoutId with its grid sibling */}
            <motion.div
              layoutId={`${selectedId}-card`}
              onLayoutAnimationComplete={() => {
                // Only set visible on the opening transition (not the close)
                if (selectedIdRef.current) setDetailVisible(true);
              }}
              style={{
                position: "fixed",
                top: "5vh",
                left: "5vw",
                width: "90vw",
                height: "88vh",
                zIndex: 100,
                borderRadius: "14px",
                overflow: "hidden",
                background: "rgba(12,12,18,.97)",
                display: "flex",
                flexDirection: "row",
              }}
            >
              {/* Left — image morphs from card */}
              <motion.div
                layoutId={`${selectedId}-image`}
                style={{
                  width: "48%",
                  background: selectedProject.gradient,
                  flexShrink: 0,
                }}
              />

              {/* Right — text content */}
              <div
                style={{
                  flex: 1,
                  padding: "3.5rem 3rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {/* Category — morphs from card */}
                <motion.p
                  layoutId={`${selectedId}-category`}
                  style={{
                    margin: 0,
                    fontSize: "0.72rem",
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.48)",
                  }}
                >
                  {selectedProject.category}
                </motion.p>

                {/* Name — morphs from card */}
                <motion.p
                  layoutId={`${selectedId}-name`}
                  style={{
                    margin: "0.6rem 0 0",
                    fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
                    fontWeight: 900,
                    color: "#ffffff",
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {selectedProject.name}
                </motion.p>

                {/* Extra detail — fades in only after layout animation completes */}
                <AnimatePresence initial={false}>
                  {detailVisible && (
                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p
                        style={{
                          marginTop: "1.6rem",
                          fontSize: "0.92rem",
                          lineHeight: 1.75,
                          color: "rgba(255,255,255,.62)",
                          maxWidth: "38ch",
                        }}
                      >
                        {selectedProject.description}
                      </p>

                      {/* Tags */}
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          marginTop: "1.6rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {selectedProject.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              padding: "0.3rem 0.85rem",
                              border: "1px solid rgba(255,255,255,.18)",
                              borderRadius: "100px",
                              fontSize: "0.7rem",
                              letterSpacing: "0.08em",
                              color: "rgba(255,255,255,.55)",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Close */}
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClose();
                        }}
                        style={{
                          marginTop: "2.5rem",
                          padding: "0.75rem 2.2rem",
                          background: "transparent",
                          border: "1px solid rgba(255,255,255,.35)",
                          color: "#ffffff",
                          cursor: "pointer",
                          fontSize: "0.72rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          fontFamily: "inherit",
                          borderRadius: "2px",
                          alignSelf: "flex-start",
                        }}
                      >
                        Close
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
