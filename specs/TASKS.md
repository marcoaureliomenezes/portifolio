# TASKS — Portfólio 2.0 (P0)

**Status:** Aprovado

> Lista atômica e paralela de tarefas. Cada tarefa tem ID, título, agente responsável,
> dependências, arquivos tocados, e critério de pronto. Implementação só após aprovação
> do operador.
>
> Convenção de estado por tarefa: `[ ]` OPEN → `[-]` IN PROGRESS → `[x]` DONE.
>
> Convenção de paralelismo: tarefas com `dep: —` ou com dependências já `[x]` podem rodar
> em paralelo se forem de agentes diferentes. Dentro de um mesmo agente, segue ordem de ID.

---

## Fase 0 — Pre-bootstrap

### `[ ]` T-DEVOPS-01 — Criar branch `develop` e cherry-pick `ci/oidc-pipelines-compliance`

- **Agente:** `[devops-engineer]`
- **Dep:** —
- **Toca:** Git (branches `main`, `develop`, `ci/oidc-pipelines-compliance`)
- **Critério de pronto:**
  - `git branch --list develop` retorna `develop`.
  - `git log --oneline develop` contém commits `15b49a8` e `c9aa3d4`.
  - Branch `ci/oidc-pipelines-compliance` deletada local e remoto.
  - PR aberto `develop → main` (não mesclado).

### `[ ]` T-DEVOPS-02a — Criar `scripts/bootstrap-oidc.sh` (versionado no repo)

- **Agente:** `[devops-engineer]`
- **Dep:** —
- **Toca:** `scripts/bootstrap-oidc.sh` (novo, no repo `portifolio`)
- **Critério de pronto:**
  - Script presente, idempotente, e segue spec em `features/infra-retomada/SPEC.md §5.2`:
    detecta OIDC provider existente e pula criação; detecta role existente e pula criação;
    re-attach idempotente da policy.
  - Script aborta com mensagem clara se executado fora de AWS CloudShell **e sem
    `INFRA_SPECIALIST_MODE=1`** (assume sem credenciais locais para o papel Developer).
  - Output do script imprime `BOOTSTRAP_ROLE_ARN=<arn>` em uma linha (fácil copiar para
    `gh secret set`).
  - Header do script documenta como rodar em CloudShell: `git clone <repo> && cd portifolio && bash scripts/bootstrap-oidc.sh`.
  - Commitado em `develop` via PR.

### `[ ]` T-DEVOPS-02a-fix — Atualizar `scripts/bootstrap-oidc.sh` para dual-mode (CloudShell + Infra Specialist local)

- **Agente:** `[devops-engineer]`
- **Dep:** T-DEVOPS-02a (script base existente)
- **Toca:** `scripts/bootstrap-oidc.sh` (atualização do guard de execução)
- **Contexto:** foundation/SPEC.md §10 e features/infra-retomada/SPEC.md §5.2 foram
  atualizados para autorizar o **Fluxo B** (Infra Specialist local) além do Fluxo A
  (CloudShell). O script precisa refletir essa autorização.
- **Critério de pronto:**
  - Guard antigo de `AWS_EXECUTION_ENV` vira **warning** (não erro) quando a variável
    `INFRA_SPECIALIST_MODE=1` está presente no ambiente. Mensagem do warning:
    "INFO: Running outside CloudShell as Infra Specialist (INFRA_SPECIALIST_MODE=1).
    Ensure credentials are scoped per foundation/SPEC.md §10.b and §10.c checklist."
  - Em CloudShell (`AWS_EXECUTION_ENV` setado pelo ambiente), o script continua executando
    sem warning, como antes.
  - Sem nenhum dos dois (Developer mode), o script aborta com erro claro orientando a
    escolher um dos dois caminhos autorizados.
  - Idempotência preservada: rerun no Fluxo A ou Fluxo B leva ao mesmo estado final.
  - Verificação manual: rodando local com `INFRA_SPECIALIST_MODE=1 bash scripts/bootstrap-oidc.sh`
    executa sem erro (assumindo credenciais IAM válidas); em CloudShell continua
    funcionando sem flag.
  - Commitado em `develop` via PR separado (não bloqueante — bootstrap já foi feito em
    2026-05-14; este fix garante reproducibilidade futura).
- **Nota:** o bootstrap real já foi executado em 2026-05-14 antes deste fix existir, o
  que valida empiricamente que o Fluxo B funciona. Este task formaliza a mudança no
  artefato versionado.

### `[x]` T-DEVOPS-02 — Executar bootstrap OIDC (uma única vez, papel Infra Specialist)

- **Agente:** `[devops-engineer]` (operacional — operador executa no papel **Infra
  Specialist**; devops-engineer verifica pós-condições via job CI ou CloudShell read-only)
- **Dep:** T-DEVOPS-02a
- **Toca:** AWS IAM. Pode ser executado **via AWS CloudShell (preferido)** OU
  **localmente por Infra Specialist autorizado** com `INFRA_SPECIALIST_MODE=1` (vide
  `foundation/SPEC.md §10.b` e `features/infra-retomada/SPEC.md §5`). **Developer**
  continua sem credenciais AWS locais — sem exceção. Foundation §10 distingue os dois
  papéis explicitamente.
- **Estado em 2026-05-14:** já executado por marco no papel Infra Specialist (Fluxo B —
  local). Resultado documentado em `specs/_archive/2026-05-14-bootstrap-notes.md`. Para
  rerun (caso destruído), os critérios abaixo continuam válidos.
- **Critério de pronto:**
  - `aws iam list-open-id-connect-providers` (executado em CloudShell, em job CI read-only,
    ou localmente pelo Infra Specialist) retorna ARN
    `arn:aws:iam::016098071081:oidc-provider/token.actions.githubusercontent.com`.
  - Role `github-actions-portfolio-bootstrap` existe com `AdministratorAccess` e trust
    `repo:marcoaureliomenezes/portifolio:*`. ARN observado:
    `arn:aws:iam::016098071081:role/github-actions-portfolio-bootstrap`.
  - ARN da bootstrap role anotado pelo operador para uso em T-DEVOPS-03.
  - Sessão encerrada (CloudShell ou shell local); nenhum credencial AWS retorna a fluxo
    de Developer. Caminho via CI assume o ciclo daí em diante.

### `[ ]` T-DEVOPS-03 — Configurar GitHub environments + secrets temporários

- **Agente:** `[devops-engineer]`
- **Dep:** T-DEVOPS-02
- **Toca:** GitHub (environments via API/UI)
- **Critério de pronto:**
  - Environments `stage` (branch policy `develop`) e `production` (branch policy `main`)
    criados.
  - `production` tem reviewer `@marcoaureliomenezes` configurado.
  - Secrets temporários: `AWS_ROLE_ARN_STAGE` (env stage) e `AWS_ROLE_ARN` (env production)
    apontando para bootstrap role.
  - Variables: `TF_STATE_BUCKET`, `TF_STATE_REGION`, `AWS_REGION`, `S3_BUCKET`, `DOMAIN`,
    `TF_ENV` por env.

---

## Fase 1 — Terraform restructure + Stage infra

### `[ ]` T-DEVOPS-04 — Restruturar `terraform/` em `modules/` + `envs/{stage,prod}/`

- **Agente:** `[devops-engineer]`
- **Dep:** T-DEVOPS-01
- **Toca:** `terraform/**`
- **Critério de pronto:**
  - Existem `terraform/modules/portfolio-static-site/{main,variables,s3,s3_policies,cloudfront,acm,route53,iam,outputs,locals}.tf`.
  - Existem `terraform/envs/stage/{main,terraform,terraform.tfvars}.tf`.
  - Existem `terraform/envs/prod/{main,terraform,terraform.tfvars}.tf`.
  - `terraform fmt -check -recursive` passa.
  - `terraform validate` passa em ambos os envs.
  - PR aberto para `develop`.

### `[ ]` T-DEVOPS-05 — Reescrever `ci.yml`, `deploy.yml`, `terraform.yml`

- **Agente:** `[devops-engineer]`
- **Dep:** T-DEVOPS-01
- **Toca:** `.github/workflows/{ci,deploy,terraform}.yml`
- **Critério de pronto:**
  - `ci.yml` com jobs `lint`, `build`, e stubs para `unit-tests`, `e2e`, `lighthouse`.
    Runner `ubuntu-24.04`.
  - `deploy.yml` com jobs `build`, `deploy-stage` (env stage), `deploy-prod` (env production).
  - `terraform.yml` com jobs `terraform-{stage,prod}-{plan,apply}` em working-directory por env.
  - Sem hardcoded backend key (partial config via `-backend-config` em init).
  - PR aberto para `develop`.

### `[ ]` T-DEVOPS-06 — Criar `.github/CODEOWNERS`

- **Agente:** `[devops-engineer]`
- **Dep:** —
- **Toca:** `.github/CODEOWNERS`
- **Critério de pronto:**
  - Arquivo presente com conteúdo de `specs/foundation/SPEC.md §2`.

### `[ ]` T-DEVOPS-07 — Aplicar branch protection em `main` e `develop`

- **Agente:** `[devops-engineer]`
- **Dep:** T-DEVOPS-01, T-DEVOPS-06
- **Toca:** GitHub branch protection API
- **Critério de pronto:**
  - `gh api repos/.../branches/main/protection` retorna config conforme
    `specs/security/SPEC.md FR-S11`.
  - Idem para `develop` (FR-S12).
  - `dadaia` regras documentadas em `foundation/SPEC.md §1` aplicadas.

### `[ ]` T-DEVOPS-08 — `terraform apply` em stage (provisionar do zero) — **via CI**

- **Agente:** `[devops-engineer]`
- **Dep:** T-DEVOPS-02, T-DEVOPS-04, T-DEVOPS-05
- **Toca:** AWS (stage env: bucket, CF, ACM, Route53, IAM role) — execução **exclusivamente
  via workflow GitHub Actions** (`terraform.yml` job `terraform-stage-apply`), assumindo a
  bootstrap role via OIDC. **Proibido** rodar `terraform apply` localmente
  (foundation §10, security FR-S29).
- **Critério de pronto:**
  - Job `terraform-stage-apply` no GitHub Actions completa sem erros.
  - `curl -I https://stage.marco-menezes.com` retorna 200 + HSTS.
  - Outputs do terraform: `cloudfront_distribution_id`, `github_actions_role_arn`
    (acessíveis via `terraform output` em job CI subsequente ou via state no S3).

### `[ ]` T-DEVOPS-09 — Atualizar secrets stage com role OIDC final

- **Agente:** `[devops-engineer]`
- **Dep:** T-DEVOPS-08
- **Toca:** GitHub secrets (env stage) — executável **localmente** via `gh` CLI; usa
  GitHub token pessoal, **não** credencial AWS (não viola foundation §10 / FR-S29). Valores
  dos outputs do terraform são obtidos do state em S3 via job CI read-only ou via output
  publicado em artifact do job `terraform-stage-apply`.
- **Critério de pronto:**
  - `gh secret set AWS_ROLE_ARN_STAGE --env stage --body <terraform output>` aplicado.
  - `gh secret set CLOUDFRONT_DISTRIBUTION_ID_STAGE --env stage --body <output>` aplicado.

---

## Fase 2 — Refator do Frontend

### `[ ]` T-FE-01 — Podagem shadcn + remoção de dependências órfãs

- **Agente:** `[software-engineer]`
- **Dep:** T-DEVOPS-01
- **Toca:** `frontend/src/components/ui/*`, `frontend/package.json`, `frontend/package-lock.json`
- **Critério de pronto:**
  - 37 arquivos `ui/*.tsx` listados em `specs/memory/tech-stack.md §2 REMOVE` deletados.
  - `package.json` sem as 30+ deps órfãs (vide tech-stack §2).
  - `dialog.tsx` (Radix Dialog) presente em `ui/` (ADICIONAR).
  - `npm ci && npm run build` sucede.
  - Snapshot de bundle: `du -sh dist/assets/*.js` registrado antes e depois (≥ 100KB de redução).
  - PR aberto para `develop`.

### `[ ]` T-FE-02 — Criar `useContent()` + `LanguageProvider` (DIP)

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-01
- **Toca:** `frontend/src/hooks/useContent.ts` (novo), `frontend/src/contexts/LanguageContext.tsx` (novo), `frontend/src/App.tsx`, `frontend/src/types/content.ts`
- **Critério de pronto:**
  - `useContent()` exporta `{ content, label, language, setLanguage }`.
  - Fallback hardcoded para `en` (não `pt`) — resolve conflito PE-08.
  - `LanguageProvider` envolve `<App />` em `App.tsx`.
  - Componentes existentes (Header, AppSidebar, Portfolio) ainda compilam — refator
    consumer é T-FE-04.

### `[ ]` T-FE-03 — Refator de `Header.tsx` (decomposição em 7 componentes)

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-01, T-FE-02
- **Toca:** `frontend/src/components/header/*` (novos), `frontend/src/components/Header.tsx` (delete ou wrapper)
- **Critério de pronto:**
  - Criados: `HeaderShell`, `HeaderDesktopLayout`, `HeaderMobileLayout`, `LanguageSelector`,
    `ContactStrip`, `EmailModal`, `AvatarImageModal` (vide architect §3 #13-#19).
  - Orquestrador `Header.tsx` ≤ 80 linhas.
  - Cada filho ≤ 250 linhas.
  - `LanguageSelector` é tipado (`SupportedLanguages = "pt" | "en" | "de"`), sem magic strings.

### `[ ]` T-FE-04 — Refator de `Portfolio.tsx` (decomposição em 12 componentes)

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-01, T-FE-02
- **Toca:** `frontend/src/components/portfolio/*` (novos), `frontend/src/components/Portfolio.tsx`
- **Critério de pronto:**
  - Criados: `HeroSection`, `ExperienceSection`, `ExperienceCard`, `RoleCollapsible`,
    `EducationSection`, `CertificationsSection`, `CertificationCategoryGroup`,
    `CertificationCard`, `SkillsSection`, `SkillCategoryCard`, `MobileCollapsibleSection`,
    `Portfolio` (orquestrador) (vide architect §3 #1-#12).
  - Orquestrador `Portfolio.tsx` ≤ 80 linhas, sem `useState`.
  - Cada filho ≤ 200 linhas.
  - Sem duplicação desktop/mobile (1 componente + Tailwind `md:*` ou `useIsMobile()` no orquestrador).

### `[ ]` T-FE-05 — Substituir modais inline do Header por Radix Dialog

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-03
- **Toca:** `frontend/src/components/header/{EmailModal,AvatarImageModal}.tsx`
- **Critério de pronto:**
  - Ambos usam `@radix-ui/react-dialog` via `ui/dialog.tsx`.
  - ESC fecha o modal.
  - Foco retorna ao botão trigger ao fechar.
  - `role="dialog"` e `aria-modal="true"` presentes (verificável via `getByRole`).
  - Resolve defeito CRITICAL do architect §7.

### `[ ]` T-FE-06 — Centralizar URLs sociais em `data/profile.ts`

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-03
- **Toca:** `frontend/src/data/profile.ts` (novo), `frontend/src/components/header/ContactStrip.tsx`, `frontend/src/pages/Index.tsx`
- **Critério de pronto:**
  - `data/profile.ts` exporta `{ linkedinUrl, githubUrl, email, cvDownloadUrl }` com
    valores **reais do operador**.
  - `ContactStrip` consome de `profile.ts`. Sem defaults `https://linkedin.com` ou
    `https://github.com`.
  - Props `linkedinUrl`/`githubUrl` removidas da assinatura do `Header` (ou tornadas
    obrigatórias se mantidas).
  - Resolve defeito CRITICAL do architect §7.

### `[ ]` T-FE-07 — Aplicar landmarks ARIA e acessibilidade

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-03, T-FE-04
- **Toca:** `frontend/src/components/portfolio/*`, `frontend/src/components/AppSidebar.tsx`,
  `frontend/src/pages/Index.tsx`
- **Critério de pronto:**
  - Cada `<section>` tem `aria-labelledby` apontando para seu `<h2>`.
  - `<nav aria-label="primary">` ao redor do sidebar.
  - `aria-current="location"` no link de sidebar correspondente à rota atual.
  - Smoke axe (`@axe-core/playwright`) na home não reporta violações `wcag2a`/`wcag2aa`.

### `[ ]` T-FE-08 — Tabela `routes.ts` centralizada

- **Agente:** `[software-engineer]`
- **Dep:** —
- **Toca:** `frontend/src/routes.ts` (novo), `frontend/src/App.tsx`, `frontend/src/components/AppSidebar.tsx`
- **Critério de pronto:**
  - `routes.ts` exporta lista tipada de rotas (`{ slug, path, labelKey }`).
  - `App.tsx` consome a lista para gerar `<Route>`.
  - `AppSidebar` consome a lista para gerar nav links.
  - Adicionar uma 4ª aba no futuro = adicionar 1 entrada em `routes.ts`.

### `[ ]` T-FE-09 — Extrair `ProjectTabPage` (layout genérico)

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-02, T-FE-08
- **Toca:** `frontend/src/pages/projects/ProjectTabPage.tsx` (novo)
- **Critério de pronto:**
  - `ProjectTabPage` recebe `{ slug, content }` e renderiza estrutura padrão (hero, seções,
    cta, seo) conforme architect §3 #20.
  - Aplicável às 3 abas P0 (`dadaia-workspace`, `tauan-games`, `portifolio`).

### `[ ]` T-FE-10 — Housekeeping (resíduo)

- **Agente:** `[software-engineer]`
- **Dep:** —
- **Toca:** `frontend/src/App.css`, `.flask.pid`, `scripts/.flask.pid`, `backend/setup.sh`,
  `backend/start_server.sh`, `z_prompts.md`, `README.md`, `.gitignore`, `AGENTS.md`
- **Critério de pronto:**
  - Arquivos vazios deletados (`backend/setup.sh`, `backend/start_server.sh`).
  - `.flask.pid` adicionados ao `.gitignore` e removidos do tree.
  - `App.css` deletado (não importado).
  - `z_prompts.md` deletado (vazio).
  - README atualizado: corrigir referências a `./devops/README.md` e `flask_server.py` →
    `stable_server.py`.
  - `AGENTS.md` ou commitado (se houver conteúdo planejado) ou removido.

---

## Fase 3 — Migração JSON + Conteúdo

### `[ ]` T-CONTENT-01 — Migrar `data/content/*.ts` → `*.json` (F-P0-06)

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-02, T-FE-03, T-FE-04
- **Toca:** `frontend/src/data/content/{pt,en,de}.json` (novos), `frontend/src/data/content/*.ts` (delete), `frontend/src/data/content/index.ts` (delete)
- **Critério de pronto:**
  - JSON files presentes com paridade de campos com os `.ts` originais.
  - `useContent()` carrega via dynamic import por idioma.
  - Lighthouse Performance ≥ 90 mantido (medido antes e depois).
  - Troca pt↔en funciona; troca para de também (com fallback em chaves novas).
  - F-P0-06 critérios A1-A8 atingidos.

### `[ ]` T-CONTENT-02 — Estrutura placeholder da aba `dadaia-workspace`

- **Agente:** `[software-engineer]`
- **Dep:** T-CONTENT-01, T-FE-09
- **Toca:** `frontend/src/data/content/{pt,en}.json` (campo `projects.dadaia-workspace`),
  `frontend/src/pages/projects/DadaiaWorkspacePage.tsx`
- **Critério de pronto:**
  - JSON shape conforme `specs/features/aba-dadaia-workspace/SPEC.md §4`.
  - Página renderiza com placeholders honestos ("Em construção — veja o repo: [link]")
    para campos não preenchidos pelo operador.
  - Critérios A1-A8 da spec atingidos.

### `[ ]` T-CONTENT-03 — Estrutura placeholder da aba `tauan-games`

- **Agente:** `[software-engineer]`
- **Dep:** T-CONTENT-01, T-FE-09
- **Toca:** `frontend/src/data/content/{pt,en}.json` (campo `projects.tauan-games`),
  `frontend/src/pages/projects/TauanGamesPage.tsx`, `frontend/public/assets/projects/tauan-games/*`
- **Critério de pronto:**
  - JSON shape conforme spec §4.
  - Pelo menos 2 cards renderizados (operador escolhe quais protótipos).
  - Imagens placeholder ≤ 200KB WebP em `public/assets/projects/tauan-games/`.
  - Critérios A1-A8.

### `[ ]` T-CONTENT-04 — Estrutura placeholder da aba `Arquitetura`

- **Agente:** `[software-engineer]`
- **Dep:** T-CONTENT-01, T-FE-09
- **Toca:** `frontend/src/data/content/{pt,en}.json` (campo `projects.portifolio`),
  `frontend/src/pages/projects/ArchitecturePage.tsx`, `frontend/public/assets/projects/portifolio/architecture.svg`
- **Critério de pronto:**
  - JSON shape conforme spec §4 (incluindo `costs`, `decisions`, `links`).
  - Diagrama SVG estático em `public/assets/projects/portifolio/architecture.svg`.
  - Critérios A1-A8.

### `[ ]` T-CONTENT-05 — Otimização de assets globais

- **Agente:** `[software-engineer]`
- **Dep:** T-CONTENT-02, T-CONTENT-03, T-CONTENT-04
- **Toca:** `frontend/public/assets/**`
- **Critério de pronto:**
  - Nenhum asset > 200KB (constitution §3.4).
  - PNGs convertidos para WebP onde aplicável.
  - SVGs minificados (`svgo` ou similar).
  - `<img loading="lazy">` em assets below-the-fold.

---

## Fase 4 — Quality gate

### `[ ]` T-QA-01 — Setup Vitest + Testing Library + jsdom

- **Agente:** `[qa-engineer]`
- **Dep:** T-FE-01
- **Toca:** `frontend/vitest.config.ts`, `frontend/src/test-setup.ts`, `frontend/package.json` (devDeps)
- **Critério de pronto:**
  - `vitest.config.ts` conforme qa §6.3.
  - `test-setup.ts` importa `@testing-library/jest-dom`.
  - `npm run test` passa (mesmo com 0 testes inicial).
  - Coverage exclui `src/components/ui/**`.

### `[ ]` T-QA-02 — Testes unit dos hooks (`useIsMobile`, `useContent`)

- **Agente:** `[qa-engineer]`
- **Dep:** T-QA-01, T-FE-02
- **Toca:** `frontend/src/hooks/use-mobile.test.tsx`, `frontend/src/hooks/useContent.test.ts`
- **Critério de pronto:**
  - 100% coverage em ambos os hooks.
  - Teste de fallback `de → en` em `useContent.test.ts` passa.

### `[ ]` T-QA-03 — Testes unit dos componentes extraídos com lógica

- **Agente:** `[qa-engineer]`
- **Dep:** T-QA-01, T-FE-03, T-FE-04
- **Toca:** `frontend/src/components/portfolio/*.test.tsx`, `frontend/src/components/header/*.test.tsx`
- **Critério de pronto:**
  - Cobertura ≥ 60% branches+statements nos seguintes: `RoleCollapsible`, `CertificationCard`,
    `MobileCollapsibleSection`, `LanguageSelector`, `Header`.
  - Testes de fechamento via ESC e foco-retorno nos modais (T-FE-05) presentes.

### `[ ]` T-QA-04 — Setup Playwright + estrutura de diretórios

- **Agente:** `[qa-engineer]`
- **Dep:** —
- **Toca:** `frontend/playwright.config.ts`, `frontend/tests/e2e/`, `frontend/package.json` (devDeps)
- **Critério de pronto:**
  - `playwright.config.ts` conforme qa §3.3 (5 projects: chromium, firefox, webkit, mobile-chrome, mobile-safari).
  - Estrutura de pastas criada (`pages/`, `fixtures/`, `setup/`).
  - `npx playwright test` roda (mesmo sem specs).

### `[ ]` T-QA-05 — Implementar E2E-01 a E2E-04 (home + i18n)

- **Agente:** `[qa-engineer]`
- **Dep:** T-QA-04, T-CONTENT-01
- **Toca:** `frontend/tests/e2e/pages/{home,language-switch}.spec.ts`, `frontend/tests/e2e/fixtures/routes.ts`
- **Critério de pronto:**
  - 4 cenários implementados e passando local.
  - E2E-04 valida fallback `de → en` (não `pt`).

### `[ ]` T-QA-06 — Implementar E2E-05 a E2E-07 (3 abas de projeto)

- **Agente:** `[qa-engineer]`
- **Dep:** T-QA-04, T-CONTENT-02, T-CONTENT-03, T-CONTENT-04
- **Toca:** `frontend/tests/e2e/pages/project-tabs.spec.ts`
- **Critério de pronto:**
  - 3 cenários implementados e passando.
  - Cada cenário verifica href + atributos de link externo (`target=_blank rel=noopener`).

### `[ ]` T-QA-07 — Implementar E2E-08 (404)

- **Agente:** `[qa-engineer]`
- **Dep:** T-QA-04
- **Toca:** `frontend/tests/e2e/pages/not-found.spec.ts`
- **Critério de pronto:** cenário passa local e em stage URL.

### `[ ]` T-QA-08 — Implementar E2E-09 (links externos seguros + URLs reais do operador)

- **Agente:** `[qa-engineer]`
- **Dep:** T-QA-04, T-FE-06
- **Toca:** `frontend/tests/e2e/pages/external-links.spec.ts`
- **Critério de pronto:**
  - Auditoria automatizada: nenhum `<a href="https://linkedin.com">` ou
    `<a href="https://github.com">` raiz; todos com path/perfil específico.
  - Todos os links `https://` com `target=_blank rel` contendo `noopener`.

### `[ ]` T-QA-09 — Implementar E2E-10 e E2E-11 (responsividade)

- **Agente:** `[qa-engineer]`
- **Dep:** T-QA-04, T-FE-04
- **Toca:** `frontend/tests/e2e/pages/responsive.spec.ts`
- **Critério de pronto:** sem overflow horizontal em 375×667 e 1280×800.

### `[ ]` T-QA-10 — Implementar E2E-13 (axe a11y) e E2E-15 (deep link)

- **Agente:** `[qa-engineer]`
- **Dep:** T-QA-04, T-FE-07
- **Toca:** `frontend/tests/e2e/pages/{a11y,deep-link}.spec.ts`
- **Critério de pronto:** axe sem violations `wcag2a`/`wcag2aa`; deep link funciona via
  CloudFront SPA fallback.

### `[ ]` T-QA-11 — Configurar Lighthouse CI (`lighthouserc.json`)

- **Agente:** `[qa-engineer]`
- **Dep:** T-CONTENT-04, T-FE-04
- **Toca:** `frontend/lighthouserc.json`
- **Critério de pronto:**
  - Budgets conforme qa §5.1 (vide spec quality-gate §5).
  - `npm run preview` + `lhci autorun` passa local.

### `[ ]` T-QA-12 — Wiring dos jobs `unit-tests`, `e2e`, `lighthouse` no `ci.yml`

- **Agente:** `[qa-engineer]` (com revisão `[devops-engineer]`)
- **Dep:** T-QA-01, T-QA-04, T-QA-11, T-DEVOPS-05
- **Toca:** `.github/workflows/ci.yml`
- **Critério de pronto:**
  - Stubs do T-DEVOPS-05 substituídos por jobs reais.
  - Job names exatos: `CI / Unit tests`, `CI / E2E`, `CI / Lighthouse`.
  - PR para `develop` mostra os 5 status checks (lint, build, unit-tests, e2e, lighthouse).

### `[ ]` T-QA-13 — Adicionar status checks às branch protections

- **Agente:** `[devops-engineer]` (operacional após T-QA-12 verde)
- **Dep:** T-QA-12, T-DEVOPS-07
- **Toca:** GitHub branch protection API (`main`, `develop`)
- **Critério de pronto:**
  - Required status checks em `main`: lint, build, unit-tests, e2e, lighthouse.
  - Em `develop`: mesmo conjunto; axe em warn-only se ainda houver pendência.

---

## Fase 5 — Prod infra + Go-live

### `[ ]` T-DEVOPS-10 — Importar bucket prod no terraform state — **via CI**

- **Agente:** `[devops-engineer]`
- **Dep:** T-DEVOPS-04, T-DEVOPS-08
- **Toca:** AWS (state `portifolio/prod/terraform.tfstate`) — execução **exclusivamente
  via workflow GitHub Actions** (`terraform.yml` job `terraform-prod-import` ou step
  dedicado dentro de `terraform-prod-apply`), assumindo a bootstrap role via OIDC.
  **Proibido** rodar `terraform import` localmente (foundation §10, security FR-S29).
- **Critério de pronto:**
  - Job CI executa `terraform import aws_s3_bucket.website portifolio-marco-menezes` com sucesso.
  - Job CI executa `terraform import aws_iam_openid_connect_provider.github <arn>` com sucesso.
  - Job CI seguinte `terraform-prod-plan` não pede recreate do bucket.

### `[ ]` T-DEVOPS-11 — `terraform apply` em prod — **via CI**

- **Agente:** `[devops-engineer]`
- **Dep:** T-DEVOPS-10
- **Toca:** AWS (prod env: ACM, CF, Route53 A/ALIAS, OAC, IAM role final) — execução
  **exclusivamente via workflow GitHub Actions** (`terraform.yml` job
  `terraform-prod-apply`), assumindo a bootstrap role via OIDC. Environment `production`
  exige aprovação manual do reviewer antes do step `apply`. **Proibido** rodar
  `terraform apply` localmente (foundation §10, security FR-S29).
- **Critério de pronto:**
  - Job `terraform-prod-apply` no GitHub Actions completa sem erros (após aprovação manual).
  - Orphan bucket policy (refer. `E25KHOW8T4PLO3`) substituída.
  - `curl -I https://marco-menezes.com` retorna 200 + HSTS.
  - Outputs: `cloudfront_distribution_id`, `github_actions_role_arn`.

### `[ ]` T-DEVOPS-12 — Atualizar secrets prod com role OIDC final

- **Agente:** `[devops-engineer]`
- **Dep:** T-DEVOPS-11
- **Toca:** GitHub secrets (env production) — executável **localmente** via `gh` CLI; usa
  GitHub token pessoal, **não** credencial AWS (não viola foundation §10 / FR-S29).
- **Critério de pronto:**
  - `AWS_ROLE_ARN`, `CLOUDFRONT_DISTRIBUTION_ID` atualizados com outputs do terraform prod.

### `[ ]` T-DEVOPS-13 — Deletar bootstrap IAM role — **via CI**

- **Agente:** `[devops-engineer]`
- **Dep:** T-DEVOPS-11, T-DEVOPS-12
- **Toca:** AWS IAM — execução **exclusivamente via workflow GitHub Actions** dedicado
  (workflow standalone `cleanup-bootstrap.yml` com `workflow_dispatch` ou job
  manual-trigger em `terraform.yml`), assumindo a role OIDC final
  `github-actions-portfolio-deploy`. **Proibido** rodar `aws iam delete-role` localmente
  (foundation §10, security FR-S29).
- **Critério de pronto:**
  - Job CI executa `aws iam detach-role-policy` + `aws iam delete-role --role-name github-actions-portfolio-bootstrap` com sucesso.
  - Job CI subsequente (ou step de verificação) confirma
    `aws iam list-roles --query 'Roles[?contains(RoleName, \`bootstrap\`)]'` retorna lista vazia.
  - Após cleanup, secrets `AWS_ROLE_ARN_STAGE` e `AWS_ROLE_ARN` apontam **exclusivamente**
    para a role OIDC final (não mais para a bootstrap role).

### `[ ]` T-DEVOPS-14 — Primeiro deploy automatizado (develop → main)

- **Agente:** `[devops-engineer]` (gatilho operador)
- **Dep:** T-QA-13, T-DEVOPS-12
- **Toca:** PR `develop → main`
- **Critério de pronto:**
  - PR aberto; 5 status checks verdes.
  - Reviewer aprova; merge.
  - `deploy.yml` job `deploy-prod` completa em ≤ 6 min.
  - CloudFront invalidation criada.

### `[ ]` T-QA-14 — Smoke E2E pós-deploy contra prod

- **Agente:** `[qa-engineer]`
- **Dep:** T-DEVOPS-14
- **Toca:** `.github/workflows/deploy.yml` (job `smoke-e2e`)
- **Critério de pronto:**
  - Job `smoke-e2e` (E2E-01, E2E-08, E2E-09) roda contra `https://marco-menezes.com` e passa.

### `[ ]` T-QA-15 — Validar Lighthouse em prod

- **Agente:** `[qa-engineer]`
- **Dep:** T-DEVOPS-14
- **Toca:** Lighthouse manual ou LHCI contra URL pública de prod (`https://marco-menezes.com`).
  Roda no navegador do operador ou em job CI; **não** consome credenciais AWS.
- **Critério de pronto:**
  - Performance ≥ 90, Accessibility ≥ 90, Best-Practices ≥ 95, SEO ≥ 90 em home + 3 abas
    (mobile e desktop).
  - Resultados registrados em `docs/lighthouse-go-live.json` (ou similar) **via PR para
    `develop`** — não via `aws s3 cp` para o bucket de prod (foundation §10 proíbe
    `aws s3 cp` local contra bucket de prod).

---

## Matriz de paralelismo (resumo)

| Janela | Tarefas paralelas |
|---|---|
| W0 (paralelo a T-DEVOPS-01) | T-DEVOPS-02a (script bootstrap) — pré-requisito de T-DEVOPS-02. T-DEVOPS-02a-fix (dual-mode) pode rodar em paralelo após T-DEVOPS-02a; não-bloqueante para T-DEVOPS-02 pois bootstrap já foi feito em 2026-05-14. |
| W1 (após T-DEVOPS-01 e T-DEVOPS-02a) | T-DEVOPS-02 (já `[x]`), T-DEVOPS-02a-fix, T-DEVOPS-04, T-DEVOPS-05, T-DEVOPS-06, T-FE-01, T-FE-08, T-FE-10, T-QA-04 |
| W2 (após T-DEVOPS-08, T-FE-01) | T-FE-02, T-DEVOPS-09, T-QA-01 |
| W3 (após T-FE-02) | T-FE-03, T-FE-04, T-QA-02 |
| W4 (após T-FE-03/04) | T-FE-05, T-FE-06, T-FE-07, T-FE-09, T-QA-03 |
| W5 (após T-FE-09 + T-FE-02) | T-CONTENT-01 → T-CONTENT-02/03/04 em paralelo → T-CONTENT-05 |
| W6 (após CONTENT + QA-04) | T-QA-05..T-QA-11 em paralelo |
| W7 | T-QA-12, T-QA-13 sequencial |
| W8 (Fase 5) | T-DEVOPS-10 → T-DEVOPS-11 → T-DEVOPS-12 → T-DEVOPS-13 → T-DEVOPS-14 → T-QA-14/15 |

## Próxima tarefa imediata

`T-DEVOPS-01` e `T-DEVOPS-02a` são portas de entrada paralelas — ambas sem dependências,
agente `devops-engineer`.

- `T-DEVOPS-01` cria a branch `develop` e cherry-picka commits OIDC.
- `T-DEVOPS-02a` cria `scripts/bootstrap-oidc.sh` versionado no repo (pré-requisito de
  rerun de T-DEVOPS-02 caso necessário; bootstrap em si já foi executado em 2026-05-14 via
  Fluxo B, registro em `specs/_archive/2026-05-14-bootstrap-notes.md`).
- `T-DEVOPS-02a-fix` atualiza o script para o modo dual (CloudShell + Infra Specialist
  local) — pode entrar em paralelo após T-DEVOPS-02a. Não-bloqueante.

Após a aprovação deste TASKS.md pelo operador, o ciclo de implementação inicia com o
`devops-engineer` pegando T-DEVOPS-01, T-DEVOPS-02a e T-DEVOPS-02a-fix em paralelo.
