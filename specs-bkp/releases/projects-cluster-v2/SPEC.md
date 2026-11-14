# Release SPEC — projects-cluster-v2

**Status:** Rascunho

> Release ID: `projects-cluster-v2`
> Owner: product-engineer
> Created: 2026-05-23
> Depends on: `projects-cluster-v1` (archived — dynamic routing + content model in prod)

---

## 1. Contexto

`projects-cluster-v1` entregou a infraestrutura de showcase: rota dinâmica
`/projetos/:slug`, 3 templates por `kind` (`case-study`, `meta`, `games`),
index page, header CTA, hero CTA, Zod schema e CI gates. Os 3 projetos iniciais
(`dadaia-workspace`, `portifolio`, `tauan-games`) foram entregues como conteúdo fixo.

Esta release adiciona os **3 próximos projetos** ao showcase, reutilizando 100% da
infraestrutura entregue por v1. Nenhuma mudança de arquitetura é necessária — o
ceiling de hand-authored JSON (estimado em ~6 projetos por revisão arquitetural
2026-05-17) ainda não é atingido com esta adição.

**Projetos a adicionar:**

| Slug | Kind | Descrição curta |
|---|---|---|
| `dadaia-bots` | `case-study` | Bots de automação e monitoramento construídos sobre o ecossistema dadaia |
| `dd-chain-explorer` | `case-study` | Explorer de blockchain on-chain construído sobre stack de dados (Databricks, Delta Lake, AWS) |
| `burrinhos-barbe` | `meta` | Projeto pessoal — plataforma digital para gestão e divulgação de barbearia |

> **Nota:** os kinds acima são uma proposta inicial. O operador deve confirmar ou
> ajustar antes do status mudar para `Aprovado`.

---

## 2. Personas

Mesmas de v1 (`specs/memory/product/personas.html`):

- **Recrutador técnico** — escaneia `/projetos` em < 30s; quer identificar sinal técnico
  sem clicar; os 3 novos cards devem ter tagline e stack claros.
- **Peer técnico** — clica no detalhe; lê arquitetura, decisões, custos; quer repo link.
- **Operador (Marco)** — adiciona os projetos editando apenas JSON (sem refator de código).

---

## 3. Escopo

### 3.1 O que esta release entrega

1. **Conteúdo JSON** — blocos `dadaia-bots`, `dd-chain-explorer`, `burrinhos-barbe`
   adicionados a `projects.list[]` em `pt.json`, `en.json`, `de.json` (paridade total).
2. **Assets** — cover `.webp` (≤ 60KB) e diagramas SVG light/dark (≤ 50KB) para cada projeto.
3. **Validação CI** — os gates existentes (`validate-content.mjs`, `check-i18n-parity.mjs`,
   SVG size gate) passam com os novos projetos sem alteração.
4. **E2E smoke** — 3 novos spec stubs em `tests/e2e/projects-cluster/` cobrindo
   navegação index → detalhe para cada novo projeto.

### 3.2 O que NÃO está em escopo

- Nenhuma mudança de código de infraestrutura (rotas, templates, components, hooks).
- Nenhum novo `kind` — os 3 projetos cabem nos kinds existentes.
- Internacionalização além de PT/EN/DE.
- CMS ou pipeline de geração automática de conteúdo.

---

## 4. Acceptance Criteria

| ID | Critério |
|---|---|
| AC-PC2-01 | `/projetos` renderiza 6 cards na ordem: dadaia-workspace, portifolio, tauan-games, dadaia-bots, dd-chain-explorer, burrinhos-barbe |
| AC-PC2-02 | `/projetos/dadaia-bots` carrega sem 404 e renderiza o template `case-study` |
| AC-PC2-03 | `/projetos/dd-chain-explorer` carrega sem 404 e renderiza o template `case-study` |
| AC-PC2-04 | `/projetos/burrinhos-barbe` carrega sem 404 e renderiza o template `meta` |
| AC-PC2-05 | Paridade total PT/EN/DE para todos os campos i18n-bearing dos 3 novos projetos (`check-i18n-parity.mjs` exit 0) |
| AC-PC2-06 | `validate-content.mjs` exit 0 com os novos projetos no schema Zod |
| AC-PC2-07 | Cada cover ≤ 60KB; cada SVG ≤ 50KB (SVG size gate CI verde) |
| AC-PC2-08 | Lighthouse mobile performance ≥ 85 em `/projetos` após adição dos 6 cards |
| AC-PC2-09 | Zero regressão nas rotas existentes (`/`, `/projetos`, `/projetos/dadaia-workspace`, `/projetos/portifolio`, `/projetos/tauan-games`) |

---

## 5. Conteúdo necessário (a preencher pelo operador)

Antes de avançar para PLAN + TASKS, o operador deve fornecer para cada projeto:

### dadaia-bots

- [ ] Tagline (1 frase, ≤ 120 chars)
- [ ] Descrição curta para o card index (≤ 200 chars)
- [ ] Stack principal (lista de tecnologias)
- [ ] Seções de detalhe: what / why / how / status
- [ ] Link para repo ou demo público (opcional)
- [ ] Cover image ou referência visual
- [ ] Diagrama de arquitetura (opcional)

### dd-chain-explorer

- [ ] Tagline
- [ ] Descrição curta para o card index
- [ ] Stack principal
- [ ] Seções de detalhe
- [ ] Link para repo ou demo público
- [ ] Cover image ou referência visual
- [ ] Diagrama de arquitetura (existe em `repos/dd-chain-explorer/` — confirmar)

### burrinhos-barbe

- [ ] Tagline
- [ ] Descrição curta para o card index
- [ ] Stack principal
- [ ] Seções de detalhe (o que é, motivação, status atual)
- [ ] Link público (opcional)
- [ ] Cover image ou referência visual

---

## 6. Decisões abertas

| ID | Decisão | Status |
|---|---|---|
| DEC-PC2-01 | Confirmar `kind` de cada projeto (proposta: bots=case-study, dd-chain=case-study, burrinhos=meta) | **Aberta** — operador decide |
| DEC-PC2-02 | Ordem dos 6 cards no index — manter os 3 existentes primeiro ou reordenar por relevância? | **Aberta** |
| DEC-PC2-03 | `burrinhos-barbe` tem diagrama de arquitetura ou só cover + seções de texto? | **Aberta** |

---

## 7. Dependências

- `projects-cluster-v1` em produção ✅ (rota dinâmica, templates, CI gates ativos)
- Assets (covers + diagramas) produzidos pelo operador antes de T-PC2-C-01
- Conteúdo de seção (§5) aprovado antes de PLAN + TASKS

---

## 8. Non-goals

- Refatoração do content model (v1 já entregou o schema correto).
- Novos templates ou kinds.
- Qualquer mudança em `mobile-redesign-v1` surface.
