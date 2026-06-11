# Release PLAN — portfolio-redesign-v1

**Status:** Aprovado

> Release ID: `portfolio-redesign-v1` · Created: 2026-06-11
> Depends on: SPEC.md Aprovado ✅ · Branch: `feature/portfolio-redesign-v1` (stacked on rc-2)

## Ondas (sequenciais, cada uma commitável e verde)

| Onda | Conteúdo | Arquivos-chave |
|---|---|---|
| W1 = R1 | tokens/typografia/Disclosure/a11y | `index.css`, `ui/disclosure.tsx` (novo), `EmailModal`, `MobileCollapsibleSection`, ícones em `portfolio/*`, `header/*`, `HeroSection` (h1), `HeaderDesktopLayout` (wordmark) |
| W2 = R2 | home IA | `portfolio/FeaturedProjects.tsx` (novo), `portfolio/HeroNowPanel.tsx` (novo), `Portfolio.tsx` (ordem), `NavAnchors`, conteúdo: labels novas nos 3 locales |
| W3 = R3 | densidade | `CertificationsSection`, `CertificationCard` (vira tile), remove `CertificationCategoryGroup` collapsible, `ExperienceCard`/`RoleCollapsible`, `Portfolio.tsx` (max-w-5xl), prune props |
| W4 = R4 | headless Fase 1 | `public/content/*.json` (movidos + ids + profile + versão), `contexts/LanguageContext.tsx` (fetch), `lib/schemas/content.ts` (novo), `scripts/export-content-schema.mjs` (novo), `scripts/validate-content.mjs` (paths/schema), `test-setup.ts` (fetch shim), `data/profile.ts` (removido), consumidores |
| W5 = R5 | gates + preview | testes novos/atualizados, e2e, axe, build, preview 3968, evidência antes/depois |

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Mover JSON quebra testes que importam `src/data/content/*` | Atualizar imports para path relativo de `public/content/`; shim fetch no test-setup lê do disco |
| Featured strip degrada LCP da home | Cards usam covers já otimizados (≤60KB) + loading=lazy; medir no preview |
| Remoção do collapsible de certs quebra e2e/a11y specs | Atualizar specs junto (mesma onda); axe re-rodado |
| fetch de conteúdo flakey em e2e | preview serve `public/` direto; `waitForLoadState('networkidle')` já cobre |

## Validação (gate da W5)

vitest ×2 · tsc · eslint · validate-content (schema completo) · i18n-parity ·
export-schema determinístico · build · e2e chromium projects-cluster + home ·
axe home · AC-RD-05/06 medidos via DOM no preview · AC-RD-07/10 provados com curl/edit.

Tasks detalhadas: TASKS.md (write sets por task).
