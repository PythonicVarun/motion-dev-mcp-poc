import { animate } from "motion";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

const menuItems = [
  {
    id: "index",
    label: "Index",
    strap: "Bold entry sequence with a liquid stress line.",
  },
  {
    id: "projects",
    label: "Projects",
    strap: "Work blocks arranged like concrete, animated like chrome.",
  },
  {
    id: "archive",
    label: "Archive",
    strap: "Dense references, frozen frames, and brutal system memory.",
  },
  {
    id: "contact",
    label: "Contact",
    strap: "One bright action inside a dark industrial shell.",
  },
];

const openEase = [0.16, 1, 0.3, 1] as const;
const collapseEase = [0.76, 0, 0.24, 1] as const;

type VariantCustom = {
  index: number;
  total: number;
  reduced: boolean;
};

const itemVariants = {
  open: ({ index, reduced }: VariantCustom) => ({
    opacity: 1,
    rotateX: 0,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: reduced ? 0.01 : 0.68,
      delay: reduced ? 0 : 0.14 + index * 0.08,
      ease: openEase,
    },
  }),
  closed: ({ index, total, reduced }: VariantCustom) => ({
    opacity: 0,
    rotateX: -96,
    y: -34,
    filter: "blur(10px)",
    transition: {
      duration: reduced ? 0.01 : 0.36,
      delay: reduced ? 0 : (total - 1 - index) * 0.08,
      ease: collapseEase,
    },
  }),
};

export default function App() {
  const reducedMotion = useReducedMotion();
  const shellRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState(menuItems[0].id);
  const [cursorVisible, setCursorVisible] = useState(false);

  const activeItem = menuItems.find((item) => item.id === activeId) ?? menuItems[0];

  const cursorTargetX = useMotionValue(-40);
  const cursorTargetY = useMotionValue(-40);
  const cursorX = useSpring(cursorTargetX, {
    stiffness: reducedMotion ? 700 : 90,
    damping: reducedMotion ? 80 : 30,
    mass: 0.8,
  });
  const cursorY = useSpring(cursorTargetY, {
    stiffness: reducedMotion ? 700 : 90,
    damping: reducedMotion ? 80 : 30,
    mass: 0.8,
  });

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      cursorTargetX.set(event.clientX - 10);
      cursorTargetY.set(event.clientY - 10);
      setCursorVisible(true);
    };

    const handleLeave = () => setCursorVisible(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerleave", handleLeave);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
    };
  }, [cursorTargetX, cursorTargetY]);

  useEffect(() => {
    if (!shellRef.current) {
      return;
    }

    const controls = animate(
      shellRef.current,
      {
        ["--menu-background" as never]: isOpen ? "#92e7d5" : "#f1e5d7",
        ["--menu-glow" as never]: isOpen ? "#cafff5" : "#fff2e9",
      } as never,
      {
        duration: reducedMotion ? 0.01 : 0.9,
        ease: [0.22, 1, 0.36, 1],
      },
    );

    return () => {
      controls.stop();
    };
  }, [isOpen, reducedMotion]);

  return (
    <div className="appShell" ref={shellRef}>
      <motion.div
        aria-hidden="true"
        className="cursorFollower"
        style={{ x: cursorX, y: cursorY }}
        animate={{
          opacity: cursorVisible && !reducedMotion ? 1 : 0,
          scale: cursorVisible && !reducedMotion ? 1 : 0.4,
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      />

      <motion.main
        className="stage"
        animate={
          isOpen
            ? {
                scale: reducedMotion ? 1 : 0.94,
                y: reducedMotion ? 0 : 26,
                filter: reducedMotion ? "none" : "blur(10px)",
              }
            : { scale: 1, y: 0, filter: "blur(0px)" }
        }
        transition={{ duration: reducedMotion ? 0.01 : 0.6, ease: openEase }}
      >
        <div className="noiseLayer" aria-hidden="true" />
        <div className="meshOrb meshOrbPrimary" aria-hidden="true" />
        <div className="meshOrb meshOrbSecondary" aria-hidden="true" />

        <header className="topBar">
          <div>
            <p className="eyebrow">Visual First / Motion React</p>
            <p className="brand">Mercury Nav</p>
          </div>

          <button
            className="menuToggle"
            type="button"
            onClick={() => setIsOpen((value) => !value)}
          >
            <span className="menuToggleLabel">{isOpen ? "Close" : "Menu"}</span>
            <span className="menuToggleIcon" aria-hidden="true">
              {isOpen ? "00" : "01"}
            </span>
          </button>
        </header>

        <section className="hero">
          <div className="heroCopy">
            <p className="heroLead">Brutalist meets fluid</p>
            <h1>
              Liquid
              <br />
              Menu
            </h1>
            <p className="heroText">
              Fullscreen navigation built like a concrete slab, animated like
              mercury. Open it and the whole surface flips, stretches, and
              liquefies.
            </p>
          </div>

          <div className="heroMeta">
            <div className="metaCard">
              <p className="metaLabel">Active section</p>
              <p className="metaValue">{activeItem.label}</p>
            </div>
            <div className="metaCard">
              <p className="metaLabel">Surface behavior</p>
              <p className="metaValue">RotateX / spring underline / color morph</p>
            </div>
            <div className="metaQuote">{activeItem.strap}</div>
          </div>
        </section>
      </motion.main>

      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.aside
            key="menu"
            className="menuOverlay"
            initial={{
              clipPath: "inset(0 0 100% 0 round 0px)",
              y: reducedMotion ? 0 : -100,
              opacity: 0.5,
            }}
            animate={{
              clipPath: "inset(0 0 0 0 round 0px)",
              y: 0,
              opacity: 1,
            }}
            exit={{
              clipPath: "inset(0 0 100% 0 round 0px)",
              y: reducedMotion ? 0 : -116,
              opacity: 0.45,
              transition: {
                duration: reducedMotion ? 0.01 : 0.72,
                delay: reducedMotion ? 0 : menuItems.length * 0.08,
                ease: collapseEase,
              },
            }}
            transition={{
              duration: reducedMotion ? 0.01 : 0.8,
              ease: collapseEase,
            }}
          >
            <div className="menuTopBar">
              <p className="menuCaption">Fullscreen liquid navigation</p>
              <button
                className="menuToggle menuToggleInvert"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                <span className="menuToggleLabel">Collapse</span>
                <span className="menuToggleIcon" aria-hidden="true">
                  02
                </span>
              </button>
            </div>

            <nav aria-label="Primary" className="menuNav">
              <ul className="menuList">
                {menuItems.map((item, index) => {
                  const isActive = activeId === item.id;

                  return (
                    <motion.li
                      key={item.id}
                      className="menuItem"
                      custom={{
                        index,
                        total: menuItems.length,
                        reduced: reducedMotion,
                      }}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={itemVariants}
                    >
                      <button
                        className="menuButton"
                        type="button"
                        onMouseEnter={() => setActiveId(item.id)}
                        onFocus={() => setActiveId(item.id)}
                        onClick={() => {
                          setActiveId(item.id);
                          setIsOpen(false);
                        }}
                      >
                        <span className="menuIndex">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="menuContent">
                          <span className="menuLabel">{item.label}</span>
                          <span className="menuStrap">{item.strap}</span>

                          <span className="menuUnderlineWrap" aria-hidden="true">
                            <motion.span
                              className="menuUnderline"
                              animate={{
                                scaleX: isActive ? 1 : 0.18,
                                opacity: isActive ? 1 : 0.35,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: reducedMotion ? 700 : 180,
                                damping: reducedMotion ? 90 : 18,
                                mass: 0.7,
                              }}
                            />
                            <motion.span
                              className="menuDrip menuDripLeft"
                              animate={{
                                scale: isActive ? 1.1 : 0.7,
                                x: isActive ? 18 : 0,
                                y: isActive ? 0 : -2,
                                opacity: isActive ? 1 : 0.55,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: reducedMotion ? 700 : 190,
                                damping: reducedMotion ? 90 : 20,
                              }}
                            />
                            <motion.span
                              className="menuDrip menuDripRight"
                              animate={{
                                scale: isActive ? 1 : 0.66,
                                x: isActive ? -18 : 0,
                                y: isActive ? 0 : -2,
                                opacity: isActive ? 1 : 0.55,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: reducedMotion ? 700 : 190,
                                damping: reducedMotion ? 90 : 20,
                              }}
                            />
                          </span>
                        </span>
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
