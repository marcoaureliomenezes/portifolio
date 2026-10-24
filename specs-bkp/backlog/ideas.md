# Backlog — ideas (raw pool)

Free-form notes and aspirational concepts. No commitment. Promote to `candidates.md`
once an idea has a concrete owner and acceptance criteria.

## Architecture page evolutions

- Live cost audit panel surfacing AWS spend per environment.
- Decision log timeline (ADR-style entries) embedded inline.
- Cross-link to `repos/dadaia-workspace` constitution for the broader workspace story.

## Recruiter funnel

- Single-click "request meeting" flow with calendar embed.
- Static social proof block (LinkedIn endorsements) populated from a JSON.

## Tech community funnel

- "What I'm working on right now" auto-updating banner from a single source of truth
  (e.g., latest GitHub repo activity or pinned issue).
- Public roadmap embed (parsed from `specs/releases/ACTIVE.md` across all repos).

## Performance baseline

- Cold-cache TTFB target: < 500ms anywhere in the world.
- Lighthouse mobile-throttled PR-gate, not just desktop.
