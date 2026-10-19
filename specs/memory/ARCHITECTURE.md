---
slug: ARCHITECTURE
title: Architecture
tldr: The system's principles, technology stack and structure.
summary: The Principles section holds the architecture principles; the Tech Stack and Structure sections describe what the code is today.
tags:
  - architecture
  - layers
  - design
---

## Principles

Greenfield: no principle is recorded yet. The founding release's SPEC proposes the initial
layout.

## Tech Stack

- (one line per technology, filled from the code by the first audit pass)

## Structure

No module layout is recorded yet; the founding release's CLOSURE records the implemented one.

<!-- dadaia:fixed slop-code -->
### Slop — code (fixed)
- A docstring or comment follows the root `AGENTS.md` map §1 docstring sentence; a comment explains a non-obvious why.
- Code is born with a real caller in the same change; without a caller it does not exist.
- A fix replaces the old path; it never wraps it and never opens a second path.
- A port exists only with two production adapters; a parameter exists only when it is read.
- Detection: `dd-code-review` SLOP.md S1, S2, S4, S5.
<!-- /dadaia:fixed slop-code -->
