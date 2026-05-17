# F-P0-10 — Projects Index Page (`/projetos`)

**Status:** Draft

## 1. Contexto

A página `/projetos` **não existe** hoje. Visitantes que clicam em "Projetos" não chegam a
lugar nenhum — `navRoutes` em `routes.ts` declara o item, mas (a) ninguém renderiza esse
array (gap CRITICAL — endereçado em F-P0-11), e (b) não há `ProjectsIndexPage` para servir
de hub das 3 abas existentes.

Esta SPEC entrega o **hub** que materializa a área de projetos como produto distinto da
home (decisão explícita do operador: home permanece "currículo / cartão de visita"; área
de projetos é separada, escalável, sem retrabalho arquitetural ao adicionar projetos).

**Decisão fixada pelo operador (sem grill-me adicional):**

- **Ordem fixa dos cards:** `dadaia-workspace → portifolio → tauan-games`
  (tese técnica → meta → pessoal).
- Slug do projeto meta permanece `portifolio` (URL `/projetos/portifolio`).
- Conteúdo dos cards traduzido para os 3 idiomas (paridade total — DE incluído).

## 2. Objetivo

Entregar a rota `/projetos` com **grid de cards** consumindo `ProjectsContent.list`
(F-P0-09), respeitando todos os gates de qualidade já estabelecidos (Lighthouse Performance
≥ 90, Accessibility ≥ 90, CLS = 0). Cards são clicáveis e levam a `/projetos/<slug>` —
renderizado pelos templates per-kind de F-P0-12.

## 3. Rota e estrutura

- **Rota:** `/projetos` (apenas) — index puro, sem `/projetos/` redundante.
- **Roteamento:** entrada nova em `frontend/src/routes.ts`:
  ```ts
  {
    slug: "projects-index",
    path: "/projetos",
    labelKey: "nav.projects",
    inNav: true,
  }
  ```
  Convention de ordem em `routes.ts`: o item `projects-index` aparece **antes** dos 3
  slugs filhos (`dadaia-workspace`, `tauan-games`, `portifolio`). `navRoutes` (filtro
  `inNav: true`) passa a ter 4 entradas; **mas** F-P0-11 vai redesenhar o nav para que
  apenas `projects-index` apareça no header desktop/mobile (os 3 filhos são alcançados via
  cards no `/projetos`). Para isso, F-P0-11 define um campo derivado ou um flag
  `inHeaderNav` distinto de `inNav` — fica em F-P0-11, não nesta SPEC.
- **Componente novo:** `frontend/src/pages/projects/ProjectsIndexPage.tsx`.
- **Card componente:** `frontend/src/components/projects/ProjectCard.tsx` (NOVO).

### 3.1 Layout

```
┌──────────────────────────────────────────────────┐
│  [HeaderShell]                                   │
├──────────────────────────────────────────────────┤
│  <ProjectsIndexHero>                             │
│    h1: content.projects.index.title              │
│    p:  content.projects.index.subtitle           │
├──────────────────────────────────────────────────┤
│  <grid> gap-6, grid-cols-1 md:grid-cols-2        │
│         lg:grid-cols-3                           │
│    [Card dadaia-workspace]                       │
│    [Card portifolio]                             │
│    [Card tauan-games]                            │
└──────────────────────────────────────────────────┘
```

Sem sidebar, sem decorador pesado. Visual coerente com WAVE2/WAVE3 (paleta amber,
JetBrains Mono em mono-snippets, `useInView` para fade-up scroll-triggered).

### 3.2 ProjectCard

Props:

```ts
interface ProjectCardProps {
  project: Project;  // discriminated union (F-P0-09)
}
```

Estrutura:

```tsx
<Link to={`/projetos/${project.slug}`} className="group">
  <Card className="overflow-hidden hover:-translate-y-1 hover:shadow-large
                   hover:border-accent/40 transition-all duration-200">
    <img src={project.card.cover} alt={project.hero.title}
         width={640} height={360}
         loading="lazy"
         className="aspect-video object-cover w-full" />
    <CardHeader>
      <CardTitle>{project.hero.title}</CardTitle>
      <Badge variant="outline" className="w-fit">
        {labelForKind(project.kind)}
      </Badge>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{project.card.summary}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        {project.card.tech.slice(0, 6).map((t) => (
          <Badge key={t} className={skillCategoryStyle(t).badge}>{t}</Badge>
        ))}
      </div>
    </CardContent>
  </Card>
</Link>
```

`labelForKind` é util local (i18n via `useContent`): `case-study` → "Estudo de caso" /
"Case study" / "Fallstudie"; `meta` → "Meta-projeto" / "Meta project" / "Meta-Projekt";
`games` → "Jogos" / "Games" / "Spiele".

### 3.3 Acessibilidade

- O `<Link>` envolve o card inteiro → `Card` interno **não** repete CTA "Ver projeto"
  (evita ambiguidade de tab order e leitor de tela duplicado).
- `aria-labelledby` no `<section>` da grid aponta para o `h1` da hero.
- Cada `<img>` tem `width`/`height` explícitos (zero CLS).
- Foco visível: anel accent no `<Link>` (`focus-visible:ring-2 focus-visible:ring-accent`).
- Tab order: hero → card 1 → card 2 → card 3 → footer.

### 3.4 SEO

- `<title>` e `<meta name="description">` vêm de `content.projects.index.seo`.
- Hook `useDocumentSeo` (extraído em F-P0-12) já encapsula essa lógica — esta página o
  consome.
- Schema.org **opcional** (`ItemList` com `ListItem` para cada projeto) — out of scope P0;
  decisão futura com SEO em dados reais.

### 3.5 Edge cases

- **`content.projects` ausente** (caso degenerado, validação Zod falhou em prod):
  renderizar `<EmptyState>` "Sem projetos cadastrados" com link "Voltar para home".
  Mantém Lighthouse verde mesmo no caso patológico.
- **`content.projects.list` com 0 itens:** mesma `EmptyState`.
- **Card sem `cover`:** placeholder `/assets/projects/_fallback.webp` (200KB max, neutro).
  Convention validada via Zod (F-P0-09 §3.3) — falha em CI antes de chegar a prod.

## 4. Conteúdo (i18n)

Adições aos 3 JSONs sob `projects.index`:

```json
{
  "projects": {
    "index": {
      "title": "Projetos",
      "subtitle": "Sistemas reais que construo — código auditável, decisões registradas.",
      "seo": {
        "title": "Projetos — Marco Menezes",
        "description": "Estudos de caso, meta-arquitetura do portfólio e jogos."
      }
    },
    "list": [ /* F-P0-09 */ ]
  }
}
```

Tradução em EN/DE pareada — paridade obrigatória (validada em F-P0-15).

Novas chaves de label em todos os idiomas:

- `nav.projects` (label do item no Header — F-P0-11 consome)
- `projects.kindCaseStudy`, `projects.kindMeta`, `projects.kindGames`

## 5. Critérios de aceite

- **A1.** Rota `/projetos` registrada em `routes.ts` com `slug="projects-index"` e
  `inNav: true`.
- **A2.** `ProjectsIndexPage` renderiza grid com exatamente **3 cards** na ordem
  `dadaia-workspace → portifolio → tauan-games`.
- **A3.** Cada card linka para `/projetos/<slug>` via `<Link>` (react-router-dom); clique
  não recarrega o bundle (SPA navigation).
- **A4.** Cada card mostra `cover`, `hero.title`, `card.summary` e até 6 `card.tech`
  badges colorizadas por `skillCategoryColors`.
- **A5.** Tab order: hero h1 → card 1 → card 2 → card 3. Foco visível em cada card. Axe:
  zero violações.
- **A6.** Lighthouse Performance ≥ 90, Accessibility ≥ 90, Best-Practices ≥ 95, SEO ≥ 90
  em `/projetos` (mobile + desktop).
- **A7.** CLS ≤ 0.1 (todas as imagens com `width`/`height` explícitos).
- **A8.** E2E novo `projects-index.spec.ts`: smoke + assert dos 3 cards visíveis na ordem
  correta + assert de navegação ao clicar.
- **A9.** Paridade i18n: PT/EN/DE com `projects.index.{title,subtitle,seo.*}` populados —
  validado em F-P0-15.

## 6. Dependências

- **F-P0-09** (`projects-content-model`) — **Hard dependency.** Esta SPEC consome
  `content.projects.list` no shape novo (`Project` discriminated union).
- **F-P0-08** (`content-ai-emphasis`) — tokens visuais (`bg-accent-subtle`, `border-accent`)
  reutilizados em hover de cards.
- **T-FE-WAVE2** (microinteractions) — `useInView` reusado para fade-up scroll-triggered.

## 7. Out of scope

- Filtros / busca / paginação. Volume atual (3 projetos, alvo ≤ 10) não justifica.
- Render do `navRoutes` no Header (F-P0-11).
- Página de detalhe de cada projeto (F-P0-12).
- Diagramas de arquitetura (F-P0-13).
- Link para os jogos no GH Pages (F-P0-14).
- CI de paridade i18n (F-P0-15).
- Schema.org JSON-LD (decisão futura).

## 8. Justificativa de design

- **Por que grid responsivo simples (1/2/3 col).** Volume de projetos é baixo nos próximos
  anos. Grid CSS sem virtualização, sem skeleton complexo, sem state remoto — favorece
  Lighthouse Performance e custo cognitivo do operador ao adicionar projetos.
- **Por que `<Link>` envolve o card inteiro.** Hot zone clicável grande, melhor UX touch,
  melhor a11y (1 target focável por card vs 2-3). Tradeoff aceitável de não ter "CTA
  visual explícito" — a affordance `hover:-translate-y-1` + `hover:border-accent/40`
  comunica clickability.
- **Por que slice em 6 tech badges no card.** Limite visual; detalhes vão na página de
  detalhe. Quando F-P0-09 tipa `card.tech: string[]` sem upper bound, é responsabilidade
  desta camada cortar para não estourar o card no mobile.
- **Por que sem filtros.** Premature optimization para o volume atual. Se o operador
  publicar 15+ projetos, abrimos como F-P1.
