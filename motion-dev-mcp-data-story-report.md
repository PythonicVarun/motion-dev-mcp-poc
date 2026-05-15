# Motion.dev MCP Benchmark Report

Date: 2026-05-15

## Executive Summary

This benchmark compares four coding agents on four Motion.dev-heavy animation prompts:

1. `context-rich`: `MagneticDock`
2. `goal-oriented`: interactive SVG blob
3. `spec-driven`: scroll-driven cinematic timeline
4. `visual-first`: liquid menu

Two top-line findings stand out:

- `codex` was the fastest overall agent and also the heaviest Motion.dev MCP user.
- `gemini-cli` recorded zero Motion.dev MCP calls across all four tasks, yet it was still the fastest on 2 of the 4 prompts.

That means the story is not "more MCP calls always means faster output." The more defensible story is:

- strong MCP integration can help a lot when the agent actually uses it well;
- some agents can still move quickly with no recorded MCP usage at all;
- the presence of an MCP in the prompt does not guarantee that every agent will invoke it.

## Methodology

History roots used:

- `Claude Code`: `C:\Users\varun\.claude\projects\V--Codes-Internship-Straive-Apr-26-motion-dev-mcp-poc-claude-code`
- `Codex`: `C:\Users\varun\.codex\sessions\2026\05\15`
- `Gemini CLI`: `C:\Users\varun\.gemini\tmp\gemini-cli\chats`
- `OpenCode`: `C:\Users\varun\.local\share\opencode\opencode.db` and `C:\Users\varun\.local\share\opencode\storage`

Metric definitions:

- `Duration`: time from the benchmark prompt being received to the first completed benchmark turn for that prompt.
- `Motion.dev MCP calls`: only explicit Motion.dev-specific tool invocations.
- `Total tool calls`: all recorded tool invocations in that prompt run, including shell/file/task tools.

Important normalization notes:

- For `codex`, Motion.dev calls are logged with names like `search_motion_docs` and `get_component_api`; they do not carry an `mcp__...` prefix, but they are clearly Motion.dev toolkit calls and were counted.
- For `claude-code`, only tools named `mcp__motion-dev__*` were counted as Motion.dev MCP calls.
- For `opencode-minimax-2.5`, only tools named `motion-dev_*` were counted as Motion.dev MCP calls.
- For `gemini-cli`, no Motion.dev-specific tool calls were recorded in the benchmark sessions.
- Generic discovery calls such as `list_mcp_resources` were not counted as Motion.dev MCP calls.

Session selection caveats:

- `codex` dock: an initial 2-second stub session existed before the real run. I excluded the stub and used the first full successful benchmark turn from `rollout-2026-05-15T11-34-27-019e2a3c-7a69-7083-8dec-fe355abd80bb.jsonl`.
- `codex` dock and `claude-code` dock both had later follow-up turns about viewing/running the output. I excluded those follow-ups and counted only the first benchmark completion.
- `gemini-cli` blob had two successful runs; I used the later successful run (`session-2026-05-15T06-45-7d11b6c4.jsonl`) as the final benchmark artifact source.
- `opencode-minimax-2.5` does not expose a clean turn-duration field in the same way as Claude/Codex, so its duration is derived from session `time_created -> time_updated` in `opencode.db`.

## Prompt-by-Prompt Results

### 1. MagneticDock (`context-rich`)

| Agent | Duration | Motion.dev MCP calls | Total tool calls | Source |
|---|---:|---:|---:|---|
| `claude-code` | 7m 25s | 0 | 23 | `87f7f279-72ee-492b-b316-8bb9303172cd.jsonl` |
| `codex` | 8m 25s | 13 | 29 | `rollout-2026-05-15T11-34-27-019e2a3c-7a69-7083-8dec-fe355abd80bb.jsonl` |
| `gemini-cli` | 14m 09s | 0 | 13 | `session-2026-05-15T06-06-2a452776.jsonl` |
| `opencode-minimax-2.5` | 24m 27s | 4 | 34 | `ses_1d5b9e18affep744wQ8BGdMMWP` |

Readout:

- Fastest: `claude-code`
- Highest Motion.dev MCP usage: `codex`
- Slowest by a large margin: `opencode-minimax-2.5`

### 2. Interactive SVG Blob (`goal-oriented`)

| Agent | Duration | Motion.dev MCP calls | Total tool calls | Source |
|---|---:|---:|---:|---|
| `claude-code` | 7m 27s | 5 | 8 | `a482cf5e-4361-4bc3-9e42-3a28bc1a36f7.jsonl` |
| `codex` | 9m 01s | 6 | 24 | `rollout-2026-05-15T12-13-51-019e2a60-8dba-78b3-850d-a62b2eb4f96c.jsonl` |
| `gemini-cli` | 2m 47s | 0 | 3 | `session-2026-05-15T06-45-7d11b6c4.jsonl` |
| `opencode-minimax-2.5` | 3m 49s | 0 | 5 | `ses_1d59e96dfffeQpxNoeZ6Ab86W9` |

Readout:

- Fastest: `gemini-cli`
- Highest Motion.dev MCP usage: `codex`
- This is the clearest "zero-MCP but still fastest" prompt.

### 3. Scroll-Driven Cinematic Timeline (`spec-driven`)

| Agent | Duration | Motion.dev MCP calls | Total tool calls | Source |
|---|---:|---:|---:|---|
| `claude-code` | 20m 25s | 6 | 31 | `298c230b-08ff-4ccb-8cf5-eeed95f02d05.jsonl` |
| `codex` | 3m 24s | 5 | 17 | `rollout-2026-05-15T12-26-30-019e2a6c-218c-74d0-b17f-267c2b78ee9b.jsonl` |
| `gemini-cli` | 10m 44s | 0 | 14 | `session-2026-05-15T06-57-512af8e4.jsonl` |
| `opencode-minimax-2.5` | 14m 21s | 0 | 19 | `ses_1d592aacaffetSZBtTEtcqOcf1` |

Readout:

- Fastest: `codex`, by a very wide margin
- Highest Motion.dev MCP usage: `claude-code`
- Most dramatic speed spread across agents

### 4. Liquid Menu (`visual-first`)

| Agent | Duration | Motion.dev MCP calls | Total tool calls | Source |
|---|---:|---:|---:|---|
| `claude-code` | 7m 33s | 5 | 29 | `0e0a0bc9-a8c3-45ea-9f46-9bc80576a3fe.jsonl` |
| `codex` | 6m 01s | 7 | 27 | `rollout-2026-05-15T12-45-15-019e2a7d-4c58-7bc2-a750-fd16c91c5260.jsonl` |
| `gemini-cli` | 5m 14s | 0 | 8 | `session-2026-05-15T07-16-72861c00.jsonl` |
| `opencode-minimax-2.5` | 19m 13s | 0 | 20 | `ses_1d581abb6ffehJDTLpZf8W8Ro2` |

Readout:

- Fastest: `gemini-cli`
- Highest Motion.dev MCP usage: `codex`
- Again, zero recorded MCP usage did not prevent Gemini from winning on speed

## Aggregate Agent Rollup

| Agent | Total duration across 4 prompts | Avg duration per prompt | Motion.dev MCP calls | Total tool calls | Prompts with at least 1 Motion.dev MCP call |
|---|---:|---:|---:|---:|---:|
| `codex` | 26m 50s | 6m 43s | 31 | 97 | 4 / 4 |
| `gemini-cli` | 32m 54s | 8m 14s | 0 | 38 | 0 / 4 |
| `claude-code` | 42m 51s | 10m 43s | 16 | 91 | 3 / 4 |
| `opencode-minimax-2.5` | 61m 49s | 15m 27s | 4 | 78 | 1 / 4 |

## Prompt Difficulty Rollup

Average completion time by prompt:

| Prompt | Avg duration across agents |
|---|---:|
| `dock` | 13m 37s |
| `timeline` | 12m 13s |
| `menu` | 9m 30s |
| `blob` | 5m 46s |

Interpretation:

- `dock` was the heaviest prompt overall.
- `timeline` was also expensive, but its cost was more uneven: `codex` finished quickly while `claude-code` took far longer.
- `blob` was the easiest prompt for this benchmark set.

## Main Findings

1. `codex` is the strongest "MCP + speed" story.
   It logged the most Motion.dev MCP calls overall (`31`) and still finished the entire benchmark fastest (`26m 50s` total).

2. `gemini-cli` is the strongest "fast without MCP" story.
   It logged zero Motion.dev MCP calls, yet it was the fastest on `blob` and `menu`, and second-fastest overall.

3. `claude-code` shows selective MCP dependence.
   It used Motion.dev MCP heavily on `blob`, `timeline`, and `menu`, but not on the initial completed `dock` turn.

4. `opencode-minimax-2.5` shows partial MCP adoption and the weakest overall speed profile.
   It only logged Motion.dev MCP usage on `dock`, and it was the slowest overall agent by a large margin.

5. MCP usage and speed are related, but not linearly.
   More MCP calls did not automatically mean slower work, and zero MCP calls did not automatically mean worse performance.

## Story Angles for a Downstream LLM

Use these as narrative options, not as mutually exclusive conclusions.

### Angle A: "The best result came from actual MCP integration, not just MCP availability"

- `codex` used Motion.dev MCP on all four prompts.
- It also had the best overall completion time.
- This supports a story about integration quality, not just benchmark prompt wording.

### Angle B: "Prompt mentions MCP, but agent behavior still diverges"

- `gemini-cli` never invoked Motion.dev MCP in recorded history.
- `claude-code` invoked it on 3 of 4 prompts.
- `opencode-minimax-2.5` invoked it on only 1 of 4 prompts.
- `codex` invoked Motion.dev tools on all 4 prompts.

This is a strong product-story point: agent tooling behavior is inconsistent even under identical prompts.

### Angle C: "Zero-MCP wins exist"

- `gemini-cli` won `blob` and `menu` on pure completion speed with zero recorded Motion.dev MCP calls.
- This gives the data story an important counterbalance so it does not become simplistic MCP cheerleading.

### Angle D: "The dock prompt was the real stress test"

- Highest average duration across agents: `13m 37s`
- Widest slowdown for weaker performers
- Mixed tool-use patterns: some agents leaned on Motion.dev tools, others did not

### Angle E: "Timeline separated the field"

- `codex`: 3m 24s
- `claude-code`: 20m 25s

That gap is large enough to anchor a dramatic comparison graphic by itself.

## Recommended Visualizations

1. A grouped bar chart: `prompt x agent`, y-axis = `duration`.
2. A grouped bar chart: `prompt x agent`, y-axis = `Motion.dev MCP calls`.
3. A scatter plot: x-axis = `Motion.dev MCP calls`, y-axis = `duration`, colored by agent.
4. A ranked leaderboard card: total benchmark time per agent.
5. A prompt difficulty heatmap: rows = prompts, columns = agents, value = duration.
6. A binary usage matrix: rows = prompts, columns = agents, value = whether Motion.dev MCP was used.

## Caveats

- This is a history-based benchmark, not a lab replay. It reflects how the agents were actually used on this machine and in these directories.
- Completion time is not the same thing as output quality. This report does not score animation fidelity or visual polish.
- Some runs included retries or extra follow-up turns. I normalized those by counting the first completed benchmark turn, not later usability follow-ups.
- `opencode-minimax-2.5` durations are based on session metadata timing because its history format differs from Claude/Codex.

## Structured Dataset

```csv
prompt,agent,duration_ms,duration_human,motion_dev_mcp_calls,total_tool_calls,source
dock,claude-code,445405,7m 25s,0,23,87f7f279-72ee-492b-b316-8bb9303172cd.jsonl
dock,codex,504514,8m 25s,13,29,rollout-2026-05-15T11-34-27-019e2a3c-7a69-7083-8dec-fe355abd80bb.jsonl
dock,gemini-cli,849330,14m 09s,0,13,session-2026-05-15T06-06-2a452776.jsonl
dock,opencode-minimax-2.5,1466754,24m 27s,4,34,ses_1d5b9e18affep744wQ8BGdMMWP
blob,claude-code,447163,7m 27s,5,8,a482cf5e-4361-4bc3-9e42-3a28bc1a36f7.jsonl
blob,codex,541203,9m 01s,6,24,rollout-2026-05-15T12-13-51-019e2a60-8dba-78b3-850d-a62b2eb4f96c.jsonl
blob,gemini-cli,167269,2m 47s,0,3,session-2026-05-15T06-45-7d11b6c4.jsonl
blob,opencode-minimax-2.5,228713,3m 49s,0,5,ses_1d59e96dfffeQpxNoeZ6Ab86W9
timeline,claude-code,1225356,20m 25s,6,31,298c230b-08ff-4ccb-8cf5-eeed95f02d05.jsonl
timeline,codex,203999,3m 24s,5,17,rollout-2026-05-15T12-26-30-019e2a6c-218c-74d0-b17f-267c2b78ee9b.jsonl
timeline,gemini-cli,643576,10m 44s,0,14,session-2026-05-15T06-57-512af8e4.jsonl
timeline,opencode-minimax-2.5,860647,14m 21s,0,19,ses_1d592aacaffetSZBtTEtcqOcf1
menu,claude-code,453113,7m 33s,5,29,0e0a0bc9-a8c3-45ea-9f46-9bc80576a3fe.jsonl
menu,codex,360616,6m 01s,7,27,rollout-2026-05-15T12-45-15-019e2a7d-4c58-7bc2-a750-fd16c91c5260.jsonl
menu,gemini-cli,313641,5m 14s,0,8,session-2026-05-15T07-16-72861c00.jsonl
menu,opencode-minimax-2.5,1152842,19m 13s,0,20,ses_1d581abb6ffehJDTLpZf8W8Ro2
```
