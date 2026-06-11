# Frontend + CloudFront Audit — portifolio

**Date:** 2026-06-11 · **Auditor:** Claude Fable 5 (main session, operator-requested full audit)
**Companion report:** `specs-implementation-audit.md` (same dir — specs/hygiene/backend dimensions)
**Scope here:** frontend implementation & component design · Projects section content · CloudFront cost

## Scores (1–10)

| Dimension | Score | Summary |
|---|---|---|
| Frontend architecture | 7.5 | Lazy routes, discriminated-union dispatch, Zod content model, build-time validators — genuinely good bones |
| Component design | 6.0 | Documented + accessible, but duplication, dead code, theme bug, inconsistent altitude |
| Projects section content | 3.0 | rand-engine absent, dadaia-workspace misrepresented, cards visually flat, dark diagrams dead on disk |
| Test health | 6.5 | 312 unit tests, e2e+axe+LHCI infra; 1 flaky test; CI Weekly red 3 weeks on main |
| CloudFront cost posture | 9.0 | Already at cost floor (~$0.50/mo total); only modernization left, no downgrade exists |

## Verdict on the "weak model" frontend

The architecture is **better than its reputation**: route-level code splitting keeping home as the eager LCP chunk, `switch(kind)` + `assertNever` dispatch over a Zod discriminated union, dev-only schema validation tree-shaken from prod, i18n parity + content validation scripts wired into CI, and consistent a11y discipline (aria-labelledby, focus-visible rings, single-h1 contract). What is weak is **finishing**: dead code left behind, copy-paste between templates, a theme-switching defect, stale/missing content, and template fossils (`vite_react_shadcn_ts@0.0.0`).

## Findings

### CRIT

- **FE-01 — Build is unreproducible at HEAD.** `frontend/package.json:24` + `package-lock.json:11,295` pin `@dadaia/analytics-sdk` to `file:../../dadaia-web/frontend/sdk`, which does not exist on this machine and can never exist inside CI's single-repo checkout. All 8 `npm ci` invocations across `ci.yml`/`ci-weekly.yml`/`deploy.yml` are broken for fresh clones; local builds run off a stale `node_modules` copy. CI Weekly on `main` has failed 3 consecutive weeks (2026-05-24, 05-31, 06-07). Fix: publish the SDK to a registry (GitHub Packages npm works for private), or vendor it under `frontend/vendor/`.

### HIGH

- **FE-02 — Dark-mode diagrams are dead on disk.** `DiagramAsset.tsx:48` selects the dark variant via `media="(prefers-color-scheme: dark)"`, but the site switches theme by toggling `html.dark` class (`useTheme.ts:18-23`). A user on a light OS toggling the site dark gets a light diagram on a dark page (and vice-versa). Compounding it, `CaseStudyTemplate.tsx:50` and `MetaProjectTemplate.tsx:51` only ever pass `light=` — yet `architecture-dark.svg` exists for dadaia-workspace, portifolio AND rand-engine. The dark assets are shipped and never shown. Fix: render via theme-aware classes (`dark:hidden` / `hidden dark:block`) or read `useTheme`, and pass both variants from content.
- **FE-03 — rand-engine missing from the Projects section** while its assets sit ready in `public/assets/projects/rand-engine/` (cover.webp + light/dark architecture SVGs). This is exactly the stalled phase C/E/V of release projects-cluster-v2 (see companion audit). The portfolio's strongest "Python library on PyPI" proof point is invisible.
- **FE-04 — dadaia-workspace misrepresented.** `projectsV2` types it `kind: case-study` with `card.tech: [TypeScript, React, Claude API, Python, Docker]`. It is a Python library, published on PyPI, open repo. No PyPI reference, no `pip install`, no version badge — same gap applies to rand-engine when added. The content model has no "library" concept at all.

### MED

- **FE-05 — Theme default contradicts its own comment.** `useTheme.ts:13-15`: comment says "fall through to system pref", code hard-returns `"dark"`. `prefers-color-scheme` is never consulted. Decide: honor system pref or document dark-by-default; don't lie in the comment.
- **FE-06 — ~840 lines of confirmed dead code.** `AppSidebar.tsx` (69 ln) is imported by nothing; it is the sole importer of `ui/sidebar.tsx` (761 ln). Legacy `projects` key (pre-V2) survives in all 3 locale JSONs with stale facts ("v0.12.0", "game-developer agent", `dadaia context activate`) and has zero non-test consumers. `public/assets/projects/portifolio/architecture.svg` superseded by the light/dark pair. `components/Portfolio.tsx` is an 8-line re-export shell.
- **FE-07 — i18n violation + template duplication.** The diagram Card block is copy-pasted between `CaseStudyTemplate.tsx:38-57` and `MetaProjectTemplate.tsx:39-58`, both with a **hardcoded Portuguese heading "Arquitetura"** in an app that ships en/pt/de from content JSON. Extract a `DiagramCard` taking an i18n'd title. Same altitude inconsistency: costs render via `<CostsTable>` component, the stack table is inlined in the template (`MetaProjectTemplate.tsx:76-95`).
- **FE-08 — ProjectCard undersells.** Schema enforces `card.tech.min(3)` but `ProjectCard.tsx` renders only title + 2-line summary — tech badges appear solely on the detail hero. No kind chip (Library / Infra / Games), no GitHub/PyPI affordance, no headline stat. For a section meant to showcase system-design ability, the index cards are the weakest link in the chain.
- **FE-09 — Flaky unit test.** `useContent.test.ts:101` ("setLanguage('en') switches to English content") fails intermittently with `result.current === null` under `waitFor` — observed 2-fail and 1-fail outcomes across consecutive runs. Flaky ≠ green; it will poison CI signal once FE-01 is fixed.

### LOW

- **FE-10** — `ProjectsIndexPage.tsx:24` uses `as ProjectsContentV2` cast + comment admitting no error boundary; `package.json` still `vite_react_shadcn_ts@0.0.0`.

## CloudFront cost analysis (operator question)

**You are already at the cheapest price class.** Both envs default `cloudfront_price_class = "PriceClass_100"` (`terraform/envs/{prod,stage}/main.tf`), no tfvars override. AWS offers exactly three classes — All ⊃ 200 ⊃ 100 — and **PriceClass_100 is the floor** (US, Canada, Europe, Israel). There is no "US+EU+Brazil" class to downgrade to:

- PriceClass_100 **already excludes** India and most of Asia — your stated goal is met.
- It also excludes the São Paulo edge: Brazilian visitors are served from US-East edges. Penalty ≈ 100–150 ms extra on first byte; with `compress = true`, HTTP/2, and a cached SPA, this is fine for a portfolio. Including São Paulo would require PriceClass_All (the most expensive) — not worth it.
- Geo-restriction allowlisting would *block* visitors (recruiters travel) and saves nothing — requests to a price-class-100 distribution already bill at class-100 rates regardless of viewer origin. Not recommended.

**Actual bill ≈ $0.50/month** (Route53 hosted zone). CloudFront's permanent free tier (1 TB egress + 10M requests/mo) covers a portfolio many times over; S3/ACM round to zero — matching what `projectsV2.portifolio.costs` already claims. **There is no meaningful CloudFront cost to reduce.** Worthwhile modernizations (performance, not cost):

1. `cloudfront.tf:33-38` uses deprecated `forwarded_values` — migrate to managed cache policies (`CachingOptimized`).
2. Add a cache behavior for `/assets/*` (Vite content-hashed files) with ~1-year TTL/immutable; keep `index.html` short-TTL. Current uniform `default_ttl = 3600` re-validates immutable assets hourly.
3. Idle stage distribution costs $0 — no savings in tearing it down.

## Projects-section evolution plan (recommended next release scope)

1. **Unblock the build** (FE-01) — registry-publish or vendor the analytics SDK. Everything else is moot while `npm ci` is broken.
2. **Finish projects-cluster-v2** — write the rand-engine block (pt/en/de), e2e smoke, run the V-phase validation gates already specced.
3. **Add a `library` kind** to the Zod union — fields: `pypi` (package, version, `pip install` snippet), `repo`, optional CI/coverage badges, headline stat (rand-engine: "132K rows/s"). Re-type **dadaia-workspace** from `case-study` to `library` with corrected tech (Python, PyPI, multi-runtime agents) and refresh its stale sections. This is what makes the "open-source Python libs" story land.
4. **Make the index cards sell** (FE-08) — kind chip, 3–4 tech badges, headline stat, GitHub/PyPI icons, real covers (they exist), subtle hover lift. 4 cards: rand-engine, dadaia-workspace, portifolio, tauan-games.
5. **Fix dark diagrams** (FE-02) + i18n'd shared `DiagramCard` (FE-07) — the architecture diagrams are the system-design showcase; today half their variants never render.
6. **Delete dead weight** (FE-06) and deflake `useContent.test.ts` (FE-09).
7. Hygiene cleanup per companion audit (419 MB `.worktrees/`, reports, caches, `specs_bkp/`).

Items 2–5 are one coherent release ("projects-cluster-v2 rc-2" or a v3 superseding it); item 1 is a hotfix-class blocker.
