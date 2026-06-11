# Release TASKS — portfolio-redesign-v1

**Status:** Aprovado

> Release ID: `portfolio-redesign-v1` · Created: 2026-06-11
> Owner de execução: sessão coordenadora (Claude Fable 5), diretiva direta do operador.
> Regra SDD: flip `[ ]`→`[-]` antes de escrever; `[-]`→`[x]` ao concluir; 1 `[-]` por vez.

## W1 — R1 design system

- [ ] **T-RD-01** — Tokens + tema
  - Write set: `src/index.css`
  - `.dark` para dentro de `@layer base`; remover tokens `--sidebar-*` e regra `[data-sidebar]`
- [ ] **T-RD-02** — Purge de cores literais + marca única + escala do h1
  - Write set: `src/components/portfolio/*.tsx`, `src/components/header/*.tsx`
  - AC-RD-02; wordmark sólido; h1 display sem gradient/ellipsis
- [ ] **T-RD-03** — Primitivo `Disclosure` + adoção + a11y
  - Write set: `src/components/ui/disclosure.tsx` (+test), `MobileCollapsibleSection`, `RoleCollapsible`, `EmailModal`
  - AC-RD-03, AC-RD-04 (DialogTitle), heading fora do button

## W2 — R2 home IA

- [ ] **T-RD-04** — FeaturedProjects + labels i18n
  - Write set: `src/components/portfolio/FeaturedProjects.tsx` (+test), `public/content/{pt,en,de}.json` (labels), `src/types/content.ts`
- [ ] **T-RD-05** — Hero 2-col + painel "now"
  - Write set: `src/components/portfolio/HeroSection.tsx`, `src/components/portfolio/HeroNowPanel.tsx` (+test)
- [ ] **T-RD-06** — Ordem de seções + NavAnchors + seções visíveis por default
  - Write set: `src/components/portfolio/Portfolio.tsx`, `src/components/header/NavAnchors.tsx`, seções (remoção do gate opacity-0)
  - AC-RD-01

## W3 — R3 densidade

- [ ] **T-RD-07** — Certs: tile grid (mata collapsible por categoria)
  - Write set: `CertificationsSection.tsx`, `CertificationCard.tsx`, delete `CertificationCategoryGroup.tsx` (+tests)
  - AC-RD-05
- [ ] **T-RD-08** — Experience compaction + container width + prune
  - Write set: `ExperienceCard.tsx`, `RoleCollapsible.tsx`, `Portfolio.tsx`, `HeaderDesktopLayout.tsx`, `Index.tsx`
  - AC-RD-06 (medido na W5)

## W4 — R4 headless Fase 1

- [ ] **T-RD-09** — Conteúdo para `public/content/` + ids + profile + versão
  - Write set: `public/content/{pt,en,de}.json` (git mv de `src/data/content/`), script de migração em `.dadaia/tmp/`
  - AC-RD-09, AC-RD-12
- [ ] **T-RD-10** — Loader fetch + shim de teste + consumidores de profile
  - Write set: `src/contexts/LanguageContext.tsx`, `src/test-setup.ts`, `src/data/profile.ts` (remove), `HeroSection`, `header/ContactStrip.tsx`, `header/EmailModal.tsx`, testes afetados
  - AC-RD-07, AC-RD-10
- [ ] **T-RD-11** — Schema completo + contrato JSON Schema + validate
  - Write set: `src/lib/schemas/content.ts` (+test), `scripts/export-content-schema.mjs`, `scripts/validate-content.mjs`, `public/content/schema/v1.json`, `package.json` (script)
  - AC-RD-08

## W5 — R5 verificação

- [ ] **T-RD-12** — Gates completos + e2e/axe + medições + preview + evidência
  - Write set: testes/e2e specs afetados, sem produção nova
  - AC-RD-04/05/06/07/10/11; preview 3968 atualizado para inspeção do operador
