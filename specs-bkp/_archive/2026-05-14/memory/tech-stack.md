# Tech-Stack Memory: portifolio (2.0)

**Status:** Aprovado

## 1. Frontend (P0)

| Componente | Tecnologia | Versão | Decisão |
|---|---|---|---|
| Framework | React | 18.3.x | Mantido — refator, não migração (vide architect §2). |
| Linguagem | TypeScript | 5.5.x | — |
| Build tool | Vite | 7.3.x | Já corrigido no commit `c9aa3d4` (Vite 5 → 7) com correção de vulnerabilidades npm. |
| CSS | Tailwind CSS | 3.4.x | + `tailwindcss-animate`, `@tailwindcss/typography` (dev). |
| Roteamento | `react-router-dom` | 6.26.x | Lazy-loading por rota para code-splitting. |
| Package manager | **npm** | — | `package-lock.json` é a fonte de verdade. Não usar Bun/yarn/pnpm. |
| UI base | shadcn/ui (podado) | — | 10 componentes mantidos, 37 marcados REMOVE (§3). |

## 2. UI — shadcn/ui (KEEP vs REMOVE)

### KEEP (10 componentes — manter no P0)

| Componente | Justificativa |
|---|---|
| `button.tsx` | Header, Portfolio, CTAs das abas. |
| `card.tsx` | Base de todas as seções. |
| `badge.tsx` | Skills, certification levels. |
| `collapsible.tsx` | Accordions mobile + cargos múltiplos + grupos de cert. |
| `select.tsx` | Seletor de idioma no Header. |
| `sidebar.tsx` (+ `separator.tsx`, `sheet.tsx`, `skeleton.tsx`, `input.tsx`, `tooltip.tsx`) | `AppSidebar.tsx` + navegação desktop. Substituição por `<nav>` Tailwind nativa fica como P1. |
| `tooltip.tsx` | `App.tsx` (`TooltipProvider`) + `sidebar.tsx`. |
| `dialog.tsx` | **ADICIONAR** — substitui modais inline do Header (image + email) para acessibilidade (focus trap, ARIA, ESC). |

### REMOVE (37 componentes — deletar em F-P0-01/P0 refator)

Todos órfãos (verificado por grep, vide architect §4):
`accordion.tsx`, `alert-dialog.tsx`, `alert.tsx`, `aspect-ratio.tsx`, `avatar.tsx`,
`breadcrumb.tsx`, `calendar.tsx`, `carousel.tsx`, `chart.tsx`, `checkbox.tsx`, `command.tsx`,
`context-menu.tsx`, `drawer.tsx`, `dropdown-menu.tsx`, `form.tsx`, `hover-card.tsx`,
`input-otp.tsx`, `menubar.tsx`, `navigation-menu.tsx`, `pagination.tsx`, `popover.tsx`,
`progress.tsx`, `radio-group.tsx`, `resizable.tsx`, `scroll-area.tsx`, `slider.tsx`,
`switch.tsx`, `table.tsx`, `tabs.tsx`, `textarea.tsx`, `toggle.tsx`, `toggle-group.tsx`,
`sonner.tsx`, `toaster.tsx`, `toast.tsx`, `radio-group.tsx`, `popover.tsx`.

### Dependências npm REMOVE consequentes

`@radix-ui/react-{accordion,alert-dialog,aspect-ratio,avatar,checkbox,context-menu,dropdown-menu,hover-card,menubar,navigation-menu,popover,progress,radio-group,scroll-area,slider,switch,tabs,toast,toggle,toggle-group}`,
`cmdk`, `date-fns`, `embla-carousel-react`, `input-otp`, `react-day-picker`,
`react-hook-form`, `@hookform/resolvers`, `react-resizable-panels`, `recharts`, `vaul`,
`zod`, `@tanstack/react-query`, `next-themes`, `lovable-tagger` (devDep — origem Lovable).

Estimativa de ganho: ≥ 180KB minified+gz no bundle inicial (architect §4).

### KEEP obrigatórias (não remover)

`react`, `react-dom`, `react-router-dom`, `class-variance-authority`, `clsx`,
`lucide-react`, `tailwind-merge`, `tailwindcss-animate`, `@radix-ui/react-collapsible`,
`@radix-ui/react-dialog`, `@radix-ui/react-label`, `@radix-ui/react-select`,
`@radix-ui/react-separator`, `@radix-ui/react-slot`, `@radix-ui/react-tooltip`,
`@radix-ui/react-aspect-ratio` (dependência interna do sidebar).

## 3. Testes

| Tipo | Toolchain | Notas |
|---|---|---|
| Unit | **Vitest** + Testing Library + `jsdom` | Collocated (`*.test.tsx` ao lado do componente). |
| E2E | **Playwright** (TypeScript) | 5 projects: chromium, firefox, webkit, mobile-chrome (Pixel 5), mobile-safari (iPhone 13). |
| Acessibilidade E2E | `@axe-core/playwright` | Smoke axe na home + 3 abas (warn em develop, error em main). |
| Lighthouse | `@lhci/cli` ≥ 0.14 | Servidor local via `npm run preview` (porta 4173). |

## 4. Backend (P1 — não implementar agora)

| Componente | Tecnologia | Decisão |
|---|---|---|
| Linguagem | **Go** 1.23+ | — |
| Plataforma | AWS Lambda | Runtime `provided.al2023`, arch **arm64** (~20% mais barato que x86_64). |
| HTTP | `net/http` puro + `aws-lambda-go/events.APIGatewayV2HTTPRequest` | **Sem framework** (Chi/Echo/Gin). 1 endpoint apenas. |
| AWS SDK | `aws-sdk-go-v2` (módulos por serviço) | v2 ergonomia moderna + binário menor. |
| Validação | `github.com/santhosh-tekuri/jsonschema/v5` | Sem CGO, draft-7, maduro. |
| Logging | `log/slog` (stdlib desde 1.21) | Zero dep, JSON estruturado nativo. |
| Auth | Cognito JWT validator no API Gateway HTTP API | Lambda só lê claims do contexto. |
| Storage | S3 (mesmo bucket do site, prefix `content/`) | Versionamento via S3 Object Versioning (já habilitado). |

Localização proposta: `backend-go/`. Pasta `backend/` (Flask atual) será arquivada após
F-P0-01 — é apenas servidor de dev local, não tem código de produção.

## 5. Infraestrutura AWS

| Serviço | Uso | Notas |
|---|---|---|
| S3 | Hosting + (P1) content/*.json | Privado, OAC. 2 buckets: `stage-portifolio-marco-menezes` e `portifolio-marco-menezes`. |
| CloudFront | CDN + HTTPS + cache | PriceClass_100 (sufficient — vide devops §8). Distribuição por env. |
| ACM | Cert SSL para CloudFront | **us-east-1** obrigatório. DNS-validated. |
| Route53 | DNS | Zona existente `Z08547081HT88IACPHZET`. |
| IAM | OIDC provider + role(s) | Trust `repo:marcoaureliomenezes/portifolio:*`. 1 role compartilhada inicialmente; split por env se necessário. |
| Lambda (P1) | CMS-lite writer | arm64, `provided.al2023`. |
| API Gateway (P1) | HTTP API com JWT authorizer | Cognito User Pool issuer. |
| Cognito (P1) | User Pool + Hosted UI | 1 usuário, TOTP MFA obrigatório. |

**Conta AWS:** `016098071081`. **Região operacional:** `sa-east-1` (buckets, Lambda, API
Gateway). **us-east-1:** apenas ACM (requisito CloudFront).

## 6. CI/CD

- **GitHub Actions** com **OIDC** (sem long-lived AWS keys).
- 3 workflows: `ci.yml` (PR gate), `deploy.yml` (build + S3 sync + CF invalidate),
  `terraform.yml` (plan + apply por env).
- Runners pinados em `ubuntu-24.04` (não `ubuntu-latest`).
- Trust policy: `repo:marcoaureliomenezes/portifolio:*` na role IAM.
- Environments GitHub: `stage` (auto-deploy de develop) e `production` (manual approval em
  push para main).

## 7. Terraform

- **Versão:** ≥ 1.9.0 (pinada para evitar drift).
- **Provider:** `hashicorp/aws ~> 5.0`.
- **Backend remoto:** `dadaia-s3-bucket-terraform-rm-state` (sa-east-1), keys:
  - `portifolio/stage/terraform.tfstate`
  - `portifolio/prod/terraform.tfstate`
- **Layout:** módulo compartilhado em `terraform/modules/portfolio-static-site/`;
  chamadores por env em `terraform/envs/stage/` e `terraform/envs/prod/`.
- **Rejeitados:** terraform workspaces (vide devops §5 — pior legibilidade com 2 envs
  divergentes em domínio/preço); prefixos no mesmo state (risco de `destroy` acidental).

## 8. Drift corrigido vs spec antiga

| Item antigo (Draft 1.0) | Realidade / Decisão 2.0 |
|---|---|
| "Package Manager: Bun" | **npm** (`package-lock.json` real). |
| "Backend: Python/Flask em prod" | **Go Lambda** em P1. Flask atual é apenas dev local; será arquivado. |
| "Estado terraform local" | Backend remoto S3 (`dadaia-s3-bucket-terraform-rm-state/portifolio/`) — já existe. |
| "Vite latest" | Vite 7.3.x pinada. |
| "shadcn latest" (50 componentes) | shadcn podado: 10 KEEP, 37 REMOVE. |

## 9. Versões e ferramentas externas

| Ferramenta | Versão |
|---|---|
| Node.js (CI + local) | `20` LTS |
| Terraform | ≥ 1.9.0 |
| Go (P1) | 1.23+ |
| Playwright | ≥ 1.44 |
| Vitest | ≥ 1.6 |
| `@lhci/cli` | ≥ 0.14 |
| `@testing-library/react` | ≥ 16 |
