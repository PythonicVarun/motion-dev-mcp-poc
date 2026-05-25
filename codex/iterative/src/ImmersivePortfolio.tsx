import { useEffect, useMemo } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";

const HERO_TITLE = "WORKS";
const STAGGER_SECONDS = 0.04;
const ENTRANCE_SECONDS = 0.88;
const BREATH_AMPLITUDE = 10;
const BREATH_SPEED = 1.8;
const WAVE_OFFSET = 0.48;

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

export function ImmersivePortfolio() {
  const timeline = useMotionValue(0);
  const characters = useMemo(() => Array.from(HERO_TITLE), []);
  const revealDelay = characters.length * STAGGER_SECONDS + ENTRANCE_SECONDS * 0.7;

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

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, rgba(255, 119, 48, 0.16), transparent 28%), linear-gradient(135deg, #09090b 0%, #121217 42%, #1b1010 100%)",
        color: "#f6efe8",
        fontFamily: '"Segoe UI", sans-serif',
      }}
    >
      <section
        style={{
          width: "min(1120px, 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "32px",
          padding: "clamp(32px, 5vw, 72px)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
          boxShadow: "0 24px 90px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
          position: "relative",
        }}
      >
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
          }}
        />

        <div
          style={{
            display: "grid",
            gap: "28px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
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
          </div>

          <h1
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
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: revealDelay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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
            initial={{ opacity: 0, y: 18 }}
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
        </div>
      </section>
    </main>
  );
}
