---
name: e2e-spec-debt-projects-cluster
status: Candidate
created: 2026-06-11
origin: projects-cluster-v2 rc-2 validation (W5)
---

# E2E spec debt — projects-cluster suite asserts UI that does not exist

9 specs fail on main AND on every branch (the cause of the weekly CI red and the
"relaxar gates E2E temporariamente" commit `8f42923`). Verified during rc-2: none
reference any rc-2-changed file; they were authored against UI that was never built.

| Specs | Root cause |
|---|---|
| `i18n-projects.spec.ts` ×6, `layout-shell.spec.ts` PC-E2E-35 | `switchLanguage()` clicks `[role="combobox"]` on `/projetos` routes — but `ProjectsLayoutShell` renders no Header/LanguageSelector; the selector only exists on the home page |
| `nav-projects.spec.ts` PC-E2E-19 | expects `.block.md:hidden nav[aria-label*="avega"]` (inline mobile header nav) — the mobile header has no such inline nav |
| `layout-shell.spec.ts` PC-E2E-37 | same shell-axe path blocked by the missing selector interactions |

**Resolution options (decide in a future release):**
1. Build the asserted UI: add LanguageSelector to ProjectsLayoutShell (it is a real
   UX gap — users cannot switch language on project pages) and an inline mobile nav.
2. Or rewrite the specs to the actual contract (switch language via home, then
   navigate) and delete the impossible assertions.

Option 1 is recommended: the i18n specs encode a legitimate product expectation.

**Also pre-existing — Lighthouse CI broken by dependency override:** `package.json`
`overrides.uuid: ">=11.1.1"` forces ESM-only uuid into `@lhci/cli` (CJS `require()`)
→ `ERR_REQUIRE_ESM`, `npx lhci autorun` cannot start on any machine/CI with a fresh
install. Same relaxed-gate commit covers it. Fix: scope the override away from
@lhci/cli or upgrade @lhci/cli when a uuid-11-compatible release exists.

rc-2 status: 30/39 green (all rand-engine, library, meta, index, a11y, games specs
pass); these 9 are quarantined as pre-existing and must not block the rc-2 PR
(gates already relaxed on main).
