# Release SPEC — portfolio-redesign-v1

**Status:** Aprovado

> Release ID: `portfolio-redesign-v1`
> Owner: product-engineer (autorado pela sessão coordenadora sob diretiva direta do operador)
> Created: 2026-06-11
> Approved: 2026-06-11 — diretiva do operador via /goal ("define the release, implement,
> validate, at the end I will inspect and if great we will publish"). Escopo = o
> candidato `specs/backlog/portfolio-redesign-v1.md` (picked), derivado da review
> `specs/audits/2026-06-11T034500Z/frontend-design-architecture-review.md`.
> Depends on: `projects-cluster-v2` rc-2 (branch pushed; este release é empilhado sobre
> `feature/projects-cluster-v2-rc2` — merge a main do v2 segue pendente no gate do operador)

---

## 1. Problema

A review 2026-06-11 mediu: página 5.589px; certificações 1.828px (33%) em linhas ~60%
vazias; projetos pessoais INVISÍVEIS na home (atrás de um pill de nav); 7 cores fora do
token system; 3 padrões de collapsible; h1 com gradient-text que trunca; seções
opacity-0 até IntersectionObserver; erro a11y vivo no EmailModal. E o bloqueio
arquitetural: conteúdo compilado no bundle JS — editar uma letra exige release, o que é
incompatível com o painel admin externo planejado pelo operador.

## 2. Objetivo

Portfolio recrutador-otimizado, minimalista com estilo ("quiet terminal": slate + um
acento âmbar, Inter para prosa, JetBrains Mono para metadados), denso sem desperdício,
com os projetos pessoais em destaque na home — e frontend pronto para plugar no painel
admin (Fase 1 headless: conteúdo fora do bundle + contrato de schema versionado).

## 3. Escopo — 5 fatias

### R1 — Disciplina de design system
1. Zero cores literais fora do token system (`text-green-600` etc. → tokens; ícones
   herdam `text-muted-foreground`; único acento = âmbar; sociais monocromáticos).
2. Uma marca: wordmark sólido `text-accent`; h1 do hero `text-foreground` (sem gradient
   text, sem nowrap/ellipsis), escala display (text-3xl md:text-5xl).
3. Primitivo único `Disclosure` (chevron único com rotate-180 animado + conteúdo
   animado) substituindo os 3 padrões; política: seções abertas, roles fechadas com
   linha-resumo.
4. EmailModal com `DialogTitle` (+ descrição) — zera o erro Radix no console.
5. Heading de seção fora do `<button>` trigger.
6. index.css: `.dark` dentro de `@layer base`; tokens/CSS de sidebar mortos removidos.
7. Ornamento: manter apenas o trilho vertical da Experience; demais barras/gradientes
   decorativos removidos.

### R2 — Arquitetura de informação da home
8. **Featured Projects strip** logo após o hero: 3 `ProjectCard`s (rand-engine,
   dadaia-workspace, portifolio) + link "ver todos" → `/projetos`. Labels i18n novas
   (`featuredProjectsTitle`, `seeAllProjects`).
9. Hero 2 colunas (lg+): identidade/bio/CTAs à esquerda; painel "now" em mono à direita
   (derivado do conteúdo: papel atual, cert mais recente, projeto mais recente).
10. Ordem: Hero → Featured Projects → Experience → Skills → Certifications → Education.
    NavAnchors na mesma ordem.
11. Seções visíveis por default (sem `opacity-0` gateado por useInView; animação só
    como enhancement motion-safe).

### R3 — Densidade
12. Certificações: grid de tiles compactos (2-col md / 3-col lg) — badge 40px, nome
    clamp-2, chip de nível + data em mono; o tile inteiro é o link da credencial; grupos
    por provider viram caption fino (ícone + nome + contagem), sem collapsible. Mapa de
    ícones de provider com paths absolutos.
13. Experience: linha-resumo única (primeira responsibility) no lugar do join de 3;
    paddings/espaçamentos -25%; box gradiente de technologies vira texto plano com
    label mono.
14. Container `max-w-5xl`.
15. Prune: props mortos (labels não usados no CertificationCard, `language` deprecated
    no Portfolio, props "backward-compat" do HeaderDesktopLayout).

### R4 — Headless Fase 1 (prontidão para o painel admin)
16. Conteúdo canônico em `frontend/public/content/{pt,en,de}.json`, servido como asset
    estático (S3+CloudFront); `loadLocaleRaw` passa de import build-time para
    `fetch('/content/<lang>.json')` (revalidação por ETag).
17. Schema Zod de conteúdo completo (`lib/schemas/content.ts`: coleções estruturadas
    + catchall para labels) validado em CI; export JSON Schema versionado em
    `public/content/schema/v1.json` via `zod-to-json-schema` — o contrato que o projeto
    admin consumirá.
18. `id` estável em toda entidade (experience, role, certification, education, skill
    category). `schema_version` + `published_at` em cada locale.
19. `profile.ts` absorvido no conteúdo (`content.profile`); consumidores migrados.
20. Shim de fetch nos testes (test-setup lê `public/content/` do disco).

### R5 — Verificação
21. vitest 100%, tsc, eslint, validate-content, i18n-parity, build, e2e chromium
    (regressões zero além do débito quarentenado), axe na home, preview server para
    inspeção do operador com evidência antes/depois.

## 4. Acceptance Criteria

| ID | Critério |
|---|---|
| AC-RD-01 | Home: 3 ProjectCards visíveis acima da dobra-2 (logo após o hero) com link "ver todos"; ordem de seções conforme §3.10 |
| AC-RD-02 | `grep -rE "text-(green|red|yellow|blue|purple)-[0-9]|#0A66C2|#E1306C" src/components` → 0 ocorrências |
| AC-RD-03 | Um único componente Disclosure; nenhum uso de par ChevronUp/ChevronDown como toggle |
| AC-RD-04 | Console sem erro Radix DialogTitle; axe na home sem violações sérias |
| AC-RD-05 | Altura da seção de certificações ≤ 900px desktop (era 1.828px) com os mesmos 11 certs |
| AC-RD-06 | Página inicial ≤ ~4.200px (era 5.589px) sem remover conteúdo |
| AC-RD-07 | `curl localhost:<preview>/content/en.json` retorna o conteúdo; bundle JS não contém os textos do resume (conteúdo fora do bundle) |
| AC-RD-08 | `public/content/schema/v1.json` existe, gerado por script de `lib/schemas/content.ts`; CI valida os 3 locales contra o schema |
| AC-RD-09 | Toda experience/role/cert/education/skill-category tem `id` único estável |
| AC-RD-10 | Editar um JSON em `public/content/` + reload muda o site SEM rebuild (provado no preview) |
| AC-RD-11 | Suite unit 100% ×2 runs; e2e projects-cluster sem NOVAS falhas; validate-content + i18n-parity exit 0 |
| AC-RD-12 | Textos de conteúdo inalterados (diff de valores de texto ≈ só campos novos: ids, labels novas, profile, versão) |

## 5. Non-goals

- O painel admin em si (projeto separado); draft/preview e auth = Fase 2/3.
- Mudança dos textos/projetos existentes; /projetos detail pages (rc-2) além da adoção
  dos primitivos compartilhados.
- Light-default (dark default permanece); novos idiomas.
- Resolver todo o débito e2e pré-existente (continua quarentenado), exceto o que o R2
  naturalmente absorver.

## 6. ADRs

| ID | Decisão | Racional |
|---|---|---|
| ADR-RD-01 | Conteúdo runtime via `public/content/` + fetch, sem snapshot duplicado no bundle | S3+CloudFront mesmo-origem já serve o site; se `/content/` falhar o site está quebrado de qualquer forma; duplicar 30KB no bundle cria drift |
| ADR-RD-02 | Contrato = JSON Schema gerado do Zod (zod-to-json-schema, já devDep) | O projeto admin renderiza forms a partir do schema sem acoplar nos tipos TS deste repo |
| ADR-RD-03 | Featured = rand-engine, dadaia-workspace, portifolio (tauan-games só em /projetos) | Sinal para recrutador: 2 libs PyPI + a meta-arquitetura AWS; games é o toque pessoal, não o pitch |
| ADR-RD-04 | Stacked branch sobre rc-2 (não esperar merge) | Operador segurou o deploy do v2; o redesign reusa os ProjectCards do rc-2 |
