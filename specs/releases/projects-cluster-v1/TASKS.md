# Release TASKS — projects-cluster-v1

**Status:** Aprovado

> Convenção: `[ ]` OPEN -> `[-]` IN PROGRESS -> `[x]` DONE.
> Ordem é dependência hard: Phase A → Phase B → Phase C.
> Owner default: `frontend-engineer` (exceções marcadas).
> Per `dadaia-task-manager` protocol: `chore(tasks): start <id>` reserva; `chore(tasks):
> done <id>` na conclusão.

---

## Currently in progress (tracker)

—

---

## Phase A — Content model + Zod build-time + i18n parity CI gate

### `[x]` T-PC-A-01 — Discriminated union types + GameLink + ProjectsContent reshape

- **Agente:** `[frontend-engineer]`
- **Dep:** —
- **Toca:** `frontend/src/types/content.ts`
- **Critério de pronto:**
  - Tipos `Project`, `CaseStudyProject`, `MetaProject`, `GamesProject`, `GameLink`,
    `ProjectsContent` (com `index` + `list: Project[]`) declarados.
  - Tipos legados (`DadaiaWorkspaceProject`, `TauanGamesProject`, `PortifolioProject`,
    `GameItem`, closed-map `ProjectsContent`) **permanecem coexistindo** (deletados em
    Phase B com a deleção das pages).
  - `npm run typecheck` exit 0.

### `[x]` T-PC-A-02 — Zod schema `frontend/src/lib/schemas/projects.ts` (sem `z.any()`)

- **Agente:** `[frontend-engineer]`
- **Dep:** T-PC-A-01
- **Toca:** `frontend/src/lib/schemas/projects.ts` (NEW), `frontend/package.json`
  (deps `zod` + `zod-to-json-schema` como devDependency).
- **Critério de pronto:** `ProjectsContentSchema` exportado; `z.discriminatedUnion` com
  3 variantes; `sections`/`stack`/`costs`/`decisions` são `z.array(z.object({...})).min(1)`
  (zero `z.any()`); cumpre AC-PC-01.

### `[x]` T-PC-A-03 — Script `validate-content.mjs` + npm script + tree-shake verify

- **Agente:** `[frontend-engineer]`
- **Dep:** T-PC-A-02
- **Toca:** `frontend/scripts/validate-content.mjs` (NEW), `frontend/package.json`
  (`"validate:content"`).
- **Critério de pronto:** Script carrega os 3 JSONs, valida contra schema, falha
  exit 1 em erro; `grep -c "zod" dist/assets/index-*.js` retorna 0 após `npm run build`
  (tree-shake remove Zod da prod). Cumpre AC-PC-02.

### `[x]` T-PC-A-04 — Dev-mode Zod guard em `useContent.ts` + transitional helper

- **Agente:** `[frontend-engineer]`
- **Dep:** T-PC-A-02
- **Toca:** `frontend/src/hooks/useContent.ts`
- **Critério de pronto:** Bloco `if (import.meta.env.DEV) { ProjectsContentSchema.parse(...) }`
  presente; helper `getProjectBySlug(content, slug)` exportado para Phase B usar; comportamento
  dos 3 pages legados preservado (eles ainda leem `content.projects?.["dadaia-workspace"]`).

### `[x]` T-PC-A-05 — Migrar JSON pt/en/de para shape `{index, list[]}` + corretivo tauan-games

- **Agente:** `[frontend-engineer]`
- **Dep:** T-PC-A-01
- **Toca:** `frontend/src/data/content/pt.json`, `frontend/src/data/content/en.json`,
  `frontend/src/data/content/de.json`
- **Critério de pronto:**
  - Bloco `projects` migrado de mapa fechado para `{ index: {...}, list: [...] }`
    com 3 itens na ordem fixa (dadaia-workspace, portifolio, tauan-games).
  - `projects.list[where kind=games].items` corrigido: slug `aero-fighters` (não
    `aero-fighters-babylon`), engine `Three.js`; `tauan-trex` engine `Phaser`. Cumpre
    AC-PC-07.
  - Todos os campos i18n preenchidos nos 3 idiomas (paridade total).
  - `grep -rn 'aero-fighters-babylon\|"Babylon\|"engine": "JavaScript"' frontend/`
    retorna 0.
  - Helper `getProjectBySlug` em `useContent` retorna os items corretos para os 3 pages
    legados durante a janela transitória.

### `[x]` T-PC-A-06 — Script `check-i18n-parity.mjs` + redaction lint

- **Agente:** `[frontend-engineer]`
- **Dep:** T-PC-A-05
- **Toca:** `frontend/scripts/check-i18n-parity.mjs` (NEW), `frontend/package.json`
  (`"check:i18n-projects"`)
- **Critério de pronto:** Script verifica paridade dos campos i18n-bearing em PT/EN/DE
  para `projects.index` + cada item em `projects.list[]`; falha exit 1 em qualquer
  ausência ou string vazia. Inclui regex check para bucket names, CloudFront IDs,
  Route53 zone IDs, AWS account ID isolado (AC-PC-15). Cumpre AC-PC-03 + AC-PC-15.

### `[x]` T-PC-A-07 — CI job `i18n-parity` no workflow

- **Agente:** `[devops-engineer]`
- **Dep:** T-PC-A-06
- **Toca:** `.github/workflows/ci.yml`
- **Critério de pronto:** Novo job `i18n-parity` com `runs-on: ubuntu-24.04`,
  `needs: lint`, chama `npm run check:i18n-projects`. Coordenar com T-QA-14 em
  `fe-qual-refactor-v1` para adicionar este check à branch protection.

---

## Phase B — Dynamic routing + page deletion + navRoutes deletion + dynamic i18n import

### `[x]` T-PC-B-01 — Refactor `routes.ts`: deletar `navRoutes`, criar `headerNavRoutes`

- **Agente:** `[frontend-engineer]`
- **Dep:** T-PC-A-04 (helper transitional precisa existir antes)
- **Toca:** `frontend/src/routes.ts`
- **Critério de pronto:** Remove campo `inNav` da `Route` interface; remove export
  `navRoutes`; adiciona `inHeaderNav: boolean` + export `headerNavRoutes`. Substitui
  3 entradas estáticas por `projects-index` (`/projetos`) e `project-detail`
  (`/projetos/:slug`). `grep -rn 'navRoutes\b' frontend/` exit 0 com 0 matches.
  Cumpre AC-PC-05.

### `[x]` T-PC-B-02 — Hook `useDocumentSeo.ts`

- **Agente:** `[frontend-engineer]`
- **Dep:** —
- **Toca:** `frontend/src/hooks/useDocumentSeo.ts` (NEW)
- **Critério de pronto:** Hook recebe `{title, description}`; manipula
  `document.title` + meta tags `description`, `og:title`, `og:description`. SSR-safe.
  Cumpre AC-PC-11 parcial.

### `[x]` T-PC-B-03 — Criar 3 templates por kind

- **Agente:** `[frontend-engineer]`
- **Dep:** T-PC-A-01, T-PC-B-02
- **Toca:** `frontend/src/pages/projects/CaseStudyTemplate.tsx` (NEW),
  `frontend/src/pages/projects/MetaProjectTemplate.tsx` (NEW),
  `frontend/src/pages/projects/GamesProjectTemplate.tsx` (NEW)
- **Critério de pronto:** Cada template aceita seu kind via prop tipada; consome
  `useDocumentSeo`; reusa primitivos shadcn (`Card`, `Badge`, `Button`); zero
  `useEffect` SEO imperativo; meta tests unitários criados.

### `[x]` T-PC-B-04 — Criar `ProjectDetailPage.tsx` com dispatch + `assertNever`

- **Agente:** `[frontend-engineer]`
- **Dep:** T-PC-B-03
- **Toca:** `frontend/src/pages/projects/ProjectDetailPage.tsx` (NEW),
  `frontend/src/lib/assertNever.ts` (NEW se não existir)
- **Critério de pronto:** `switch(project.kind)` com 3 cases + `default:
  return assertNever(project)`; `useParams<{slug:string}>()`; slug desconhecido renderiza
  `<NotFound />` inline (preserva URL). Cumpre AC-PC-04 (parcial).

### `[x]` T-PC-B-05 — Atualizar `App.tsx` para rota dinâmica + remover `componentMap` legado

- **Agente:** `[frontend-engineer]`
- **Dep:** T-PC-B-01, T-PC-B-04
- **Toca:** `frontend/src/App.tsx`
- **Critério de pronto:** `<Route path="/projetos">` + `<Route path="/projetos/:slug"
  element={<ProjectDetailPage />} />` registrados; `componentMap` legado removido. SPA
  ainda navega corretamente (smoke via dev server).

### `[x]` T-PC-B-06 — Deletar 3 pages ad-hoc + 3 test files + remover ProjectTabPage residual

- **Agente:** `[frontend-engineer]`
- **Dep:** T-PC-B-05
- **Toca:** `frontend/src/pages/projects/DadaiaWorkspacePage.tsx` (DELETE),
  `frontend/src/pages/projects/TauanGamesPage.tsx` (DELETE),
  `frontend/src/pages/projects/ArchitecturePage.tsx` (DELETE),
  `frontend/src/pages/projects/DadaiaWorkspacePage.test.tsx` (DELETE),
  `frontend/src/pages/projects/TauanGamesPage.test.tsx` (DELETE),
  `frontend/src/pages/projects/ArchitecturePage.test.tsx` (DELETE),
  `frontend/src/pages/projects/ProjectTabPage.tsx` (refator final → renomear para
  CaseStudyTemplate ou deletar se redundante; remover comment `react-helmet-async`
  da linha 49).
- **Critério de pronto:** `grep -rn 'react-helmet' frontend/` retorna 0. `grep -rn
  'DadaiaWorkspacePage\|ArchitecturePage' frontend/` retorna 0. Cumpre AC-PC-04 e
  AC-PC-11 parcial.

### `[x]` T-PC-B-07 — Deletar tipos legados em `types/content.ts`

- **Agente:** `[frontend-engineer]`
- **Dep:** T-PC-B-06
- **Toca:** `frontend/src/types/content.ts`
- **Critério de pronto:** `DadaiaWorkspaceProject`, `TauanGamesProject`, `PortifolioProject`,
  closed-map `ProjectsContent` (versão antiga), `GameItem` deletados. Cumpre AC-PC-01
  (parcial — LOW-2 Architect).

### `[x]` T-PC-B-08 — Converter `useContent` para dynamic-import por idioma + loading state

- **Agente:** `[frontend-engineer]`
- **Dep:** T-PC-A-04, T-PC-B-07
- **Toca:** `frontend/src/hooks/useContent.ts`,
  `frontend/src/contexts/LanguageContext.tsx`, `frontend/src/hooks/useContent.test.ts`
- **Critério de pronto:** Remover os 3 `import` estáticos de `pt/en/de.json`; usar
  `await import("@/data/content/" + lang + ".json")`; `LanguageContext` expõe
  `isLoading`; SSR-safe (window guard); remover helper transitório
  `getProjectBySlug` (consumers do helper já foram deletados em T-PC-B-06). Bundle
  inicial diminui ~28KB (`du -sh dist/assets/*.js` comparativo). Cumpre AC-PC-06.

### `[x]` T-PC-B-09 — Build `ProjectsLayoutShell` (chrome compartilhado /projetos/*)

- **Agente:** `[frontend-engineer]`
- **Dep:** T-PC-B-05 (rota dinâmica `/projetos/:slug` precisa existir para wrap)
- **Toca:**
  - `frontend/src/components/projects/ProjectsLayoutShell.tsx` (NEW)
  - `frontend/src/routes.ts` — agrupar `/projetos` e `/projetos/:slug` sob o shell via
    layout route (React Router nested layout)
  - `frontend/src/components/projects/__tests__/ProjectsLayoutShell.test.tsx` (NEW) —
    testes unit do shell (renderiza breadcrumb correto por slug, back-link visível em
    detail view e oculto em index, container ARIA correto)
- **Acceptance:**
  - Visitar `/projetos` renderiza index dentro do shell, breadcrumb "Projetos", sem back-link.
  - Visitar `/projetos/dadaia-workspace` renderiza detail dentro do shell, breadcrumb
    "Projetos / Dadaia Workspace", back-link visível apontando `/projetos`.
  - `useDocumentSeo` chamado pelo filho do Outlet ajusta `<title>` sem que o shell
    sobrescreva.
  - Bundle não cresce mais que 2KB gzip (medido em CI).
  - Teste unit do shell verde no CI.
- **Razão:** Resolve SPEC §10 R1 "Layout shell para /projetos/* — posição firme";
  substitui `ProjectLayoutShell` SUPERSEDED em `fe-qual-refactor-v1` AC-FQR-04. Cumpre
  AC-PC-16.

---

## Phase C — Index page + Header nav + Hero CTA + Diagrams + visual polish

### `[-]` T-PC-C-01 — QA: definir E2E acceptance criteria + spec stubs

- **Agente:** `[qa-engineer]`
- **Dep:** T-PC-A-01 (precisa do contrato de dados); pode rodar em paralelo a Phase B.
- **Toca:** `frontend/tests/e2e/projects-index.spec.ts`,
  `frontend/tests/e2e/project-detail-case-study.spec.ts`,
  `frontend/tests/e2e/project-detail-meta.spec.ts`,
  `frontend/tests/e2e/project-detail-games.spec.ts`,
  `frontend/tests/e2e/tauan-games-link-out.spec.ts`,
  `frontend/tests/e2e/nav-projects.spec.ts` (todos stubs com `test.skip` no início e
  asserts documentados em comentário).
- **Critério de pronto:** 6 spec files existem com asserts documentados (skip por
  enquanto). qa-engineer transforma `test.skip` → `test` à medida que cada componente
  de Phase C fica disponível.

### `[-]` T-PC-C-02 — Componentes projects/ (Card, Hero, Sections, Diagram, Costs, Decisions, GameCard)

- **Agente:** `[frontend-engineer]`
- **Dep:** T-PC-A-01, T-PC-B-03
- **Toca:** `frontend/src/components/projects/ProjectCard.tsx` (NEW),
  `frontend/src/components/projects/ProjectHero.tsx` (NEW),
  `frontend/src/components/projects/ProjectSections.tsx` (NEW),
  `frontend/src/components/projects/DiagramAsset.tsx` (NEW),
  `frontend/src/components/projects/CostsTable.tsx` (NEW),
  `frontend/src/components/projects/DecisionsList.tsx` (NEW),
  `frontend/src/components/projects/GameCard.tsx` (NEW), + tests unitários.
- **Critério de pronto:** Cada componente tem teste unit; `ProjectCard` é `<Link>` com
  `focus-visible:ring-2`; `DiagramAsset` usa `<picture>` + `<source
  media="(prefers-color-scheme: dark)">`. Templates de Phase B passam a consumir estes
  componentes (refator interno).

### `[x]` T-PC-C-03 — `ProjectsIndexPage` + rota render

- **Agente:** `[frontend-engineer]`
- **Dep:** T-PC-C-02
- **Toca:** `frontend/src/pages/projects/ProjectsIndexPage.tsx` (NEW), + test unit.
- **Critério de pronto:** Grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`; renderiza
  3 cards na ordem fixa; sem filtros/busca; CLS = 0 (aspect-ratio nos cards). Cumpre
  AC-PC-08.

### `[x]` T-PC-C-04 — Header CTA desktop + mobile

- **Agente:** `[frontend-engineer]`
- **Dep:** T-PC-B-01
- **Toca:** `frontend/src/components/Header.tsx`,
  `frontend/src/components/header/HeaderShell.tsx`,
  `frontend/src/components/header/HeaderDesktopLayout.tsx`,
  `frontend/src/components/header/HeaderMobileLayout.tsx`,
  `frontend/src/types/content.ts`, `frontend/src/data/content/{pt,en,de}.json`.
- **Critério de pronto:** Desktop tem `<nav aria-label="Navegação principal">` com
  link "Projetos" no cluster superior direito antes de ThemeToggle/LanguageSelector.
  Mobile renderiza o mesmo link inline em cada scroll state. `navProjects` plumado
  via `Header` → `HeaderShell` → ambos os layouts; chave i18n adicionada nos 3 JSONs
  (PT="Projetos", EN="Projects", DE="Projekte"). i18n parity verde.
- **Desvio:** Mobile usa link inline em vez de Radix Dialog sheet — minimal viable
  enquanto o Dialog não é necessário para discoverability. Reavaliar se mobile
  navigation ganhar mais entradas.
- **Tests:** Header.test.tsx + i18n-strings.test.tsx atualizados com `MemoryRouter`
  wrapper. 266/266 verde.

### `[x]` T-PC-C-05 — Hero: 3º CTA "Ver projetos"

- **Agente:** `[frontend-engineer]`
- **Dep:** —
- **Toca:** `frontend/src/components/portfolio/HeroSection.tsx`,
  `frontend/src/components/portfolio/HeroSection.test.tsx`,
  `frontend/src/types/content.ts` (campo `heroCTAs.seeProjects?`),
  `frontend/src/data/content/{pt,en,de}.json` (`heroCTAs.seeProjects`).
- **Critério de pronto:** Hero renderiza 3º CTA outline com ícone `FolderKanban`
  linkando para `/projetos`; i18n parity gate verde; teste unit afirma href + label.

### `[ ]` T-PC-C-06 — Assets: covers + diagrams light/dark

- **Agente:** `[frontend-engineer]` (assets produzidos pelo operador)
- **Dep:** T-PC-C-02
- **Toca:** `frontend/public/assets/projects/dadaia-workspace/cover.webp`,
  `frontend/public/assets/projects/dadaia-workspace/architecture-light.svg`,
  `frontend/public/assets/projects/dadaia-workspace/architecture-dark.svg`,
  `frontend/public/assets/projects/portifolio/cover.webp`,
  `frontend/public/assets/projects/portifolio/architecture-light.svg`,
  `frontend/public/assets/projects/portifolio/architecture-dark.svg`,
  `frontend/public/assets/projects/tauan-games/cover.webp`,
  `frontend/public/assets/projects/tauan-games/aero-fighters-cover.webp`,
  `frontend/public/assets/projects/tauan-games/tauan-trex-cover.webp`.
- **Critério de pronto:** Cada cover ≤ 60KB (AC-PC-08); cada SVG ≤ 50KB pós-svgo
  (AC-PC-10). `diagramAlt` preenchido nos 3 idiomas.

### `[ ]` T-PC-C-07 — CI step: SVG size gate em `build` job

- **Agente:** `[devops-engineer]`
- **Dep:** T-PC-C-06
- **Toca:** `.github/workflows/ci.yml`
- **Critério de pronto:** Step bash adicionado ao job `build` após `npm run build`,
  verifica `dist/assets/projects/**/*.svg` ≤ 50KB; falha exit 1 se violado. ~2s
  overhead. Cumpre AC-PC-10.

### `[ ]` T-PC-C-08 — Ativar 6 E2E specs + Lighthouse run

- **Agente:** `[qa-engineer]`
- **Dep:** T-PC-C-02, T-PC-C-03, T-PC-C-04, T-PC-C-05
- **Toca:** os 6 spec files de T-PC-C-01 (remover `test.skip`).
- **Critério de pronto:** Os 6 E2E specs verdes; LHCI verde em `/`, `/projetos`,
  `/projetos/dadaia-workspace`, `/projetos/portifolio`, `/projetos/tauan-games`; Axe
  zero violations. Cumpre AC-PC-13 + AC-PC-14.

### `[ ]` T-PC-C-09 — Smoke operacional em stage

- **Agente:** `[qa-engineer]` (coordena com operador)
- **Dep:** T-PC-C-08
- **Toca:** none (apenas validation)
- **Critério de pronto:** Após merge em `develop` + deploy de stage, operador valida
  visualmente `https://stage.marco-menezes.com/projetos` + 3 detail pages (per
  `portifolio_preview_protocol`); zero regressão na home e demais rotas existentes.
  Cumpre Success criterion 3 do SPEC.
