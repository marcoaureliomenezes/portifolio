# Release PLAN — projects-cluster-v1

**Status:** Aprovado

> Owner: product-engineer
> Strategy: ONE release with 3 internal phases (Architect §Q10 D4).
> No sub-releases. Each phase = 1 PR (blast-radius reduction via phasing, atomicity via single SPEC).

---

## 1. Estratégia geral

A release entrega o cluster de showcase de projetos em 3 fases sequenciais. Phasing é
estratégia de implementação (PRs separados), não fatiamento de spec.

- **Phase A** — content model + Zod build-time + i18n parity CI gate
- **Phase B** — dynamic routing + page deletion + `navRoutes` deletion + dynamic i18n import
- **Phase C** — index page + header nav CTA + Hero 3rd CTA + diagrams + visual polish

Phase A é dependência hard de B e C (tipos + JSON precisam existir antes do dispatch).
Phase B é dependência hard de C (Header nav aponta para `/projetos` que vem de Phase B).
Within Phase B há um transitional helper `getProjectBySlug(content, slug)` em
`useContent` para manter os 3 pages legados compilando até a deleção atômica final do PR.

## 2. Layers afetadas

| Layer (memory/architecture.html) | Phase | Modificação |
|---|---|---|
| Layer 6 (Conteúdo) | A | Migração de map → list[]; novo schema; novos campos i18n |
| Layer 4 (App / Routing) | B | Rota dinâmica `/projetos/:slug` + dispatch |
| Layer 3 (Hooks) | A, B | `useContent.ts` Zod dev-guard; `useDocumentSeo.ts` novo |
| Layer 2 (Components) | C | `components/projects/*` + Header nav |
| Layer 1 (Templates) | B | `pages/projects/*` templates por kind |
| Build / CI | A, C | scripts validation + i18n gate + SVG size gate |

Zero impacto em Layer 7 (Terraform/AWS) — verificado em Architect §Q5.

## 3. Phase A — Content model + Zod + i18n gate

### 3.1 Objetivo
Estabelecer o contrato de dados (TypeScript + Zod), migrar o JSON para o shape novo
mantendo as 3 pages legadas compilando via helper transitório, e plugar o CI gate de
paridade i18n.

### 3.2 Arquivos afetados (caminhos absolutos sob `repos/portifolio/`)

- `frontend/src/types/content.ts` — adicionar `Project`, `CaseStudyProject`,
  `MetaProject`, `GamesProject`, `GameLink`, `ProjectsContent`; manter tipos legados
  por enquanto.
- `frontend/src/lib/schemas/projects.ts` (NEW) — `z.discriminatedUnion`, sem `z.any()`.
- `frontend/scripts/validate-content.mjs` (NEW) — carrega 3 JSONs + valida.
- `frontend/scripts/check-i18n-parity.mjs` (NEW) — Node ESM, zero deps; vide FE §Q4 source.
- `frontend/src/data/content/pt.json` — migrar bloco `projects` para `{index, list[]}`;
  corrigir `tauan-games.items` (slug `aero-fighters`, engines corretos — AC-PC-07).
- `frontend/src/data/content/en.json` — idem.
- `frontend/src/data/content/de.json` — idem (paridade total).
- `frontend/src/hooks/useContent.ts` — adicionar `if (import.meta.env.DEV)` Zod guard;
  adicionar `getProjectBySlug(content, slug)` helper transitório.
- `frontend/package.json` — adicionar scripts `validate:content`, `check:i18n-projects`;
  adicionar `zod` (devDependency), `zod-to-json-schema` (devDependency).
- `frontend/package-lock.json` — atualizado.
- `.github/workflows/ci.yml` — adicionar job `i18n-parity` (`runs-on: ubuntu-24.04`,
  `needs: lint`).

### 3.3 Acceptance criteria mapeados
AC-PC-01 (model), AC-PC-02 (build-time validation), AC-PC-03 (i18n gate), AC-PC-07
(tauan-games corretivo), AC-PC-15 (redaction lint).

### 3.4 Validação no fim da Phase A
- `npm run validate:content` exit 0.
- `npm run check:i18n-projects` exit 0.
- `npm run typecheck` exit 0 (mesmo com `strict: false`).
- Os 3 pages legados ainda renderizam em dev (helper transitório ativo).
- Bundle prod não contém `"zod"` (`grep` em `dist/assets/*.js` retorna 0).

### 3.5 Executor
`frontend-engineer` (toda a phase).

## 4. Phase B — Dynamic routing + page deletion + dynamic i18n import

### 4.1 Objetivo
Substituir as 3 rotas estáticas por rota dinâmica `/projetos/:slug` com dispatch,
deletar os 3 pages ad-hoc, deletar `navRoutes`, e converter `useContent` para
dynamic-import per language (memory drift remediation).

### 4.2 Arquivos afetados

- `frontend/src/routes.ts` — substituir 3 entradas estáticas por `projects-index` +
  `project-detail`; remover `inNav` field; adicionar `inHeaderNav`; remover export
  `navRoutes`; adicionar export `headerNavRoutes`.
- `frontend/src/App.tsx` — remover `componentMap` legado; registrar
  `<Route path="/projetos">` + `<Route path="/projetos/:slug">`.
- `frontend/src/pages/projects/ProjectDetailPage.tsx` (NEW) — dispatch `switch(project.kind)`
  com `assertNever` no default.
- `frontend/src/pages/projects/CaseStudyTemplate.tsx` (NEW) — refator do
  `ProjectTabPage.tsx` original aceitando `project: CaseStudyProject`.
- `frontend/src/pages/projects/MetaProjectTemplate.tsx` (NEW) — refator de
  `ArchitecturePage.tsx`.
- `frontend/src/pages/projects/GamesProjectTemplate.tsx` (NEW) — refator de
  `TauanGamesPage.tsx`.
- `frontend/src/pages/projects/DadaiaWorkspacePage.tsx` — DELETE.
- `frontend/src/pages/projects/TauanGamesPage.tsx` — DELETE.
- `frontend/src/pages/projects/ArchitecturePage.tsx` — DELETE.
- `frontend/src/pages/projects/ProjectTabPage.tsx` — refator para
  `CaseStudyTemplate.tsx` (renomear + reshape props); remover comment `react-helmet-async`.
- `frontend/src/pages/projects/{DadaiaWorkspacePage,TauanGamesPage,ArchitecturePage}.test.tsx` — DELETE.
- `frontend/src/hooks/useDocumentSeo.ts` (NEW) — substituir 3 `useEffect` imperativos.
- `frontend/src/hooks/useContent.ts` — remover 3 imports estáticos; converter para
  dynamic import (`await import(...)`); expor `isLoading` em `LanguageContext`; remover
  helper transitório de Phase A.
- `frontend/src/contexts/LanguageContext.tsx` — adicionar loading state.
- `frontend/src/hooks/useContent.test.ts` — atualizar com casos async.
- `frontend/src/components/projects/ProjectsLayoutShell.tsx` (NEW) — shell que envolve
  `<Outlet />` para `/projetos/*` (index + dinâmica); breadcrumb + back-link + container.
  Substitui o `ProjectLayoutShell` SUPERSEDED em `fe-qual-refactor-v1` AC-FQR-04.
- `frontend/src/components/projects/__tests__/ProjectsLayoutShell.test.tsx` (NEW) — testes
  unit do shell (breadcrumb por slug, back-link em detail vs ausente em index, ARIA).
- Novos testes: `CaseStudyTemplate.test.tsx`, `MetaProjectTemplate.test.tsx`,
  `GamesProjectTemplate.test.tsx`.

### 4.3 Acceptance criteria mapeados
AC-PC-04 (dynamic routing), AC-PC-05 (navRoutes deletion), AC-PC-06 (dynamic i18n
import), AC-PC-11 (useDocumentSeo), AC-PC-16 (layout shell).

### 4.4 Validação no fim da Phase B
- `grep -rn 'navRoutes\b' frontend/` retorna 0.
- `grep -rn 'react-helmet' frontend/` retorna 0.
- `npm run typecheck && npm run test:unit && npm run build` verde.
- `du -sh dist/assets/*.js`: bundle JS principal **diminui** ~28KB vs Phase A
  (apenas idioma ativo carrega).
- Smoke navegação: `/`, `/projetos/dadaia-workspace`, `/projetos/portifolio`,
  `/projetos/tauan-games`, `/projetos/slug-invalido` → todos OK (último renderiza
  NotFound inline preservando URL).

### 4.5 Executor
`frontend-engineer` (toda a phase). `software-architect` faz code review do dispatch +
`assertNever` exhaustiveness.

## 5. Phase C — Index page + Header nav + Hero CTA + Diagrams

### 5.1 Objetivo
Construir o hub `/projetos`, expor a área via Header CTA (desktop + mobile) e Hero CTA,
e finalizar os diagramas SVG light/dark.

### 5.2 Arquivos afetados

- `frontend/src/pages/projects/ProjectsIndexPage.tsx` (NEW) — grid responsivo.
- `frontend/src/components/projects/ProjectCard.tsx` (NEW) — card individual; `<Link>`
  com `focus-visible:ring-2`.
- `frontend/src/components/projects/ProjectHero.tsx` (NEW) — extraído.
- `frontend/src/components/projects/ProjectSections.tsx` (NEW) — renderer por type.
- `frontend/src/components/projects/DiagramAsset.tsx` (NEW) — `<picture>` light/dark.
- `frontend/src/components/projects/CostsTable.tsx` (NEW) — para MetaProject.
- `frontend/src/components/projects/DecisionsList.tsx` (NEW) — para MetaProject.
- `frontend/src/components/projects/GameCard.tsx` (NEW) — para GamesProject.
- `frontend/src/components/header/HeaderDesktopLayout.tsx` — adicionar
  `<nav aria-label="Navegação principal">` entre nome/contato e ThemeToggle/LanguageSelector.
- `frontend/src/components/header/HeaderMobileLayout.tsx` — sheet Radix com mesmo nav.
- `frontend/src/components/Hero.tsx` (ou equivalente) — 3º CTA "Ver projetos".
- `frontend/src/data/content/{pt,en,de}.json` — preencher `projects.index.*`,
  `card.*`, `hero.*`, `sections.*`, `stack`, `costs`, `decisions`, `items`, `seo.*`,
  `diagramAlt`, `nav.projects`, `hero.cta.seeProjects` em 3 idiomas.
- `frontend/public/assets/projects/dadaia-workspace/cover.webp` (≤ 60KB).
- `frontend/public/assets/projects/dadaia-workspace/architecture-{light,dark}.svg` (≤ 50KB).
- `frontend/public/assets/projects/portifolio/cover.webp`.
- `frontend/public/assets/projects/portifolio/architecture-{light,dark}.svg`.
- `frontend/public/assets/projects/tauan-games/cover.webp`.
- `frontend/public/assets/projects/tauan-games/{aero-fighters,tauan-trex}-cover.webp`.
- `.github/workflows/ci.yml` — adicionar step bash no job `build` para SVG size gate.
- E2E: `tests/e2e/projects-index.spec.ts`, `project-detail-{case-study,meta,games}.spec.ts`,
  `tauan-games-link-out.spec.ts`, `nav-projects.spec.ts`.
- Testes unit: `ProjectCard.test.tsx`, `ProjectsIndexPage.test.tsx`, `DiagramAsset.test.tsx`,
  `CostsTable.test.tsx`, `DecisionsList.test.tsx`, `GameCard.test.tsx`.

### 5.3 Acceptance criteria mapeados
AC-PC-08 (index), AC-PC-09 (header + hero CTA), AC-PC-10 (diagrams), AC-PC-12
(link-out), AC-PC-13 (Lighthouse/Axe), AC-PC-14 (E2E).

### 5.4 Validação no fim da Phase C
- LHCI verde nos 4 paths (`/`, `/projetos`, `/projetos/dadaia-workspace`,
  `/projetos/portifolio`, `/projetos/tauan-games`).
- Axe zero violations.
- Todos 6 E2E specs verdes (5 novos + nav-projects).
- SVG size gate verde (todos ≤ 50KB).
- Operador smoke em `https://stage.marco-menezes.com/projetos` (portifolio_preview_protocol).

### 5.5 Executor
`frontend-engineer` (toda a phase). `qa-engineer` define os 6 E2E specs **antes** de
Phase C terminar (criterios + assertions). `software-architect` revisa boundary
header nav (sem regressão a11y).

## 6. Coordenação cross-agent

| Agente | Phase A | Phase B | Phase C |
|---|---|---|---|
| `frontend-engineer` | Owner | Owner | Owner |
| `software-architect` | Review schema strictness | Review dispatch + assertNever | Review header a11y |
| `qa-engineer` | — | — | **Owner** dos 6 E2E specs (define antes do code) |
| `devops-engineer` | Adiciona i18n-parity ao branch protection (T-QA-14 coordena) | — | Adiciona SVG size step ao build job |
| `product-engineer` | Não toca código | Não toca código | Não toca código |

## 7. Riscos técnicos por phase

- **Phase A:** merge conflict textual em `data/content/*.json` vs T-FE-WAVE5 (R5 do
  SPEC) — coordenar ordem de merge.
- **Phase B:** dynamic-import + StrictMode duplo-effect; mitigar com guarda em
  `LanguageContext`. AssertNever deve estar **dentro** do switch, não fora.
- **Phase C:** asset budgets (cover ≤ 60KB; SVG ≤ 50KB) podem demandar iteração no svgo
  config + cwebp quality. Lighthouse pode regredir se Header nav inserir layout shift
  — usar `min-height` no `<nav>`.

## 8. Validation plan

- Cada phase termina com PR isolado em `develop`.
- CI green é mandatory; sem merge se falhar.
- Phase A pode mergear isoladamente porque o helper transitório preserva o
  comportamento dos 3 pages legados.
- Phase B mergeia atomicamente — não há estado intermediário válido onde os 3 pages
  legados ainda existem mas as rotas dinâmicas já estão registradas.
- Phase C é incremental e pode ser sub-PRizada se o operador preferir (ex: PR de
  diagrams separado de PR de header nav), mas SPEC continua tratando como 1 phase.

## 9. Out-of-PLAN

- Como integrar com CMS-lite P1 — fora desta release (vide constitution §2 + SPEC §4).
- Open Graph dinâmico — fora.
- Habilitar `tsconfig.app.json` `strict: true` — debt aceito (Risk R4 do SPEC).
- Reconciliar tasks `[x]` falsamente DONE em `fe-qual-refactor-v1` — operator decision
  fora desta release (Risk R1 do SPEC).
