# Prompt - Motion.dev MCP Benchmark Data Story

This document records the prompt used to generate the published data story at [`index.html`](./index.html), along with attribution to the model that produced it.

## Attribution

- **Model:** Claude Opus 4.7 (1M context) - model ID `claude-opus-4-7[1m]`
- **Tool:** [Claude Code](https://claude.com/claude-code) - Anthropic's official CLI for Claude
- **Date generated:** 2026-05-15
- **Source materials read by the model:**
  - [`motion-dev-mcp-data-story-report.md`](./motion-dev-mcp-data-story-report.md)
  - [`motion-dev-mcp-benchmark.csv`](./motion-dev-mcp-benchmark.csv)
  - [`motion-dev-mcp-benchmark.json`](./motion-dev-mcp-benchmark.json)
  - [`motion-dev-mcp-executive-summary.md`](./motion-dev-mcp-executive-summary.md)
- **Files produced:**
  - [`index.html`](./index.html) - root data story
  - [`claude-code/index.html`](./claude-code/index.html), [`codex/index.html`](./codex/index.html), [`gemini-cli/index.html`](./gemini-cli/index.html) - agent landing pages
  - This file

## Original prompt

The following prompt was given verbatim after a `/clear` to start a fresh context. The model was expected to base every factual claim only on the four source files listed above.

````
You are a senior tech journalist and data storyteller. Your job is to turn the attached benchmark materials into a polished, compelling, evidence-grounded
data story.

Files to use:
- motion-dev-mcp-data-story-report.md
- motion-dev-mcp-benchmark.csv
- motion-dev-mcp-benchmark.json
- motion-dev-mcp-executive-summary.md

Context:
This benchmark compares four coding agents on four Motion.dev-heavy animation prompts:
- context-rich: MagneticDock
- goal-oriented: interactive SVG blob
- spec-driven: scroll-driven cinematic timeline
- visual-first: liquid menu

The central theme is not "MCP always makes agents faster."
The deeper story is:
- actual tool-use behavior diverges across agents even under the same prompt,
- strong MCP integration can help materially,
- zero-MCP wins also exist,
- benchmark speed is not the same thing as output quality.

Your task:
Write a polished data story that could be published as a strong internal report, blog draft, or benchmark narrative. It should read like a finished piece, not
notes.

Requirements:
1. Base every factual claim on the attached files only. Do not invent metrics or quality judgments.
2. Keep the story nuanced. Do not oversimplify into "more MCP calls = better."
3. Highlight the strongest tensions in the data:
   - Codex was fastest overall and the heaviest Motion.dev MCP user.
   - Gemini CLI logged zero recorded Motion.dev MCP calls and still won 2 of 4 prompts on speed.
   - Prompt wording alone did not produce consistent MCP usage across agents.
   - The timeline prompt created the largest performance gap.
   - The dock prompt was the hardest overall by average completion time.
4. Make the piece readable and polished, with a strong opening hook and clean narrative flow.
5. Explicitly mention that this is a history-based benchmark and does not evaluate output quality or animation fidelity.
6. Use exact numbers where they strengthen the story.

Output format:
1. Headline
2. Subheadline
3. Main story
4. Key findings
5. Suggested charts
6. Short social-summary version

Style guidance:
- Write in a sharp, analytical, publication-quality tone.
- Make it engaging, but do not become dramatic or hype-driven.
- Prioritize clarity, narrative tension, and evidence.
- Explain what matters, not just what happened.
- Use tables or bullet points only where they improve readability; otherwise prefer strong prose.
- Assume the reader is familiar with LLM coding agents, but not with this specific benchmark.

Content guidance for each section:

Headline:
- Make it crisp and insight-led, not generic.

Subheadline:
- One sentence summarizing the core tension in the benchmark.

Main story:
- 700-1200 words.
- Start with the most surprising contrast in the data.
- Build toward the larger takeaway: MCP availability and MCP behavior are not the same thing.
- Compare the agents in a way that is fair and evidence-driven.
- Use the timeline and dock prompts as anchor examples where appropriate.
- Include exact benchmark totals and prompt winners where useful.

Key findings:
- 5 to 8 bullets.
- Each bullet should be concrete and data-backed.

Suggested charts:
- 4 to 6 charts.
- For each, give:
  - chart title
  - chart type
  - what it should show
  - why it matters

Short social-summary version:
- 120-180 words.
- Written like a concise LinkedIn or X/Twitter benchmark summary.

Important constraints:
- Do not claim that one agent produced better animations unless the files explicitly show quality evaluation.
- Do not imply causation where the data only shows correlation.
- Do not ignore the caveats around normalization and session selection.
- If there is ambiguity, state it clearly rather than smoothing it over.

Goal:
Produce a polished final narrative data story single, index.html.
````

## Subsequent refinements

The published page is the result of the original prompt plus a series of follow-up corrections during the same session. Each one shaped the final output materially and is worth recording for transparency:

1. **Direct links to generated outputs.** Add a per-prompt, per-agent matrix that links to each agent's static-export build, with completion time as the visible label and prompt winners starred. OpenCode's `dock` build is published at the agent root rather than in a `context-rich/` sub-route - the matrix reflects this rather than moving the existing Next.js build.

2. **Editorial agent landing pages.** Replace the dark "Segoe UI / gradient" landing pages at `claude-code/index.html`, `codex/index.html`, and `gemini-cli/index.html` with the same editorial theme as the data story: Fraunces serif, cream paper, per-agent accent color, a four-stat strip, and a 2×2 grid of per-prompt output cards with the winner badged. OpenCode's root was deliberately not touched because it serves the Magnetic Dock build directly.

3. **Model attribution.** Thread the underlying model into the story:
   - `codex` -> **GPT-5.4 (medium reasoning)**
   - `claude-code` -> **Claude Sonnet 4.6 (high reasoning)**
   - `gemini-cli` -> **Gemini 3.1 Pro Preview**
   - `opencode-minimax-2.5` -> **MiniMax M2.5**

   "Agent" is shorthand for the harness + model combination throughout the page.

4. **Drop the "Suggested charts" section.** A finished data story aimed at readers should not include a meta-instructional block that reads like notes from a writer to a downstream designer. Every chart described should be rendered inline as an actual figure, or dropped from the deliverable entirely. The original prompt's "Suggested charts" output section was therefore satisfied by *building* the charts rather than describing them.

5. **Build new charts directly when needed.** Two aggregate-level visualizations were added in a final pass because the stat strip at the top of the page conveyed the rankings only as numbers, not as a visual comparison:
   - **Figure 04 • Leaderboard** - total benchmark time per agent (horizontal bars).
   - **Figure 05 • Tool ledger** - total tool calls per agent, split into Motion.dev MCP vs. everything else (stacked horizontal bars).

## Note on factuality

Every number in the published page is derived from the four source files listed under *Attribution*. The model was instructed to invent no metrics and pass no quality judgments. Where ambiguity exists (e.g. OpenCode's session-metadata timing, Codex's non-`mcp__` Motion.dev tool names), it is called out explicitly in the *Methodology and caveats* footer of `index.html`.
