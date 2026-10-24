# F-P0-08 — Content AI emphasis (Home/CV refresh)

**Status:** Aprovado

## 1. Contexto

Sweep visual identity (F-P0-07, ondas WAVE1/2/3) foi mergeado em `main` em 2026-05-15.
A paleta amber, dark mode toggle, microinteractions e Hero memorável estão no ar em
`marco-menezes.com`. Em revisão pós-WAVE3, o operador identificou **gaps críticos de
conteúdo** que comprometem o posicionamento técnico atual do site:

1. **AI tooling experience invisível.** O operador usa GitHub Copilot desde 2023,
   pilotou Devin no Santander, e conduz **solo** uma migração de pipelines SAS →
   Azure + Databricks usando Windsurf + Devin + ferramentas próprias. Stack adicional:
   Claude Code, Codex, Opencode, Openclaw, Hermes agent. **Nada disso aparece no site.**
2. **Roles sem skills tags.** Os cards de experiência mostram apenas
   `responsibilities` + `technologies` (string única). Não há cluster de badges
   colorizados por categoria — o sinal "Data/AI Engineer" não é visualmente legível
   em scan rápido.
3. **Senior bullets específicos demais.** Os bullets do cargo Senior no Santander
   listam responsabilidades operacionais ao invés de comunicar liderança técnica em
   AI-augmented engineering e o impacto do projeto SAS→Cloud.
4. **Projeto de impacto sem destaque.** A migração SAS → Azure + Databricks com
   redução de SLA de 12 meses para 2 meses (execução solo via AI tooling) é o
   diferenciador mais forte da carreira atual — mas não tem espaço visual próprio
   em nenhum cargo.

A home/CV (`Portfolio.tsx`) é o **cartão de visita** do operador (decisão explícita,
não negociada): permanece como currículo. Esta feature **não** mexe em projetos —
área dedicada de projetos é trabalho separado (Grupo B do plano de referência) e
requer interview de produto independente (`dadaia-grill-me`) com 7 perguntas em
aberto antes de virar SPEC.

**Decisões fixadas pelo operador (via AskUserQuestion na sessão de planejamento de
2026-05-15):**

- **Hero tagline:**
  - PT: `"AI-augmented data engineering em escala"`
  - EN: `"AI-augmented data engineering at scale"`
  - DE: `"KI-gestütztes Data Engineering im Maßstab"`
- **Highlight project visual:** bloco com `bg-accent-subtle` + `border-accent` no
  card do cargo Senior. Header com badge `⚡ Impacto` em accent. `rounded-xl p-5`.
  Reutiliza tokens já estabelecidos em F-P0-07.
- **Privacidade do projeto SAS:** `R$ 6M` **NÃO** deve aparecer no site (cláusula
  de confidencialidade). A métrica de impacto pública é exclusivamente
  **"redução do tempo de migração: 12 meses → 2 meses"** (SLA de execução do
  projeto).

## 2. Objetivo

Refletir, na home, o posicionamento **"Data/AI Engineer + AI-augmented engineering
at scale"** sem regredir os gates de qualidade já estabelecidos (Lighthouse
Performance ≥ 90, Accessibility ≥ 90, CLS = 0, LCP ≤ 2.5s) e sem quebrar a suíte
E2E existente — apenas adaptando seletores onde necessário.

Escopo é **apenas conteúdo + 2 componentes de renderização novos** ancorados em
tokens visuais que já existem em F-P0-07. **Sem mexer em:**

- Estrutura de projetos (`pages/projects/*`, `routes.ts`, `App.tsx`).
- Header / nav / sidebar / decoradores.
- `HeroSection.tsx` na sua estrutura (só o conteúdo da tagline em JSONs).

## 3. Ondas

Duas ondas sequenciais, cada uma é 1 PR. Owner: `software-engineer` (após esta SPEC
aprovada). `qa-engineer` pareia em PR review com Axe + Lighthouse local.

### Onda 5 — Conteúdo refresh + tipos AI-aware (T-FE-WAVE5)

#### 3.1 Tipos novos em `frontend/src/types/content.ts`

```ts
export interface HighlightProject {
  title: string;
  body: string;            // 1-2 parágrafos de contexto
  impact?: string[];       // métricas ("Redução SLA 12 meses → 2 meses", etc.)
  links?: { label: string; url: string }[];
}

export interface Position {
  title: string;
  period: string;
  responsibilities?: string[];
  technologies?: string;
  skills?: string[];                   // ≥10 tags por role, colorizadas
  highlightProject?: HighlightProject; // projeto de destaque do cargo (opcional)
}
```

Ambos os campos novos (`skills`, `highlightProject`) são **opcionais** para não
quebrar shapes existentes nem o Position interface. Roles sem `skills` ou sem
`highlightProject` continuam renderizando como antes.

#### 3.2 Conteúdo em `frontend/src/data/content/{pt,en,de}.json`

- **`heroTagline`** atualizado para os 3 idiomas conforme decisões fixadas.
- **`Position.skills`** populado com ≥10 tags por role, contextualizadas. Exemplos
  representativos (não exaustivos):
  - **Santander Senior**: `Data Architecture`, `Python`, `SQL`, `Linux`,
    `Databricks`, `Spark`, `Azure Data Factory`, `AWS`, `Claude Code`,
    `GitHub Copilot`, `Devin`, `Windsurf`, `Scala`, `Spec-Driven Development`,
    `TDD com AI` (15 tags).
  - **Santander Pleno**: `Python`, `SQL`, `Linux`, `Cloudera`, `Hadoop`, `Hive`,
    `Spark`, `BMC Control-M`, `Shell scripting`, `Jenkins`, `Git`, `Jira` (12 tags).
  - Cargos anteriores: mesma escala (10–12 tags), contextualizados ao cargo.
- **`highlightProject` no Santander Senior** (somente):
  ```json
  {
    "title": "Migração SAS → Azure + Databricks",
    "body": "Conduzindo solo a re-arquitetura de pipelines de dados críticos rodando em SAS para a stack moderna Azure Data Factory + Databricks com arquitetura medallion. Substitui processos batch caros e lentos por pipelines elásticos. Toolchain de execução: Windsurf + Devin para geração de código, GitHub Copilot para edição interativa, Claude Code para refactors e revisões maiores. Ferramentas auxiliares construídas in-house para acelerar análise de SAS legacy e geração de specs de migração.",
    "impact": [
      "Redução do tempo de migração: 12 meses → 2 meses (SLA de execução do projeto)",
      "Execução solo viabilizada por AI-augmented engineering",
      "Stack legacy SAS → Azure Data Factory + Databricks (arquitetura medallion)",
      "Piloto de Devin no banco — fundação para escalar a prática"
    ]
  }
  ```
  **Proibido** mencionar `R$ 6M` ou qualquer valor financeiro nesta seção (ou em
  qualquer outra do site). Métrica pública é exclusivamente "12 meses → 2 meses".
- **Bullets Santander Senior reescritos** — generalizar para liderança técnica e
  AI-augmented engineering, mantendo 1–2 bullets de stack tradicional
  (Databricks/Spark/Azure DF) para ancorar senioridade. Exemplos:
  - "Liderança técnica em migrações large-scale de pipelines com AI-augmented
    engineering"
  - "Piloto interno de coding agents (Devin) no Santander"
  - "Padronização de Spec-Driven Development + TDD aplicado a desenvolvimento com AI"
  - "Disseminação de práticas de AI tooling (Copilot, Claude Code, Codex) entre
    times técnicos"

Paridade i18n (pt/en/de) preservada: shape idêntico nos 3 JSONs; tradução natural
dos textos. Fallback `de → en` segue regra de `constitution.md`.

#### 3.3 `frontend/src/lib/skillCategoryColors.ts` — matchers de AI tooling

Expandir o array `KEYWORDS` com nova entrada na categoria `ai-tooling` (categoria
já existe em `STYLES`):

```ts
{
  category: "ai-tooling",
  matchers: [
    /claude/i, /devin/i, /windsurf/i, /copilot/i, /codex/i,
    /opencode/i, /openclaw/i, /hermes/i,
    /spec[\s-]?driven/i, /tdd com ai/i, /ai[\s-]augmented/i,
    /\bai\b/i, /machine learning/i, /\bllm\b/i, /agent/i,
    /ai-tooling/i, /tooling/i, /ferramenta/i, /werkzeug/i,
  ],
}
```

Outras categorias existentes (cloud, language, database) **não** são alteradas —
apenas a `ai-tooling` recebe matchers expandidos. Atualizar
`skillCategoryColors.test.ts` para incluir casos das novas keywords.

#### 3.4 Critério de pronto — Onda 5

- `cd frontend && npm run test:run` verde (incluindo `skillCategoryColors.test.ts`
  com novos casos).
- `home.spec.ts` adaptado para a nova tagline (assertion textual do `<h1>`).
- `language-switch.spec.ts` adaptado para as 3 taglines.
- Paridade estrutural i18n confirmada:
  `jq 'paths(scalars)' src/data/content/{en,pt,de}.json | sort -u | uniq -c` —
  paths novos (`heroTagline`, `experience.positions[].skills`,
  `experience.positions[].highlightProject.*`) presentes 3x cada.
- `npm run dev` local com troca PT ↔ EN ↔ DE: nova tagline aparece corretamente
  em cada idioma; fallback `de → en` não acontece para nenhum campo de role
  populado.

### Onda 6 — Renderização: RoleSkillBadges + HighlightProjectBlock (T-FE-WAVE6)

#### 3.5 Componente novo `frontend/src/components/portfolio/RoleSkillBadges.tsx`

- Props: `{ skills: string[] }`.
- Renderiza um cluster de `<Badge>` (já existente em `components/ui/badge.tsx`),
  cada um colorizado via `skillCategoryStyle(skill).badge` (função existente em
  `lib/skillCategoryColors.ts`).
- Layout: `flex flex-wrap gap-2`.
- Sem estado, sem efeitos — componente puro.
- Acessível: cada badge é texto, sem ARIA extra necessário (`<Badge>` já é
  semântica).

#### 3.6 Componente novo `frontend/src/components/portfolio/HighlightProjectBlock.tsx`

- Props: `{ highlight: HighlightProject }`.
- Visual (conforme decisão do operador): `bg-accent-subtle border border-accent
  rounded-xl p-5`.
- Header: badge `⚡ Impacto` em accent (`bg-accent text-accent-foreground`) +
  título `font-bold text-lg`.
- Body: `<p>` com `text-foreground` (não `text-accent` — preserva contraste
  WCAG AA conforme regra do F-P0-07).
- Métricas (`impact[]`): lista vertical compacta de cards mono — cada item em
  `<div class="font-mono text-sm">`.
- Links (`links[]`, opcional): botões variant `outline`, abrem em nova aba com
  `rel="noopener noreferrer"`.
- A11y: o badge `⚡ Impacto` deve incluir `aria-label="Impacto"` para leitores
  de tela (o emoji não basta sozinho).

#### 3.7 Integração nos cards existentes

- **`frontend/src/components/portfolio/ExperienceCard.tsx`** (single-role layout):
  após o bloco `technologies`, renderizar condicionalmente:
  ```tsx
  {position.skills && <RoleSkillBadges skills={position.skills} />}
  {position.highlightProject && <HighlightProjectBlock highlight={position.highlightProject} />}
  ```
- **`frontend/src/components/portfolio/RoleCollapsible.tsx`** (multi-role layout,
  dentro do `CollapsibleContent`): mesmo padrão, no mesmo ponto da hierarquia.
- Nenhuma das integrações altera assinatura de props, IDs DOM, ou ordem de tab.

#### 3.8 Testes

- `RoleSkillBadges.test.tsx` (NOVO) — smoke + assert de cor por categoria
  (`ai-tooling` aplica `bg-accent-subtle`; `cloud` aplica `bg-blue-100`).
- `HighlightProjectBlock.test.tsx` (NOVO) — smoke + render de `impact[]` como
  lista + render condicional de `links[]`.
- `ExperienceCard.test.tsx` e `RoleCollapsible.test.tsx`: atualizar snapshots se
  existirem; adicionar caso "renders skill badges when position.skills present" e
  "renders highlight block when position.highlightProject present".

#### 3.9 Critério de pronto — Onda 6

- `npm run test:run` verde, incluindo os 2 testes novos.
- Axe DevTools no painel Issues: zero violações em `/` (verificar contraste do
  `bg-accent-subtle` + foreground; foreground em body deve permanecer não-accent).
- Lighthouse accessibility ≥ 0.9 em `/` desktop + mobile.
- Inspeção visual: cada `Position` renderiza ≥10 badges colorizados; Santander
  Senior mostra o `HighlightProjectBlock` com a métrica "12 meses → 2 meses".
- E2E `home.spec.ts` continua verde com seletores adaptados (vide §4).

## 4. Riscos atravessados

- **E2E `home.spec.ts`** assume tagline antiga (`"Construo pipelines de dados em
  escala"` em PT — definida em F-P0-07 / T-FE-WAVE3). Onda 5 muda a tagline em
  PT/EN/DE; este teste **será atualizado na mesma PR da Onda 5** para evitar
  janela vermelha em CI.
- **`language-switch.spec.ts`** valida troca de tagline entre os 3 idiomas;
  mesma observação — atualização vem com Onda 5.
- **Tab order do Hero** permanece preservado (Onda 5 só toca conteúdo do
  `heroTagline`, não a estrutura do `HeroSection`).
- **CLS**: nenhum dos componentes novos (`RoleSkillBadges`,
  `HighlightProjectBlock`) carrega imagens — sem risco de layout shift adicional.
- **Bundle size**: 2 componentes pequenos (≤80 linhas cada); incremento
  desprezível.
- **Privacidade**: revisar diff antes do merge para garantir que `R$ 6M` (ou
  qualquer valor financeiro) não aparece em **nenhum** dos 3 JSONs.

## 5. Dependências

- F-P0-07 (visual-identity) **Aprovado** e mergeado — esta feature depende dos
  tokens `--accent`, `--accent-subtle`, `border-accent`, `bg-accent-subtle` já
  estabelecidos. ✅
- T-FE-WAVE3 (Hero memorável) `[x]` — esta feature reescreve o `heroTagline`
  introduzido lá; depende da estrutura existir. ✅
- T-CONTENT-06 (refresh do conteúdo) `[x]` — esta feature edita os mesmos JSONs.
  Não há conflito porque T-CONTENT-06 trouxe os dados de LinkedIn corretos e
  esta feature adiciona campos novos (`skills`, `highlightProject`) por cima da
  base já confiável. ✅
- T-FE-WAVE5 (Onda 5 desta feature) → T-FE-WAVE6 (Onda 6) sequencial: Onda 6
  consome tipos e dados criados em Onda 5.

## 6. Out of scope desta feature (faz parte de outra)

Cobertos no plano de referência mas **fora** desta SPEC (serão tratados em
features separadas após `dadaia-grill-me` com o operador):

- Migração de `ProjectsContent` para modelo unificado por `kind`.
- Rota `/projetos` e `ProjectsIndexPage`.
- Renderização de `navRoutes` no Header (gap CRITICAL identificado pelo
  software-architect).
- Refator de `TauanGamesPage` + `ArchitecturePage` para template `ProjectTabPage`.
- Diagramas de arquitetura per-project em `public/assets/projects/<slug>/`.
- `tauan-games` playable em iframe sandboxed.
- Script CI de paridade i18n para `projects.list`.

Esses 7 trabalhos formam o **Grupo B** do plano `algum-feedback-sobre-o-merry-kay.md`
e serão formalizados em sessão separada.

## 7. Justificativa de design

- **Por que `skills?: string[]` no Position e não em outra estrutura.** Manter
  o campo no nível do cargo (e não na `experience` global) permite mostrar a
  evolução da stack do operador ao longo do tempo, reforçando narrativa de
  carreira (cargos anteriores sem AI tooling, cargo atual com AI tooling
  consolidado).
- **Por que `HighlightProject` é opcional por cargo.** Apenas o cargo Senior tem
  highlight hoje. No futuro, outros cargos podem ganhar destaque sem mudar
  schema. Não-obrigatoriedade evita poluir cargos antigos com `null`/vazio.
- **Por que reusar `skillCategoryColors` em vez de criar nova lib.** A lib já
  existe (F-P0-07 Onda 2), é estável, tem testes, e a única evolução necessária
  é o array de matchers `ai-tooling`. Criar nova abstração violaria DRY.
- **Por que `bg-accent-subtle` para o highlight block e não `bg-accent`
  direto.** Decisão do F-P0-07 (Onda 1): accent puro fica restrito a CTAs,
  borders e badges — nunca em superfícies grandes — para preservar contraste
  WCAG AA do texto sobre o fundo. `bg-accent-subtle` é o token criado
  exatamente para esse caso (fundo com tonalidade quente mas que mantém
  legibilidade).
- **Por que não mencionar R$ 6M.** Cláusula de confidencialidade contratual
  com o Santander. A métrica de tempo (12 meses → 2 meses) é equivalente em
  impacto narrativo e pública sem risco legal.
