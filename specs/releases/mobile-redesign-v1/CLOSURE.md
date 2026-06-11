# CLOSURE — mobile-redesign-v1

**Status:** Aprovado

## Summary

A release `mobile-redesign-v1` foi concluída e deployada em produção (merge PR #28 em
`main` via squash, 2026-05-23). Todas as tasks foram implementadas e validadas
visualmente no preview local (desktop + mobile 390px) antes do merge.

A release abrangeu mais do que os 3 tasks formais: um conjunto de QA fixes emergentes
foram absorvidos em T-MR-01 após revisão em dispositivo real (espaçamento, dark mode
default, cores dos ícones sociais, tagline mobile, bio teaser).

## Tasks completed

| Task ID | Description | Final commit SHA |
|---|---|---|
| T-MR-01 | Mobile-first redesign — padding, header clearance, dark default, bio teaser, social icon colors, tagline mobile wrap | `c344aa8` |
| T-MR-02 | Hero tagline — font size ~50% + uniform amber gradient | `c344aa8` |
| T-MR-03 | Hero social row — LinkedIn / GitHub / Instagram brand icons | `c344aa8` |

## Scope delivered (absorbed into T-MR-01)

Changes shipped beyond the 3 formal tasks:

- `useTheme.ts` — default theme forced to `"dark"` (was system-preference fallback)
- `Portfolio.tsx` — container padding `pt-16 md:pt-[72px]` to clear fixed header (was `pt-6 md:pt-10`)
- `HeroSection.tsx` — social icons always-on brand colours; tagline `sm:whitespace-nowrap` (desktop-only single line); separator reduced; bio `line-clamp-3` with cliffhanger teaser
- `RoleCollapsible.tsx` — role title never wraps on mobile (title+date stacked left, chevron right); period strings reformatted via `formatPeriod()` to `"Mon YYYY – Mon YYYY · X yrs Y mos"`
- `ExperienceCard.tsx` — `totalPeriod` also formatted via `formatPeriod()`
- `src/lib/formatPeriod.ts` — new utility; handles pt/en/de separators; recalculates duration from raw dates; discards stale hardcoded suffixes
- `ThemeToggle.test.tsx` — assertions updated for dark-first default
- `vitest.config.ts` — `server.deps.inline: ['react-icons']` for jsdom

## Validations

| Description | Evidence |
|---|---|
| All 312 unit tests green | `npx vitest run` — 312 passed, 0 failed |
| CI green on develop (pre-merge) | GitHub Actions run `26340456774` — success |
| Stage deploy green | GitHub Actions run `26340253389` — success |
| Production deploy green | GitHub Actions run `26340556362` — triggered on main push |
| Visual QA on desktop + mobile 390px | Preview at `http://192.168.1.50:8087` — operator validated |

## Drifts

None. All implementation is aligned with the 3 TASKS.

## Memory updates

None required for this release scope.

## Backlog returns

- `projects-cluster-v2` — add `dadaia-bots`, `dd-chain-explorer`, `burrinhos-barbe` to the projects showcase. SPEC started at `specs/releases/projects-cluster-v2/SPEC.md`.

## Archive decision

**MOVE** — mover `specs/releases/mobile-redesign-v1` para
`specs/_archive/releases/mobile-redesign-v1` após este CLOSURE aprovado pelo operador.
