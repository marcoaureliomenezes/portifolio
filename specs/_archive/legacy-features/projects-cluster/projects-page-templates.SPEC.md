# F-P0-12 — Projects Page Templates (`ProjectTabPage` + per-kind dispatch)

**Status:** Draft

## 1. Contexto

Análise do `software-architect`: o template genérico `ProjectTabPage` (266 linhas, já
preparado para ser Template Method) é usado **apenas** em `DadaiaWorkspacePage`.
`TauanGamesPage` e `ArchitecturePage` (slug `portifolio`) reimplementam render do zero —
violação DRY e do Open/Closed Principle.

Esta SPEC unifica o caminho de render de detalhe de projeto:

- **Hub de dispatch** `ProjectDetailPage` decide o template a usar com base em
  `project.kind` (discriminator de F-P0-09).
- **Template por kind** — `ProjectTabPage` para `case-study`, `MetaProjectTemplate` para
  `meta`, `GamesProjectTemplate` para `games`.
- **Hook extraído** `useDocumentSeo` desduplica a lógica de `<title>` + `<meta>` que hoje
  está copy-paste nas 3 páginas.

**Decisão fixada pelo operador (sem grill-me adicional):**

- `MetaProjectTemplate` é uma **extensão** de `ProjectTabPage` (não duplicação) — adiciona
  blocos de `costs` e `decisions`.
- `GamesProjectTemplate` é **um template novo distinto** (grid de cards de jogo com botão
  "Jogar") porque sua estrutura difere semanticamente — não é narrativa, é vitrine.
- Botão "Jogar" abre `https://marcoaureliomenezes.github.io/tauan-games/<slug>/` em nova
  aba (F-P0-14 define o detalhe).

## 2. Objetivo

Eliminar render ad-hoc por projeto. Garantir que adicionar um 4º projeto seja apenas:

1. Adicionar entrada em `projects.list` (F-P0-09).
2. Adicionar entrada em `routes.ts` (`inHeaderNav: false`, slug bate com `project.slug`).
3. (Se `kind: case-study`) Não há código novo — `ProjectTabPage` cobre via dados.
4. (Se `kind: meta` ou `games`) Reusar template existente.

Zero retrabalho no orquestrador. Custo de adicionar projeto = custo de escrever JSON.

## 3. Arquitetura

### 3.1 Hook novo `useDocumentSeo`

`frontend/src/hooks/useDocumentSeo.ts`:

```ts
import { useEffect } from "react";

interface SeoData {
  title: string;
  description: string;
}

export function useDocumentSeo({ title, description }: SeoData) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const desc = document.querySelector('meta[name="description"]');
    const prevDesc = desc?.getAttribute("content") ?? "";
    desc?.setAttribute("content", description);

    return () => {
      document.title = prevTitle;
      desc?.setAttribute("content", prevDesc);
    };
  }, [title, description]);
}
```

Mínimo necessário; sem `react-helmet` (lib órfã marcada REMOVE no architect §4).
Restauração `prevTitle`/`prevDesc` em cleanup evita drift quando o usuário navega
SPA-internamente.

Consumido por: `ProjectsIndexPage`, `ProjectDetailPage` (e portanto todos os 3 templates),
e como futura option pela home (não obrigatório nesta SPEC).

### 3.2 `ProjectDetailPage` — dispatch

`frontend/src/pages/projects/ProjectDetailPage.tsx`:

```tsx
import { useParams, Navigate } from "react-router-dom";
import { useContent } from "@/hooks/useContent";
import { ProjectTabPage } from "./ProjectTabPage";
import { MetaProjectTemplate } from "./MetaProjectTemplate";
import { GamesProjectTemplate } from "./GamesProjectTemplate";

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { content } = useContent();
  const project = content.projects?.list.find((p) => p.slug === slug);

  if (!project) return <Navigate to="/404" replace />;

  switch (project.kind) {
    case "case-study": return <ProjectTabPage project={project} />;
    case "meta":       return <MetaProjectTemplate project={project} />;
    case "games":      return <GamesProjectTemplate project={project} />;
  }
}
```

TypeScript exhaustive check (discriminated union) garante que adicionar 4º `kind` quebra o
build até o template existir.

Rota única em `routes.ts` (substitui as 3 rotas atuais):

```ts
{
  slug: "project-detail",
  path: "/projetos/:slug",
  labelKey: "nav.projectDetail",
  inNav: false,
  inHeaderNav: false,
}
```

As 3 rotas hoje existentes (`/projetos/dadaia-workspace`, `/projetos/tauan-games`,
`/projetos/portifolio`) **deixam de existir** como entradas separadas em `routes.ts` —
viram parametrizadas via `:slug`. Componentes velhos `TauanGamesPage`, `ArchitecturePage`,
`DadaiaWorkspacePage` são **deletados** do repo (`src/pages/projects/`); `App.tsx` é
ajustado para usar apenas `ProjectDetailPage` na rota dinâmica.

**Importante:** essa mudança implica que `inNav: true` nas 3 entradas antigas é
substituído. F-P0-10 e F-P0-11 já assumem isso (`headerNavRoutes` filtra
`inHeaderNav: true`, e nenhum dos 3 slugs filhos tem essa flag — apenas
`projects-index`). Confirmação cruzada entre as 3 SPECs.

### 3.3 `ProjectTabPage` — refator para receber `Project`

Hoje `ProjectTabPage` recebe props ad-hoc (`hero`, `sections`, `cta`, `seo`). Refator para
receber o `Project` inteiro (kind `case-study`) e extrair internamente:

```tsx
interface ProjectTabPageProps {
  project: CaseStudyProject;
}

export function ProjectTabPage({ project }: ProjectTabPageProps) {
  useDocumentSeo(project.seo);
  // ... render usando project.hero, project.sections, project.cta, project.diagram
}
```

Diagrama (`project.diagram`) é renderizado via `<ArchitectureDiagram>` (componente novo de
F-P0-13).

### 3.4 `MetaProjectTemplate` — extensão para `kind: meta`

`frontend/src/pages/projects/MetaProjectTemplate.tsx`:

```tsx
interface MetaProjectTemplateProps {
  project: MetaProject;
}

export function MetaProjectTemplate({ project }: MetaProjectTemplateProps) {
  useDocumentSeo(project.seo);
  return (
    <ProjectLayout>
      <ProjectHero {...project.hero} />
      {project.diagram && <ArchitectureDiagram path={project.diagram} />}
      <ProjectSections sections={project.sections} />
      <CostsTable rows={project.costs} />          {/* NOVO bloco */}
      <DecisionsList items={project.decisions} />  {/* NOVO bloco */}
      <StackTable rows={project.stack} />
      <ProjectLinks links={project.links} />
    </ProjectLayout>
  );
}
```

**Reuso máximo:** `ProjectLayout`, `ProjectHero`, `ProjectSections`, `ProjectLinks` saem
de `ProjectTabPage` extraídos como subcomponentes em `components/projects/`. Sem
duplicação.

`<CostsTable>` e `<DecisionsList>` são componentes novos pequenos (≤ 60 linhas cada),
ancorados em `<table>` semântica + utilitários Tailwind (responsivo: mobile-stack para
costs; lista numerada para decisions).

### 3.5 `GamesProjectTemplate` — grid de cards de jogo

`frontend/src/pages/projects/GamesProjectTemplate.tsx`:

```tsx
interface GamesProjectTemplateProps {
  project: GamesProject;
}

export function GamesProjectTemplate({ project }: GamesProjectTemplateProps) {
  useDocumentSeo(project.seo);
  return (
    <ProjectLayout>
      <ProjectHero {...project.hero} />
      <section aria-labelledby="games-list-heading">
        <h2 id="games-list-heading">{label("projects.tauanGames.itemsTitle")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {project.items.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>
    </ProjectLayout>
  );
}
```

`<GameCard>` é componente novo em `components/projects/GameCard.tsx`:

```tsx
interface GameCardProps {
  game: GameLink;
}

export function GameCard({ game }: GameCardProps) {
  const { label } = useContent();
  return (
    <Card className="overflow-hidden">
      <img src={game.cover} alt={game.title}
           width={640} height={360}
           loading="lazy"
           className="aspect-video object-cover w-full" />
      <CardHeader>
        <CardTitle>{game.title}</CardTitle>
        <Badge variant="outline" className="w-fit">{game.engine}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{game.body}</p>
        <div className="flex gap-2 mt-4">
          <Button asChild variant="default">
            <a href={game.playUrl} target="_blank" rel="noopener noreferrer">
              {label("projects.tauanGames.play")}
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={game.repo} target="_blank" rel="noopener noreferrer">
              {label("projects.tauanGames.viewRepo")}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

`game.playUrl` é resolvido pelo conteúdo (F-P0-14 define convention:
`https://marcoaureliomenezes.github.io/tauan-games/<slug>/`).

### 3.6 Estrutura final dos arquivos

```
frontend/src/
├── hooks/
│   └── useDocumentSeo.ts                              [NOVO]
├── pages/projects/
│   ├── ProjectDetailPage.tsx                          [NOVO]
│   ├── ProjectsIndexPage.tsx                          [F-P0-10]
│   ├── ProjectTabPage.tsx                             [REFATOR]
│   ├── MetaProjectTemplate.tsx                        [NOVO]
│   ├── GamesProjectTemplate.tsx                       [NOVO]
│   ├── DadaiaWorkspacePage.tsx                        [DELETAR]
│   ├── TauanGamesPage.tsx                             [DELETAR]
│   └── ArchitecturePage.tsx                           [DELETAR]
├── components/projects/
│   ├── ProjectCard.tsx                                [F-P0-10]
│   ├── ProjectLayout.tsx                              [NOVO, extraído]
│   ├── ProjectHero.tsx                                [NOVO, extraído]
│   ├── ProjectSections.tsx                            [NOVO, extraído]
│   ├── ProjectLinks.tsx                               [NOVO, extraído]
│   ├── ArchitectureDiagram.tsx                        [F-P0-13]
│   ├── CostsTable.tsx                                 [NOVO]
│   ├── DecisionsList.tsx                              [NOVO]
│   └── GameCard.tsx                                   [NOVO]
└── routes.ts                                           [ATUALIZADO]
```

`App.tsx` é simplificado: rotas dos 3 projetos viram uma única rota dinâmica
`/projetos/:slug → <ProjectDetailPage />`.

## 4. Critérios de aceite

- **A1.** `useDocumentSeo` hook implementado, com cleanup que restaura `<title>` e
  `<meta description>` na unmount.
- **A2.** `ProjectDetailPage` faz dispatch correto: `kind: case-study` →
  `ProjectTabPage`; `kind: meta` → `MetaProjectTemplate`; `kind: games` →
  `GamesProjectTemplate`. Slug inexistente → `<Navigate to="/404" replace />`.
- **A3.** `ProjectTabPage` aceita `project: CaseStudyProject` (não props ad-hoc). Render
  visual mantém paridade com versão anterior em `dadaia-workspace`.
- **A4.** `MetaProjectTemplate` renderiza, no projeto `portifolio`, os blocos de `hero`,
  `diagram`, `sections`, `costs`, `decisions`, `stack`, `links` em ordem coerente.
- **A5.** `GamesProjectTemplate` renderiza grid de `<GameCard>` para cada item; botão
  "Jogar" abre `playUrl` em nova aba com `target="_blank" rel="noopener noreferrer"`.
- **A6.** Componentes velhos (`DadaiaWorkspacePage`, `TauanGamesPage`, `ArchitecturePage`)
  foram **removidos** do repo.
- **A7.** `routes.ts` tem rota única dinâmica `/projetos/:slug` (substituindo as 3
  específicas). Entradas antigas (`dadaia-workspace`, `tauan-games`, `portifolio` com
  `path: /projetos/<slug>`) **deletadas**.
- **A8.** E2E existentes adaptados (`tauan-games.spec.ts`, `dadaia-workspace.spec.ts`,
  `architecture.spec.ts` — se presentes; ou os equivalentes em `project-tabs.spec.ts`):
  - `/projetos/dadaia-workspace` renderiza `ProjectTabPage` shape.
  - `/projetos/portifolio` renderiza `MetaProjectTemplate` shape (`costs` + `decisions`
    visíveis).
  - `/projetos/tauan-games` renderiza `GamesProjectTemplate` shape (2 cards de jogo, cada
    um com botão "Jogar").
  - `/projetos/inexistente` redireciona para `/404`.
- **A9.** Lighthouse Performance ≥ 90, Accessibility ≥ 90 em cada uma das 3 páginas
  refatoradas.
- **A10.** `npm run test:run` verde; cobertura unit dos templates ≥ 60% branches.
- **A11.** Build sem erros TS — `tsc --noEmit` limpo.

## 5. Riscos e mitigações

- **Risco:** quebra de URLs externas que apontam para `/projetos/dadaia-workspace` etc.
  **Mitigação:** as URLs **continuam funcionando** — só o componente que serve a rota
  muda. Path public idêntico, dispatch novo. Sem 301 redirect.
- **Risco:** o exhaustive check do `switch` em `ProjectDetailPage` deixa de quebrar build
  se TS perde info do discriminator por algum motivo (ex: cast incorreto).
  **Mitigação:** TS strict mode já ligado; adicionar `assertNever` helper no `default`
  para fechar a porta em runtime (joga `Error("Unhandled project kind")` em prod).
- **Risco:** componentes velhos têm testes/snapshots que não migram limpos.
  **Mitigação:** task explícita em TASKS.md inclui remoção dos testes obsoletos
  (`TauanGamesPage.test.tsx` etc.) e criação dos novos (`ProjectDetailPage.test.tsx`,
  `MetaProjectTemplate.test.tsx`, `GamesProjectTemplate.test.tsx`).

## 6. Dependências

- **F-P0-09** (`projects-content-model`) — **Hard dependency.** Consome `Project`
  discriminated union.
- **F-P0-13** (`projects-architecture-diagrams`) — consome `<ArchitectureDiagram>`.
- **F-P0-14** (`tauan-games-link-out`) — define `GameLink.playUrl`.

## 7. Out of scope

- Page transitions / view transitions API. Não justifica complexidade no P0.
- Compartilhamento social / Open Graph metas dinâmicas por projeto. `useDocumentSeo` cobre
  `<title>` + `<meta description>`; OG é P1.
- Comentários por projeto (giscus, utterances etc.). Out of scope.

## 8. Justificativa de design

- **Por que `useDocumentSeo` hook custom e não `react-helmet`.** `react-helmet` está na
  lista REMOVE do architect §4 (deps órfãs, footprint relevante). Hook custom de 15 linhas
  resolve sem nova dep.
- **Por que dispatch por `switch` e não polimorfismo via `template: ComponentType`.** Two
  reasons: (a) TS discriminated union dá exhaustive check gratuito; (b) adicionar 4º kind
  exige decisão consciente (escrever template novo), não passa silenciosamente.
- **Por que `MetaProjectTemplate` chama `ProjectLayout`/`ProjectHero` em vez de estender
  `ProjectTabPage`.** Composição > herança. `ProjectTabPage` é o template do `case-study`
  e fica simples; `MetaProjectTemplate` é o template do `meta` com blocos extras. Ambos
  compartilham os primitivos (`ProjectLayout`, `ProjectHero`, etc.) por composição —
  encaixa direto no princípio DIP do `architecture §5`.
- **Por que rota única `/:slug` e não rotas estáticas.** Eliminar três entradas em
  `routes.ts` que só apontavam para o mesmo dispatch é desperdício. Rota dinâmica +
  `slug` validado contra `projects.list` cobre tudo, incluindo projetos futuros
  (zero retrabalho).
