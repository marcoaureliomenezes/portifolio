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

No principle is recorded yet.

## Tech Stack

No technology is recorded yet.

## Structure

- Site content: `frontend/public/content/{pt,en,de}.json`, fetched at runtime as
  `/content/<lang>.json` (`frontend/src/contexts/LanguageContext.tsx`); its contract is
  `frontend/scripts/content-schema.mjs`, built on the one project schema
  `frontend/src/lib/schemas/projects.ts` and exported as `frontend/public/content/schema/v1.json`.

<!-- dadaia:fixed slop-code -->
### Slop — code (fixed)
- A docstring or comment follows the root `AGENTS.md` map §1 docstring sentence; a comment explains a non-obvious why.
- Code is born with a real caller in the same change; without a caller it does not exist.
- A fix replaces the old path; it never wraps it and never opens a second path.
- A port exists only with two production adapters; a parameter exists only when it is read.
- Detection: `dd-code-review` SLOP.md S1, S2, S4, S5.
<!-- /dadaia:fixed slop-code -->
