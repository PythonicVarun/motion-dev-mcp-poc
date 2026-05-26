# Motion.dev MCP Iterative Prompt Archive

The following prompts were used verbatim for the iterative benchmark. This doesn't include any of the follow-up clarifications or adjustments that were made during the process, just the original prompts as they were given to the model. Each prompt builds on the previous one, adding new features and complexity to the same React app.

## PROMPT 0

**Git Commit:** [feat: Prompt 0 - Character-Level Text Orchestration](https://github.com/PythonicVarun/motion-dev-mcp-poc/commit/f050f23ec2ff722e53c730d5031081d23091171b)

````text
Using the Motion.dev MCP, build a React app with component called <ImmersivePortfolio />.

Start with a hero section:
- A large heading (e.g. "WORKS") where every single character is a separate motion span
- On mount, characters animate in with a staggered wave — not a simple fade-slide, but a 3D rotateX flip on each character (like pages turning), stagger 40ms apart
- Characters should flip in from a random direction (some from top, some from bottom) — use Math.random() seeded per character index
- After the entrance, the heading continuously breathes — a subtle sinusoidal y-oscillation, each character offset by its index to create a wave effect, driven by useMotionValue + a requestAnimationFrame loop (not CSS keyframes)
- Below the heading, a subheading and a CTA button fade in after all characters have landed
- Use motion/react. TypeScript. Inline styles.
- Generate all codes in @iterative\ directory all and you aren't allowed to peek into any of the directories in current directory.
````

## PROMPT 1

**Git Commit:** [feat: Prompt 1 - SVG Displacement Distortion via MotionValues](https://github.com/PythonicVarun/motion-dev-mcp-poc/commit/546682e6f516f6737dc82dd987e767ee866ec9d5)

````text
Extend <ImmersivePortfolio /> — add a hero background image behind the text:

- Apply an SVG feTurbulence + feDisplacementMap filter to the image
- The turbulence baseFrequency and the displacement scale must be driven directly by MotionValues tied to cursor position — NOT CSS transitions
- As the cursor moves left↔right: baseFrequency X shifts between 0.01 and 0.08
- As the cursor moves up↓down: displacement scale shifts between 0 and 40
- The distortion should feel like the image is made of liquid reacting to the cursor
- On mouse leave, all values spring back to neutral (baseFrequency 0.02, scale 0) using useSpring with stiffness: 60, damping: 20
- The SVG filter must be defined inline and referenced — no external files
- The existing character wave animation must still run simultaneously without jank
````

## PROMPT 2

**Git Commit:** [feat: Prompt 2 - Shared Layout Expansion with Content Morphing](https://github.com/PythonicVarun/motion-dev-mcp-poc/commit/bf5f23a91c16afbf78e918e2a5222d6836fcc218)

````text
Add a project grid below the hero in <ImmersivePortfolio />:

- 6 project cards in a 3×2 grid, each with an image, project name, and category
- Clicking a card expands it to a fullscreen detail view using Motion's layoutId — the image, title, and category must all have their own layoutId so they morph position/size independently during the transition
- The fullscreen view shows additional content (description, tags, close button) that is NOT present in the card — use AnimatePresence with initial={false} so this content fades in only after the layout animation completes (use onLayoutAnimationComplete)
- The remaining 5 cards must scale down and blur out while one is expanded, then restore when closed
- Closing must reverse everything — the card morphs back to its grid position
- The hero section above must compress its height when a card is expanded, also using layout animation (not a hardcoded height change)
- Nothing should jump or reflow. Every positional change must be animated.
````

## PROMPT 3

**Git Commit:** [feat: Prompt 3 - Scroll-Driven SVG Path Draw + Multi-Layer Parallax](https://github.com/PythonicVarun/motion-dev-mcp-poc/commit/e2a96d655544cbad62cea08245f677bb69e6833d)

````text
Add a scroll-driven "process" section below the grid in <ImmersivePortfolio />:

- A tall section (400vh) with 5 steps
- A continuous SVG path runs vertically through the section — as the user scrolls through, the path draws itself using strokeDashoffset driven by useScroll + useTransform (not IntersectionObserver)
- The path connects 5 circular nodes — each node pulses (scale + glow) exactly when the scroll progress reaches its position along the path
- Each step's text block has a 3-layer parallax:
    background image moves at 0.3× scroll velocity
    mid-layer illustration at 0.7×
    foreground text at 1.15× (slight overshoot)
  All three driven by the same useScroll scrollYProgress, forked into 3 useTransform chains with different input/output ranges
- The section has a horizontal clip-path wipe entrance — a diagonal line that sweeps left-to-right as the section enters the viewport, driven by scroll (not a one-time trigger)
- All existing sections (hero, grid) must still work during scroll without MotionValue conflicts
````

## PROMPT 4

**Git Commit:** feat: Prompt 4 - Physics Carousel with Momentum & Snap
- [Codex and Gemini](https://github.com/PythonicVarun/motion-dev-mcp-poc/commit/f426ef991577253e219a7d8d7646f2fabba277c6)
- [Claude Code](https://github.com/PythonicVarun/motion-dev-mcp-poc/commit/384237d7f8c92ea56eeaffa48a952e69c1fb5ded)

````text
Add a horizontal "clients" carousel at the bottom of <ImmersivePortfolio />:

- 10 logo cards in an infinitely draggable horizontal track
- Implement inertia manually: on drag release, calculate velocity from the
  last 5 pointer events, then animate to a resting position using
  animate() with a custom decay — velocity × 0.95 each frame until < 0.5px/f
- Snap-to-nearest: after inertia settles, snap to the closest card using
  a spring (stiffness: 300, damping: 30)
- Each card's scale and opacity are driven by its distance from the center
  of the viewport — center card is scale 1.2 + full opacity, cards further
  away shrink and fade (use useTransform on a per-card MotionValue tracking
  its x offset from center)
- The track is infinite — when the drag position passes the first or last
  card boundary, the array order must silently re-index so it feels endless,
  with no visible jump
- Cards have a subtle 3D perspective tilt: cards left of center tilt +15° on Y,
  right tilt -15°, driven continuously by position (not just drag state)
- The carousel must not interfere with vertical page scroll
````

## PROMPT 5

**Git Commit:** [feat: Prompt 5 - Global Scroll Narrative + Page Transition Orchestration](https://github.com/PythonicVarun/motion-dev-mcp-poc/commit/c06f49752d8d4829d2e039a62a549902cb90874d)

````text
Final integration pass on <ImmersivePortfolio />:

A) Global scroll progress bar:
   - A fixed top bar whose scaleX is driven by overall page scroll progress
   - But it must use a non-linear transform — map scroll progress through a
     custom cubic-bezier curve so it accelerates in the middle of the page
     (where most content is) and eases at start/end

B) Section transition choreography:
   - Add a "Contact" section at the very end
   - Navigating to it (via the CTA button in hero OR scrolling to it) triggers
     a full-page transition sequence:
       1. All current content simultaneously scatters — each section flies to a
          random offscreen direction with staggered 60ms delays
       2. A full-screen SVG overlay morphs in (using path d animation between
          a flat line and a filled screen shape) — this acts as the transition
          wipe
       3. Contact section content assembles from particles — each word in the
          heading starts at a random position and springs into place
   - Navigating back reverses the entire sequence
   - This must work for both scroll-triggered entry AND click-triggered entry
     without duplicating animation logic

C) Reduced motion:
   - Wrap ALL motion in the portfolio in a useReducedMotion check
   - If true, every animation must still convey the state change but with
     zero movement — opacity only, instant layout, no transforms
   - This must be a single top-level check that propagates via React context,
     not 40 individual checks scattered through components
````
