# Motion.dev MCP Benchmark

This repository contains the results and source code for a Proof of Concept (POC) benchmark comparing the capabilities of various AI coding assistants and agents when developing interactive and motion-rich frontend applications using a Motion.dev Model Context Protocol (MCP).

## Overview

The benchmark evaluated four coding agents across distinct Motion.dev-heavy animation prompts (e.g., a MagneticDock, an interactive SVG blob, a scroll-driven cinematic timeline, and a liquid menu). The goal was to observe how each agent utilized the Motion.dev MCP and how that affected their speed and implementation success.

The full benchmark data, execution reports, and a live showcase of the generated applications are hosted on the `gh-pages` branch of this repository.

## Structure

The project is organized into top-level directories based on the AI tool used, and sub-directories based on the prompting strategy or development task employed.

### AI Assistants Evaluated
* **Claude Code** (`/claude-code`)
* **Codex** (`/codex`)
* **Gemini CLI** (`/gemini-cli`)
* **OpenCode Minimax 2.5** (`/opencode-minimax-2.5`)

### Prompting Strategies & Tasks
Within each assistant's directory, you will find experiments categorized by the following approaches/tasks:
* **Context-Rich:** Providing extensive background and related code context.
* **Goal-Oriented:** Defining the end-state and allowing the agent to determine the path.
* **Iterative:** Building the solution step-by-step with back-and-forth prompting.
* **Spec-Driven:** Providing a rigid technical specification for the agent to implement.
* **Visual-First:** Focusing primarily on aesthetics, animations, and visual polish.

## Tech Stack
The experiments primarily focus on modern frontend web technologies, utilizing frameworks and build tools such as:
* React / Vite
* TypeScript / JavaScript
* Vanilla CSS / CSS Modules
* Motion.dev (via MCP)

## Results & Reports

To view the final reports, metrics (`motion-dev-mcp-benchmark.csv`), and the interactive applications themselves, please check out the `gh-pages` branch. The static site hosted from there provides an executive summary and detailed performance comparisons across all agents.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
