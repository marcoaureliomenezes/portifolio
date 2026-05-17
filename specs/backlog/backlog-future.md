# Backlog — future / parked

Features explicitly parked (P1+) with reasoning. Differs from `candidates.md` in that
these are NOT next-up — they require an upstream condition before activation.

## CMS-lite (`cms-lite-v1`)

**Source:** `_archive/legacy-features/cms-lite.SPEC.md`
**Parked because:** Content authoring loop is not yet a pain point. The current
JSON-driven content (`content-json-v1`, already in `_archive/releases/`) covers the
recruiter persona path. CMS-lite becomes worth doing once content additions hit ~3+
per month or non-developer contributors need access.
**Reactivation trigger:** Operator decides content velocity needs a non-engineering
authoring path.

## Visual identity v2

**Source:** None archived yet; concept only.
**Parked because:** `visual-identity-v1` (in `_archive/releases/`) already shipped a
baseline visual language. A v2 round would address dark-mode refinement and motion
language, but is dependent on `fe-qual-refactor-v1` closing first (which touches the
sidebar + EmailModal — both visual-identity surface area).
**Reactivation trigger:** `fe-qual-refactor-v1` closes AND visual debt is observed in
the live site.

## Projects content AI emphasis (full release)

**Source:** `releases/fe-qual-refactor-v1/supporting/content-ai-emphasis.SPEC.md`
(currently scoped as a supporting input to fe-qual-refactor-v1)
**Parked because:** Captured today as a *content refresh* under `T-FE-WAVE5`, not a
release. If the content surface ever needs structural changes (new project tabs,
deeper AI tooling narrative, etc.), this feature could be re-promoted to a dedicated
release.

## Notes

- Items here are explicitly NOT promised. They exist so the next "what's next?"
  conversation has context, not so they get implemented by default.
- Move to `candidates.md` only when the reactivation trigger fires and operator
  confirms commitment.
