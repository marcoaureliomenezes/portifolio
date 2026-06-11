---
name: portfolio-redesign-v1
status: Candidate
created: 2026-06-11
origin: operator directive + Fable design review (specs/audits/2026-06-11T034500Z/)
priority: HIGH
---

# portfolio-redesign-v1 — design overhaul + headless-content Phase 1

**Goal (operator):** a recruiter-optimized, minimalist-with-style portfolio that puts
the personal projects on stage, wastes no space, and whose content layer is ready to be
plugged into the future external admin-panel project (edit texts / add certifications /
add experiences without a release).

Full findings + rationale: `specs/audits/2026-06-11T034500Z/frontend-design-architecture-review.md`.

## Scope (5 slices, dependency-ordered)

1. **R1 — design-system discipline:** purge off-token rainbow colors (icons →
   muted-foreground; single amber accent), one brand treatment (kill gradient text),
   typography scale (display 36-44 / section 24 / card 16-18 / mono metadata), single
   animated `Disclosure` primitive replacing 3 collapsible patterns, flatten ornament
   (keep only the experience timeline rail), fix EmailModal DialogTitle a11y error +
   heading-inside-button semantics, theme-file cleanup (.dark layer, dead sidebar tokens).
2. **R2 — home information architecture:** Featured Projects strip (3 ProjectCards +
   "all projects →") directly under the hero; 2-col hero (identity/bio/CTAs left, mono
   "now" panel right); section reorder Hero → Projects → Experience → Skills → Certs →
   Education; sections visible by default (no opacity-0 until IntersectionObserver).
3. **R3 — density:** certifications → compact tile grid 2/3-col (saves ~1,200px, −22%
   page height), experience role-card compaction (summary line, not 3-bullets-joined),
   max-w-5xl, prune dead props.
4. **R4 — headless-content Phase 1 (admin-panel readiness):** content JSON moved out of
   the JS bundle to `public/content/` + runtime fetch with ETag; full-content Zod schema
   exported as versioned JSON Schema contract (zod-to-json-schema) for the admin project;
   stable `id` on every entity; absorb `profile.ts` into content; `schema_version` +
   `published_at`; bundled en snapshot as fallback. Acceptance: change a text in the
   S3 JSON + invalidate → site shows it, NO build.
5. **R5 — verification:** axe green, e2e updated, Lighthouse ≥ 90 mobile, 3-locale
   parity, operator visual approval on preview server.

## Constraints

- Dark default stays (deliberate, mobile-redesign-v1). Content TEXT unchanged (only
  structure/fields like `id`, optional `summary`). /projetos detail pages unchanged
  (rc-2 just delivered them) except shared-primitive adoption.
- The admin panel itself is a SEPARATE project — this release only makes the front
  pluggable (the contract is the JSON Schema + content URL convention).

## Dependencies

- projects-cluster-v2 rc-2 merged (branch pushed 2026-06-11, awaiting operator PR).
- Pairs with: CloudFront cache-policy modernization (audit 2026-06-11T013733Z) — the
  `/content/*` behavior lands together with the managed cache policies.
- Related debt: `e2e-spec-debt-projects-cluster.md` (LanguageSelector on /projetos) —
  R2's header work may absorb it.
