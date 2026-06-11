# Release PLAN — projects-cluster-v2

**Status:** Aprovado

> Release ID: `projects-cluster-v2`
> Owner: product-engineer
> Created: 2026-05-28
> Depends on: SPEC.md **Aprovado** ✅

---

## 1. Visão geral

Esta release é **100% content-only** — nenhum arquivo de código de infraestrutura
(componentes, hooks, rotas, schema Zod, CI workflows) é modificado. Todo o trabalho
se divide em:

| Tipo | Agente responsável | Arquivos afetados |
|---|---|---|
| Asset production | Operador | `frontend/public/assets/projects/` |
| JSON content | `frontend-engineer` | `frontend/src/data/content/{pt,en,de}.json` |
| E2E smoke | `qa-engineer` | `frontend/tests/e2e/projects-cluster/rand-engine.spec.ts` |
| Validação CI | `qa-engineer` | CI local + scripts |

---

## 2. Fases e dependências

```
[A] Asset production (operador)
      │
      ├──▶ [C1] Update dadaia-workspace JSON (frontend-engineer)
      │
      └──▶ [C2] Add rand-engine JSON (frontend-engineer)
                  │
                  └──▶ [E1] E2E smoke rand-engine (qa-engineer)
                              │
                              └──▶ [V1] Validação CI completa (qa-engineer)
```

> C1 e C2 podem começar em paralelo com A usando caminhos de asset provisórios —
> o merge só ocorre após A estar completo.

---

## 3. Tarefas

### Fase A — Assets (Operador)

#### T-PC2-A-01 — Cover rand-engine
- **Responsável:** Operador
- **Output:** `frontend/public/assets/projects/rand-engine/cover.webp` (≤ 60KB)
- **Critério de aceite:** arquivo existe no path correto, ≤ 60KB, proporção 16:9 ou 4:3
- **Blocker para:** T-PC2-C-02 (finalizar path no JSON)

#### T-PC2-A-02 — Screenshots workspace panel (dadaia-workspace)
- **Responsável:** Operador
- **Output:**
  - `frontend/public/assets/projects/dadaia-workspace/workspace-panel-01.webp` (≤ 60KB)
  - `frontend/public/assets/projects/dadaia-workspace/workspace-panel-02.webp` (≤ 60KB, opcional)
- **Conteúdo sugerido:** `dadaia context list` no terminal + painel Claude Code com agentes
- **Decisão:** O campo `diagram` existente do dadaia-workspace apontará para `workspace-panel-01.webp`
  substituindo o diagrama de arquitetura anterior (DEC-PC2-01 — fechada)
- **Critério de aceite:** ≤ 60KB, legível em tela desktop (min 1280px)
- **Blocker para:** T-PC2-C-01 (path do screenshot no JSON)

---

### Fase C — JSON Content (frontend-engineer)

#### T-PC2-C-01 — Atualizar dadaia-workspace em pt/en/de
- **Responsável:** `frontend-engineer`
- **Pode iniciar:** imediatamente (campos de texto independem dos assets)
- **Assets:** aguardar T-PC2-A-02 antes do merge para definir path do `diagram`
- **Arquivos:** `frontend/src/data/content/pt.json`, `en.json`, `de.json`
- **Mudanças no bloco `dadaia-workspace`:**

| Campo | Localização | Valor antigo | Valor novo |
|---|---|---|---|
| `status[Versão]` | PT: `Versão` / EN: `Version` / DE: `Version` | `v0.12.0` | `v0.1.2` |
| `status[Agentes]` | PT: `Agentes ativos` / EN: `Active agents` / DE: `Aktive Agenten` | `5 (product, software, qa, devops, game-developer)` | `21` |
| `status[Contextos]` | PT: `Contextos suportados` / EN: `Supported contexts` / DE: `Unterstützte Kontexte` | `portifolio, hermes-jobs, tauan-games` | `portifolio, dadaia-workspace, dd-chain-explorer, burrinhos-barbe, dd-chain-capture, dadaia-agents, dadaia-bots, bothub-provisioner` |
| `status[Marco]` | PT: `Último marco` / EN: `Last milestone` / DE: `Letzter Meilenstein` | `Migração de conteúdo para JSON estático` | `Paridade Codex + orquestração multi-runtime com 21 agentes especializados` |
| `diagram` | todos | `/assets/projects/dadaia-workspace/architecture-light.svg` | `/assets/projects/dadaia-workspace/workspace-panel-01.webp` |
| `diagramAlt` | PT | `Diagrama de arquitetura do dadaia-workspace...` | `Painel do workspace dadaia mostrando os contextos de projeto ativos e agentes carregados.` |
| `diagramAlt` | EN | `Architecture diagram of dadaia-workspace...` | `dadaia workspace panel showing active project contexts and loaded agents.` |
| `diagramAlt` | DE | _(correspondente)_ | `dadaia-Workspace-Panel mit aktiven Projektkontexten und geladenen Agenten.` |

- **Critério de aceite:** `check-i18n-parity.mjs` exit 0; paridade PT/EN/DE em todos os campos

---

#### T-PC2-C-02 — Adicionar rand-engine em pt/en/de
- **Responsável:** `frontend-engineer`
- **Pode iniciar:** imediatamente (usar path provisório para cover se T-PC2-A-01 ainda pendente)
- **Assets:** finalizar `card.cover` após T-PC2-A-01 concluído
- **Arquivos:** `frontend/src/data/content/pt.json`, `en.json`, `de.json`
- **Inserir no array `projectsV2.list[]`** após `tauan-games`:

**Bloco PT:**
```json
{
  "slug": "rand-engine",
  "kind": "case-study",
  "hero": {
    "title": "rand-engine",
    "tagline": "Biblioteca Python para geração de dados sintéticos em escala — construída na era pré-IA para estudar fluxos de engenharia de dados."
  },
  "card": {
    "cover": "/assets/projects/rand-engine/cover.webp",
    "summary": "Gera dados sintéticos realistas em segundos — 132K rows/s local, 5.1M rows/s no Spark. O que importa é testar o fluxo, não o dado em si.",
    "tech": ["Python", "Pandas", "PySpark", "DuckDB", "NumPy", "Faker"]
  },
  "seo": {
    "title": "rand-engine — Marco Menezes",
    "description": "Biblioteca Python open-source para geração de dados sintéticos em escala. Streaming, batch, dados correlacionados, Pandas e Spark."
  },
  "diagram": "/assets/projects/rand-engine/architecture-light.svg",
  "diagramDark": "/assets/projects/rand-engine/architecture-dark.svg",
  "diagramAlt": "Diagrama de arquitetura do rand-engine: spec de entrada → DataGenerator (NPCore, PyCore, SparkCore) → DataFrame Pandas ou Spark → exportação em CSV, Parquet e JSON.",
  "sections": [
    {
      "id": "what",
      "title": "O que é",
      "body": "rand-engine é uma biblioteca Python open-source para geração de dados sintéticos em escala. Suporta Pandas (local) e Spark (distribuído), com 20+ especificações prontas — clientes, pedidos, sensores, produtos e mais. Publicada no PyPI com 494 testes automatizados e MIT License. Tem suporte nativo a dados correlacionados (moeda↔país, departamento→nível→cargo) e geração de padrões (IPs, SKUs, URLs)."
    },
    {
      "id": "why",
      "title": "Por que existe",
      "body": "Criei o rand-engine para estudar fluxos de engenharia de dados sem depender de dados reais ou sensíveis. Ferramentas genéricas como Faker não têm suporte nativo a DataFrames nem constraints de chave — e claramente não foram desenhadas para alimentar streaming ou batch de produção. O princípio é simples: quando você está aprendendo ou testando pipelines, o que importa é o fluxo de dados, não o dado em si."
    },
    {
      "id": "how",
      "title": "Como funciona",
      "body": "pip install rand-engine. Escolha uma spec pronta (CommonRandSpecs, AdvancedRandSpecs) ou defina a sua, chame .size(n).get_df() e receba um DataFrame Pandas ou Spark. O parâmetro seed garante reprodutibilidade. Para streaming, .stream() emite lotes contínuos. Dados correlacionados são definidos por mapeamento declarativo — a lib garante que USD sempre saia com US, EUR com DE, e assim por diante. Exportação nativa para CSV, Parquet e JSON com compressão."
    },
    {
      "id": "status",
      "title": "Status atual",
      "items": [
        { "label": "Versão", "value": "v0.6.3" },
        { "label": "Testes", "value": "494 passando" },
        { "label": "Performance local", "value": "~132K rows/s" },
        { "label": "Performance Spark", "value": "5.1M rows/s (Databricks)" },
        { "label": "Licença", "value": "MIT" }
      ]
    }
  ],
  "cta": {
    "github": "https://github.com/marcoaureliomenezes/rand_engine",
    "githubLabel": "Ver no GitHub",
    "external": "https://pypi.org/project/rand-engine/",
    "externalLabel": "Ver no PyPI"
  }
}
```

**Bloco EN:**
```json
{
  "slug": "rand-engine",
  "kind": "case-study",
  "hero": {
    "title": "rand-engine",
    "tagline": "Python library for synthetic data generation at scale — built pre-AI to study data engineering flows."
  },
  "card": {
    "cover": "/assets/projects/rand-engine/cover.webp",
    "summary": "Generates realistic synthetic data in seconds — 132K rows/s locally, 5.1M rows/s on Spark. What matters is testing the flow, not the data itself.",
    "tech": ["Python", "Pandas", "PySpark", "DuckDB", "NumPy", "Faker"]
  },
  "seo": {
    "title": "rand-engine — Marco Menezes",
    "description": "Open-source Python library for synthetic data generation at scale. Streaming, batch, correlated data, Pandas and Spark."
  },
  "diagram": "/assets/projects/rand-engine/architecture-light.svg",
  "diagramDark": "/assets/projects/rand-engine/architecture-dark.svg",
  "diagramAlt": "rand-engine architecture diagram: input spec → DataGenerator (NPCore, PyCore, SparkCore) → Pandas or Spark DataFrame → CSV, Parquet and JSON export.",
  "sections": [
    {
      "id": "what",
      "title": "What is it",
      "body": "rand-engine is an open-source Python library for synthetic data generation at scale. It supports Pandas (local) and Spark (distributed), with 20+ ready-made specs — customers, orders, sensors, products and more. Published on PyPI with 494 automated tests and MIT License. Native support for correlated data (currency↔country, department→level→role) and pattern generation (IPs, SKUs, URLs)."
    },
    {
      "id": "why",
      "title": "Why it exists",
      "body": "I built rand-engine to study data engineering flows without relying on real or sensitive data. Generic tools like Faker have no native DataFrame support or key constraints — and were clearly not designed to feed production-grade streaming or batch pipelines. The principle is simple: when you are learning or testing pipelines, what matters is the data flow, not the data itself."
    },
    {
      "id": "how",
      "title": "How it works",
      "body": "pip install rand-engine. Pick a ready-made spec (CommonRandSpecs, AdvancedRandSpecs) or define your own, call .size(n).get_df() and receive a Pandas or Spark DataFrame. The seed parameter ensures reproducibility. For streaming, .stream() emits continuous batches. Correlated data is declared as mappings — the library ensures USD always pairs with US, EUR with DE, and so on. Native export to CSV, Parquet and JSON with compression."
    },
    {
      "id": "status",
      "title": "Current status",
      "items": [
        { "label": "Version", "value": "v0.6.3" },
        { "label": "Tests", "value": "494 passing" },
        { "label": "Local performance", "value": "~132K rows/s" },
        { "label": "Spark performance", "value": "5.1M rows/s (Databricks)" },
        { "label": "License", "value": "MIT" }
      ]
    }
  ],
  "cta": {
    "github": "https://github.com/marcoaureliomenezes/rand_engine",
    "githubLabel": "View on GitHub",
    "external": "https://pypi.org/project/rand-engine/",
    "externalLabel": "View on PyPI"
  }
}
```

**Bloco DE:**
```json
{
  "slug": "rand-engine",
  "kind": "case-study",
  "hero": {
    "title": "rand-engine",
    "tagline": "Python-Bibliothek zur synthetischen Datengenerierung im großen Maßstab — vor der KI-Ära entwickelt, um Data-Engineering-Flows zu studieren."
  },
  "card": {
    "cover": "/assets/projects/rand-engine/cover.webp",
    "summary": "Erzeugt realistische synthetische Daten in Sekunden — 132K rows/s lokal, 5,1M rows/s auf Spark. Entscheidend ist der Datenfluss, nicht die Daten selbst.",
    "tech": ["Python", "Pandas", "PySpark", "DuckDB", "NumPy", "Faker"]
  },
  "seo": {
    "title": "rand-engine — Marco Menezes",
    "description": "Open-Source-Python-Bibliothek zur synthetischen Datengenerierung im großen Maßstab. Streaming, Batch, korrelierte Daten, Pandas und Spark."
  },
  "diagram": "/assets/projects/rand-engine/architecture-light.svg",
  "diagramDark": "/assets/projects/rand-engine/architecture-dark.svg",
  "diagramAlt": "Architekturdiagramm von rand-engine: Eingabe-Spec → DataGenerator (NPCore, PyCore, SparkCore) → Pandas- oder Spark-DataFrame → Export als CSV, Parquet und JSON.",
  "sections": [
    {
      "id": "what",
      "title": "Was ist es",
      "body": "rand-engine ist eine Open-Source-Python-Bibliothek zur synthetischen Datengenerierung im großen Maßstab. Sie unterstützt Pandas (lokal) und Spark (verteilt) mit über 20 vorgefertigten Spezifikationen — Kunden, Bestellungen, Sensoren, Produkte und mehr. Auf PyPI veröffentlicht mit 494 automatisierten Tests und MIT-Lizenz. Native Unterstützung für korrelierte Daten (Währung↔Land, Abteilung→Ebene→Rolle) und musterbasierende Generierung (IPs, SKUs, URLs)."
    },
    {
      "id": "why",
      "title": "Warum es existiert",
      "body": "Ich habe rand-engine entwickelt, um Data-Engineering-Flows zu studieren, ohne auf echte oder sensible Daten angewiesen zu sein. Generische Tools wie Faker bieten keine native DataFrame-Unterstützung oder Key-Constraints — und wurden eindeutig nicht für Produktions-Streaming oder Batch-Pipelines konzipiert. Das Prinzip ist einfach: Beim Lernen oder Testen von Pipelines zählt der Datenfluss, nicht die Daten selbst."
    },
    {
      "id": "how",
      "title": "Wie es funktioniert",
      "body": "pip install rand-engine. Wählen Sie eine fertige Spec (CommonRandSpecs, AdvancedRandSpecs) oder definieren Sie Ihre eigene, rufen Sie .size(n).get_df() auf und erhalten Sie einen Pandas- oder Spark-DataFrame. Der seed-Parameter gewährleistet Reproduzierbarkeit. Für Streaming liefert .stream() kontinuierliche Batches. Korrelierte Daten werden als Mappings deklariert — die Bibliothek stellt sicher, dass USD immer mit US gepaart wird, EUR mit DE usw. Nativer Export nach CSV, Parquet und JSON mit Komprimierung."
    },
    {
      "id": "status",
      "title": "Aktueller Status",
      "items": [
        { "label": "Version", "value": "v0.6.3" },
        { "label": "Tests", "value": "494 bestanden" },
        { "label": "Lokale Performance", "value": "~132K rows/s" },
        { "label": "Spark-Performance", "value": "5,1M rows/s (Databricks)" },
        { "label": "Lizenz", "value": "MIT" }
      ]
    }
  ],
  "cta": {
    "github": "https://github.com/marcoaureliomenezes/rand_engine",
    "githubLabel": "Auf GitHub ansehen",
    "external": "https://pypi.org/project/rand-engine/",
    "externalLabel": "Auf PyPI ansehen"
  }
}
```

- **Critério de aceite:** `validate-content.mjs` exit 0; paridade PT/EN/DE confirmada; card visível em `/projetos`

---

### Fase E — E2E Smoke (qa-engineer)

#### T-PC2-E-01 — Smoke spec rand-engine
- **Responsável:** `qa-engineer`
- **Depende de:** T-PC2-C-02 completo (rand-engine no JSON)
- **Arquivo:** `frontend/tests/e2e/projects-cluster/rand-engine.spec.ts`
- **Referência:** seguir padrão de `project-detail-case-study.spec.ts` existente
- **Cobertura mínima:**
  1. `/projetos` renderiza card com slug `rand-engine`
  2. Navegação `/projetos/rand-engine` não retorna 404
  3. Template `case-study` renderiza (hero title, seções, CTA GitHub + PyPI)
  4. Troca de idioma PT → EN mantém `/projetos/rand-engine` sem 404
- **Critério de aceite:** spec passa em modo headed e headless; sem flakiness

---

### Fase V — Validação CI (qa-engineer)

#### T-PC2-V-01 — Validação completa
- **Responsável:** `qa-engineer`
- **Depende de:** T-PC2-C-01, T-PC2-C-02, T-PC2-E-01 completos; assets em disco (T-PC2-A-01, T-PC2-A-02)
- **Checklist:**
  - [ ] `node scripts/validate-content.mjs` exit 0
  - [ ] `node scripts/check-i18n-parity.mjs` exit 0
  - [ ] SVG size gate: nenhum SVG > 50KB em `public/assets/projects/rand-engine/`
  - [ ] WebP size gate: todos os novos `.webp` ≤ 60KB
  - [ ] `npx playwright test tests/e2e/projects-cluster/rand-engine.spec.ts` pass
  - [ ] Regressão zero: `npx playwright test tests/e2e/projects-cluster/` pass completo
  - [ ] Lighthouse mobile `/projetos`: Performance ≥ 85

---

## 4. Sequência de implementação recomendada

```
Dia 1
  Operador → T-PC2-A-01 (cover rand-engine)
  Operador → T-PC2-A-02 (screenshots workspace panel)
  frontend-engineer → T-PC2-C-01 (dadaia-workspace JSON — campos de texto)
  frontend-engineer → T-PC2-C-02 (rand-engine JSON — todos os campos de texto)

Dia 1–2 (após assets prontos)
  frontend-engineer → finaliza paths de assets em T-PC2-C-01 + T-PC2-C-02
  qa-engineer → T-PC2-E-01

Dia 2
  qa-engineer → T-PC2-V-01
  → merge em develop → PR para main
```

---

## 5. Agentes envolvidos

| Agente | Tarefas | Write allowlist |
|---|---|---|
| `frontend-engineer` | T-PC2-C-01, T-PC2-C-02 | `frontend/src/data/content/*.json` |
| `qa-engineer` | T-PC2-E-01, T-PC2-V-01 | `frontend/tests/e2e/projects-cluster/rand-engine.spec.ts` |
| Operador | T-PC2-A-01, T-PC2-A-02 | `frontend/public/assets/projects/` |

---

## 5-R2. Plano do rc-2 fold (2026-06-11)

Ondas sequenciais, cada uma commitável: **W1** hotfix vendor SDK (desbloqueia tudo) →
**W2** higiene → **W3** kind `library` (schema → template → diagramas theme-aware) →
**W4** conteúdo + cards → **W5** testes/gates + deflake. Detalhe operacional, write
sets e ACs: TASKS.md fases R2-W1..W5 (mantido lá para respeitar o cap de 300 linhas
deste PLAN — SPEC-DOC-005; este arquivo já o excede e não deve crescer). ADRs: SPEC §9.

## 6. Riscos e mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| `cta.external` não está no schema Zod atual | Média | `frontend-engineer` verifica schema antes de T-PC2-C-02; se ausente, adiciona ao schema (extensão mínima) |
| Assets fora do prazo (operador) | Média | JSON pode ser mergeado com cover placeholder; assets em PR separado |
| Lighthouse regressão por 4º card | Baixa | Imagens lazy-loaded por padrão (constitution §3.4); se regredir, reduzir cover WebP |
