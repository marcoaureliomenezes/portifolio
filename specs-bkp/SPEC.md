# Portfólio 2.0 — Top-level SPEC

**Status:** Aprovado

> Spec top-level do produto. Consolida o escopo P0 (Retomada da Garden Pessoal — fase
> Portfólio) e referencia as 7 features detalhadas em `features/`.

---

## 1. Visão de produto

`marco-menezes.com` evolui de "currículo online estático" para **portfólio técnico vivo**.

- Recrutadores continuam encontrando a apresentação profissional na Home.
- Comunidade técnica (peers, recrutadores técnicos, contribuidores futuros) encontra abas
  de projeto com código real e a meta-página da arquitetura do próprio portfólio.
- Operador edita texto sem redeploy (P1 — CMS-lite).

## 2. Escopo P0 — 6 features

| ID | Feature | Spec | Agente responsável principal |
|---|---|---|---|
| F-P0-01 | Retomada da infra estática (S3+CloudFront+ACM+Route53+OIDC, 2 ambientes) | `features/infra-retomada/SPEC.md` | devops-engineer |
| F-P0-02 | Quality gate (Lighthouse + Playwright + Vitest+RTL) | `features/quality-gate/SPEC.md` | qa-engineer |
| F-P0-03 | Aba "dadaia-workspace" | `features/aba-dadaia-workspace/SPEC.md` | software-engineer |
| F-P0-04 | Aba "tauan-games" | `features/aba-tauan-games/SPEC.md` | software-engineer |
| F-P0-05 | Aba "Arquitetura deste portfólio" | `features/aba-arquitetura/SPEC.md` | software-engineer |
| F-P0-06 | Migração de conteúdo `.ts` → `.json` | `features/content-json/SPEC.md` | software-engineer |

Dependências entre features são detalhadas em `PLAN.md` e `TASKS.md`.

## 3. Refator transversal (vide architect §3 e §4)

Antes das features serem entregáveis com qualidade Lighthouse ≥ 90, é necessário **refator**
do código existente. Esse refator não é uma feature em si — é pré-requisito de F-P0-02 e
das abas:

- Decomposição de `Portfolio.tsx` (1007 linhas) e `Header.tsx` (540 linhas) em 21 componentes
  coesos (`components/portfolio/` + `components/header/`).
- Podagem do shadcn/ui (37 componentes REMOVE) + remoção das 30+ dependências órfãs.
- Introdução do hook `useContent()` (DIP — ponto único de troca da fonte de conteúdo).
- Substituição dos modais inline por `dialog.tsx` (Radix Dialog).
- Tornar URLs sociais (`linkedinUrl`, `githubUrl`) **obrigatórios** ou centralizá-los em
  `data/profile.ts` — eliminar defaults `https://linkedin.com` e `https://github.com`.
- Aplicar landmarks ARIA (`aria-labelledby`, `<nav aria-label>`, `aria-current="location"`).
- Dynamic import por idioma (code-splitting do conteúdo).
- Limpeza de resíduo: `App.css`, `.flask.pid`, scripts vazios, `AGENTS.md` (commitar ou
  remover), `z_prompts.md`, README links quebrados.

Essas mudanças vivem como tasks específicas em `TASKS.md` (T-FE-01..T-FE-09).

## 4. Fora de escopo do P0

- Implementação do CMS-lite (P1 — apenas spec em `features/cms-lite/SPEC.md`).
- Backend Go em produção.
- Decisão final sobre `de` (P1, com dados de tráfego).
- Multi-region, WAF, observabilidade ativa, testes de carga/mutação, snapshot visual.
- Arquivamento físico do diretório `backend/` Flask (decisão registrada; ação opcional
  pós-go-live).

## 4b. Constraints transversais (decisões fechadas)

Restrições absolutas que valem para **todas** as features P0 e P1, definidas por **papel
(persona)**:

- **CT-01 — No local AWS credentials por papel.** A política se aplica a duas personas
  distintas com permissões mutuamente exclusivas:
  - **Developer** (papel padrão, 99% das interações com o repo): **não** tem credenciais
    AWS de longo prazo apontando para a conta `016098071081` em ambiente DEV local. Toda
    escrita e leitura na conta para o projeto `portifolio` no fluxo de Developer acontece
    exclusivamente via **GitHub Actions OIDC**. Sem exceções.
  - **Infra Specialist** (papel raro, bootstrap inicial e break-glass): credenciais AWS
    locais autorizadas em escopo restrito a (i) bootstrap do OIDC provider e bootstrap
    role (T-DEVOPS-02 + T-DEVOPS-02a-fix), e (ii) diagnóstico read-only durante incidentes
    em que o caminho via CI está bloqueado. Cada uso justificado via checklist de
    `foundation/SPEC.md §10.c` e auditável via CloudTrail.
  - Bootstrap inicial (T-DEVOPS-02) pode ocorrer via **CloudShell** (preferido) **ou** via
    máquina local do Infra Specialist (autorizado, com `INFRA_SPECIALIST_MODE=1`). Após
    bootstrap, ambos os papéis voltam à regra geral. Detalhes em `foundation/SPEC.md §10`
    e `security/SPEC.md FR-S29..S31`.
- **CT-02 — All provisioning via CI (pós-bootstrap).** `terraform apply`,
  `terraform import`, `terraform destroy`, `aws iam create-*` e `aws iam delete-*` de
  recursos de aplicação, `aws s3 cp`/`sync` para buckets do projeto rodam
  **exclusivamente** em workflow GitHub Actions (`terraform.yml`, `deploy.yml`,
  `cleanup-bootstrap.yml`) — para ambos os papéis após o bootstrap concluído. A única
  exceção autorizada a `aws iam create-*` local é durante o próprio T-DEVOPS-02 no Fluxo
  B (criação do OIDC provider e da bootstrap role).
- **CT-03 — `gh` CLI permitido local.** `gh secret set`, `gh api`, `gh pr create` usam
  GitHub token pessoal e **não** são credencial AWS — execução local permitida para
  ambos os papéis.
- **CT-04 — Diagnóstico read-only AWS.** Para **Developer**: comandos
  `aws sts get-caller-identity`, `aws iam list-*`, `aws s3 ls`, `aws cloudfront list-*`
  etc. rodam em AWS CloudShell ou em job CI dedicado — nunca localmente. Para **Infra
  Specialist** durante break-glass: autorizado localmente quando o caminho via CI está
  bloqueado, com justificativa documentada (FR-S31).

## 5. Critérios globais de "pronto" do P0

- **A1.** Site servindo `https://marco-menezes.com` e `https://www.marco-menezes.com` com
  cert ACM válido (vide F-P0-01).
- **A2.** Site servindo `https://stage.marco-menezes.com` com cert ACM válido.
- **A3.** Lighthouse Performance ≥ 90, Accessibility ≥ 90, Best-Practices ≥ 95, SEO ≥ 90
  (mobile e desktop) em home + 3 abas + 404 (com budget relaxado em 404 — vide qa §5.2).
- **A4.** Suite Playwright completa passando: 12 cenários E2E mínimos (E2E-01..E2E-12) +
  smoke axe nas 3 abas.
- **A5.** Unit tests (Vitest+RTL) cobrindo componentes com lógica condicional real
  (≥ 60% branches+statements nos extraídos da decomposição) + 100% nos hooks customizados e
  em `useContent`/`getContent`.
- **A6.** Branch protection ativa em `main` e `develop`; environment `production` exige
  aprovação manual.
- **A7.** Custo mensal projetado < US$ 5/mês (devops §8).
- **A8.** Deploy via push para `main` completa em ≤ 6 min com invalidation CloudFront.
- **A9.** Conteúdo todo em JSON (não mais em `.ts` constants — F-P0-06).
- **A10.** Os 3 defeitos CRITICAL do architect são resolvidos: URLs sociais reais (não
  defaults fake), modais com Radix Dialog, bundle sem deps órfãs.
- **A11.** Nenhuma operação AWS (apply, import, IAM de aplicação, S3) foi executada
  localmente durante o ciclo de retomada **fora da janela autorizada de bootstrap**.
  CloudTrail mostra:
  - 99%+ das ações com principal
    `arn:aws:sts::016098071081:assumed-role/github-actions-portfolio-*/<workflow-run-id>`
    (operações via CI — esperado).
  - Eventos pontuais de bootstrap (T-DEVOPS-02) com principal humano via SSO/console,
    documentados em `specs/_archive/` ou incident log (operações como Infra Specialist —
    autorizado por foundation §10.b).
  - CT-01..CT-04 verificadas, incluindo a separação de papéis.

## 6. Estado de aprovação

| Spec | Status atual |
|---|---|
| `specs/constitution.md` | Aprovado |
| `specs/memory/architecture.md` | Aprovado |
| `specs/memory/product.md` | Aprovado |
| `specs/memory/tech-stack.md` | Aprovado |
| `specs/foundation/SPEC.md` | Aprovado |
| `specs/SPEC.md` (este) | Aprovado |
| `specs/security/SPEC.md` | Aprovado |
| `specs/features/infra-retomada/SPEC.md` | Aprovado |
| `specs/features/quality-gate/SPEC.md` | Aprovado |
| `specs/features/aba-dadaia-workspace/SPEC.md` | Aprovado |
| `specs/features/aba-tauan-games/SPEC.md` | Aprovado |
| `specs/features/aba-arquitetura/SPEC.md` | Aprovado |
| `specs/features/content-json/SPEC.md` | Aprovado |
| `specs/features/cms-lite/SPEC.md` | Draft — Roadmap (não implementar agora) |
| `specs/PLAN.md` | Aprovado |
| `specs/TASKS.md` | Aprovado |

> O operador pode ajustar Status individualmente caso queira revisão extra antes de iniciar
> a implementação. O default é Aprovado porque todas as decisões já foram consolidadas pelos
> 5 reports do ciclo de Retomada.
