import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  animate,
  motion,
  useScroll,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import type { MotionValue } from "motion/react";

const HERO_TITLE = "WORKS";
const STAGGER_SECONDS = 0.04;
const ENTRANCE_SECONDS = 0.88;
const BREATH_AMPLITUDE = 10;
const BREATH_SPEED = 1.8;
const WAVE_OFFSET = 0.48;
const NEUTRAL_FREQUENCY_X = 0.02;
const MAX_FREQUENCY_X = 0.08;
const MIN_FREQUENCY_X = 0.01;
const MAX_DISPLACEMENT = 40;
const NEUTRAL_CURSOR_X = (NEUTRAL_FREQUENCY_X - MIN_FREQUENCY_X) / (MAX_FREQUENCY_X - MIN_FREQUENCY_X);
const LIQUID_SPRING = { stiffness: 60, damping: 20 };
const LAYOUT_TRANSITION = { type: "spring", stiffness: 220, damping: 28 } as const;
const HERO_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1200">
    <defs>
      <linearGradient id="sky" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#201515" />
        <stop offset="45%" stop-color="#593226" />
        <stop offset="100%" stop-color="#0c111d" />
      </linearGradient>
      <radialGradient id="flare" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#ff9e4a" stop-opacity="0.9" />
        <stop offset="45%" stop-color="#ff6a3d" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#ff6a3d" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="panel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f4dfcb" stop-opacity="0.92" />
        <stop offset="100%" stop-color="#8e5a48" stop-opacity="0.7" />
      </linearGradient>
    </defs>
    <rect width="1600" height="1200" fill="url(#sky)" />
    <circle cx="1040" cy="280" r="320" fill="url(#flare)" />
    <g opacity="0.95">
      <rect x="160" y="220" width="460" height="680" rx="40" fill="url(#panel)" transform="rotate(-8 390 560)" />
      <rect x="540" y="160" width="400" height="780" rx="38" fill="#121927" fill-opacity="0.9" transform="rotate(4 740 550)" />
      <rect x="920" y="250" width="520" height="630" rx="48" fill="#e6b693" fill-opacity="0.84" transform="rotate(-6 1180 565)" />
    </g>
    <g stroke="#fbe8d7" stroke-opacity="0.24" fill="none">
      <path d="M95 970C310 790 516 831 726 660s321-322 779-259" stroke-width="10" />
      <path d="M180 1048c179-121 354-149 533-90 180 59 345 32 625-94" stroke-width="6" />
    </g>
  </svg>
`)}`;

type Project = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  image: string;
};

type ProjectSeed = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  palette: [string, string, string];
};

type ProcessStep = {
  id: string;
  phase: string;
  title: string;
  description: string;
  nodeLeft: number;
  nodeTop: number;
  cardSide: "left" | "right";
  backgroundImage: string;
  illustrationImage: string;
};

type ProcessStepSeed = {
  id: string;
  phase: string;
  title: string;
  description: string;
  palette: [string, string, string];
  nodeLeft: number;
  nodeTop: number;
  cardSide: "left" | "right";
};

type ClientLogo = {
  id: string;
  name: string;
  mark: string;
  sector: string;
  palette: [string, string, string];
};

function createProjectImage(
  name: string,
  category: string,
  [primary, secondary, accent]: ProjectSeed["palette"],
) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${secondary}" />
        </linearGradient>
        <radialGradient id="flare" cx="68%" cy="22%" r="52%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.92" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="900" rx="56" fill="url(#bg)" />
      <circle cx="910" cy="210" r="260" fill="url(#flare)" />
      <g opacity="0.92">
        <rect x="104" y="124" width="364" height="560" rx="38" fill="rgba(255,255,255,0.12)" transform="rotate(-9 286 404)" />
        <rect x="418" y="92" width="348" height="650" rx="42" fill="rgba(255,255,255,0.18)" transform="rotate(6 592 417)" />
        <rect x="736" y="168" width="306" height="486" rx="34" fill="rgba(15,15,18,0.36)" transform="rotate(-8 889 411)" />
      </g>
      <g fill="none" stroke="rgba(255,255,255,0.2)">
        <path d="M94 744c203-148 384-170 560-76 176 94 326 99 450 28" stroke-width="7" />
        <path d="M142 810c168-78 324-101 468-68 144 33 297 16 464-78" stroke-width="3" />
      </g>
      <text x="100" y="748" fill="rgba(255,255,255,0.94)" font-size="104" font-family="Segoe UI, sans-serif" font-weight="800" letter-spacing="-4">${name}</text>
      <text x="106" y="822" fill="rgba(255,255,255,0.66)" font-size="30" font-family="Segoe UI, sans-serif" letter-spacing="8">${category.toUpperCase()}</text>
    </svg>
  `)}`;
}

function createProcessBackground(
  title: string,
  [primary, secondary, accent]: ProcessStepSeed["palette"],
) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${secondary}" />
        </linearGradient>
        <radialGradient id="flare" cx="72%" cy="18%" r="48%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.88" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="900" rx="48" fill="url(#bg)" />
      <circle cx="960" cy="180" r="280" fill="url(#flare)" />
      <g fill="none" stroke="rgba(255,255,255,0.16)">
        <path d="M88 646c164-104 309-122 433-54 124 68 247 76 574-38" stroke-width="8" />
        <path d="M100 726c148-58 275-70 380-36 105 34 240 22 544-76" stroke-width="3" />
      </g>
      <text x="86" y="162" fill="rgba(255,255,255,0.14)" font-size="146" font-family="Segoe UI, sans-serif" font-weight="800" letter-spacing="-6">${title}</text>
    </svg>
  `)}`;
}

function createProcessIllustration(
  [primary, secondary, accent]: ProcessStepSeed["palette"],
) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
      <defs>
        <linearGradient id="shape" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.92" />
          <stop offset="100%" stop-color="${secondary}" stop-opacity="0.4" />
        </linearGradient>
      </defs>
      <g opacity="0.95">
        <path d="M111 264c0-88 60-163 146-163 61 0 93 26 139 26 54 0 133-37 133 76 0 89-68 166-179 166-139 0-239-28-239-105Z" fill="url(#shape)" />
        <rect x="122" y="88" width="362" height="214" rx="36" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="12" />
        <path d="M168 311c43-56 84-83 123-83 40 0 72 29 104 29 32 0 64-20 114-67" fill="none" stroke="rgba(255,255,255,0.34)" stroke-width="10" stroke-linecap="round" />
      </g>
      <circle cx="492" cy="118" r="16" fill="${primary}" fill-opacity="0.85" />
    </svg>
  `)}`;
}

const PROJECTS: Project[] = ([
  {
    id: "atlas-frame",
    name: "Atlas Frame",
    category: "Campaign System",
    description:
      "A motion-first portfolio system for a global design studio, combining modular storytelling blocks with tactile media transitions and live editorial sequencing.",
    tags: ["Motion Direction", "React", "Narrative UX"],
    palette: ["#20141a", "#694035", "#ff7f4d"],
  },
  {
    id: "northstar",
    name: "Northstar",
    category: "Brand Platform",
    description:
      "An immersive launch surface for a fashion label, pairing oversized typography, fluid imagery, and spatial transitions across lookbooks and commerce entry points.",
    tags: ["Art Direction", "Motion Systems", "Commerce"],
    palette: ["#121824", "#28526d", "#7fd2ff"],
  },
  {
    id: "cinder",
    name: "Cinder",
    category: "Editorial Experience",
    description:
      "A cinematic magazine interface where long-form pieces unfold through layered media, responsive pacing, and atmospheric motion cues.",
    tags: ["Editorial", "Prototyping", "Design Engineering"],
    palette: ["#180f12", "#5d2b2e", "#ffaf6d"],
  },
  {
    id: "aeris",
    name: "Aeris",
    category: "Spatial Showcase",
    description:
      "A high-gloss environment for architectural work, designed to make still renders feel physical through depth, inertia, and measured reveal timing.",
    tags: ["Architecture", "3D-ready UI", "Interaction"],
    palette: ["#0e1620", "#2b3e59", "#8cd7ff"],
  },
  {
    id: "sonder",
    name: "Sonder",
    category: "Film Archive",
    description:
      "A living archive for moving image projects with expandable credits, programmable motion choreography, and a timeline tuned for browsing and discovery.",
    tags: ["Archive", "Media Systems", "Type"],
    palette: ["#191612", "#5a4a38", "#f6d189"],
  },
  {
    id: "fluxline",
    name: "Fluxline",
    category: "Interactive Identity",
    description:
      "A responsive identity lab where every surface reacts to presence, using soft physics, liquid distortion, and adaptive layouts to keep the brand in motion.",
    tags: ["Identity", "Motion.dev", "Frontend"],
    palette: ["#13131c", "#3a2c64", "#8f90ff"],
  },
 ] satisfies ProjectSeed[]).map((project) => ({
  ...project,
  image: createProjectImage(project.name, project.category, project.palette),
}));

const CLIENT_LOGOS: ClientLogo[] = [
  { id: "solstice", name: "Solstice", mark: "SO", sector: "Fashion House", palette: ["#171118", "#4e2945", "#ff9c6e"] },
  { id: "meridian", name: "Meridian", mark: "ME", sector: "Spatial Studio", palette: ["#101722", "#214f65", "#8ad9ff"] },
  { id: "stanza", name: "Stanza", mark: "ST", sector: "Editorial Lab", palette: ["#181210", "#554434", "#f3c987"] },
  { id: "orbit", name: "Orbit", mark: "OR", sector: "Media Network", palette: ["#111320", "#303e72", "#9eabff"] },
  { id: "hinter", name: "Hinter", mark: "HI", sector: "Architecture", palette: ["#15151a", "#504b5c", "#d7dde9"] },
  { id: "fenne", name: "Fenne", mark: "FE", sector: "Product Brand", palette: ["#180f12", "#66363f", "#ffad83"] },
  { id: "vellum", name: "Vellum", mark: "VE", sector: "Publishing", palette: ["#111620", "#2e5066", "#84d0f4"] },
  { id: "kinetic", name: "Kinetic", mark: "KI", sector: "Motion Lab", palette: ["#15111c", "#4a2e74", "#a695ff"] },
  { id: "north", name: "North", mark: "NO", sector: "Venture Studio", palette: ["#151412", "#4f4a3a", "#f4d28e"] },
  { id: "luma", name: "Luma", mark: "LU", sector: "Film Collective", palette: ["#131017", "#5e3346", "#ff8d78"] },
];

const CLIENT_CARD_WIDTH = 216;
const CLIENT_CARD_GAP = 18;
const CLIENT_CARD_SPAN = CLIENT_CARD_WIDTH + CLIENT_CARD_GAP;

const PROCESS_STEPS: ProcessStep[] = ([
  {
    id: "discover",
    phase: "Step 01",
    title: "Discover",
    description:
      "We map the emotional arc first: what the user should feel, where attention should peak, and which moments deserve silence instead of motion.",
    palette: ["#16101b", "#4a2b35", "#ff8e5b"],
    nodeLeft: 48,
    nodeTop: 10,
    cardSide: "left",
  },
  {
    id: "structure",
    phase: "Step 02",
    title: "Structure",
    description:
      "Narrative beats turn into layouts, grids, pacing rules, and content modules so the portfolio can stretch without losing rhythm.",
    palette: ["#121724", "#274d62", "#77d7ff"],
    nodeLeft: 57,
    nodeTop: 29,
    cardSide: "right",
  },
  {
    id: "prototype",
    phase: "Step 03",
    title: "Prototype",
    description:
      "We build tactile transitions early, stress-testing reveal choreography, scroll velocity, and the exact handoff between sections.",
    palette: ["#160f12", "#5b2a2f", "#ffaf77"],
    nodeLeft: 44,
    nodeTop: 49,
    cardSide: "left",
  },
  {
    id: "choreograph",
    phase: "Step 04",
    title: "Choreograph",
    description:
      "Every interaction gets tuned as a system: enter timings, breathing loops, parallax depth, liquid image response, and recovery states.",
    palette: ["#101723", "#2f3a5d", "#86b9ff"],
    nodeLeft: 56,
    nodeTop: 69,
    cardSide: "right",
  },
  {
    id: "launch",
    phase: "Step 05",
    title: "Launch",
    description:
      "The final layer is resilience: responsive polish, production constraints, and preserving the cinematic feeling once real content lands.",
    palette: ["#171411", "#5b4834", "#f3c47b"],
    nodeLeft: 49,
    nodeTop: 88,
    cardSide: "left",
  },
 ] satisfies ProcessStepSeed[]).map((step) => ({
  ...step,
  backgroundImage: createProcessBackground(step.title, step.palette),
  illustrationImage: createProcessIllustration(step.palette),
}));

function createSeededRandom(seed: number) {
  let state = (seed + 1) * 1779033703;

  return () => {
    state += 0x6d2b79f5;
    let hashed = Math.imul(state ^ (state >>> 15), 1 | state);
    hashed ^= hashed + Math.imul(hashed ^ (hashed >>> 7), 61 | hashed);
    return ((hashed ^ (hashed >>> 14)) >>> 0) / 4294967296;
  };
}

function getCharacterDirection(index: number) {
  const random = createSeededRandom(index);
  return random() > 0.5 ? 1 : -1;
}

type AnimatedCharacterProps = {
  character: string;
  index: number;
  timeline: MotionValue<number>;
};

function AnimatedCharacter({
  character,
  index,
  timeline,
}: AnimatedCharacterProps) {
  const direction = useMemo(() => getCharacterDirection(index), [index]);
  const breatheY = useTransform(timeline, (value) => {
    const phase = value * BREATH_SPEED + index * WAVE_OFFSET;
    return Math.sin(phase) * BREATH_AMPLITUDE;
  });

  return (
    <motion.span
      style={{
        display: "inline-block",
        y: breatheY,
        marginRight: character === " " ? "0.3em" : "0.02em",
      }}
    >
      <motion.span
        initial={{
          opacity: 0,
          rotateX: direction * 96,
          y: direction * 52,
          filter: "blur(10px)",
        }}
        animate={{
          opacity: 1,
          rotateX: 0,
          y: 0,
          filter: "blur(0px)",
        }}
        transition={{
          delay: index * STAGGER_SECONDS,
          duration: ENTRANCE_SECONDS,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          display: "inline-block",
          minWidth: character === " " ? "0.32em" : undefined,
          transformOrigin: direction > 0 ? "50% 0%" : "50% 100%",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          willChange: "transform, opacity, filter",
        }}
      >
        {character === " " ? "\u00A0" : character}
      </motion.span>
    </motion.span>
  );
}

type ProcessStepCardProps = {
  step: ProcessStep;
  progress: MotionValue<number>;
  index: number;
};

function ProcessStepCard({ step, progress, index }: ProcessStepCardProps) {
  const trigger = index / (PROCESS_STEPS.length - 1);
  const inputRange = [
    Math.max(0, trigger - 0.17),
    trigger,
    Math.min(1, trigger + 0.17),
  ];
  const localOffset = useTransform(progress, inputRange, [-1, 0, 1]);
  const backgroundY = useTransform(localOffset, [-1, 1], [-32, 32]);
  const illustrationY = useTransform(localOffset, [-1, 1], [-74, 74]);
  const textY = useTransform(localOffset, [-1, 1], [-2, 2]);

  return (
    <motion.article
      style={{
        position: "absolute",
        top: `${step.nodeTop}%`,
        [step.cardSide]: "7%",
        width: "min(38vw, 430px)",
        minHeight: "288px",
        y: "-50%",
        borderRadius: "28px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(14, 14, 18, 0.7)",
        boxShadow: "0 18px 48px rgba(0, 0, 0, 0.28)",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          y: backgroundY,
          backgroundImage: `url("${step.backgroundImage}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.58,
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          inset: "12% 12% auto auto",
          width: "46%",
          y: illustrationY,
          opacity: 0.88,
        }}
      >
        <img
          src={step.illustrationImage}
          alt=""
          style={{
            width: "100%",
            display: "block",
            pointerEvents: "none",
          }}
        />
      </motion.div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(6,6,8,0.14), rgba(6,6,8,0.26) 44%, rgba(6,6,8,0.82) 100%)",
        }}
      />
      <motion.div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          alignContent: "start",
          gap: "14px",
          padding: "28px",
          y: textY,
        }}
      >
        <span
          style={{
            color: "rgba(246,239,232,0.52)",
            fontSize: "0.76rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          {step.phase}
        </span>
        <h3
          style={{
            margin: 0,
            fontSize: "clamp(1.9rem, 3vw, 2.7rem)",
            lineHeight: 0.94,
            letterSpacing: "-0.05em",
          }}
        >
          {step.title}
        </h3>
        <p
          style={{
            margin: 0,
            color: "rgba(246,239,232,0.7)",
            lineHeight: 1.55,
            maxWidth: "34ch",
          }}
        >
          {step.description}
        </p>
      </motion.div>
    </motion.article>
  );
}

type ProcessNodeProps = {
  progress: MotionValue<number>;
  trigger: number;
  left: number;
  top: number;
};

function ProcessNode({ progress, trigger, left, top }: ProcessNodeProps) {
  const pulse = useTransform(
    progress,
    [Math.max(0, trigger - 0.045), trigger, Math.min(1, trigger + 0.045)],
    [0, 1, 0],
  );
  const scale = useTransform(pulse, [0, 1], [1, 1.45]);
  const glowSize = useTransform(pulse, [0, 1], [12, 42]);
  const glowAlpha = useTransform(pulse, [0, 1], [0.24, 0.9]);
  const boxShadow = useMotionTemplate`0 0 ${glowSize}px rgba(255, 140, 82, ${glowAlpha})`;

  return (
    <motion.div
      data-node-trigger={trigger}
      style={{
        position: "absolute",
        left: `${left}%`,
        top: `${top}%`,
        x: "-50%",
        y: "-50%",
        zIndex: 3,
      }}
    >
      <motion.div
        style={{
          width: "26px",
          height: "26px",
          borderRadius: "999px",
          border: "4px solid rgba(255,255,255,0.28)",
          background: "linear-gradient(135deg, #ff8b51, #ffd18d)",
          scale,
          boxShadow,
        }}
      />
    </motion.div>
  );
}

function ProcessSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [pathLength, setPathLength] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    if (!pathRef.current) {
      return;
    }

    setPathLength(pathRef.current.getTotalLength());
  }, []);

  const strokeDashoffset = useTransform(scrollYProgress, [0, 1], [pathLength, 0]);
  const wipeLead = useTransform(scrollYProgress, [0, 0.18], [0, 112]);
  const wipeTail = useTransform(scrollYProgress, [0, 0.18], [-16, 98]);
  const sectionClipPath = useMotionTemplate`polygon(0% 0%, ${wipeLead}% 0%, ${wipeTail}% 100%, 0% 100%)`;

  return (
    <section
      ref={sectionRef}
      id="process-section"
      style={{
        height: "400vh",
        position: "relative",
      }}
    >
      <motion.div
        data-process-stage="true"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          clipPath: sectionClipPath,
          borderRadius: "32px",
          border: "1px solid rgba(255,255,255,0.08)",
          background:
            "radial-gradient(circle at top, rgba(255, 136, 72, 0.14), transparent 30%), linear-gradient(180deg, rgba(15,15,21,0.98), rgba(10,10,14,0.94))",
          boxShadow: "0 24px 90px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(8, 8, 12, 0.84) 0%, rgba(8, 8, 12, 0.56) 44%, rgba(8, 8, 12, 0.78) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: "6% 8% auto",
            zIndex: 2,
            display: "grid",
            gap: "10px",
          }}
        >
          <span
            style={{
              color: "rgba(246,239,232,0.48)",
              fontSize: "0.78rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            Process
          </span>
          <h2
            style={{
              margin: 0,
              maxWidth: "12ch",
              fontSize: "clamp(2.2rem, 5vw, 4.4rem)",
              lineHeight: 0.92,
              letterSpacing: "-0.06em",
            }}
          >
            Scroll the system as it builds itself.
          </h2>
        </div>

        <svg
          viewBox="0 0 1000 3200"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            inset: "0 36%",
            width: "28%",
            height: "100%",
            zIndex: 1,
          }}
        >
          <path
            d="M500 110C420 320 616 516 502 768S372 1280 514 1552 620 2100 472 2416 420 2868 508 3102"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <motion.path
            ref={pathRef}
            data-process-path="true"
            d="M500 110C420 320 616 516 502 768S372 1280 514 1552 620 2100 472 2416 420 2868 508 3102"
            fill="none"
            stroke="url(#process-draw-gradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={pathLength || 1}
            style={{
              strokeDashoffset,
            }}
          />
          <defs>
            <linearGradient id="process-draw-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff8446" />
              <stop offset="55%" stopColor="#ffd18d" />
              <stop offset="100%" stopColor="#8fd5ff" />
            </linearGradient>
          </defs>
        </svg>

        {PROCESS_STEPS.map((step, index) => (
          <ProcessNode
            key={step.id}
            progress={scrollYProgress}
            trigger={index / (PROCESS_STEPS.length - 1)}
            left={step.nodeLeft}
            top={step.nodeTop}
          />
        ))}

        <div
          style={{
            position: "absolute",
            inset: "0 0 0 0",
            zIndex: 2,
          }}
        >
          {PROCESS_STEPS.map((step, index) => (
            <ProcessStepCard
              key={step.id}
              step={step}
              index={index}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

type ClientCarouselCardProps = {
  client: ClientLogo;
  index: number;
  trackX: MotionValue<number>;
  viewportCenter: MotionValue<number>;
};

function ClientCarouselCard({
  client,
  index,
  trackX,
  viewportCenter,
}: ClientCarouselCardProps) {
  const distanceFromCenter = useTransform(
    [trackX, viewportCenter],
    ([track, center]: number[]) =>
      track + index * CLIENT_CARD_SPAN + CLIENT_CARD_WIDTH / 2 - center,
  );
  const scale = useTransform(
    distanceFromCenter,
    [-540, -160, 0, 160, 540],
    [0.82, 0.96, 1.2, 0.96, 0.82],
  );
  const opacity = useTransform(
    distanceFromCenter,
    [-540, -180, 0, 180, 540],
    [0.28, 0.64, 1, 0.64, 0.28],
  );
  const rotateY = useTransform(distanceFromCenter, [-420, 0, 420], [15, 0, -15]);
  const translateZ = useTransform(scale, [0.82, 1.2], [0, 34]);
  const borderGlow = useMotionTemplate`0 14px 34px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(255,255,255,${opacity}) inset`;

  return (
    <div
      data-client-card={client.id}
      style={{
        width: `${CLIENT_CARD_WIDTH}px`,
        flex: `0 0 ${CLIENT_CARD_WIDTH}px`,
        perspective: "1400px",
      }}
    >
      <motion.article
        style={{
          scale,
          opacity,
          rotateY,
          z: translateZ,
          transformStyle: "preserve-3d",
          minHeight: "168px",
          borderRadius: "24px",
          padding: "18px",
          display: "grid",
          alignContent: "space-between",
          gap: "20px",
          background: `linear-gradient(135deg, ${client.palette[0]}, ${client.palette[1]})`,
          boxShadow: borderGlow,
          border: `1px solid ${client.palette[2]}24`,
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "18px",
            display: "grid",
            placeItems: "center",
            background: `linear-gradient(135deg, ${client.palette[2]}, rgba(255,255,255,0.14))`,
            color: "#0d0a09",
            fontSize: "1.08rem",
            fontWeight: 900,
            letterSpacing: "0.08em",
          }}
        >
          {client.mark}
        </div>

        <div style={{ display: "grid", gap: "6px" }}>
          <h3
            style={{
              margin: 0,
              fontSize: "1.42rem",
              lineHeight: 0.96,
              letterSpacing: "-0.04em",
            }}
          >
            {client.name}
          </h3>
          <span
            style={{
              color: "rgba(246,239,232,0.58)",
              fontSize: "0.76rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            {client.sector}
          </span>
        </div>
      </motion.article>
    </div>
  );
}

function ClientsCarousel() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackX = useMotionValue(0);
  const viewportCenter = useMotionValue(0);
  const [orderedClients, setOrderedClients] = useState(CLIENT_LOGOS);
  const initializedRef = useRef(false);
  const pointerStateRef = useRef({
    active: false,
    horizontal: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startTrackX: 0,
    lastX: 0,
    events: [] as Array<{ x: number; time: number }>,
  });
  const inertiaRef = useRef<ReturnType<typeof animate> | null>(null);
  const snapRef = useRef<ReturnType<typeof animate> | null>(null);
  const clientsRef = useRef(orderedClients);

  useEffect(() => {
    clientsRef.current = orderedClients;
  }, [orderedClients]);

  const stopMotion = () => {
    inertiaRef.current?.stop();
    snapRef.current?.stop();
    inertiaRef.current = null;
    snapRef.current = null;
  };

  const normalizeTrack = (value: number) => {
    let nextValue = value;
    let nextClients = clientsRef.current;
    let changed = false;

    while (nextValue <= -CLIENT_CARD_SPAN) {
      nextClients = [...nextClients.slice(1), nextClients[0]];
      nextValue += CLIENT_CARD_SPAN;
      changed = true;
    }

    while (nextValue >= CLIENT_CARD_SPAN) {
      nextClients = [nextClients[nextClients.length - 1], ...nextClients.slice(0, -1)];
      nextValue -= CLIENT_CARD_SPAN;
      changed = true;
    }

    if (changed) {
      clientsRef.current = nextClients;
      setOrderedClients(nextClients);
    }

    trackX.set(nextValue);
    return nextValue;
  };

  const snapToNearest = () => {
    const center = viewportCenter.get();
    const rawIndex = (center - CLIENT_CARD_WIDTH / 2 - trackX.get()) / CLIENT_CARD_SPAN;
    const nearestIndex = Math.round(rawIndex);
    const targetX = center - CLIENT_CARD_WIDTH / 2 - nearestIndex * CLIENT_CARD_SPAN;

    snapRef.current = animate(trackX, targetX, {
      type: "spring",
      stiffness: 300,
      damping: 30,
      onUpdate: (latest) => {
        normalizeTrack(latest);
      },
    });
  };

  const startInertia = (velocityPerFrame: number) => {
    let velocity = velocityPerFrame;
    stopMotion();

    inertiaRef.current = animate(0, 1, {
      duration: 20,
      ease: "linear",
      onUpdate: () => {
        velocity *= 0.95;
        const nextValue = trackX.get() + velocity;
        normalizeTrack(nextValue);

        if (Math.abs(velocity) < 0.5) {
          inertiaRef.current?.stop();
          inertiaRef.current = null;
          snapToNearest();
        }
      },
    });
  };

  useEffect(() => {
    const measure = () => {
      const viewportWidth = viewportRef.current?.getBoundingClientRect().width ?? 0;
      viewportCenter.set(viewportWidth / 2);

      if (!initializedRef.current && viewportWidth > 0) {
        const initialX = viewportWidth / 2 - CLIENT_CARD_WIDTH / 2 - 2 * CLIENT_CARD_SPAN;
        trackX.set(initialX);
        initializedRef.current = true;
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      stopMotion();
    };
  }, [trackX, viewportCenter]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    stopMotion();
    pointerStateRef.current = {
      active: true,
      horizontal: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTrackX: trackX.get(),
      lastX: event.clientX,
      events: [{ x: event.clientX, time: event.timeStamp }],
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointer = pointerStateRef.current;
    if (!pointer.active || pointer.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - pointer.startX;
    const deltaY = event.clientY - pointer.startY;

    if (!pointer.horizontal) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) {
        return;
      }

      if (Math.abs(deltaX) <= Math.abs(deltaY)) {
        pointer.active = false;
        return;
      }

      pointer.horizontal = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    pointer.lastX = event.clientX;
    pointer.events = [...pointer.events, { x: event.clientX, time: event.timeStamp }].slice(-5);
    normalizeTrack(pointer.startTrackX + deltaX);
  };

  const releasePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointer = pointerStateRef.current;
    if (pointer.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (pointer.horizontal) {
      const samples = pointer.events;
      const first = samples[0];
      const last = samples[samples.length - 1];
      const frameSpan = Math.max((last.time - first.time) / (1000 / 60), 1);
      const velocityPerFrame = (last.x - first.x) / frameSpan;

      if (Math.abs(velocityPerFrame) >= 0.5) {
        startInertia(velocityPerFrame);
      } else {
        snapToNearest();
      }
    }

    pointerStateRef.current = {
      active: false,
      horizontal: false,
      pointerId: -1,
      startX: 0,
      startY: 0,
      startTrackX: trackX.get(),
      lastX: 0,
      events: [],
    };
  };

  return (
    <section
      id="clients-carousel"
      style={{
        borderRadius: "32px",
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          "radial-gradient(circle at top right, rgba(136, 196, 255, 0.12), transparent 30%), linear-gradient(180deg, rgba(14,14,18,0.98), rgba(10,10,14,0.94))",
        boxShadow: "0 24px 90px rgba(0, 0, 0, 0.28)",
        padding: "clamp(24px, 4vw, 36px)",
        display: "grid",
        gap: "28px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
          alignItems: "end",
        }}
      >
        <div style={{ display: "grid", gap: "10px" }}>
          <span
            style={{
              color: "rgba(246,239,232,0.48)",
              fontSize: "0.78rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            Clients
          </span>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(2.1rem, 4vw, 3.8rem)",
              lineHeight: 0.92,
              letterSpacing: "-0.06em",
            }}
          >
            Drag through the partners this system was built for.
          </h2>
        </div>

        <p
          style={{
            margin: 0,
            maxWidth: "420px",
            color: "rgba(246,239,232,0.64)",
            lineHeight: 1.55,
          }}
        >
          The track keeps moving without edges. Throw it, let it decay, and it will
          settle back onto the nearest card without interrupting the vertical page flow.
        </p>
      </div>

      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={releasePointer}
        onPointerCancel={releasePointer}
        style={{
          overflow: "hidden",
          cursor: "grab",
          padding: "18px 0 22px",
          touchAction: "pan-y",
          userSelect: "none",
        }}
      >
        <motion.div
          data-client-track="true"
          style={{
            display: "flex",
            gap: `${CLIENT_CARD_GAP}px`,
            x: trackX,
            willChange: "transform",
          }}
        >
          {orderedClients.map((client, index) => (
            <ClientCarouselCard
              key={client.id}
              client={client}
              index={index}
              trackX={trackX}
              viewportCenter={viewportCenter}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function ImmersivePortfolio() {
  const timeline = useMotionValue(0);
  const pointerXRatio = useMotionValue(NEUTRAL_CURSOR_X);
  const pointerYRatio = useMotionValue(0);
  const characters = useMemo(() => Array.from(HERO_TITLE), []);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [detailReady, setDetailReady] = useState(false);
  const revealDelay = characters.length * STAGGER_SECONDS + ENTRANCE_SECONDS * 0.7;
  const turbulenceTargetX = useTransform(pointerXRatio, [0, 1], [MIN_FREQUENCY_X, MAX_FREQUENCY_X]);
  const displacementTarget = useTransform(pointerYRatio, [0, 1], [0, MAX_DISPLACEMENT]);
  const turbulenceX = useSpring(turbulenceTargetX, LIQUID_SPRING);
  const displacementScale = useSpring(displacementTarget, LIQUID_SPRING);
  const baseFrequency = useMotionTemplate`${turbulenceX} 0.02`;
  const selectedProject = PROJECTS.find((project) => project.id === selectedProjectId) ?? null;
  const heroSupportVisible = selectedProjectId === null;

  useEffect(() => {
    let frameId = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      timeline.set((now - startedAt) / 1000);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [timeline]);

  useEffect(() => {
    setDetailReady(false);
  }, [selectedProjectId]);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextX = (event.clientX - bounds.left) / bounds.width;
    const nextY = (event.clientY - bounds.top) / bounds.height;

    pointerXRatio.set(Math.min(Math.max(nextX, 0), 1));
    pointerYRatio.set(Math.min(Math.max(nextY, 0), 1));
  };

  const handlePointerLeave = () => {
    pointerXRatio.set(NEUTRAL_CURSOR_X);
    pointerYRatio.set(0);
  };

  const closeProject = () => {
    setDetailReady(false);
    setSelectedProjectId(null);
  };

  return (
    <LayoutGroup id="immersive-portfolio-layout">
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          padding: "24px",
          background:
            "radial-gradient(circle at top, rgba(255, 119, 48, 0.16), transparent 28%), linear-gradient(135deg, #09090b 0%, #121217 42%, #1b1010 100%)",
          color: "#f6efe8",
          fontFamily: '"Segoe UI", sans-serif',
        }}
      >
        <motion.div
          layout
          transition={LAYOUT_TRANSITION}
          style={{
            width: "min(1180px, 100%)",
            display: "grid",
            alignContent: "start",
            gap: "22px",
          }}
        >
          <motion.section
            layout
            transition={LAYOUT_TRANSITION}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "flex-end",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "32px",
              padding: "clamp(32px, 5vw, 72px)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
              boxShadow: "0 24px 90px rgba(0, 0, 0, 0.35)",
              overflow: "hidden",
              position: "relative",
              isolation: "isolate",
            }}
          >
            <motion.svg
              aria-hidden="true"
              viewBox="0 0 1600 1200"
              preserveAspectRatio="xMidYMid slice"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            >
              <defs>
                <filter
                  id="portfolio-liquid-filter"
                  x="-10%"
                  y="-10%"
                  width="120%"
                  height="120%"
                  colorInterpolationFilters="sRGB"
                >
                  <motion.feTurbulence
                    type="fractalNoise"
                    baseFrequency={baseFrequency}
                    numOctaves={2}
                    seed={7}
                    stitchTiles="stitch"
                    result="noise"
                  />
                  <motion.feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale={displacementScale}
                    xChannelSelector="R"
                    yChannelSelector="B"
                  />
                </filter>
                <linearGradient id="portfolio-image-fade" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(8, 8, 10, 0.15)" />
                  <stop offset="58%" stopColor="rgba(8, 8, 10, 0.3)" />
                  <stop offset="100%" stopColor="rgba(8, 8, 10, 0.84)" />
                </linearGradient>
              </defs>

              <image
                href={HERO_IMAGE}
                x="0"
                y="0"
                width="1600"
                height="1200"
                preserveAspectRatio="xMidYMid slice"
                filter="url(#portfolio-liquid-filter)"
                opacity="0.92"
              />
              <rect x="0" y="0" width="1600" height="1200" fill="url(#portfolio-image-fade)" />
            </motion.svg>

            <div
              style={{
                position: "absolute",
                inset: "auto -12% -18% auto",
                width: "42vw",
                height: "42vw",
                maxWidth: "460px",
                maxHeight: "460px",
                borderRadius: "999px",
                background:
                  "radial-gradient(circle, rgba(255, 119, 48, 0.22), rgba(255, 119, 48, 0) 68%)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, rgba(8, 8, 10, 0.82) 0%, rgba(8, 8, 10, 0.54) 38%, rgba(8, 8, 10, 0.3) 100%)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            <motion.div
              layout
              transition={LAYOUT_TRANSITION}
              style={{
                display: "grid",
                gap: "28px",
                position: "relative",
                zIndex: 2,
                maxWidth: "760px",
              }}
            >
              <motion.div
                layout
                transition={LAYOUT_TRANSITION}
                style={{
                  display: "inline-flex",
                  width: "fit-content",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(246, 239, 232, 0.7)",
                  letterSpacing: "0.22em",
                  fontSize: "12px",
                  textTransform: "uppercase",
                }}
              >
                Selected Portfolio 2026
              </motion.div>

              <motion.h1
                layout
                transition={LAYOUT_TRANSITION}
                style={{
                  margin: 0,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "flex-end",
                  gap: "0.01em",
                  fontSize: "clamp(4.6rem, 18vw, 11rem)",
                  lineHeight: 0.9,
                  letterSpacing: "-0.08em",
                  textTransform: "uppercase",
                  fontWeight: 900,
                  perspective: "1200px",
                  textShadow: "0 10px 38px rgba(0, 0, 0, 0.24)",
                }}
              >
                {characters.map((character, index) => (
                  <AnimatedCharacter
                    key={`${character}-${index}`}
                    character={character}
                    index={index}
                    timeline={timeline}
                  />
                ))}
              </motion.h1>

              <AnimatePresence initial={false}>
                {heroSupportVisible ? (
                  <motion.div
                    key="hero-support"
                    layout
                    transition={LAYOUT_TRANSITION}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    style={{
                      display: "grid",
                      gap: "20px",
                    }}
                  >
                    <motion.p
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: revealDelay,
                        duration: 0.7,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{
                        margin: 0,
                        maxWidth: "640px",
                        color: "rgba(246, 239, 232, 0.78)",
                        fontSize: "clamp(1rem, 2.6vw, 1.35rem)",
                        lineHeight: 1.55,
                      }}
                    >
                      Cinematic interfaces, tactile motion systems, and deliberate visual
                      narratives for brands that want their portfolio to feel alive before
                      a single case study opens.
                    </motion.p>

                    <motion.div
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: revealDelay + 0.14,
                        duration: 0.65,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      <motion.button
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.985 }}
                        style={{
                          border: 0,
                          borderRadius: "999px",
                          padding: "16px 24px",
                          background: "linear-gradient(135deg, #ff7730, #ff5a36)",
                          color: "#120a07",
                          fontSize: "0.96rem",
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          boxShadow: "0 18px 40px rgba(255, 107, 43, 0.28)",
                        }}
                        onClick={() => {
                          const grid = document.getElementById("project-grid");
                          grid?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                      >
                        View Projects
                      </motion.button>

                      <span
                        style={{
                          color: "rgba(246, 239, 232, 0.54)",
                          fontSize: "0.95rem",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        Direction, code, and motion systems
                      </span>
                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </motion.section>

          <motion.section
            id="project-grid"
            layout
            transition={LAYOUT_TRANSITION}
            style={{
              borderRadius: "32px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              background: "rgba(12, 12, 16, 0.72)",
              boxShadow: "0 24px 90px rgba(0, 0, 0, 0.28)",
              padding: "clamp(24px, 4vw, 36px)",
              display: "grid",
              gap: "24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <motion.div
              layout
              transition={LAYOUT_TRANSITION}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
                flexWrap: "wrap",
                alignItems: "end",
              }}
            >
              <div style={{ display: "grid", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "0.78rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(246, 239, 232, 0.48)",
                  }}
                >
                  Featured projects
                </span>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "clamp(1.9rem, 4vw, 3.1rem)",
                    letterSpacing: "-0.04em",
                  }}
                >
                  Spatial case studies built to open like scenes.
                </h2>
              </div>

              <p
                style={{
                  margin: 0,
                  maxWidth: "420px",
                  color: "rgba(246, 239, 232, 0.62)",
                  lineHeight: 1.5,
                }}
              >
                Each tile is a living entry point. Expand any project to move from
                overview into the full narrative without breaking spatial continuity.
              </p>
            </motion.div>

            <motion.div
              layout
              transition={LAYOUT_TRANSITION}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "18px",
              }}
            >
              {PROJECTS.map((project) => {
                const isSelected = project.id === selectedProjectId;
                const isDimmed = selectedProjectId !== null && !isSelected;

                return (
                  <motion.button
                    key={project.id}
                    layout
                    transition={LAYOUT_TRANSITION}
                    onClick={() => setSelectedProjectId(project.id)}
                    animate={
                      isDimmed
                        ? { scale: 0.92, opacity: 0.22, filter: "blur(10px)" }
                        : { scale: 1, opacity: isSelected ? 0 : 1, filter: "blur(0px)" }
                    }
                    style={{
                      border: 0,
                      padding: 0,
                      textAlign: "left",
                      cursor: "pointer",
                      background: "transparent",
                      pointerEvents: isSelected ? "none" : "auto",
                    }}
                  >
                    <motion.article
                      layoutId={`project-card-${project.id}`}
                      transition={LAYOUT_TRANSITION}
                      style={{
                        minHeight: "340px",
                        borderRadius: "26px",
                        overflow: "hidden",
                        background: "rgba(18, 18, 24, 0.88)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "grid",
                        gridTemplateRows: "220px auto",
                        boxShadow: "0 16px 36px rgba(0,0,0,0.22)",
                      }}
                    >
                      <motion.img
                        layoutId={`project-image-${project.id}`}
                        transition={LAYOUT_TRANSITION}
                        src={project.image}
                        alt={project.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />

                      <div
                        style={{
                          display: "grid",
                          gap: "14px",
                          padding: "18px 18px 20px",
                          alignContent: "start",
                        }}
                      >
                        <motion.span
                          layoutId={`project-category-${project.id}`}
                          transition={LAYOUT_TRANSITION}
                          style={{
                            display: "inline-flex",
                            width: "fit-content",
                            padding: "7px 12px",
                            borderRadius: "999px",
                            background: "rgba(255,255,255,0.08)",
                            color: "rgba(246, 239, 232, 0.76)",
                            fontSize: "0.78rem",
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                          }}
                        >
                          {project.category}
                        </motion.span>

                        <motion.h3
                          layoutId={`project-title-${project.id}`}
                          transition={LAYOUT_TRANSITION}
                          style={{
                            margin: 0,
                            fontSize: "1.65rem",
                            lineHeight: 0.96,
                            letterSpacing: "-0.05em",
                          }}
                        >
                          {project.name}
                        </motion.h3>
                      </div>
                    </motion.article>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.section>

          <ProcessSection />

          <ClientsCarousel />
        </motion.div>

        <AnimatePresence initial={false}>
          {selectedProject ? (
            <motion.div
              key="project-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 30,
                padding: "24px",
                background: "rgba(5, 5, 8, 0.52)",
                backdropFilter: "blur(20px)",
                display: "flex",
                alignItems: "stretch",
                justifyContent: "center",
              }}
            >
              <motion.button
                aria-label="Close project"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                }}
                onClick={closeProject}
              />

              <motion.article
                layoutId={`project-card-${selectedProject.id}`}
                transition={LAYOUT_TRANSITION}
                onLayoutAnimationComplete={() => {
                  if (!detailReady) {
                    setDetailReady(true);
                  }
                }}
                style={{
                  position: "relative",
                  width: "min(1220px, 100%)",
                  minHeight: "min(88vh, 940px)",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                  gap: "24px",
                  padding: "24px",
                  borderRadius: "32px",
                  background: "rgba(12, 12, 16, 0.96)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 32px 120px rgba(0,0,0,0.42)",
                  overflow: "hidden",
                }}
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <motion.img
                  layoutId={`project-image-${selectedProject.id}`}
                  transition={LAYOUT_TRANSITION}
                  src={selectedProject.image}
                  alt={selectedProject.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "320px",
                    objectFit: "cover",
                    borderRadius: "24px",
                    display: "block",
                  }}
                />

                <div
                  style={{
                    display: "grid",
                    alignContent: "start",
                    gap: "18px",
                    padding: "4px 4px 4px 0",
                  }}
                >
                  <motion.span
                    layoutId={`project-category-${selectedProject.id}`}
                    transition={LAYOUT_TRANSITION}
                    style={{
                      display: "inline-flex",
                      width: "fit-content",
                      padding: "9px 14px",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(246, 239, 232, 0.76)",
                      fontSize: "0.82rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                    }}
                  >
                    {selectedProject.category}
                  </motion.span>

                  <motion.h2
                    layoutId={`project-title-${selectedProject.id}`}
                    transition={LAYOUT_TRANSITION}
                    style={{
                      margin: 0,
                      fontSize: "clamp(3rem, 7vw, 5.5rem)",
                      lineHeight: 0.9,
                      letterSpacing: "-0.07em",
                    }}
                  >
                    {selectedProject.name}
                  </motion.h2>

                  <AnimatePresence initial={false}>
                    {detailReady ? (
                      <motion.div
                        key={`project-details-${selectedProject.id}`}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                          display: "grid",
                          gap: "24px",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            color: "rgba(246, 239, 232, 0.72)",
                            fontSize: "1.04rem",
                            lineHeight: 1.65,
                            maxWidth: "46ch",
                          }}
                        >
                          {selectedProject.description}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
                          {selectedProject.tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                padding: "10px 14px",
                                borderRadius: "999px",
                                background: "rgba(255,255,255,0.06)",
                                color: "rgba(246,239,232,0.74)",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                fontSize: "0.78rem",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <motion.button
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={closeProject}
                          style={{
                            border: 0,
                            width: "fit-content",
                            borderRadius: "999px",
                            padding: "15px 22px",
                            background: "linear-gradient(135deg, #ff7730, #ff5a36)",
                            color: "#120a07",
                            fontSize: "0.92rem",
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            cursor: "pointer",
                            boxShadow: "0 18px 40px rgba(255, 107, 43, 0.28)",
                          }}
                        >
                          Close Project
                        </motion.button>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </motion.article>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </LayoutGroup>
  );
}
