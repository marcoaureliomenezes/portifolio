# Release PLAN — visual-identity-v1 (archived)

**Status:** Aprovado

## Sequência executada (3 ondas, 1 PR cada)

1. **WAVE1** — paleta amber + Inter/JetBrains Mono via `@fontsource/*` + dark mode
   toggle (Sun/Moon `lucide-react`) com persistência em `localStorage` e respeito a
   `prefers-color-scheme`. Script inline no `<head>` evita flash de tema claro.
2. **WAVE2** — microinteractions: scroll-triggered `fade-up`/`fade-in` via
   IntersectionObserver, hover-lift em cards, backdrop-blur no header quando scrolled.
   Respeito a `prefers-reduced-motion`. Skill semantic colors (cloud=blue,
   language=emerald, database=purple, ai-tooling=accent).
3. **WAVE3** — Hero memorável: layout 2-col desktop (60% texto / 40% avatar+halo),
   avatar 192px com halo `box-shadow: 0 0 80px hsl(var(--accent)/0.3)`, tagline grande
   (`text-4xl md:text-6xl`), stats em mono (`5+ years · 9 certs · 4 clouds`), 2 CTAs.

## Critérios de fechamento (atendidos)

- Lighthouse Performance >= 90, Accessibility >= 90, CLS = 0, LCP <= 2.5s mantidos.
- E2E não regrediu (axe smoke + i18n + 3 abas).
- Dark mode persiste e não causa flash.
- Bundle não inflado (snapshot antes/depois OK).

## Out-of-scope (movido para `fe-qual-refactor-v1` como WAVE5/WAVE6)

- Content AI emphasis (refresh dos JSONs + RoleSkillBadges + HighlightProjectBlock) —
  identificado pós-WAVE3 como gap crítico de conteúdo, não de identidade visual.
