# Motion.dev MCP Benchmark Executive Summary

Date: 2026-05-15

## One-Paragraph Readout

This benchmark compared four coding agents across four Motion.dev-heavy animation prompts: a `MagneticDock`, an interactive SVG blob, a scroll-driven cinematic timeline, and a liquid menu. The key result is that Motion.dev MCP availability did not produce uniform behavior. `codex` was the fastest overall agent at `26m 50s` total and also the heaviest Motion.dev MCP user with `31` Motion.dev-specific calls across all `4/4` prompts. At the same time, `gemini-cli` logged `0` Motion.dev MCP calls and still won `2/4` prompts on speed, finishing second overall at `32m 54s`. The clean data-story takeaway is that strong MCP integration can help materially, but actual agent behavior matters more than prompt wording alone.

## Core Numbers

- Fastest overall: `codex` at `26m 50s`, with `31` Motion.dev MCP calls and `97` total tool calls.
- Second overall: `gemini-cli` at `32m 54s`, with `0` Motion.dev MCP calls and `38` total tool calls.
- Third overall: `claude-code` at `42m 51s`, with `16` Motion.dev MCP calls and `91` total tool calls.
- Slowest overall: `opencode-minimax-2.5` at `61m 49s`, with `4` Motion.dev MCP calls and `78` total tool calls.

## Prompt Winners

- `dock`: `claude-code` in `7m 25s`
- `blob`: `gemini-cli` in `2m 47s`
- `timeline`: `codex` in `3m 24s`
- `menu`: `gemini-cli` in `5m 14s`

## Strongest Story Angles

- `codex` is the strongest "MCP + speed" angle because it used Motion.dev MCP consistently and still finished first overall.
- `gemini-cli` is the strongest "fast without MCP" angle because it never used recorded Motion.dev MCP calls and still won twice.
- The benchmark shows that saying "use the Motion.dev MCP" in the prompt does not ensure consistent tool usage across agents.
- The `timeline` prompt is the clearest separation graphic because `codex` finished in `3m 24s` while `claude-code` took `20m 25s`.
- The `dock` prompt was the hardest overall based on average completion time across all four agents.

## Suggested Framing For Another LLM

Avoid framing this as "more MCP calls always equals better performance." The stronger framing is:

- MCP integration quality matters.
- Agent behavior under the same prompt diverges substantially.
- Zero-MCP wins exist.
- The benchmark measures speed and tool usage, not output quality.
