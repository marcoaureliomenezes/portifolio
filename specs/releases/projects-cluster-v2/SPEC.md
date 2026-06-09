# Release SPEC — projects-cluster-v2

**Status:** Aprovado

> Release ID: `projects-cluster-v2`
> Owner: product-engineer
> Created: 2026-05-23
> Revised: 2026-05-28 — escopo redirecionado pelo operador (rand-engine + dadaia-workspace update)
> Depends on: `projects-cluster-v1` (archived — dynamic routing + content model in prod)

---

## 1. Contexto

`projects-cluster-v1` entregou a infraestrutura de showcase: rota dinâmica
`/projetos/:slug`, 3 templates por `kind` (`case-study`, `meta`, `games`),
index page, header CTA, hero CTA, Zod schema e CI gates. Os 3 projetos iniciais
(`dadaia-workspace`, `portifolio`, `tauan-games`) foram entregues como conteúdo fixo.

Esta release faz duas coisas:

1. **Adiciona `rand-engine`** — biblioteca Python open-source publicada no PyPI para
   geração de dados sintéticos em escala (Pandas + Spark). Projeto pessoal técnico de
   alto valor de sinal para recrutadores da área de dados.
2. **Atualiza `dadaia-workspace`** — versão, contagem de agentes, contextos ativos e
   screenshots do workspace panel estão desatualizados desde v1 (entrada criada com
   dados de placeholder).

Os projetos `dadaia-bots`, `dd-chain-explorer` e `burrinhos-barbe` foram movidos para
o backlog e entrarão em uma release subsequente (`projects-cluster-v3`).

---

## 2. Personas

Mesmas de v1 (`specs/memory/product/personas.html`):

- **Recrutador técnico** — escaneia `/projetos` em < 30s; quer identificar sinal técnico
  sem clicar. Para `rand-engine`: tagline + stats de performance são o sinal chave.
- **Peer técnico** — clica no detalhe; quer ver o PyPI, o GitHub, a arquitetura da lib.
- **Operador (Marco)** — edita JSON + adiciona assets sem tocar em código.

---

## 3. Escopo

### 3.1 O que esta release entrega

#### rand-engine (novo projeto)

1. Bloco JSON `rand-engine` adicionado a `projectsV2.list[]` em `pt.json`, `en.json`, `de.json`.
2. Cover `.webp` (≤ 60KB) em `public/assets/projects/rand-engine/cover.webp`.
3. Diagrama SVG light/dark em `public/assets/projects/rand-engine/architecture-{light,dark}.svg`
   (≤ 50KB cada) — opcional; se não houver diagrama, campo `diagram` omitido do JSON.
4. E2E smoke spec em `tests/e2e/projects-cluster/rand-engine.spec.ts`.

#### dadaia-workspace (atualização de conteúdo existente)

5. Atualizar o bloco JSON existente em `pt.json`, `en.json`, `de.json`:
   - Versão: `v0.1.2` (era `v0.12.0`)
   - Agentes ativos: `21` (era `5`)
   - Contextos suportados: lista dos 8 ativos (vide §5)
   - Último marco: revisão da seção `status`
6. Screenshot(s) do workspace panel adicionados como asset:
   `public/assets/projects/dadaia-workspace/workspace-panel-{01,02}.webp` (≤ 60KB cada).
   Referenciados na seção `how` do JSON como imagens ilustrativas.

### 3.2 O que NÃO está em escopo

- Nenhuma mudança de código de infraestrutura (rotas, templates, components, hooks).
- Nenhum novo `kind` — `rand-engine` é `case-study`.
- `dadaia-bots`, `dd-chain-explorer`, `burrinhos-barbe` — ficam no backlog (v3).
- CMS ou pipeline de geração automática de conteúdo.
- Internacionalização além de PT/EN/DE.

---

## 4. Acceptance Criteria

| ID | Critério |
|---|---|
| AC-PC2-01 | `/projetos` renderiza 4 cards na ordem: dadaia-workspace, portifolio, tauan-games, rand-engine |
| AC-PC2-02 | `/projetos/rand-engine` carrega sem 404 e renderiza o template `case-study` |
| AC-PC2-03 | `/projetos/dadaia-workspace` mostra versão `v0.1.2` e `21 agentes` no bloco de status |
| AC-PC2-04 | Paridade total PT/EN/DE para todos os campos i18n-bearing de `rand-engine` (`check-i18n-parity.mjs` exit 0) |
| AC-PC2-05 | `validate-content.mjs` exit 0 com `rand-engine` no schema Zod |
| AC-PC2-06 | Cover de `rand-engine` ≤ 60KB; SVGs (se presentes) ≤ 50KB (SVG size gate CI verde) |
| AC-PC2-07 | Screenshots do workspace panel ≤ 60KB cada; referenciados corretamente no JSON |
| AC-PC2-08 | Lighthouse mobile performance ≥ 85 em `/projetos` após adição do 4º card |
| AC-PC2-09 | Zero regressão nas rotas existentes (`/`, `/projetos`, `/projetos/portifolio`, `/projetos/tauan-games`) |

---

## 5. Conteúdo (pré-aprovado pelo operador via sessão 2026-05-28)

### rand-engine

- **Slug:** `rand-engine`
- **Kind:** `case-study`
- **Tagline:** "Biblioteca Python de alta performance para geração de dados sintéticos em escala — Pandas, Spark e DuckDB."
- **Card summary (≤200 chars):** "Gera dados sintéticos realistas em segundos. Suporte nativo a Pandas e Spark, 17+ especificações prontas, sistema de constraints FK/PK e seed reproduzível."
- **Stack:** `Python`, `Pandas`, `PySpark`, `DuckDB`, `NumPy`, `Faker`
- **Links:** PyPI `https://pypi.org/project/rand-engine/` + GitHub `https://github.com/marcoaureliomenezes/rand_engine`
- **Cover:** a produzir pelo operador (referência: `public/assets/projects/rand-engine/cover.webp`)
- **Diagrama:** opcional — se não houver, omitir campos `diagram`/`diagramAlt` do JSON

**Seções de detalhe:**

| Seção | Conteúdo PT |
|---|---|
| **what** | `rand-engine` é uma biblioteca Python open-source para geração de dados sintéticos em escala. Suporta Pandas (local) e Spark (distribuído), com 17+ especificações prontas — clientes, pedidos, produtos, funcionários e mais. Publicada no PyPI com 494 testes automatizados e MIT License. |
| **why** | Testar pipelines ETL/ELT exige dados realistas sem expor informações sensíveis. Ferramentas genéricas como Faker não têm suporte nativo a DataFrames nem constraints de chave. `rand-engine` resolve o problema com uma API declarativa que gera volumes de produção em segundos. |
| **how** | `pip install rand-engine`. Defina uma especificação (schema + constraints), chame `.generate(n_rows)` e receba um DataFrame Pandas ou Spark. O parâmetro `seed` garante reprodutibilidade. Exportação nativa para CSV, Parquet e JSON com compressão. Performance: ~12K rows/s local; 5.1M rows/s no Databricks Spark. |
| **status** | Versão `v0.6.3` · 494 testes · MIT · PyPI + GitHub |

**Stats do bloco status (itens):**

| Label | Value |
|---|---|
| Versão | v0.6.3 |
| Testes | 494 passando |
| Performance local | ~12K rows/s |
| Performance Spark | 5.1M rows/s (Databricks) |
| Licença | MIT |

---

### dadaia-workspace (atualização)

**Campos a atualizar no bloco status:**

| Label | Valor atual (errado) | Valor correto |
|---|---|---|
| Versão | v0.12.0 | v0.1.2 |
| Agentes ativos | 5 (product, software, qa, devops, game-developer) | 21 |
| Contextos suportados | portifolio, hermes-jobs, tauan-games | portifolio, dadaia-workspace, dd-chain-explorer, burrinhos-barbe, dd-chain-capture, dadaia-agents, dadaia-bots, bothub-provisioner |
| Último marco | Migração de conteúdo para JSON estático | Paridade Codex + orquestração de agentes multi-runtime |

**Screenshots do workspace panel:**
- Quantidade: 2 (mínimo), 3 (ideal)
- Conteúdo sugerido: `dadaia context list` mostrando os contextos ativos + panel do Claude Code com agentes carregados
- Formato: captura de terminal ou UI do Claude Code, exportado em WebP ≤ 60KB
- A produzir pelo operador e colocar em `public/assets/projects/dadaia-workspace/`
- Referenciados na seção `how` como campo `screenshots: [{ src, alt }]` (extensão do schema — vide DEC-PC2-01)

---

## 6. Decisões abertas

| ID | Decisão | Status |
|---|---|---|
| DEC-PC2-01 | O campo `screenshots` em seções de projeto precisa de extensão no schema Zod ou será tratado como campo livre dentro do body de `how`? | **Fechada** — screenshots entram como assets estáticos em `public/assets/projects/dadaia-workspace/`; o campo `diagram` existente aponta para o principal; nenhuma extensão de schema nesta release |
| DEC-PC2-02 | `rand-engine` tem diagrama de arquitetura ou só cover + seções de texto? | **Aberta** — operador decide |
| DEC-PC2-03 | Ordem dos 4 cards: manter dadaia-workspace primeiro ou rand-engine fecha a lista? | **Fechada** — manter existentes primeiro + rand-engine no fim (AC-PC2-01) |

---

## 7. Dependências

- `projects-cluster-v1` em produção ✅
- Covers/screenshots produzidos pelo operador antes de T-PC2-ASSETS
- DEC-PC2-01 resolvida antes de T-PC2-SCHEMA (extensão do Zod, se necessário)

---

## 8. Non-goals

- Refatoração do content model.
- Novos templates ou kinds.
- `dadaia-bots`, `dd-chain-explorer`, `burrinhos-barbe` — próxima release.
- Qualquer mudança na surface `mobile-redesign-v1`.
