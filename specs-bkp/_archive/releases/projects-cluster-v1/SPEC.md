# Release SPEC — projects-cluster-v1

**Status:** Aprovado

> Release ID: `projects-cluster-v1`
> Owner: product-engineer
> Synthesized: 2026-05-17
> Coexistence: active release `fe-qual-refactor-v1` (phase IMPLEMENTATION) remains untouched.
> This SPEC consolidates the 7 archived F-P0-09..F-P0-15 SPECs in
> `specs/_archive/legacy-features/projects-cluster/` plus the corrections surfaced by the
> Stage 2 architectural and frontend reviews.

---

## 1. Contexto

Esta release entrega a área dedicada de **showcase de projetos** do portfólio
(`/projetos` index + páginas de detalhe), consolidando 7 SPECs arquivadas em um único
release atômico com 3 fases internas. O contexto técnico foi auditado em Stage 2 por
dois especialistas; os 3 reports são os inputs canônicos desta SPEC.

**Inputs canônicos (Stage 1–2 do pipeline de discovery):**

- Discovery (Stage 1): `.dadaia/reports/portifolio/product-engineer/2026-05-17T061920Z-projects-showcase-discovery.html`
  (sha256:`162472943d269e5913195d85a0a3b3bdfe7e5b163894820c52b892acc24a7f49`)
- Frontend analysis (Stage 2a): `.dadaia/reports/portifolio/frontend-engineer/2026-05-17T033000Z-projects-showcase-analysis.html`
  (sha256:`82b99af828cef9ce8aa69bb08948155c65104431ac37d92a7026cd668e2bde9c`)
- Architecture review (Stage 2b): `.dadaia/reports/portifolio/software-architect/2026-05-17T062729Z-projects-showcase-review.html`
  (sha256:`a377dc6b7385138aa02caabc708d7aabf3548bed242ca98e2d696cb52945f5ac`)

**SPECs arquivadas consolidadas** (permanecem em `_archive/legacy-features/projects-cluster/`
como referência histórica; este SPEC é o autoritativo):

| Arquivada | Tema |
|---|---|
| F-P0-09 | `projects-content-model` — discriminated union, Zod schema |
| F-P0-10 | `projects-index-page` — rota `/projetos`, grid responsivo |
| F-P0-11 | `nav-projects-cta` — CTA Header + 3º CTA Hero |
| F-P0-12 | `projects-page-templates` — rota dinâmica + dispatch por `kind` |
| F-P0-13 | `projects-architecture-diagrams` — SVG light/dark |
| F-P0-14 | `tauan-games-link-out` — playUrl externo, sem iframe |
| F-P0-15 | `projects-content-i18n-parity` — paridade total PT/EN/DE em `projects.*` |

## 2. Personas

Consume `specs/memory/product/personas.html`:

- **Recrutador técnico** — escaneia /projetos em &lt; 30s, precisa identificar o sinal
  técnico de cada projeto sem clicar.
- **Peer técnico (engenheiro)** — clica em projeto específico, lê custos/decisões/arquitetura
  na meta-page, valida com o repo público.
- **Operador (Marco)** — adiciona um 4º+ projeto editando JSON, sem refator.

## 3. Escopo

### 3.1 Projetos cobertos nesta release (3 fixos)

Ordem fixa em `projects.list[]`:

1. `dadaia-workspace` — kind `case-study`
2. `portifolio` — kind `meta`
3. `tauan-games` — kind `games`

Expansão para `dadaia-bots`, `dd-chain-explorer`, `burrinhos-barbe` fica explicitamente
**fora desta release** e é re-enfileirada no backlog como candidata
`projects-cluster-v2` (vide Stage 1 Q1; Stage 2b §Q3 confirma que o ceiling de
hand-authored JSON está em ~6 projetos antes de virar problema arquitetural).

### 3.2 Surface coberta (3 fases internas — TASKS.md sequencia)

- **Phase A** — content model + Zod build-time + i18n parity CI gate
- **Phase B** — dynamic routing + page deletion + `navRoutes` deletion + dynamic i18n import
- **Phase C** — index page + header nav CTA + Hero 3rd CTA + diagrams + visual polish

Phasing é estratégia de implementação, **não** sub-releases (vide Stage 2b §Q10 e a tabela
de coupling em §Q10: 5 de 7 arquivos críticos são tocados por 2+ fases — fatiar em 3
releases triplicaria merge overhead).

## 4. Non-goals (consolidados)

Todos os Non-goals herdados das 7 archived SPECs §7, mais adições resultantes da revisão:

- **Sem** CMS-lite backend (P1 / `cms-lite-v1`).
- **Sem** métricas / analytics por projeto.
- **Sem** Open Graph images dinâmicos por projeto (P1; `useDocumentSeo` cobre apenas
  `<title>` + `<meta description>`).
- **Sem** filtros / busca / paginação / timeline no index.
- **Sem** dropdown / mega-menu por kind no header.
- **Sem** iframe embedded de games.
- **Sem** Makefile `games:sync` e Terraform Cache-Control `/games/*`.
- **Sem** Schema.org JSON-LD.
- **Sem** page transitions / View Transitions API.
- **Sem** SVG interativo (zoom/pan) nos diagramas.
- **Sem** auto-detect de GH Pages offline.
- **Sem** publicação dos jogos no GH Pages (PR separado, owner `game-developer`).
- **Sem** Zod incluído no bundle de produção (vide §6 — decisão de placement build-time).
- **Sem** monitoramento de saúde do link-out `tauan-games` GH Pages neste release
  (registrado como candidate `portfolio-external-link-monitor-v1` — Stage 2b MEDIUM-3).
- **Sem** dynamic import por idioma do `useContent` (vide §10 Risk R3 — escopo está em
  Phase B mas é mitigação parcial do memory drift).
- **Sem** habilitar `tsconfig.app.json` `strict: true` neste release (recomendado por FE
  OBJECTION-02 mas fora de escopo — debt declarado em Risks).

## 5. Per-kind content contract

Herdado de F-P0-09 §3.1 + Stage 2a §Q2 (typing) + Stage 2b §HIGH-3 (Zod strictness):

### 5.1 `ProjectBase` (compartilhado)

| Campo | Tipo | i18n | Notas |
|---|---|---|---|
| `slug` | `string` (regex `^[a-z0-9-]+$`) | NÃO | identifier único |
| `kind` | `"case-study" \| "meta" \| "games"` | NÃO | discriminator |
| `hero.title` | `string` | SIM | |
| `hero.tagline` | `string` | SIM | |
| `card.cover` | `string` (path `/assets/projects/<slug>/cover.webp`) | NÃO | ≤ 60KB |
| `card.summary` | `string` (≤ 280 chars) | SIM | |
| `card.tech` | `string[]` (≥ 3) | SIM (parcial) | |
| `seo.title` | `string` | SIM | |
| `seo.description` | `string` | SIM | |
| `diagram?` | `string` (path) | NÃO | optional; light+dark via `DiagramAsset` |
| `diagramAlt?` | `string` | SIM | obrigatório SE `diagram` presente (Stage 2a §Q7) |

### 5.2 `CaseStudyProject` (`dadaia-workspace`)

Adiciona: `sections: ProjectSectionData[]` (≥ 1), `cta: { github: string, githubLabel: string }`.

### 5.3 `MetaProject` (`portifolio`)

Adiciona: `sections: ProjectSectionData[]` (≥ 1), `stack: StackRow[]` (≥ 1), `costs: CostRow[]`,
`decisions: ArchDecision[]` (≥ 1), `links: { repo: string, terraform: string, specs: string }`.

### 5.4 `GamesProject` (`tauan-games`)

Adiciona: `items: GameLink[]` (≥ 1), onde `GameLink = { slug, title, engine, cover, body, repo, playUrl }`.

### 5.5 Zod schema strictness (decisão Stage 2b HIGH-3)

Zero `z.any()` no schema final. Cada `ProjectSectionData`, `StackRow`, `CostRow`,
`ArchDecision`, `GameLink` é um `z.object({...})` explícito. A justificativa: o schema é
o contrato exportável para o futuro Lambda Go (F-P0-09 §A7), e shipping permissivo agora
shippa permissivo depois.

## 6. Decisões resolvidas (com rationale)

### D1 — Zod placement: build-time only + dev-mode runtime guard

Discovery (Q4) sugeriu Zod em runtime dentro de `useContent()`. **FE recommendation
(Stage 2a §Q6) adoptada**: Zod roda em (a) `frontend/scripts/validate-content.mjs`
chamado pelo CI antes do `npm run build`, e (b) dentro de `useContent.ts` condicionado a
`if (import.meta.env.DEV)` para feedback imediato em dev. Em produção, Vite 7 (Rollup 4)
faz tree-shaking ESM nativo e o bundle de Zod (~13.5KB gzip) é eliminado. Rationale:
quality-bar Lighthouse Performance ≥ 90 não deve pagar 12-13KB de runtime tax quando
build-time é suficiente; o dev-mode guard preserva o feedback imediato.

### D2 — i18n parity gate: plain Node script no CI

FE recommendation (Stage 2a §Q4) adoptada: `frontend/scripts/check-i18n-parity.mjs` é
um Node ESM script de ~40 LOC, zero deps. Vira `npm run check:i18n-projects`. Architect
(Stage 2b §Q6) confirma que isto é um **job novo** em `ci.yml` (não step do `lint`) com
`runs-on: ubuntu-24.04` (não `ubuntu-latest` — pinned por `tech-stack.html §cicd`),
custo ~45s.

### D3 — T-FE-QUAL-05 / AC-FQR-05 conflito → cross-release dependency

T-FE-QUAL-05 está `[ ]` OPEN em `fe-qual-refactor-v1/TASKS.md` (verificado FE OBJECTION
e SPEC §2). F-P0-12 desta release **deleta** `TauanGamesPage`, `ArchitecturePage` e
`DadaiaWorkspacePage` em vez de migrá-los para `ProjectTabPage` — work duplicado e
ilógico se ambos forem executados (Architect §Q9 e FE §Q8 concordam: F-P0-12 é
estritamente superior).

**Decisão (caminho (a) — reformulação cross-release):** esta release **não toca em
nenhum arquivo de `fe-qual-refactor-v1/`** (constituição §8 atomicidade de release;
gate v3). O AC-FQR-05 fica como **dependência cross-release**: o operador, em um turn
follow-up de `product-engineer`, reformula AC-FQR-05 em `fe-qual-refactor-v1/SPEC.md`
de _"TauanGamesPage e ArchitecturePage consomem ProjectTabPage"_ para _"zero ad-hoc
components nas rotas /projetos/* — satisfeito via projects-cluster-v1 dynamic dispatch
e deleção dos 3 ad-hoc pages"_ e remove T-FE-QUAL-05 do TASKS.md (ou marca como
superseded). Sem essa reformulação, `fe-qual-refactor-v1` **nunca pode CLOSURE**
(Architect §Q9). Vide §10 Dependencies.

### D4 — Release sequencing: 1 release com 3 fases internas (não 3 sub-releases)

Architect §Q10 recommendation adoptada. Evidência: 5 de 7 arquivos críticos
(`types/content.ts`, `routes.ts`, `App.tsx`, `useContent.ts`, `data/content/*.json`,
`components/header/HeaderDesktopLayout.tsx`, `.github/workflows/ci.yml`) são tocados
por 2 ou mais sub-releases. v1a deployado isolado coloca os 3 pages legados em estado
half-implemented (dual-shape no JSON ou breakage imediato). Mantém atomicidade
constitucional §10.

### D5 — `navRoutes` é stale layer → deletar, não bypassar

Architect HIGH-1 e FE OBJECTION-04 confirmados: `navRoutes` exportado em `routes.ts:43`
tem **zero consumidores** em produção (grep validado). F-P0-11 originalmente sugeria
manter `navRoutes` "for backward compatibility" — sem compatibilidade real a preservar,
isto criaria duas abstrações paralelas. **Decisão**: deletar `navRoutes` e o campo
`inNav` do `Route` interface. Substituir por `inHeaderNav` (boolean) e
`headerNavRoutes` (derived array). AC explícita §7.4.

### D6 — Zod strictness: shapes explícitos em `sections`/`stack`/`decisions`

Architect HIGH-3 adoptado: substituir `z.array(z.any()).min(1)` por arrays de objetos
com shape explícito. Vide §5.5 e AC §7.5.

### D7 — Dynamic i18n import: in-scope para Phase B

Architect HIGH-2 + FE achados confirmam que `useContent.ts:7-9` faz eager import dos 3
JSONs (~84KB hoje, ~108KB após esta release), contradizendo `memory/architecture.html
§risks` que declara _"Dynamic import por idioma em F-P0-06"_ como mitigação. Esta
release **converte** os 3 imports para dynamic-import async-load do JSON ativo,
resolvendo o drift e prevenindo regressão Lighthouse com mais conteúdo. Acompanhado
de loading state em `LanguageContext`. AC §7.6.

### D8 — `tauan-games.items` corrective AC

Architect MEDIUM-1 verificou drift em produção nos 3 JSONs: `aero-fighters-babylon` /
`engine: "Babylon.js"` e `tauan-trex` / `engine: "JavaScript"`. F-P0-14 §1/§3.5
especifica `aero-fighters` / `Three.js` e `tauan-trex` / `Phaser`. **AC corretiva
obrigatória** §7.7.

### D9 — Escopo: 3 projetos originais nesta release

Discovery Q1 + Architect §Q3 (growth math): 3 projetos é o sweet spot; expansão para 6+
exige dynamic-import per language para preservar Lighthouse. Adicionar `dadaia-bots`,
`dd-chain-explorer`, `burrinhos-barbe` agora é prematuro — fica como
`projects-cluster-v2` no backlog.

## 7. Acceptance criteria

Cada AC tem ID estável `AC-PC-NN` (Projects Cluster) e é testável.

### AC-PC-01 — Content model e Zod schema explícito
- `frontend/src/types/content.ts` define o discriminated union `Project = CaseStudyProject |
  MetaProject | GamesProject` conforme §5.
- `frontend/src/lib/schemas/projects.ts` exporta `ProjectsContentSchema` com
  `z.discriminatedUnion("kind", [...])` e **zero `z.any()`** (§5.5; D6; Architect HIGH-3).
- Tipos antigos deletados: `DadaiaWorkspaceProject`, `TauanGamesProject`,
  `PortifolioProject`, e o `ProjectsContent` closed-map shape (Architect LOW-2).
- `GameItem` substituído por `GameLink` per F-P0-09 §3.1.

### AC-PC-02 — Build-time validation script
- `frontend/scripts/validate-content.mjs` carrega os 3 JSONs e valida contra
  `ProjectsContentSchema`; falha com exit 1 em erro.
- `package.json` tem script `"validate:content": "node scripts/validate-content.mjs"`.
- O CI roda `npm run validate:content` antes do `npm run build` (D1).
- Em produção, `import.meta.env.DEV` é false e o import de Zod é eliminado por
  tree-shaking — `grep -c "zod" dist/assets/index-*.js` retorna 0 após `npm run build`.

### AC-PC-03 — i18n parity CI gate
- `frontend/scripts/check-i18n-parity.mjs` existe, zero deps; valida que todos os campos
  i18n-bearing (vide §5 tabela) estão presentes e não-vazios em PT/EN/DE para cada item
  em `projects.list[]` + `projects.index`.
- `package.json`: `"check:i18n-projects": "node scripts/check-i18n-parity.mjs"`.
- `.github/workflows/ci.yml` tem novo job `i18n-parity` com `runs-on: ubuntu-24.04`
  (Stage 2b §Q6 drift fix), `needs: lint`, chama `npm run check:i18n-projects` (D2).

### AC-PC-04 — Dynamic routing + page deletion
- `frontend/src/routes.ts` tem entradas `projects-index` (`/projetos`) e
  `project-detail` (`/projetos/:slug`); as 3 entradas estáticas
  (`dadaia-workspace`, `tauan-games`, `portifolio`) **removidas**.
- `frontend/src/App.tsx` registra `<Route path="/projetos">` e
  `<Route path="/projetos/:slug" element={<ProjectDetailPage />} />`; `componentMap` legado
  removido.
- `ProjectDetailPage.tsx` faz `switch(project.kind)` dispatch com `assertNever(project)`
  no `default` (Architect §Q7 hard AC).
- Slug desconhecido retorna `<NotFound />` inline (preserva URL para debug; FE §Q3).
- Componentes deletados: `DadaiaWorkspacePage.tsx`, `TauanGamesPage.tsx`,
  `ArchitecturePage.tsx` (+ seus `.test.tsx`).

### AC-PC-05 — `navRoutes` deleção
- `grep -rn 'navRoutes\b' frontend/` retorna **zero** matches após merge.
- `Route` interface não tem mais o campo `inNav` — substituído por `inHeaderNav: boolean`.
- `headerNavRoutes = routes.filter(r => r.inHeaderNav)` exportado e consumido por
  `HeaderDesktopLayout` e `HeaderMobileLayout` (D5; Architect HIGH-1).

### AC-PC-06 — Dynamic i18n import (memory drift remediation)
- `frontend/src/hooks/useContent.ts` não tem mais os 3 imports estáticos
  (`import ptJson from "@/data/content/pt.json"` etc.).
- Carregamento via `import("@/data/content/" + lang + ".json")` async; `LanguageContext`
  expõe `isLoading: boolean` para SSR-safe rendering.
- Bundle inicial não contém os JSONs dos idiomas inativos — verificável via
  `npm run build && du -sh dist/assets/*.js` (regressão de ~28KB esperada vs hoje).
- Memory `architecture.html §risks` "Dynamic import por idioma" fica **honrado pelo código**
  (Architect HIGH-2; D7).

### AC-PC-07 — `tauan-games.items` corrective writes
- Em `pt.json`, `en.json`, `de.json`: `projects.list[where kind=games].items` contém
  exatamente:
  - `{ slug: "aero-fighters", engine: "Three.js", playUrl: "https://marcoaureliomenezes.github.io/tauan-games/aero-fighters/", ... }`
  - `{ slug: "tauan-trex", engine: "Phaser", playUrl: "https://marcoaureliomenezes.github.io/tauan-games/tauan-trex/", ... }`
- O slug `aero-fighters-babylon` aparece **em zero locais** após merge (Architect MEDIUM-1; D8).
- `grep -rn 'aero-fighters-babylon\|"engine": "Babylon\|"engine": "JavaScript"' frontend/`
  retorna zero matches.

### AC-PC-08 — Index page
- Rota `/projetos` renderiza `ProjectsIndexPage` com grid responsivo Tailwind
  `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (F-P0-10 §3.1).
- Renderiza **3 cards** na ordem fixa (dadaia-workspace, portifolio, tauan-games).
- Cards são `<Link>` (não `<div role="button">`) com `focus-visible:ring-2`
  (FE §Q7 a11y).
- Sem filtros, sem busca, sem paginação.
- Cada `card.cover` ≤ 60KB (Architect §Q3 — não 200KB constitucional, mais restrito
  porque cobra aparece above-the-fold).

### AC-PC-09 — Header CTA + Hero 3rd CTA
- `HeaderDesktopLayout` renderiza `<nav aria-label="Navegação principal">` com link
  "Projetos" entre nome/contato e ThemeToggle/LanguageSelector (FE §Q7 tab order).
- `HeaderMobileLayout` expõe o mesmo nav via Radix Dialog sheet (`@radix-ui/react-dialog`
  já em `package.json`).
- `Hero` ganha 3º CTA "Ver projetos" (`projects.cta.seeProjects`), variant outline
  (F-P0-11 §3.1).

### AC-PC-10 — Architecture diagrams (light/dark)
- Cada projeto com `diagram` tem 2 SVGs (`architecture-light.svg`, `architecture-dark.svg`)
  em `frontend/public/assets/projects/<slug>/`.
- `DiagramAsset.tsx` usa `<picture>` + `<source media="(prefers-color-scheme: dark)">`.
- Cada SVG ≤ 50KB após svgo, verificado por step bash no job `build` do CI
  (F-P0-13 A5; Architect §Q6).
- `diagramAlt` (i18n) descreve conteúdo, não tipo — Zod valida presença (FE §Q7).

### AC-PC-11 — useDocumentSeo hook
- `frontend/src/hooks/useDocumentSeo.ts` substitui os 3 `useEffect` imperativos.
- Sem `react-helmet-async` em `package.json`; após merge, `grep -rn 'react-helmet'
  frontend/` retorna zero matches (Architect MEDIUM-2).
- Comentário em código antigo referenciando `react-helmet-async` é removido.

### AC-PC-12 — tauan-games link-out
- `GamesProjectTemplate` renderiza `GameCard` por item com `<a href={playUrl}
  target="_blank" rel="noopener noreferrer">`.
- **Sem** iframe, **sem** Makefile `games:sync`, **sem** Cache-Control Terraform `/games/*`
  (F-P0-14 §3.6; reaffirmed).

### AC-PC-13 — Lighthouse + Axe regressão zero
- Lighthouse em `/projetos` e cada `/projetos/<slug>`: Performance ≥ 90, A11y ≥ 90,
  Best-Practices ≥ 95, SEO ≥ 90 (constitution §3.5; memory/quality-bar §acceptance).
- Axe zero violations em `/projetos` + as 3 detail pages.
- CLS = 0 (cards com `aspect-ratio` ou width/height explícitos).

### AC-PC-14 — E2E coverage
- `tests/e2e/projects-index.spec.ts` — assert 3 cards, ordem fixa, link funcional.
- `tests/e2e/project-detail-case-study.spec.ts` — dadaia-workspace.
- `tests/e2e/project-detail-meta.spec.ts` — portifolio (costs, decisions visíveis).
- `tests/e2e/project-detail-games.spec.ts` — tauan-games (2 GameCards, playUrl absoluto).
- `tests/e2e/tauan-games-link-out.spec.ts` — link tem `rel="noopener noreferrer"`.
- `tests/e2e/nav-projects.spec.ts` — Header CTA + Hero CTA navegam para `/projetos`.

### AC-PC-15 — Security/redaction policy
Per Architect §Q8 — `frontend/src/data/content/*.json` **nunca** contém:
- Bucket names (`stage-portifolio-marco-menezes`, etc.)
- CloudFront distribution IDs (`E25KHOW8T4PLO3`, etc.)
- Route53 zone IDs (`Z08547081HT88IACPHZET`)
- AWS account ID como dígitos isolados em copy editorial

Enforcement: regex check no `check-i18n-parity.mjs` (cheap; alta proteção).

### AC-PC-16 — `ProjectsLayoutShell` chrome compartilhado `/projetos/*`
`ProjectsLayoutShell` existe em
`frontend/src/components/projects/ProjectsLayoutShell.tsx`, envolve todas as
rotas sob `/projetos/*` via layout route em `routes.ts`, e renderiza breadcrumb +
back-link conforme especificado em §10 R1 "Layout shell para /projetos/* —
posição firme". Substitui formalmente o `ProjectLayoutShell` SUPERSEDED em
`fe-qual-refactor-v1` AC-FQR-04. **(T-PC-B-09 — bloqueador de release).**

## 8. Dependencies (incluindo cross-release)

### 8.1 Cross-release: `fe-qual-refactor-v1` AC-FQR-05 reformulação

**Operator action required** (owned por `product-engineer` em turn follow-up; NÃO faz
parte do escopo desta release):

Após esta release entrar em IMPLEMENTATION (ou idealmente antes), o operador deve
solicitar ao `product-engineer` que edite `fe-qual-refactor-v1/SPEC.md §4 AC-FQR-05` de:

> AC-FQR-05. `TauanGamesPage` e `ArchitecturePage` consomem `ProjectTabPage` (zero
> render ad-hoc). (T-FE-QUAL-05 — em aberto)

para:

> AC-FQR-05. Rotas `/projetos/*` não têm renders ad-hoc — `TauanGamesPage`,
> `ArchitecturePage` e `DadaiaWorkspacePage` foram substituídos por templates dinâmicos
> em `projects-cluster-v1` (F-P0-12 §3.2). (Superseded por projects-cluster-v1; T-FE-QUAL-05
> removido do TASKS.md.)

E remover (ou marcar como superseded) T-FE-QUAL-05 em `fe-qual-refactor-v1/TASKS.md`.

**Sem essa reformulação, `fe-qual-refactor-v1` não pode CLOSURE** porque AC-FQR-05
permanecerá não-satisfeito perpetuamente (T-FE-QUAL-05 nunca será implementada). Esta
SPEC documenta a dependência mas **não toca em nenhum arquivo de
`fe-qual-refactor-v1/`** — gate v3 + atomicidade constitucional §10.

### 8.2 Sequenciamento de implementação

- Esta release pode entrar em IMPLEMENTATION em paralelo a `fe-qual-refactor-v1`, **desde
  que** as tasks deste release não tocam os arquivos in-flight de
  `fe-qual-refactor-v1` (`localStorage` em `LanguageProvider`, `RoleCollapsible`,
  `EmailModal`, `data/content` AI emphasis, branch protections). Coordenação operacional
  pelo `product-engineer` quando ativar este release no `ACTIVE.md`.
- `T-FE-WAVE5` (in-progress em `fe-qual-refactor-v1`) toca `data/content/*.json` em
  blocos disjuntos (`projects.*` vs `heroTagline/experience.*`); Phase A deste release
  deve coordenar merge order para evitar conflito textual.

### 8.3 Sem dependências externas novas

- Zero novas deps de runtime em `package.json` (Zod é dev-only quando build-time;
  Vite tree-shake remove em prod — D1).
- `zod-to-json-schema` é dev-dependency (Architect §Q2; ~5KB dev-only) para gerar
  `dist/schemas/projects.schema.json` (artefato de build, não commitado).

## 9. Memory files affected at CLOSURE

Esta release **não escreve em memory durante IMPLEMENTATION** (gate v3: memory edits
são CLOSURE-only). Os memory files que serão atualizados no CLOSURE phase:

- `specs/memory/product/index.html` — adicionar entrada para feature "projects-area"
  no `<ol class="catalog">`.
- `specs/memory/product/projects-area.html` — NEW file, feature page detalhando o
  showcase de projetos (propósito, flow, trigger, diferencial, runtime state,
  dependências).
- `specs/memory/architecture.html` — atualizar `§risks` removendo "Dynamic import por
  idioma em F-P0-06" (será cumprido nesta release — AC-PC-06); confirmar
  `§invariants 4` ainda válido com novo shape `projects.list`.
- `specs/memory/product/overview.html` — atualizar `§features-pending` (remover entries
  de projects cluster); adicionar `projects-area-v1` ao histórico de releases entregues.
- `specs/memory/tech-stack.html` — sem mudança (nenhuma tech nova entra na stack
  oficial — Zod é dev-only).
- `specs/memory/product/quality-bar.html` — sem mudança (gates pré-existentes; a
  release apenas os honra).

## 10. Risks

### R1 — Stale state em `fe-qual-refactor-v1` flagada pela FE analysis
FE OBJECTION-01: T-FE-QUAL-04 marcada `[x]` DONE com commit `e680ec0`, mas
`ProjectLayoutShell` **não existe** no filesystem (`frontend/src/components/project/`
inexistente). FE OBJECTION-02: T-FE-QUAL-01 marcada `[x]` DONE com commit `5e9fa44`,
mas `tsconfig.app.json:19` tem `"strict": false`.

**Não é problema deste release fixar** (atomicidade da release ativa). Esta SPEC
documenta para o operador o gap entre tasks-marcadas-DONE e estado de código. Sugestão
operacional: `product-engineer` ou `qa-engineer` audita `fe-qual-refactor-v1` antes do
CLOSURE para reconciliar tasks ↔ código (reabrir tasks falsamente DONE ou abrir nova
release de remediação).

Esta release **não depende** desses fixes para entregar, e os novos tipos passam mesmo
com `strict: false` (FE §Q9). Se `strict: true` for habilitado depois, pode haver
retrabalho.

**Layout shell para `/projetos/*` — posição firme (resolvido pelo refine-specs
2026-05-17T065653Z Problema #3).**

`projects-cluster-v1` entrega um componente `ProjectsLayoutShell` em
`frontend/src/components/projects/ProjectsLayoutShell.tsx` (Phase B,
task `T-PC-B-09`). Esse shell:

- Envolve `<Outlet />` para todas as rotas sob `/projetos` (index `/projetos` e
  dinâmica `/projetos/:slug`).
- Provê o chrome compartilhado: breadcrumb ("Projetos / <slug>"), botão "voltar
  para todos os projetos" na detail view, container layout consistente, e estilo
  comum de hero entre os 3 kinds (`case-study` / `meta` / `games`).
- É o ponto de montagem para o `useDocumentSeo` por-rota (cada filho do Outlet
  ajusta `<title>` via hook; o shell mantém estrutura ARIA estável).
- Substitui formalmente o `ProjectLayoutShell` previamente declarado em
  `fe-qual-refactor-v1/SPEC.md` AC-FQR-04 (marcado SUPERSEDED em Turn A
  2026-05-17T132630Z). O FE analysis report §Q1 ("Sem atrito com
  ProjectLayoutShell") confirma que `CaseStudyTemplate`, `MetaProjectTemplate` e
  `GamesProjectTemplate` podem reusar a estrutura sem fricção
  (`"O design mais simples e que CaseStudyTemplate, MetaProjectTemplate ... reusem a
  estrutura ja presente em ProjectTabPage"` — FE §Q1), e que a integração desse
  componente não cria atrito com o restante do refactor de header/nav já em
  andamento.

A versão antiga punted-to-implementation desse parágrafo foi substituída em
Turn B para fechar gap de SPEC: decisões sobre existência de componentes
nomeados não devem ficar para o PR. AC correspondente: **AC-PC-16** (§7).

### R2 — Memory drift: eager i18n import vs declared mitigation
Architect HIGH-2: `useContent.ts:7-9` faz eager import dos 3 JSONs, contradizendo
`memory/architecture.html §risks` que declara dynamic-import-per-language como
mitigação. **Mitigado por AC-PC-06** (D7) — esta release implementa dynamic import.
Memory `§risks` será atualizada no CLOSURE.

### R3 — `tauan-games` GH Pages link-out não monitorado
Architect MEDIUM-3: portfolio referencia `https://marcoaureliomenezes.github.io/tauan-games/<slug>/`.
F-P0-14 §A8 decide não testar HTTP 200 em CI (correto). Mas isso significa que slug
rename, deploy break ou archive do repo `tauan-games` produzirá link rot silencioso.
**Mitigação deferida** para release follow-up `portfolio-external-link-monitor-v1`
(weekly cron + `curl -I` + GH issue on failure; ~20 LOC). Aceita como debt nesta release.

### R4 — `tsconfig.app.json strict: false` debt persiste
FE §Q9: novos discriminated unions funcionam com strict: false, mas
`noUncheckedIndexedAccess` ausente significa acessos a `project.sections[0]` sem
guards passam. Quando strict for habilitado (fora deste release), pode haver retrabalho
~10-20 LOC em type guards. Debt aceito; FE §Q9 confirma backward-safe.

### R5 — Coordenação textual em `data/content/*.json` com T-FE-WAVE5
T-FE-WAVE5 está `[-]` IN PROGRESS em `fe-qual-refactor-v1`, mexendo em
`heroTagline`/`experience.*`. Phase A deste release mexe em `projects.*`. **Disjuntos**
no JSON, mas merge conflict textual no mesmo arquivo é possível. Mitigação: coordenar
ordem de merge entre as 2 releases via `product-engineer` antes de abrir PR de Phase A.

### R6 — `backend/` Flask dev server permanece (escopo limpeza F-P0-01 não consumado)
Architect INFO finding. Não afeta esta release. Documentado para próximo release
backend-touching.

## 11. Success criteria

Composição (vide constitution §3.5 + `memory/product/quality-bar.html §acceptance`):

1. Todos os 16 AC-PC-NN acima satisfeitos.
2. CI green em todos os jobs novos (`i18n-parity`) e existentes (`lint`, `build`,
   `unit-tests`, `e2e`, `lighthouse`, `typecheck`).
3. PR mergeado em `develop` com smoke `https://stage.marco-menezes.com/projetos` verde
   (operador valida visualmente conforme `portifolio_preview_protocol`).
4. Zero regressão em `/`, `/projetos/dadaia-workspace`, `/projetos/portifolio`,
   `/projetos/tauan-games` (Lighthouse + Axe).
5. Após CLOSURE: memory `product/index.html` + `product/projects-area.html` atualizadas;
   `architecture.html §risks` reflete dynamic-import implementado.
6. Operador pode adicionar 4º projeto editando apenas JSONs + adicionando assets, sem
   refator (OCP test — Architect §Q7).
