# Motion.dev MCP Iterative Story Handoff

## What This Dataset Is For

This handoff is for a data story about how specialized MCP servers can expand the functional range and working speed of coding agents during iterative product-building, especially when the work depends on:

- framework-specific docs retrieval
- motion-pattern lookup
- browser verification
- repeated visual/debug feedback loops

This is **not** an output-quality comparison. The dataset is about workflow, tool usage, iteration patterns, and verification behavior.

The machine-readable source for this handoff is:

- `motion-dev-mcp-iterative-session-metrics.json`

## Selected Raw Sessions

- `codex`
  - session id: `019e5d97-8202-73f0-80fa-3330c392fe81`
  - source: `C:/Users/varun/.codex/sessions/2026/05/25/rollout-2026-05-25T10-54-31-019e5d97-8202-73f0-80fa-3330c392fe81.jsonl`
- `claude-code`
  - session id: `0fbef8f3-40b9-456a-9837-170274b43cc4`
  - source: `C:/Users/varun/.claude/projects/V--Codes-Internship-Straive-Apr-26-motion-dev-mcp-poc-claude-code/0fbef8f3-40b9-456a-9837-170274b43cc4.jsonl`
- `gemini-cli`
  - session id: `410aac00-27eb-440b-9287-0586bc7ba03a`
  - source: `C:/Users/varun/.gemini/tmp/gemini-cli/chats/session-2026-05-25T05-25-410aac00.jsonl`

## Headline Numbers

| Agent | Active work time | Idle removed | Prompt turns | Feedback turns | Total tool calls | Motion.dev MCP | Browser MCP | Observed tool error rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Codex | 1h 1m 30s | 8h 27m 38s | 14 | 13 | 350 | 17 | 136 | 4.29% |
| Claude Code | 2h 41m 42s | 1h 47m 54s | 12 | 11 | 198 | 6 | 50 | 8.08% |
| Gemini CLI | 2h 5m 59s | 2h 34m 38s | 12 | 11 | 617 | 0 | 155 | 12.32% |

These active-work durations exclude idle gaps where the last agent response in a turn was already logged and the session was waiting for the next user prompt.

## Core Story Angles

### 1. MCP value shows up most clearly in the iterative loop, not the first answer

Across the three selected sessions:

- there were `38` user prompt turns
- `35` of them were follow-up or feedback turns
- there were `1165` total tool calls
- `341` browser MCP calls were used for verification, inspection, screenshots, or browser-side debugging
- there were `12h 48m 31s` of idle waiting gaps removed from the raw session spans
- the combined active work time becomes `5h 49m 11s`

That means the strongest productivity story here is not “agent gets one big prompt and finishes”. It is “agent stays in a tight build-debug-verify loop, and MCP servers compress the cost of each iteration”.

### 2. Specialized MCP usage diverged sharply even on the same task

Motion.dev MCP usage in the selected iterative sessions:

- Codex: `17`
- Claude Code: `6`
- Gemini CLI: `0`

This matters for the story because the prompt explicitly told every agent to use Motion.dev MCP, but actual tool behavior still diverged. The story angle is not that one output was better. The story angle is that **MCP availability does not automatically become MCP utilization**. Tool-aware agents convert that availability into workflow leverage more directly.

### 3. Browser MCP became the universal force multiplier

Even when Motion.dev MCP usage differed, browser automation converged as the shared productivity layer:

- Codex browser MCP calls: `136`
- Claude Code browser MCP calls: `50`
- Gemini CLI browser MCP calls: `155`

This suggests a strong narrative split:

- Motion.dev MCP helps with domain-specific implementation knowledge.
- Browser MCP helps with visual verification, debugging, and reducing human manual QA effort.

Together, they form a stronger story than Motion.dev MCP alone.

### 4. The real productivity win is feedback absorption

Each session started with the same initial hero request, but then expanded through multi-turn feedback:

- feature stacking: hero, liquid image, project grid, process section, clients carousel, final integration
- corrective loops: alignment bugs, scroll bugs, contact flow bugs, motion fidelity issues
- verification requests: Playwright/browser verification was explicitly requested multiple times
- screenshot-guided fixes: image or PNG driven feedback appeared in Codex and Gemini

The story to tell is that MCP-equipped agents can keep moving after the first draft, because they can inspect the running UI, patch code, rebuild, and verify again without a human doing all the intermediate work manually.

## Per-Agent Workflow Shape

### Codex

Codex shows the clearest “specialized MCP plus verification” workflow:

- `17` Motion.dev MCP calls
- `136` browser MCP calls
- `134` shell calls
- `58` file-edit calls

Its prompt sequence shows a long corrective tail after the full feature set was already in place. The important data-story point is that the tool stack supported sustained refinement:

- multiple process-section fixes
- screenshot-based overlap debugging
- later scroll-performance and jitter fixes

This is a good example of MCP helping the agent stay productive deep into revision work.

### Claude Code

Claude Code shows a more selective MCP pattern:

- `6` Motion.dev MCP calls
- `50` browser MCP calls
- `64` file-read calls
- `46` shell calls

The process is more read-heavy and lighter in total tool volume. The session also exposes a useful story detail: domain MCP is only helpful if the server’s affordances line up with the exact task. Two notable Motion.dev tool failures appeared early:

- unknown animation pattern for `generate_motion_component`
- missing API doc for `motion.span`

That is useful for the story because it shows that “having an MCP” is not enough. The server has to be aligned to the target use case and the agent has to know how to recover when the MCP surface is incomplete.

### Gemini CLI

Gemini CLI shows the strongest “general tooling without Motion.dev MCP” pattern:

- `0` Motion.dev MCP calls
- `155` browser MCP calls
- `165` shell calls
- `126` file-edit calls
- `92` planning/topic-update calls

This is the heaviest tool-use session overall. The useful story angle is not that this is better or worse. It is that when a domain MCP is not used, the workflow shifts into a more labor-intensive mix of shell, patch, and browser debugging. The session contains repeated build errors and a very large late-stage corrective block on the contact section.

That makes Gemini a useful contrast case for a story about **what specialized MCP can reduce**, even when a capable coding agent can still push forward through generic tooling.

## Feedback Pattern Data

### Feature-building phase

All three agents were asked to build, in order:

1. hero section
2. liquid/displaced hero background
3. project grid with fullscreen expansion
4. scroll-driven process section
5. clients carousel
6. final integration pass

This gives the story a clean scaffold: the task itself expanded in layers, like a real product build rather than a toy one-shot request.

### Corrective phase

After feature build-out, the feedback changed character:

- Codex: process alignment, overlap, no-scroll-animation, empty-screen, lag, jitter
- Claude Code: process alignment and verification-driven fixes
- Gemini CLI: process alignment, distorted timeline SVG, contact-section behavior, sticky scroll bug

This is the most important behavioral shift in the data: once the interface exists, productivity depends on how quickly the agent can absorb and resolve visual feedback.

## Suggested Story Spine

If another agent is writing the story, the most defensible framing is:

1. Building animated frontends is not a one-shot generation problem. It is an iterative verification problem.
2. MCP servers matter because they reduce friction in those loops.
3. Different MCPs solve different bottlenecks.
4. The best productivity story here is the combination of:
   - domain MCP for implementation guidance
   - browser MCP for live verification
5. The absence or underuse of a domain MCP does not stop work, but it appears to shift more load onto generic shell, patch, and browser-debug loops.

## Caveats For The Writer

- Do not claim these numbers measure output quality.
- Do not claim higher tool counts are inherently better.
- Do not claim lower tool counts are inherently more efficient without explaining what kind of work the tools were doing.
- Treat `tool_error_rate` as a normalized history signal, not a perfect apples-to-apples failure metric.
- Use `active work time` for productivity framing, not raw session span.
- Keep the strongest claim focused on workflow leverage, not model superiority.
