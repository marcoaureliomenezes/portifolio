# F-P0-09 — Projects Content Model (discriminated union por `kind`)

**Status:** Draft

## 1. Contexto

A análise do `software-architect` (relatório `2026-05-15T*-projects-area-architecture.md`)
identificou **4 gaps duros** na área de projetos do portfólio:

1. **`navRoutes` declarado em `routes.ts:43` sem consumidor** — não há render do menu em
   nenhum layout do Header (gap CRITICAL).
2. **Template `ProjectTabPage` usado em apenas 1/3 das páginas** (`DadaiaWorkspacePage`);
   `TauanGamesPage` e `ArchitecturePage` (slug `portifolio`) implementam render
   ad-hoc, violando DRY e o princípio Open/Closed.
3. **`ProjectsContent` é um mapa fechado com 3 interfaces incompatíveis**
   (`DadaiaWorkspaceProject` ≠ `TauanGamesProject` ≠ `PortifolioProject`) — adicionar um 4º
   projeto exige tocar no tipo, em todos os JSONs (`pt/en/de`) e em código de consumo
   (violação OCP).
4. **Zero página índice** — não existe rota `/projetos` listando os projetos disponíveis.

Esta SPEC ataca o gap (3) — o **modelo de dados** — porque é o piso técnico que destrava
as outras 6 features do Grupo B (B-2 a B-7). Sem um modelo unificado, índice, navegação,
templates e diagramas continuam sendo código especial-por-projeto.

**Decisão fixada pelo operador** (AskUserQuestion na sessão de planejamento de 2026-05-15,
sem grill-me adicional necessário):

- **Slug do projeto meta permanece `portifolio`** (não renomear para `arquitetura`). URL
  pública: `/projetos/portifolio`.
- **Ordem fixa na grid `/projetos`:** `dadaia-workspace → portifolio → tauan-games`
  (narrativa: tese técnica → meta → pessoal).
- **Compatibilidade com CMS-lite (P1):** o schema desta SPEC vai servir de base de longo
  prazo. O Lambda Go (`backend-go/internal/schema/content.schema.json` — referência em
  `memory/architecture.md §10`) vai validar este shape sem rework. Inclui validação
  **Zod** opcional em P0 que pode evoluir para JSON Schema gerado em P1.

## 2. Objetivo

Substituir o mapa fechado `ProjectsContent` por um **modelo aberto e ordenado**, com
discriminated union por `kind`, garantindo:

- Adicionar um 4º projeto não exige tocar em `types/content.ts` nem em código de consumo —
  apenas em `data/content/{pt,en,de}.json`.
- A ordem dos projetos é uma propriedade explícita do dado (array), não derivada de chaves
  de objeto.
- O tipo do projeto (`case-study | games | meta`) determina o template de renderização
  (resolvido em F-P0-12) sem `switch` espalhado.
- Schema estável o suficiente para o Lambda Go de P1 validar sem refator.

## 3. Modelo de dados

### 3.1 Tipos novos em `frontend/src/types/content.ts`

```ts
// Discriminator
export type ProjectKind = "case-study" | "games" | "meta";

// Card data — sempre presente, consumido pela ProjectsIndexPage (F-P0-10)
export interface ProjectCard {
  cover: string;        // path em /assets/projects/<slug>/cover.webp (≤ 200KB)
  summary: string;      // 1-2 frases para o card no índice
  tech: string[];       // tags renderizadas via skillCategoryColors (≥ 3 itens)
}

// Base — tudo que todo projeto tem
export interface ProjectBase {
  slug: string;                   // único; bate com routes.ts e diretório de assets
  kind: ProjectKind;              // discriminator
  hero: ProjectHeroData;          // já existente; reusa shape de F-P0-04/05
  card: ProjectCard;              // NOVO — alimenta a grid de /projetos
  seo: ProjectSeoData;            // já existente
  diagram?: string;               // path para SVG (light); convention em F-P0-13
}

// kind: "case-study" — projetos de software/infra (ex: dadaia-workspace)
export interface CaseStudyProject extends ProjectBase {
  kind: "case-study";
  sections: ProjectSectionData[]; // shape já existente
  cta: ProjectCtaData;            // shape já existente
}

// kind: "meta" — projeto de autoarquitetura (este portfólio)
export interface MetaProject extends ProjectBase {
  kind: "meta";
  sections: ProjectSectionData[]; // narrativa
  stack: StackRow[];              // shape já existente
  costs: CostRow[];               // shape já existente
  decisions: ArchDecision[];      // shape já existente
  links: PortifolioProjectLinks;  // shape já existente
}

// kind: "games" — vitrines de jogos referenciados em GH Pages externos (F-P0-14)
export interface GameLink {
  slug: string;             // path no GH Pages: /tauan-games/<slug>/
  title: string;
  engine: string;
  cover: string;            // /assets/projects/tauan-games/<slug>.webp
  body: string;             // descrição curta
  repo: string;             // URL do repo (mesma para todos hoje)
  playUrl: string;          // URL externa do jogo no GH Pages (F-P0-14)
}

export interface GamesProject extends ProjectBase {
  kind: "games";
  items: GameLink[];        // só os fully implemented (ver F-P0-14)
}

// Discriminated union
export type Project = CaseStudyProject | MetaProject | GamesProject;

// Container ordenado — substitui o mapa fechado
export interface ProjectsContent {
  index: {
    title: string;          // ex: "Projetos"
    subtitle?: string;
    seo: ProjectSeoData;
  };
  list: Project[];          // ORDEM FIXA: dadaia-workspace → portifolio → tauan-games
}
```

Tipos **mantidos** sem alteração: `ProjectHeroData`, `ProjectSectionData`, `ProjectCtaData`,
`ProjectSeoData`, `StackRow`, `CostRow`, `ArchDecision`, `PortifolioProjectLinks`,
`GameItem` (será removido em F-P0-14; até lá fica como alias deprecado de `GameLink` para
evitar quebra durante migração).

### 3.2 Container em `ContentData`

```ts
export interface ContentData {
  // ... campos existentes ...
  projects?: ProjectsContent;   // mantém opcional para retrocompatibilidade build-time
}
```

A presença de `projects.list` é validada em tempo de carga via Zod (§3.3); ausência cai no
índice em estado vazio (caso degenerado tratado em F-P0-10).

### 3.3 Validação Zod (P0 → P1 stability)

**Decisão (operador):** SIM, adicionar validação Zod em P0 — barato, contrato explícito,
evita drift silencioso entre `pt/en/de`, e o schema serve de espelho do JSON Schema que o
Lambda Go (P1) vai validar.

Novo arquivo `frontend/src/lib/schemas/projects.ts`:

```ts
import { z } from "zod";

const ProjectCardSchema = z.object({
  cover: z.string().startsWith("/assets/projects/"),
  summary: z.string().min(20).max(280),
  tech: z.array(z.string()).min(3),
});

const ProjectBaseSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  hero: z.object({ title: z.string(), tagline: z.string(), logo: z.string().optional() }),
  card: ProjectCardSchema,
  seo: z.object({ title: z.string(), description: z.string() }),
  diagram: z.string().optional(),
});

const CaseStudySchema = ProjectBaseSchema.extend({
  kind: z.literal("case-study"),
  sections: z.array(z.any()).min(1),
  cta: z.object({ github: z.string().url(), docs: z.string().url().optional() }),
});

const MetaSchema = ProjectBaseSchema.extend({
  kind: z.literal("meta"),
  sections: z.array(z.any()).min(1),
  stack: z.array(z.any()).min(1),
  costs: z.array(z.any()),
  decisions: z.array(z.any()).min(1),
  links: z.object({ repo: z.string().url(), terraform: z.string().url(), specs: z.string().url() }),
});

const GamesSchema = ProjectBaseSchema.extend({
  kind: z.literal("games"),
  items: z.array(z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string(),
    engine: z.string(),
    cover: z.string().startsWith("/assets/projects/"),
    body: z.string().min(20),
    repo: z.string().url(),
    playUrl: z.string().url(),
  })).min(1),
});

export const ProjectSchema = z.discriminatedUnion("kind", [
  CaseStudySchema, MetaSchema, GamesSchema,
]);

export const ProjectsContentSchema = z.object({
  index: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    seo: z.object({ title: z.string(), description: z.string() }),
  }),
  list: z.array(ProjectSchema).min(1),
});

export type ProjectsContentValidated = z.infer<typeof ProjectsContentSchema>;
```

Validação acontece em `useContent()` no momento da carga do idioma — log de erros via
`console.error` em dev/stage; em prod, falha **silenciosa** (renderiza `/projetos` vazio
com fallback de cards) para não quebrar a home. A regra "Lighthouse é gate de merge"
(`constitution §3.5`) garante que drift seja pego antes de chegar a prod.

`zod` já é dependência indireta de várias libs no `package.json`; se não estiver direta,
adicionar `"zod": "^3.x"` em `dependencies`. Tamanho gzip ≈ 12KB — abaixo do orçamento de
performance.

### 3.4 Conteúdo `frontend/src/data/content/{pt,en,de}.json`

Reescrita atômica do bloco `projects` em cada um dos 3 JSONs. **Ordem fixa**:

1. `dadaia-workspace` (kind `case-study`)
2. `portifolio` (kind `meta`)
3. `tauan-games` (kind `games`)

Campos `card.cover` apontam para `/assets/projects/<slug>/cover.webp` (assets entregues por
software-engineer em PR paralelo; SPEC só fixa a convention).

Conteúdo do `card.summary` e `card.tech` é traduzido nos 3 idiomas (paridade total — DE
incluído, decisão do operador). Itens de `GamesProject.items` em F-P0-14 limitam-se a
`aero-fighters` (Three.js) e `tauan-trex` (Phaser) — somente os fully implemented.

### 3.5 Hook `useContent()` — sem mudança de assinatura

`useContent()` continua devolvendo `{ label, content, language, setLanguage }`. A única
mudança é a validação Zod interna ao carregar `content.projects`. Componentes que hoje
fazem `content.projects?.["dadaia-workspace"]` migram para
`content.projects?.list.find((p) => p.slug === "dadaia-workspace")` — tarefa de F-P0-12.

## 4. Critérios de aceite

- **A1.** `frontend/src/types/content.ts` exporta `ProjectKind`, `ProjectBase`,
  `ProjectCard`, `CaseStudyProject`, `MetaProject`, `GamesProject`, `GameLink`, `Project`,
  `ProjectsContent` conforme §3.1.
- **A2.** `frontend/src/lib/schemas/projects.ts` exporta `ProjectSchema` e
  `ProjectsContentSchema` (Zod) conforme §3.3. `zod` declarado como `dependency`.
- **A3.** Os 3 JSONs (`pt/en/de.json`) têm bloco `projects.list` com **exatamente 3
  entradas** na ordem fixa `[dadaia-workspace, portifolio, tauan-games]`, cada uma com
  `kind` correto e `card.{cover,summary,tech}` populados.
- **A4.** `useContent()` valida `content.projects` contra `ProjectsContentSchema` em
  desenvolvimento; falha de validação aparece no console com `console.error("[content]
  invalid projects shape", err)`.
- **A5.** Build (`npm run build`) e testes unit (`npm run test:run`) verdes. Nenhum
  componente quebra (consumidores ainda não migrados — F-P0-12 cuida).
- **A6.** Paridade i18n estrutural: `jq '.projects.list | length' src/data/content/{pt,en,de}.json`
  retorna `3` para todos; `jq '[.projects.list[].slug]'` retorna o mesmo array nos 3.
- **A7.** **Compat P1:** o JSON Schema gerável a partir de `ProjectSchema` (via
  `zod-to-json-schema`) é compatível com `backend-go/internal/schema/content.schema.json`
  no formato 2020-12 — verificável quando o Lambda Go for implementado, sem retrabalho.

## 5. Riscos e mitigações

- **Risco:** consumidores atuais (`TauanGamesPage`, `ArchitecturePage`, `DadaiaWorkspacePage`)
  quebram porque acessam `content.projects?.["tauan-games"]` (map syntax).
  **Mitigação:** esta SPEC entrega **apenas** o tipo e o conteúdo. A migração dos
  consumidores acontece em F-P0-12 (`projects-page-templates`), que tem esta SPEC como
  dependência declarada. Durante a janela, pode ser necessário um helper transitório
  `getProjectBySlug(content, slug)` em `useContent()` para evitar TS errors temporários.
- **Risco:** Zod adiciona ~12KB ao bundle.
  **Mitigação:** abaixo do budget Lighthouse (vide `constitution §3.5`); permite tree-shake
  via `import { z } from "zod/mini"` se vier a apertar (não esperado em P0).
- **Risco:** validação Zod silencia erros em prod (decisão), o que pode mascarar drift.
  **Mitigação:** F-P0-15 (`projects-content-i18n-parity`) é gate de merge no CI — não chega
  em prod com drift.

## 6. Dependências

- F-P0-08 (`content-ai-emphasis`) **Aprovado** — define a forma como `ContentData` evolui
  com campos opcionais sem quebra. Mesma técnica aqui.
- T-FE-WAVE5 (`[-]`) — Onda 5 já está alterando `pt/en/de.json`; coordenação para evitar
  conflito de merge: F-P0-09 mexe **apenas** no bloco `projects` (T-FE-WAVE5 mexe em
  `heroTagline`, `experience[*].positions[*].skills`, `experience[*].positions[*].highlightProject`).
  Áreas disjuntas.
- F-P0-06 (`content-json`) **Aprovado** — base do carregamento via JSON, viabiliza esta
  evolução.

## 7. Out of scope

- Render da página índice `/projetos` (F-P0-10).
- Render do header com `navRoutes` (F-P0-11).
- Refator de `TauanGamesPage`/`ArchitecturePage`/`DadaiaWorkspacePage` para o novo modelo
  (F-P0-12).
- Convention dos diagramas SVG light/dark (F-P0-13).
- Link out para os jogos no GH Pages do `tauan-games` (F-P0-14).
- Script CI de paridade i18n (F-P0-15).

## 8. Justificativa de design

- **Por que `kind` como discriminator no nível do projeto e não no nível da seção.** O
  template completo da página muda conforme o tipo (`case-study` é narrativa; `meta` tem
  `costs` e `decisions`; `games` tem grid de links). Discriminar no projeto evita switches
  espalhados em cada bloco e permite que TS valide o shape exato em cada branch.
- **Por que array ordenado e não objeto por slug.** Ordem é dado, não derivação. Hoje a
  ordem do operador é `dadaia-workspace → portifolio → tauan-games`. Amanhã pode ser
  qualquer outra — sem mexer em código. Lookup por slug (`list.find((p) => p.slug ===
  ...)`) é O(N) com N ≤ 10 nos próximos anos — irrelevante.
- **Por que Zod em P0 mesmo sem CMS.** Custo é uma dependência leve; benefício é contrato
  testável que pega drift de i18n e drift do operador editando JSON direto. Em P1 vira o
  espelho do JSON Schema que o Lambda Go valida — economia de retrabalho.
- **Por que manter `slug=portifolio` (não renomear para `arquitetura`).** Decisão do
  operador. URL pública `/projetos/portifolio` continua válida — sem 301 redirect, sem
  quebra de SEO/links externos.
