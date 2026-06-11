# Frontend Design + Headless-Readiness Review — portifolio

**Date:** 2026-06-11 · **Reviewer:** Claude Fable 5 (operator-requested deep design review)
**Method:** full component read (19 home components + theme) + live browser inspection at
1440×900 and 390×844, both themes (vite preview of `feature/projects-cluster-v2-rc2`)
**Out of scope (operator):** content text, the projects inside /projetos (rc-2 just shipped them)

## Verdict

The implementation is **functionally solid** (clean component decomposition, content fully
externalized to JSON, consistent a11y intent, working i18n fallback chain). The design is
**acceptable but not optimal** — it loses the recruiter in exactly the ways the operator
suspects: the strongest material (personal projects) is invisible on the home page, the
certifications burn a third of the page on near-empty rows, and the visual language
violates its own minimalism with rainbow icons and ornamental gradients. The architecture
has one structural blocker for the admin-panel future: **content is compiled into the JS
bundle**, so every text edit is a build+deploy.

Scores: information-architecture **4/10** · space-economy **4/10** · visual-consistency
**5/10** · component-quality **7/10** · headless-readiness **5/10** (foundation good,
delivery blocked).

## A. The recruiter's 30-second test (information architecture)

Measured page: **5,589 px** desktop. Section heights: hero 452 · experience 1,949 ·
education 258 · certifications 1,828 · skills 902.

- **A-1 (CRIT, IA).** Personal projects do not exist on the home page. They live behind a
  nav pill and a hero CTA. A recruiter scanning top-down sees: bio → 4 jobs → degree →
  11 certs → skill chips — and never rand-engine or dadaia-workspace, the system-design
  proof the portfolio exists to show. The rc-2 `ProjectCard`s are exactly the artifact to
  surface: a **Featured Projects strip (3 cards + "all projects →") directly under the
  hero**.
- **A-2 (HIGH).** Above the fold at 1440×900: hero ends ~520px; the lower half of the
  first screen is empty (compounded by A-4). The most valuable real estate shows zero
  evidence of work. Proposal: 2-column hero — left identity/bio/CTAs, right a mono
  "now" panel (current role @ Santander · latest cert · latest project) or the first
  featured-project card.
- **A-3 (MED).** Section order fights the scan: certs (1,828px) sit between education and
  skills. Recruiter order: who → what (projects/skills) → where (experience) → proof
  (certs/education). Proposed home: Hero → Featured Projects → Experience → Skills →
  Certifications → Education → contact footer.
- **A-4 (MED, defect).** Sections mount `opacity-0` until `useInView` flips — screenshot
  caught the experience section fully invisible inside the viewport. Slow JS = blank
  page; print/reader/no-JS = nothing. Render visible by default; animate with
  motion-safe CSS only (`animation` from opacity 0 as *enhancement*, not initial state).

## B. Space economy (operator's "wasted space" — confirmed with numbers)

- **B-1 (HIGH).** Certifications: 11 items consume **1,828 px (33% of the page)** —
  ~166 px per cert, each a full-width row that is ~60% whitespace, wrapped in
  per-category collapsibles with gradient header pills. Redesign: **compact tile grid**
  (2-col md / 3-col lg): badge image 40px, name (2-line clamp), level chip + date in
  mono, the whole tile is the credential link. Provider shown as a slim group caption,
  not a collapsible bar. Expected: ~600 px total (−1,200 px, −22% of the page).
- **B-2 (MED).** Experience (1,949 px): role teaser is `responsibilities.slice(0,3).join(" ")`
  — three bullets fused into one run-on paragraph that ellipsizes mid-sentence. Replace
  with a single summary line (first responsibility, or a dedicated `summary` field when
  the admin lands) + tighter vertical rhythm (p-4→p-3, space-y-4→3). ~−30%.
- **B-3 (LOW).** `max-w-4xl` (896px) on 1440+ leaves ~40% flanking dead space while
  content competes for vertical room. `max-w-5xl` + the 2-col hero + 3-col certs uses
  the width instead of the height.

## C. Visual language (minimalism violations)

- **C-1 (HIGH).** Literal rainbow off-token colors in a 2-color design system:
  `text-green-600` (calendar), `text-red-600` (map pin), `text-yellow-600` (award,
  trophy, certs section icon), `text-blue-600` (tech link), `text-green-500`
  (education), `bg-green-400` pulse, plus brand-colored social icons (`#0A66C2`,
  `#E1306C`). Seven hues against the slate+amber system; several read poorly in dark
  mode. Rule: icons inherit `text-muted-foreground`; the ONLY accent is amber; social
  icons monochrome with hover-accent.
- **C-2 (MED).** Brand gradient inconsistency: header wordmark `from-amber-400
  to-orange-500`, hero h1 `from-amber-300 to-orange-400` — two ambers for the same
  brand. And gradient-text at `text-2xl` looks muddy. Pick one: solid `text-accent`
  wordmark; hero h1 in `text-foreground` with an accent keyword span. Kill gradient text.
- **C-3 (MED).** Ornament inflation: gradient side-bars on every section title AND every
  category AND every experience card, dotted connectors, gradient trigger pills, a
  gradient box around the technologies paragraph. When everything is decorated, nothing
  is. Keep ONE structural motif — the vertical timeline rail in Experience — and flatten
  the rest to plain borders.
- **C-4 (MED).** Three different disclosure patterns (section card-header chevron /
  certs gradient pill / role card) and all three swap `ChevronUp`/`ChevronDown` elements
  instead of one chevron with `rotate-180 transition-transform`. Unify into a single
  `Disclosure` primitive: same trigger anatomy, animated chevron, animated height
  (tailwindcss-animate is already installed), consistent default-open policy
  (sections open; roles closed-with-summary; cert groups gone per B-1).
- **C-5 (LOW).** Typography hierarchy is timid: hero h1 at `text-2xl` (a headline that
  also `whitespace-nowrap`-ellipsizes on mid screens — a headline must wrap, never
  truncate); section titles vs card titles barely differ. Define the scale: display
  36/44 (hero, wraps), section 24, card 16–18, metadata in JetBrains Mono 12–13 (dates,
  stats, periods — leaning into the data-engineer identity; the mono stats line in the
  hero is already the best moment of the current design).
- **C-6 (LOW).** Theme file debt: `.dark` block sits OUTSIDE `@layer base`; dead sidebar
  token set + `[data-sidebar]` media rule survive the sidebar removal; `--gradient-*`
  tokens defined but used incoherently.

## D. Component quality defects

- **D-1 (HIGH, live a11y error).** EmailModal Radix Dialog renders without
  `DialogTitle`/`Description` — console error on every page load (screen-reader
  blocking per Radix contract).
- **D-2 (MED).** `MobileCollapsibleSection` puts the section `<h2>` (CardTitle) inside
  the `<button>` trigger — heading-inside-button semantics; restructure trigger so the
  heading is a sibling.
- **D-3 (MED).** `PROVIDER_ICONS` hardcodes category→icon with **relative** paths
  (`images/aws_icon.png` — route-dependent resolution); icon mapping belongs in content
  (becomes admin-editable), paths absolute.
- **D-4 (LOW).** Dead surface: `CertificationCard` receives 5 label props and uses 1;
  `Portfolio` still accepts the deprecated `language` prop; `HeaderDesktopLayout` carries
  5 "backward-compat, not rendered" props. Prune.
- **D-5 (LOW).** Cert rows render a `View credential` button per row (11 buttons);
  in the B-1 tile design the tile itself is the single link.

## E. Headless-admin readiness (the architectural question)

**What is already right:** components are 100% content-driven via `useContent()`
(text-free components — the hard part is done); Zod exists; an i18n parity gate exists;
S3+CloudFront is already the perfect serving substrate for content JSON.

**The blocker (E-1, CRIT for the goal):** `LanguageContext.loadLocaleRaw` resolves
locales through build-time module loaders — `pt/en/de.json` are compiled into hashed JS
chunks (`dist/assets/en-*.js`, 29 KB). Content is code: every letter change requires
build + deploy. This single fact makes the current front incompatible with an external
admin panel.

**Gaps behind it:** (E-2) no stable entity IDs — certs keyed by name, experiences/roles
by array index; an admin cannot address "edit cert X" reliably. (E-3) Zod covers only
`projectsV2`; experiences/certs/education/skills have TS types but no runtime schema —
no contract to hand the admin project. (E-4) `src/data/profile.ts` hardcodes
contact/CV URLs outside content. (E-5) no content versioning/draft mechanism.

**Evolution plan (phased; only Phase 1 belongs in the next frontend release):**

- **Phase 1 — content out of the bundle** (frontend, next release):
  1. Move `{pt,en,de}.json` to `public/content/` → served by the existing S3+CloudFront.
  2. `loadLocaleRaw`: dynamic import → `fetch('/content/<lang>.json')` (ETag/no-cache
     headers; CloudFront behavior `/content/*` short-TTL — pairs with the cache-policy
     modernization from the CloudFront audit).
  3. Full-content Zod schema (all sections), validated in CI and dev-runtime; export
     JSON Schema via `zod-to-json-schema` (already a devDep) as the **versioned contract**
     the admin project will consume (`content/schema/v1.json`).
  4. Stable `id` on every entity (experience, role, cert, education entry, skill
     category, project). `schema_version` + `published_at` fields in each locale file.
  5. Absorb `profile.ts` into content. Keep the bundled `en.json` as offline/error
     fallback snapshot.
  **After Phase 1, editing content = upload JSON + CloudFront invalidation. No release.**
- **Phase 2 — publish contract + draft/preview** (mostly admin-project side):
  `content/draft/` + `content/published/` prefixes on S3; front gains a `?preview`
  mode reading draft. Asset upload path convention (`/assets/...`, size budgets moved
  into the admin API).
- **Phase 3 — the admin panel** (the separate project you're creating): auth
  (Cognito/OIDC), schema-driven forms generated from the JSON Schema contract, writes
  via presigned-PUT/Lambda → S3, CloudFront invalidation hook, S3 versioning as
  edit history/rollback. **Zero further changes required in this front** if Phase 1
  lands correctly — that is the test of the contract.

## F. Recommended release shape ("portfolio-redesign-v1")

Slices in dependency order, each independently shippable:
1. **R1 — design-system discipline:** token cleanup (C-1/C-2/C-6), typography scale
   (C-5), single Disclosure primitive (C-4), kill ornament inflation (C-3), fix D-1/D-2.
2. **R2 — home IA:** Featured Projects strip under hero (A-1), 2-col hero (A-2),
   section reorder (A-3), visible-by-default sections (A-4).
3. **R3 — density:** certifications tile grid (B-1, D-5), experience compaction (B-2),
   max-w-5xl (B-3), prune dead props (D-4).
4. **R4 — headless Phase 1** (E-1..E-5) — can run parallel to R2/R3.
5. **R5 — verification:** axe + e2e updates, Lighthouse, 3-locale parity, visual pass
   with the operator on the preview server.

Direction in one sentence: **"quiet terminal" minimalism** — slate + one amber accent,
Inter for prose, JetBrains Mono reserved for metadata, one structural motif (the
experience timeline rail), density from grids instead of stacked rows, and the projects
finally on stage where the recruiter lands.

## Evidence

Screenshots: `.dadaia/tmp/claude/20260611/{home-fold-dark,experience-dark,certs-dark,mobile-fold-dark}.jpeg`
(ephemeral). Measurements via DOM (`scrollHeight`, per-section `getBoundingClientRect`).
Console: Radix Dialog a11y error captured live. Component evidence: file:line refs above
map to `frontend/src/components/{portfolio,header}/*` and `frontend/src/contexts/LanguageContext.tsx:42-50`.
