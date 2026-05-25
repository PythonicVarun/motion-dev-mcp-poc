import {
  useCallback,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  type MouseEvent,
} from "react";
import {
  motion,
  animate,
  motionValue,
  useMotionValue,
  useSpring,
  useReducedMotion,
  useMotionValueEvent,
  AnimatePresence,
  useScroll,
  useTransform,
} from "motion/react";
import type { MotionValue } from "motion/react";

// ─── Reduced-motion context ───────────────────────────────────────────────────
// Single top-level check; propagated to all children via this context.
const MotionCtx = createContext<{ reduced: boolean }>({ reduced: false });
const useMotionCtx = () => useContext(MotionCtx);

// ─── Constants ───────────────────────────────────────────────────────────────

const HEADING    = "WORKS";
const CHARS      = HEADING.split("");
const STAGGER    = 0.04;
const FLIP_DUR   = 0.55;
const BREATHE_AMP = 8;
const BREATHE_HZ  = 1.5;
const PHASE_STEP  = 0.65;
const ALL_IN_SEC  = (CHARS.length - 1) * STAGGER + FLIP_DUR + 0.15;

const FREQ_NEUTRAL  = 0.02;
const SCALE_NEUTRAL = 0;
const SPRING_CFG    = { stiffness: 60, damping: 20 };

// ─── Project data ─────────────────────────────────────────────────────────────

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

// ─── Clients carousel data ────────────────────────────────────────────────────

const CLIENTS = [
  { name: "Arc Studio", abbr: "AS", accent: "#7c3aed" },
  { name: "Meridian",   abbr: "ME", accent: "#db2777" },
  { name: "Forma",      abbr: "FM", accent: "#0891b2" },
  { name: "Luma",       abbr: "LM", accent: "#059669" },
  { name: "Strand",     abbr: "ST", accent: "#d97706" },
  { name: "Axis",       abbr: "AX", accent: "#6d28d9" },
  { name: "Veil",       abbr: "VL", accent: "#be185d" },
  { name: "Coda",       abbr: "CD", accent: "#0284c7" },
  { name: "Rune",       abbr: "RN", accent: "#16a34a" },
  { name: "Echo",       abbr: "EC", accent: "#c2410c" },
] as const;
type Client = (typeof CLIENTS)[number];

const C_W      = 220;
const C_H      = 140;
const C_GAP    = 24;
const C_STRIDE = C_W + C_GAP;
const C_N      = CLIENTS.length;
const C_COPIES = 5;
const C_MID    = Math.floor(C_COPIES / 2);

// ─── SVG wipe paths ───────────────────────────────────────────────────────────
// viewBox "0 0 100 100" + preserveAspectRatio="none" → coords are % of screen.
// All three paths share the same M C L L Z structure for clean d-attribute morph.
const WIPE_HIDDEN = "M 0 103 C 33 108 67 108 100 103 L 100 115 L 0 115 Z";
const WIPE_ARC    = "M 0 30  C 25 75  75 75  100 30  L 100 115 L 0 115 Z";
const WIPE_FULL   = "M 0 -8  C 33 -8  67 -8  100 -8  L 100 115 L 0 115 Z";

// ─── Contact section words ────────────────────────────────────────────────────

const CONTACT_WORDS = ["Let's", "build", "something", "unforgettable."];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function seededRand(seed: number): number {
  const n = Math.sin(seed * 9301 + 49297) * 233280;
  return Math.abs(n - Math.floor(n));
}

// ─── ContactSection ───────────────────────────────────────────────────────────

function ContactSection({
  active,
  onBack,
}: {
  active: boolean;
  onBack: () => void;
}) {
  const { reduced } = useMotionCtx();
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 55,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: active ? "all" : "none",
      }}
    >
      {/* Heading — words spring from seeded random offscreen positions */}
      <div style={{ textAlign: "center" }}>
        {CONTACT_WORDS.map((word, i) => {
          const rx = (seededRand(i * 3 + 7) - 0.5) * (reduced ? 0 : 700);
          const ry = (seededRand(i * 3 + 8) - 0.5) * (reduced ? 0 : 450);
          return (
            <motion.span
              key={word}
              initial={{ x: rx, y: ry, opacity: 0 }}
              animate={
                active
                  ? { x: 0, y: 0, opacity: 1 }
                  : { x: rx, y: ry, opacity: 0 }
              }
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 22,
                delay: i * 0.07,
              }}
              style={{
                display: "inline-block",
                marginRight: "0.28em",
                fontSize: "clamp(2.5rem, 5vw, 5.5rem)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                lineHeight: 1.1,
              }}
            >
              {word}
            </motion.span>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0, y: reduced ? 0 : 18 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : 18 }}
        transition={{ delay: CONTACT_WORDS.length * 0.07 + 0.1, duration: 0.5 }}
        style={{
          marginTop: "1.6rem",
          fontSize: "0.9rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.42)",
        }}
      >
        hello@studio.works
      </motion.p>

      <motion.button
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: CONTACT_WORDS.length * 0.07 + 0.42, duration: 0.4 }}
        whileHover={reduced ? {} : { scale: 1.04 }}
        whileTap={reduced ? {} : { scale: 0.96 }}
        onClick={onBack}
        style={{
          marginTop: "3rem",
          padding: "0.85rem 2.5rem",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.35)",
          color: "#ffffff",
          cursor: "pointer",
          fontSize: "0.72rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          borderRadius: "2px",
          outline: "none",
        }}
      >
        ← Back
      </motion.button>
    </div>
  );
}

// ─── ProcessSection ───────────────────────────────────────────────────────────

function ProcessSection() {
  const { reduced } = useMotionCtx();
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef    = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(420);
  const strokeDashoffset = useMotionValue(420);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Horizontal clip-path wipe
  const wipePct  = useTransform(scrollYProgress, [0, 0.1], [100, 0]);
  const clipPath = useTransform(wipePct, (v) => `inset(0 ${v.toFixed(1)}% 0 0)`);

  // 3-layer parallax — zero range when reduced so depth layers don't move
  const bgY  = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0]     : [40, -40]);
  const midY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0]     : [100, -100]);
  const fgY  = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0]     : [160, -160]);

  // Node pulse MotionValues
  const ns0 = useMotionValue(1), ns1 = useMotionValue(1), ns2 = useMotionValue(1);
  const ns3 = useMotionValue(1), ns4 = useMotionValue(1);
  const no0 = useMotionValue(0.3), no1 = useMotionValue(0.3), no2 = useMotionValue(0.3);
  const no3 = useMotionValue(0.3), no4 = useMotionValue(0.3);
  const nodeScales    = [ns0, ns1, ns2, ns3, ns4];
  const nodeOpacities = [no0, no1, no2, no3, no4];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const len = pathRef.current?.getTotalLength() ?? 420;
    setPathLen(len);
    strokeDashoffset.set(len);

    const computeThresholds = (): number[] => {
      const vpH           = window.innerHeight;
      const sectionDocTop = section.getBoundingClientRect().top + window.scrollY;
      const sectionH      = section.scrollHeight;
      const scrollStart   = sectionDocTop - vpH;
      const range         = sectionDocTop + sectionH - scrollStart;
      const h3s = [...section.querySelectorAll("h3")] as HTMLElement[];
      return ["Discover", "Define", "Design", "Develop", "Deploy"].map((title) => {
        const h3 = h3s.find((el) => el.textContent?.trim() === title);
        if (!h3) return 0.5;
        let el: HTMLElement | null = h3;
        while (el && !el.style?.minHeight) el = el.parentElement as HTMLElement | null;
        if (!el) return 0.5;
        const r = el.getBoundingClientRect();
        return (r.top + r.height / 2 + window.scrollY - vpH / 2 - scrollStart) / range;
      });
    };

    let thresholds = computeThresholds();
    const scales    = [ns0, ns1, ns2, ns3, ns4];
    const opacities = [no0, no1, no2, no3, no4];
    const HALF = 0.06;

    const unsub = scrollYProgress.on("change", (p) => {
      const t = Math.max(0, Math.min(1, (p - thresholds[0]) / (thresholds[4] - thresholds[0])));
      strokeDashoffset.set(len * (1 - t));
      thresholds.forEach((center, i) => {
        if (reduced) {
          scales[i].set(1);
          opacities[i].set(p > center - HALF && p < center + HALF ? 1 : 0.3);
        } else {
          const frac = Math.max(0, 1 - Math.abs(p - center) / HALF);
          scales[i].set(1 + frac * 0.85);
          opacities[i].set(0.3 + frac * 0.7);
        }
      });
    });

    const onResize = () => { thresholds = computeThresholds(); };
    window.addEventListener("resize", onResize);
    return () => { unsub(); window.removeEventListener("resize", onResize); };
  }, [reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.section
      ref={sectionRef}
      style={{ position: "relative", zIndex: 1, minHeight: "400vh", clipPath, overflow: "hidden" }}
    >
      <div style={{ padding: "5rem 3rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <p style={{ fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", margin: "0 0 0.75rem" }}>
          How We Work
        </p>
        <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 900, color: "#ffffff", margin: 0, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
          Process
        </h2>
      </div>

      <div style={{ display: "flex", padding: "0 3rem", maxWidth: "1200px", margin: "0 auto", gap: "2.5rem" }}>
        {/* Timeline column */}
        <div style={{ width: "80px", flexShrink: 0, position: "relative", alignSelf: "stretch" }}>
          <svg viewBox="0 0 100 500" preserveAspectRatio="none"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}>
            <path d={PROCESS_PATH} stroke="rgba(255,255,255,0.07)" strokeWidth="2" fill="none" />
            <motion.path ref={pathRef} d={PROCESS_PATH} stroke="rgba(139,92,246,0.8)"
              strokeWidth="2" fill="none" strokeLinecap="round"
              strokeDasharray={pathLen} style={{ strokeDashoffset }} />
          </svg>
          {NODE_CYS.map((cy, i) => (
            <div key={i}>
              <motion.div style={{
                position: "absolute", left: "50%", top: `${(cy / 500) * 100}%`,
                width: "28px", height: "28px", marginLeft: "-14px", marginTop: "-14px",
                borderRadius: "50%", border: "1px solid rgba(139,92,246,0.4)",
                scale: nodeScales[i], opacity: nodeOpacities[i], pointerEvents: "none",
              }} />
              <motion.div style={{
                position: "absolute", left: "50%", top: `${(cy / 500) * 100}%`,
                width: "12px", height: "12px", marginLeft: "-6px", marginTop: "-6px",
                borderRadius: "50%", background: "rgba(10,10,10,0.95)",
                border: "1.5px solid rgba(255,255,255,0.6)",
                scale: nodeScales[i], opacity: nodeOpacities[i], pointerEvents: "none",
              }} />
            </div>
          ))}
        </div>

        {/* Steps */}
        <div style={{ flex: 1 }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ minHeight: "76vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
              <motion.div style={{ position: "absolute", inset: "-30%", y: bgY, pointerEvents: "none" }}>
                <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at ${18 + i * 14}% 50%, rgba(139,92,246,0.09) 0%, transparent 65%)` }} />
              </motion.div>
              <motion.div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", pointerEvents: "none", y: midY }}>
                <span style={{ fontSize: "clamp(7rem, 20vw, 17rem)", fontWeight: 900, color: "rgba(255,255,255,0.028)", lineHeight: 1, letterSpacing: "-0.05em", userSelect: "none" }}>
                  {step.num}
                </span>
              </motion.div>
              <motion.div style={{ position: "relative", zIndex: 2, y: fgY }}>
                <p style={{ fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", margin: "0 0 1rem" }}>{step.num}</p>
                <h3 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 900, color: "#ffffff", lineHeight: 1.0, letterSpacing: "-0.03em", margin: "0 0 1.4rem" }}>{step.title}</h3>
                <p style={{ fontSize: "0.94rem", lineHeight: 1.8, color: "rgba(255,255,255,.52)", margin: 0, maxWidth: "42ch" }}>{step.body}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// ─── CarouselCard ─────────────────────────────────────────────────────────────

interface CarouselCardProps {
  client: Client;
  cardAbsX: number;
  trackX: MotionValue<number>;
}

function CarouselCard({ client, cardAbsX, trackX }: CarouselCardProps) {
  const { reduced } = useMotionCtx();
  const dist = useTransform(trackX, (x) => {
    return cardAbsX + C_W / 2 + x - window.innerWidth / 2;
  });
  const scale   = useTransform(dist, [-600, 0, 600], reduced ? [1, 1, 1]           : [0.82, 1.18, 0.82]);
  const opacity = useTransform(dist, [-600, 0, 600],                                  [0.30, 1.0, 0.30]);
  const rotateY = useTransform(dist, [-400, 0, 400], reduced ? [0, 0, 0]           : [15, 0, -15]);

  return (
    <motion.div
      style={{
        position: "absolute", left: cardAbsX, top: 0, width: C_W, height: C_H,
        borderRadius: "12px", background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(12px)",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: "0.6rem",
        scale, opacity, rotateY, transformPerspective: 900,
        userSelect: "none", pointerEvents: "none",
      }}
    >
      <div style={{
        width: "44px", height: "44px", borderRadius: "50%",
        background: `${client.accent}22`, border: `1.5px solid ${client.accent}66`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", color: client.accent, flexShrink: 0,
      }}>
        {client.abbr}
      </div>
      <p style={{ margin: 0, fontSize: "0.66rem", fontWeight: 500, letterSpacing: "0.12em", color: "rgba(255,255,255,0.58)", textTransform: "uppercase" }}>
        {client.name}
      </p>
    </motion.div>
  );
}

// ─── ClientsCarousel ──────────────────────────────────────────────────────────

function ClientsCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackX       = useMotionValue(0);
  const [ready, setReady] = useState(false);

  const startRef   = useRef({ x: 0, y: 0, tx: 0 });
  const recentPts  = useRef<Array<{ x: number; t: number }>>([]);
  const isDragging = useRef(false);
  const dirLocked  = useRef<"h" | "v" | null>(null);
  const inertiaRaf = useRef(0);
  const snapAnim   = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    trackX.set(w / 2 - (C_MID * C_N * C_STRIDE + C_W / 2));
    setReady(true);
  }, [trackX]);

  const normalize = useCallback((w: number) => {
    const curr   = trackX.get();
    const refX   = w / 2 - (C_MID * C_N * C_STRIDE + C_W / 2);
    const cycles = Math.round((curr - refX) / (C_N * C_STRIDE));
    if (Math.abs(cycles) >= 1) trackX.set(curr - cycles * C_N * C_STRIDE);
  }, [trackX]);

  const doSnap = useCallback(() => {
    const w      = containerRef.current?.offsetWidth ?? window.innerWidth;
    const x      = trackX.get();
    const viewCx = w / 2;
    let nearest  = C_MID * C_N;
    let minDist  = Infinity;
    for (let i = 0; i < C_N * C_COPIES; i++) {
      const d = Math.abs(i * C_STRIDE + C_W / 2 + x - viewCx);
      if (d < minDist) { minDist = d; nearest = i; }
    }
    const targetX = viewCx - (nearest * C_STRIDE + C_W / 2);
    snapAnim.current = animate(trackX, targetX, {
      type: "spring", stiffness: 300, damping: 30,
      onComplete: () => normalize(w),
    });
  }, [trackX, normalize]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(inertiaRaf.current);
    snapAnim.current?.stop();
    startRef.current  = { x: e.clientX, y: e.clientY, tx: trackX.get() };
    recentPts.current = [{ x: e.clientX, t: Date.now() }];
    isDragging.current = false;
    dirLocked.current  = null;
  }, [trackX]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const s  = startRef.current;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!dirLocked.current) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      dirLocked.current = Math.abs(dx) >= Math.abs(dy) ? "h" : "v";
      if (dirLocked.current === "h") {
        isDragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    }
    if (dirLocked.current !== "h") return;
    trackX.set(s.tx + dx);
    const pts = recentPts.current;
    pts.push({ x: e.clientX, t: Date.now() });
    if (pts.length > 5) pts.shift();
  }, [trackX]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) { dirLocked.current = null; return; }
    isDragging.current = false;
    dirLocked.current  = null;
    const pts = recentPts.current;
    let vel = 0;
    if (pts.length >= 2) {
      const first = pts[0], last = pts[pts.length - 1];
      const dt = last.t - first.t;
      if (dt > 0 && dt < 300) vel = ((last.x - first.x) / dt) * 16;
    }
    vel = Math.max(-300, Math.min(300, vel));
    if (Math.abs(vel) < 0.5) { doSnap(); return; }
    const decay = () => {
      vel *= 0.95;
      if (Math.abs(vel) < 0.5) { doSnap(); return; }
      trackX.set(trackX.get() + vel);
      inertiaRaf.current = requestAnimationFrame(decay);
    };
    inertiaRaf.current = requestAnimationFrame(decay);
  }, [trackX, doSnap]);

  useEffect(() => () => {
    cancelAnimationFrame(inertiaRaf.current);
    snapAnim.current?.stop();
  }, []);

  const cards: Array<{ key: string; client: Client; cardAbsX: number }> = [];
  for (let c = 0; c < C_COPIES; c++) {
    for (let i = 0; i < C_N; i++) {
      cards.push({ key: `${c}-${i}`, client: CLIENTS[i], cardAbsX: (c * C_N + i) * C_STRIDE });
    }
  }

  const EXTRA = 50;

  return (
    <section style={{ position: "relative", zIndex: 1, padding: "6rem 0 8rem", overflow: "hidden", opacity: ready ? 1 : 0, transition: "opacity 0.3s" }}>
      <div style={{ padding: "0 3rem", maxWidth: "1200px", margin: "0 auto 3.5rem" }}>
        <p style={{ fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", margin: "0 0 0.75rem" }}>Trusted By</p>
        <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 900, color: "#ffffff", margin: 0, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Clients</h2>
      </div>
      <div ref={containerRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}
        style={{ position: "relative", height: C_H + EXTRA, touchAction: "pan-y", cursor: "grab" }}>
        <motion.div style={{ position: "absolute", top: EXTRA / 2, left: 0, width: C_N * C_COPIES * C_STRIDE, height: C_H, x: trackX }}>
          {cards.map(({ key, client, cardAbsX }) => (
            <CarouselCard key={key} client={client} cardAbsX={cardAbsX} trackX={trackX} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── ImmersivePortfolio ───────────────────────────────────────────────────────

type Phase =
  | "content"
  | "scatter-out"
  | "wipe-in"
  | "contact"
  | "wipe-out"
  | "scatter-in";

export function ImmersivePortfolio() {
  // ── Reduced motion — single check, propagated via context ────────────────
  const reduced = useReducedMotion() ?? false;

  // ── Card selection ───────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;
  const selectedProject = PROJECTS.find((p) => p.id === selectedId) ?? null;

  // ── Hero breathing wave ──────────────────────────────────────────────────
  const [subVisible, setSubVisible] = useState(false);
  const rafRef = useRef<number>(0);
  const t0Ref  = useRef<number>(0);

  const charYsRef = useRef<MotionValue<number>[] | null>(null);
  if (!charYsRef.current) charYsRef.current = CHARS.map(() => motionValue(0));
  const charYs = charYsRef.current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSubVisible(true);
      if (reduced) return; // no movement in reduced mode
      t0Ref.current = performance.now();
      const tick = (now: number) => {
        const t = (now - t0Ref.current) / 1000;
        for (let i = 0; i < CHARS.length; i++) {
          charYs[i].set(Math.sin(t * BREATHE_HZ * Math.PI * 2 + i * PHASE_STEP) * BREATHE_AMP);
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, ALL_IN_SEC * 1000);
    return () => { clearTimeout(timer); cancelAnimationFrame(rafRef.current); };
  }, [reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── SVG filter ──────────────────────────────────────────────────────────
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const targetFreq  = useMotionValue(FREQ_NEUTRAL);
  const targetScale = useMotionValue(SCALE_NEUTRAL);
  const freqSpring  = useSpring(targetFreq,  SPRING_CFG);
  const scaleSpring = useSpring(targetScale, SPRING_CFG);

  useMotionValueEvent(freqSpring,  "change", (v) => { turbRef.current?.setAttribute("baseFrequency", `${v.toFixed(4)} 0.04`); });
  useMotionValueEvent(scaleSpring, "change", (v) => { dispRef.current?.setAttribute("scale", v.toFixed(2)); });

  useEffect(() => {
    if (selectedId) { targetFreq.set(FREQ_NEUTRAL); targetScale.set(SCALE_NEUTRAL); }
  }, [selectedId, targetFreq, targetScale]);

  // ── Mouse handlers ───────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (selectedIdRef.current || reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    targetFreq.set(0.01 + (e.clientX - rect.left) / rect.width * 0.07);
    targetScale.set((e.clientY - rect.top) / rect.height * 40);
  }, [reduced, targetFreq, targetScale]);

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

  // ── Global scroll progress bar ───────────────────────────────────────────
  const { scrollYProgress } = useScroll();
  const progressScaleX = useTransform(scrollYProgress, (t) => {
    if (reduced) return t;
    // easeInOutCubic: slow at start/end, accelerates through middle content
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  });

  // ── Contact transition phase & block MotionValues ─────────────────────────
  const [phase, setPhase] = useState<Phase>("content");

  const bx0 = useMotionValue(0), by0 = useMotionValue(0), bo0 = useMotionValue(1);
  const bx1 = useMotionValue(0), by1 = useMotionValue(0), bo1 = useMotionValue(1);
  const bx2 = useMotionValue(0), by2 = useMotionValue(0), bo2 = useMotionValue(1);

  const wipePath = useMotionValue(WIPE_HIDDEN);

  // Phase state machine — drives scatter, wipe, and restore in sequence
  useEffect(() => {
    if (phase === "scatter-out") {
      const vw = window.innerWidth, vh = window.innerHeight;
      const dirs = [
        [vw * 1.25, vh * -0.28],
        [-vw * 1.15, vh * 0.18],
        [vw * 0.75,  vh * 1.15],
      ];
      const blocks: [MotionValue<number>, MotionValue<number>, MotionValue<number>][] = [
        [bx0, by0, bo0], [bx1, by1, bo1], [bx2, by2, bo2],
      ];
      blocks.forEach(([x, y, o], i) => {
        const delay = i * 60;
        setTimeout(() => {
          if (reduced) {
            animate(o, 0, { duration: 0.25 });
          } else {
            animate(x, dirs[i][0], { duration: 0.55, ease: [0.4, 0, 1, 1] });
            animate(y, dirs[i][1], { duration: 0.55, ease: [0.4, 0, 1, 1] });
            animate(o, 0,          { duration: 0.3,  ease: [0.4, 0, 1, 1] });
          }
        }, delay);
      });
      setTimeout(() => setPhase("wipe-in"), reduced ? 350 : 720);
    }

    if (phase === "wipe-in") {
      if (reduced) {
        // Instant: opacity-only overlay already covers via contact section opacity
        setTimeout(() => setPhase("contact"), 80);
        return;
      }
      // @ts-ignore
      animate(wipePath, [WIPE_HIDDEN, WIPE_ARC, WIPE_FULL], {
        duration: 0.95,
        times: [0, 0.52, 1],
        ease: "easeInOut",
        onComplete: () => setPhase("contact"),
      } as Parameters<typeof animate>[2]);
    }

    if (phase === "wipe-out") {
      if (reduced) {
        setTimeout(() => setPhase("scatter-in"), 80);
        return;
      }
      // @ts-ignore
      animate(wipePath, [WIPE_FULL, WIPE_ARC, WIPE_HIDDEN], {
        duration: 0.75,
        times: [0, 0.48, 1],
        ease: "easeInOut",
        onComplete: () => setPhase("scatter-in"),
      } as Parameters<typeof animate>[2]);
    }

    if (phase === "scatter-in") {
      const blocks: [MotionValue<number>, MotionValue<number>, MotionValue<number>][] = [
        [bx0, by0, bo0], [bx1, by1, bo1], [bx2, by2, bo2],
      ];
      blocks.forEach(([x, y, o], i) => {
        setTimeout(() => {
          if (reduced) {
            animate(o, 1, { duration: 0.25 });
          } else {
            animate(x, 0, { type: "spring", stiffness: 95,  damping: 22 });
            animate(y, 0, { type: "spring", stiffness: 95,  damping: 22 });
            animate(o, 1, { duration: 0.45 });
          }
        }, i * 65);
      });
      setTimeout(() => setPhase("content"), reduced ? 350 : 720);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reduced]);

  // Lock scroll during transition so mid-flight sections don't ghost
  useEffect(() => {
    const locked = phase !== "content";
    document.body.style.overflow = locked ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [phase]);

  const startContact = useCallback(() => {
    if (phase !== "content") return;
    setPhase("scatter-out");
  }, [phase]);

  const startRestore = useCallback(() => {
    if (phase !== "contact") return;
    wipePath.set(WIPE_FULL);
    setPhase("wipe-out");
  }, [phase, wipePath]);

  // Scroll-triggered contact: IntersectionObserver on a sentinel at page bottom
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || phase !== "content") return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { observer.disconnect(); startContact(); } },
      { threshold: 1.0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [phase, startContact]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <MotionCtx.Provider value={{ reduced }}>
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ position: "relative", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", userSelect: "none", background: "#0a0a0a" }}
      >
        {/* ── Scroll progress bar ────────────────────────────── */}
        <motion.div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, height: "2px",
            background: "linear-gradient(to right, #7c3aed, #ec4899, #3b82f6)",
            transformOrigin: "left center",
            scaleX: progressScaleX,
            zIndex: 200,
            pointerEvents: "none",
          }}
        />

        {/* ── SVG filter ─────────────────────────────────────── */}
        <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
          <defs>
            <filter id="liquid-distort" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
              <feTurbulence ref={turbRef} type="fractalNoise" baseFrequency="0.02 0.04" numOctaves="6" seed="3" result="noise" />
              <feColorMatrix in="noise" type="matrix" values="0.14 0 0 0 0.43  0 0.14 0 0 0.43  0 0 0.14 0 0.43  0 0 0 1 0" result="subtleNoise" />
              <feBlend in="SourceGraphic" in2="subtleNoise" mode="soft-light" result="textured" />
              <feDisplacementMap ref={dispRef} in="textured" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>

        {/* ── Fixed background ───────────────────────────────── */}
        <div aria-hidden="true" style={{
          position: "fixed", inset: "-5%",
          background: `radial-gradient(ellipse at 22% 38%,rgba(139,92,246,.90) 0%,transparent 52%),
            radial-gradient(ellipse at 80% 65%,rgba(236,72,153,.75) 0%,transparent 48%),
            radial-gradient(ellipse at 58% 18%,rgba(16,185,129,.55) 0%,transparent 42%),
            radial-gradient(ellipse at 12% 88%,rgba(245,158,11,.45) 0%,transparent 38%),
            radial-gradient(ellipse at 90% 10%,rgba(59,130,246,.50) 0%,transparent 40%),
            linear-gradient(148deg,#0f0c29 0%,#302b63 52%,#24243e 100%)`,
          filter: "url(#liquid-distort)", willChange: "filter", zIndex: 0,
        }} />
        <div aria-hidden="true" style={{
          position: "fixed", inset: 0,
          background: "radial-gradient(ellipse at 50% 50%,rgba(10,10,10,.30) 0%,rgba(10,10,10,.72) 100%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        {/* ── Block 0: Hero + Projects ────────────────────────── */}
        <motion.div style={{ x: bx0, y: by0, opacity: bo0, position: "relative" }}>
          {/* Hero */}
          <motion.section layout transition={{ type: "spring", stiffness: 100, damping: 28 }}
            style={{ position: "relative", zIndex: 1, minHeight: selectedId ? "38vh" : "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <div aria-label={HEADING} style={{ display: "flex", alignItems: "center" }}>
              {CHARS.map((char, i) => {
                const flipFrom = seededRand(i) > 0.5 ? 90 : -90;
                return (
                  <div key={i} aria-hidden="true" style={{ perspective: "700px" }}>
                    <motion.span
                      initial={reduced ? { opacity: 0 } : { rotateX: flipFrom, opacity: 0 }}
                      animate={reduced ? { opacity: 1 } : { rotateX: 0, opacity: 1 }}
                      transition={reduced
                        ? { duration: 0.25, delay: i * 0.02 }
                        : { duration: FLIP_DUR, delay: i * STAGGER, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        display: "block",
                        fontSize: selectedId ? "clamp(2rem, 8vw, 6rem)" : "clamp(4rem, 19vw, 15rem)",
                        fontWeight: 900, color: "#ffffff", lineHeight: 0.88,
                        letterSpacing: "-0.03em", transformOrigin: "50% 50%",
                        y: charYs[i], paddingInline: "0.025em",
                        textShadow: "0 2px 40px rgba(255,255,255,.12)",
                      }}
                    >
                      {char}
                    </motion.span>
                  </div>
                );
              })}
            </div>

            <motion.p
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={subVisible ? { opacity: 1, y: 0 } : reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              style={{ marginTop: "3rem", marginBottom: "2.5rem", marginLeft: 0, marginRight: 0, fontSize: "clamp(0.7rem, 1.8vw, 1.05rem)", fontWeight: 300, letterSpacing: "0.38em", textTransform: "uppercase", color: "rgba(255,255,255,.55)" }}
            >
              Selected Works &amp; Experiments
            </motion.p>

            <motion.button
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={subVisible ? { opacity: 1, y: 0 } : reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduced ? {} : { scale: 1.04 }}
              whileTap={reduced ? {} : { scale: 0.96 }}
              style={{ padding: "1rem 3rem", fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#ffffff", background: "transparent", border: "1px solid rgba(255,255,255,.45)", borderRadius: "1px", cursor: "pointer", fontFamily: "inherit", outline: "none" }}
              onClick={startContact}
            >
              Explore
            </motion.button>
          </motion.section>

          {/* Projects */}
          <motion.section layout style={{ position: "relative", zIndex: 1, padding: "5rem 3rem 6rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", maxWidth: "1200px", margin: "0 auto" }}>
              {PROJECTS.map((project) => (
                <motion.div key={project.id} layoutId={`${project.id}-card`}
                  onClick={() => handleCardClick(project.id)}
                  animate={{
                    scale: selectedId && selectedId !== project.id ? 0.94 : 1,
                    opacity: selectedId && selectedId !== project.id ? 0.45 : 1,
                    filter: selectedId && selectedId !== project.id ? "blur(3px) brightness(0.55)" : "blur(0px) brightness(1)",
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 28 }}
                  style={{ cursor: selectedId ? "default" : "pointer", borderRadius: "10px", overflow: "hidden", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", backdropFilter: "blur(8px)" }}
                >
                  <motion.div layoutId={`${project.id}-image`} style={{ height: "180px", background: project.gradient, flexShrink: 0 }} />
                  <div style={{ padding: "1.1rem 1.25rem 1.4rem" }}>
                    <motion.p layoutId={`${project.id}-category`} style={{ margin: 0, fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", fontWeight: 400 }}>{project.category}</motion.p>
                    <motion.p layoutId={`${project.id}-name`} style={{ margin: "0.4rem 0 0", fontSize: "1.05rem", fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>{project.name}</motion.p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </motion.div>

        {/* ── Block 1: Process ─────────────────────────────────── */}
        <motion.div style={{ x: bx1, y: by1, opacity: bo1, position: "relative" }}>
          <ProcessSection />
        </motion.div>

        {/* ── Block 2: Clients carousel ────────────────────────── */}
        <motion.div style={{ x: bx2, y: by2, opacity: bo2, position: "relative" }}>
          <ClientsCarousel />
        </motion.div>

        {/* ── Scroll sentinel: triggers contact on scroll-to-bottom ─ */}
        <div ref={sentinelRef} style={{ height: "1px", position: "relative", zIndex: 1 }} />

        {/* ── SVG wipe overlay ──────────────────────────────────── */}
        {!reduced && (
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 50, pointerEvents: "none" }}
          >
            <motion.path style={{ d: wipePath }} fill="#0a0a0a" />
          </svg>
        )}

        {/* ── Contact section ───────────────────────────────────── */}
        <ContactSection active={phase === "contact"} onBack={startRestore} />

        {/* ── Fullscreen card detail overlay ────────────────────── */}
        <AnimatePresence>
          {selectedId && selectedProject && (
            <>
              <motion.div key="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }} onClick={handleClose}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.80)", zIndex: 99, cursor: "pointer" }} />

              <motion.div layoutId={`${selectedId}-card`}
                onLayoutAnimationComplete={() => { if (selectedIdRef.current) setDetailVisible(true); }}
                style={{ position: "fixed", top: "5vh", left: "5vw", width: "90vw", height: "88vh", zIndex: 100, borderRadius: "14px", overflow: "hidden", background: "rgba(12,12,18,.97)", display: "flex", flexDirection: "row" }}>
                <motion.div layoutId={`${selectedId}-image`} style={{ width: "48%", background: selectedProject.gradient, flexShrink: 0 }} />
                <div style={{ flex: 1, padding: "3.5rem 3rem", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
                  <motion.p layoutId={`${selectedId}-category`} style={{ margin: 0, fontSize: "0.72rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,.48)" }}>{selectedProject.category}</motion.p>
                  <motion.p layoutId={`${selectedId}-name`} style={{ margin: "0.6rem 0 0", fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 900, color: "#ffffff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{selectedProject.name}</motion.p>
                  <AnimatePresence initial={false}>
                    {detailVisible && (
                      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
                        <p style={{ marginTop: "1.6rem", fontSize: "0.92rem", lineHeight: 1.75, color: "rgba(255,255,255,.62)", maxWidth: "38ch" }}>{selectedProject.description}</p>
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.6rem", flexWrap: "wrap" }}>
                          {selectedProject.tags.map((tag) => (
                            <span key={tag} style={{ padding: "0.3rem 0.85rem", border: "1px solid rgba(255,255,255,.18)", borderRadius: "100px", fontSize: "0.7rem", letterSpacing: "0.08em", color: "rgba(255,255,255,.55)" }}>{tag}</span>
                          ))}
                        </div>
                        <motion.button whileHover={reduced ? {} : { scale: 1.04 }} whileTap={reduced ? {} : { scale: 0.96 }}
                          onClick={(e) => { e.stopPropagation(); handleClose(); }}
                          style={{ marginTop: "2.5rem", padding: "0.75rem 2.2rem", background: "transparent", border: "1px solid rgba(255,255,255,.35)", color: "#ffffff", cursor: "pointer", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "inherit", borderRadius: "2px", alignSelf: "flex-start" }}>
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
    </MotionCtx.Provider>
  );
}
