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

## Currently in progress

Tracker em formato de lista para compat com `sdd-spec-gate.sh` (que procura `- [-]`).
Manter sincronizado com os markers `### \`[-]\`` espalhados pelas seções abaixo.

- [-] T-QA-14 — status checks nas branch protections (aplicar pós-merge deste PR)
- [-] T-FE-WAVE5 — content refresh + AI tooling matchers
- [-] T-FE-QUAL-01 — TypeScript hygiene: fix 13 erros de compilação + enable strict

---

## Fase 0 — Pre-bootstrap

### `[x]` T-DEVOPS-01 — Criar branch `develop` e cherry-pick `ci/oidc-pipelines-compliance`

- **Agente:** `[devops-engineer]`
- **Dep:** —
- **Toca:** Git (branches `main`, `develop`, `ci/oidc-pipelines-compliance`)
- **Estado em 2026-05-14:** consumado. Branch `develop` existe e contém todos os commits
  do trabalho OIDC (vide `fc2dea0` "replace static-key CI/CD with OIDC-based pipelines",
  `7994feb` "bootstrap-oidc.sh", `774596a` "restruturar terraform em modules/+envs/",
  `8ea05cd` "reescrever ci/deploy/terraform workflows", `62daa98` "CODEOWNERS",
  `586483f` "aprovar specs do Portfólio 2.0"). Branch fonte `ci/oidc-pipelines-compliance`
  já não existe local nem em `origin` — cherry-pick foi consumado direto em `develop`
  e a branch fonte foi descartada. Critério funcional satisfeito.
- **Critério de pronto:**
  - `git branch --list develop` retorna `develop`. ✅
  - `git log --oneline develop` contém commits OIDC originais (verificado via `fc2dea0`,
    `7994feb`, `774596a`, `8ea05cd`, `62daa98`). ✅
  - Branch `ci/oidc-pipelines-compliance` ausente local e remoto. ✅
  - PR `develop → main` é tarefa do go-live (T-DEVOPS-14), não pré-condição desta task.

### `[x]` T-DEVOPS-02a — Criar `scripts/bootstrap-oidc.sh` (versionado no repo)

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

### `[x]` T-DEVOPS-02a-fix — Atualizar `scripts/bootstrap-oidc.sh` para dual-mode (CloudShell + Infra Specialist local)

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

### `[x]` T-DEVOPS-03 — Configurar GitHub environments + secrets temporários

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

### `[x]` T-DEVOPS-04 — Restruturar `terraform/` em `modules/` + `envs/{stage,prod}/`

- **Agente:** `[devops-engineer]`
- **Dep:** T-DEVOPS-01
- **Toca:** `terraform/**`
- **Estado em 2026-05-14:** consumado. Commits `774596a` (restruturação inicial) e
  `867df32` (fix: OIDC provider via data source compartilhado). Estrutura presente em
  disco: `terraform/modules/portfolio-static-site/{main,variables,s3,s3_policies,cloudfront,acm,route53,iam,outputs,locals}.tf`
  + `terraform/envs/{stage,prod}/`.
- **Critério de pronto:**
  - Existem `terraform/modules/portfolio-static-site/{main,variables,s3,s3_policies,cloudfront,acm,route53,iam,outputs,locals}.tf`. ✅
  - Existem `terraform/envs/stage/` e `terraform/envs/prod/`. ✅
  - `terraform fmt -check -recursive` passa. ✅ (verificado por `774596a`)
  - `terraform validate` passa em ambos os envs. ✅ (verificado por `867df32`)
  - PR aberto para `develop`. ✅ (mergeado)

### `[x]` T-DEVOPS-05 — Reescrever `ci.yml`, `deploy.yml`, `terraform.yml`

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

### `[x]` T-DEVOPS-06 — Criar `.github/CODEOWNERS`

- **Agente:** `[devops-engineer]`
- **Dep:** —
- **Toca:** `.github/CODEOWNERS`
- **Estado em 2026-05-14:** consumado. Commit `62daa98` "chore(github): adicionar
  CODEOWNERS". Arquivo presente em `.github/CODEOWNERS` (717 bytes).
- **Critério de pronto:**
  - Arquivo presente com conteúdo de `specs/foundation/SPEC.md §2`. ✅

### `[x]` T-DEVOPS-07 — Aplicar branch protection em `main` e `develop`

- **Agente:** `[devops-engineer]`
- **Dep:** T-DEVOPS-01, T-DEVOPS-06
- **Toca:** GitHub branch protection API
- **Critério de pronto:**
  - `gh api repos/.../branches/main/protection` retorna config conforme
    `specs/security/SPEC.md FR-S11`.
  - Idem para `develop` (FR-S12).
  - `dadaia` regras documentadas em `foundation/SPEC.md §1` aplicadas.

### `[x]` T-DEVOPS-08 — `terraform apply` em stage (provisionar do zero) — **via CI**

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

### `[x]` T-DEVOPS-09 — Atualizar secrets stage com role OIDC final

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

### `[x]` T-FE-01 — Podagem shadcn + remoção de dependências órfãs

- **Agente:** `[software-engineer]`
- **Dep:** T-DEVOPS-01
- **Toca:** `frontend/src/components/ui/*`, `frontend/package.json`, `frontend/package-lock.json`
- **Estado em 2026-05-14:** consumado. Commit `24e5fdc` "podar shadcn e remover deps órfãs".
- **Critério de pronto:**
  - 37 arquivos `ui/*.tsx` listados em `specs/memory/tech-stack.md §2 REMOVE` deletados. ✅
  - `package.json` sem as 30+ deps órfãs (vide tech-stack §2). ✅
  - `dialog.tsx` (Radix Dialog) presente em `ui/` (ADICIONAR). ✅
  - `npm ci && npm run build` sucede. ✅
  - Snapshot de bundle: ≥ 100KB de redução registrada. ✅
  - PR aberto para `develop`. ✅ (mergeado)

### `[x]` T-FE-02 — Criar `useContent()` + `LanguageProvider` (DIP)

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-01
- **Toca:** `frontend/src/hooks/useContent.ts` (novo), `frontend/src/contexts/LanguageContext.tsx` (novo), `frontend/src/App.tsx`, `frontend/src/types/content.ts`
- **Estado em 2026-05-14:** consumado. Commit `6133112` "adicionar useContent + LanguageProvider".
- **Critério de pronto:**
  - `useContent()` exporta `{ content, label, language, setLanguage }`. ✅
  - Fallback hardcoded para `en` (não `pt`) — resolve conflito PE-08. ✅
  - `LanguageProvider` envolve `<App />` em `App.tsx`. ✅
  - Componentes existentes ainda compilam. ✅

### `[x]` T-FE-03 — Refator de `Header.tsx` (decomposição em 7 componentes)

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-01, T-FE-02
- **Toca:** `frontend/src/components/header/*` (novos), `frontend/src/components/Header.tsx` (delete ou wrapper)
- **Estado em 2026-05-14:** consumado. Commit `42a3496` "decompor Header.tsx em 7 componentes".
- **Critério de pronto:**
  - Criados: `HeaderShell`, `HeaderDesktopLayout`, `HeaderMobileLayout`, `LanguageSelector`,
    `ContactStrip`, `EmailModal`, `AvatarImageModal`. ✅
  - Orquestrador `Header.tsx` ≤ 80 linhas. ✅
  - Cada filho ≤ 250 linhas. ✅
  - `LanguageSelector` tipado (`SupportedLanguages = "pt" | "en" | "de"`). ✅

### `[x]` T-FE-04 — Refator de `Portfolio.tsx` (decomposição em 12 componentes)

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-01, T-FE-02
- **Toca:** `frontend/src/components/portfolio/*` (novos), `frontend/src/components/Portfolio.tsx`
- **Estado em 2026-05-14:** consumado. Commit `55cdd37` "decompor Portfolio.tsx em 12 componentes".
- **Critério de pronto:**
  - Criados os 12 componentes (vide architect §3 #1-#12). ✅
  - Orquestrador `Portfolio.tsx` ≤ 80 linhas, sem `useState`. ✅
  - Cada filho ≤ 200 linhas. ✅
  - Sem duplicação desktop/mobile. ✅

### `[x]` T-FE-05 — Substituir modais inline do Header por Radix Dialog

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-03
- **Toca:** `frontend/src/components/header/{EmailModal,AvatarImageModal}.tsx`
- **Critério de pronto:**
  - Ambos usam `@radix-ui/react-dialog` via `ui/dialog.tsx`.
  - ESC fecha o modal.
  - Foco retorna ao botão trigger ao fechar.
  - `role="dialog"` e `aria-modal="true"` presentes (verificável via `getByRole`).
  - Resolve defeito CRITICAL do architect §7.

### `[x]` T-FE-06 — Centralizar URLs sociais em `data/profile.ts`

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-03
- **Toca:** `frontend/src/data/profile.ts` (novo), `frontend/src/components/header/ContactStrip.tsx`, `frontend/src/pages/Index.tsx`
- **Estado em 2026-05-14:** consumado. Commit `5c044e1` "centralizar URLs sociais em data/profile.ts".
- **Critério de pronto:**
  - `data/profile.ts` exporta `{ linkedinUrl, githubUrl, email, cvDownloadUrl }`. ✅
  - `ContactStrip` consome de `profile.ts`. ✅
  - Defeito CRITICAL do architect §7 resolvido. ✅

### `[x]` T-FE-07 — Aplicar landmarks ARIA e acessibilidade

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-03, T-FE-04
- **Toca:** `frontend/src/components/portfolio/*`, `frontend/src/components/AppSidebar.tsx`,
  `frontend/src/pages/Index.tsx`
- **Estado em 2026-05-14:** consumado. Commit `5603269` "landmarks ARIA + roles em todas as seções".
- **Critério de pronto:**
  - Cada `<section>` tem `aria-labelledby` apontando para seu `<h2>`. ✅
  - `<nav aria-label="primary">` ao redor do sidebar. ✅
  - `aria-current="location"` no link de sidebar correspondente à rota atual. ✅
  - Smoke axe sem violations `wcag2a`/`wcag2aa`. ✅ (verificado por T-QA-10)

### `[x]` T-FE-08 — Tabela `routes.ts` centralizada

- **Agente:** `[software-engineer]`
- **Dep:** —
- **Toca:** `frontend/src/routes.ts` (novo), `frontend/src/App.tsx`, `frontend/src/components/AppSidebar.tsx`
- **Estado em 2026-05-14:** consumado. Commit `75dfcb7` "centralizar rotas em routes.ts".
- **Critério de pronto:**
  - `routes.ts` exporta lista tipada de rotas. ✅
  - `App.tsx` consome a lista para gerar `<Route>`. ✅
  - `AppSidebar` consome a lista para gerar nav links. ✅

### `[x]` T-FE-09 — Extrair `ProjectTabPage` (layout genérico)

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-02, T-FE-08
- **Toca:** `frontend/src/pages/projects/ProjectTabPage.tsx` (novo)
- **Estado em 2026-05-14:** consumado. Commit `586f5e3` "ProjectTabPage template genérico".
- **Critério de pronto:**
  - `ProjectTabPage` recebe `{ slug, content }` e renderiza estrutura padrão. ✅
  - Aplicável às 3 abas P0. ✅

### `[x]` T-FE-10 — Housekeeping (resíduo)

- **Agente:** `[software-engineer]`
- **Dep:** —
- **Toca:** `frontend/src/App.css`, `.flask.pid`, `scripts/.flask.pid`, `backend/setup.sh`,
  `backend/start_server.sh`, `z_prompts.md`, `README.md`, `.gitignore`, `AGENTS.md`
- **Estado em 2026-05-14:** consumado. Commit `ee1915a` "housekeeping de resíduos AS-IS".
- **Critério de pronto:**
  - Arquivos vazios deletados. ✅
  - `.flask.pid` ao `.gitignore` e removidos do tree. ✅
  - `App.css` deletado. ✅
  - `z_prompts.md` deletado. ✅
  - README atualizado. ✅
  - `AGENTS.md` ajustado. ✅

---

## Fase 3 — Migração JSON + Conteúdo

### `[x]` T-CONTENT-01 — Migrar `data/content/*.ts` → `*.json` (F-P0-06)

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-02, T-FE-03, T-FE-04
- **Toca:** `frontend/src/data/content/{pt,en,de}.json` (novos), `frontend/src/data/content/*.ts` (delete), `frontend/src/data/content/index.ts` (delete)
- **Estado em 2026-05-14:** consumado. Commit `d5f8532` "migrar content para JSON estático".
- **Critério de pronto:**
  - JSON files presentes com paridade de campos com os `.ts` originais. ✅
  - `useContent()` carrega via dynamic import por idioma. ✅
  - Lighthouse Performance ≥ 90 mantido. ✅
  - Troca pt↔en↔de funciona com fallback. ✅
  - F-P0-06 critérios A1-A8 atingidos. ✅

### `[x]` T-CONTENT-02 — Estrutura placeholder da aba `dadaia-workspace`

- **Agente:** `[software-engineer]`
- **Dep:** T-CONTENT-01, T-FE-09
- **Toca:** `frontend/src/data/content/{pt,en}.json` (campo `projects.dadaia-workspace`),
  `frontend/src/pages/projects/DadaiaWorkspacePage.tsx`
- **Estado em 2026-05-14:** consumado. Commit `f5eaf0a` "aba dadaia-workspace placeholder".
- **Critério de pronto:**
  - JSON shape conforme `specs/features/aba-dadaia-workspace/SPEC.md §4`. ✅
  - Página renderiza com placeholders honestos. ✅
  - Critérios A1-A8 da spec atingidos. ✅

### `[x]` T-CONTENT-03 — Estrutura placeholder da aba `tauan-games`

- **Agente:** `[software-engineer]`
- **Dep:** T-CONTENT-01, T-FE-09
- **Toca:** `frontend/src/data/content/{pt,en}.json` (campo `projects.tauan-games`),
  `frontend/src/pages/projects/TauanGamesPage.tsx`, `frontend/public/assets/projects/tauan-games/*`
- **Estado em 2026-05-14:** consumado. Commit `9ca7d41` "aba tauan-games placeholder".
- **Critério de pronto:**
  - JSON shape conforme spec §4. ✅
  - Pelo menos 2 cards renderizados. ✅
  - Imagens placeholder ≤ 200KB WebP. ✅
  - Critérios A1-A8. ✅

### `[x]` T-CONTENT-04 — Estrutura placeholder da aba `Arquitetura`

- **Agente:** `[software-engineer]`
- **Dep:** T-CONTENT-01, T-FE-09
- **Toca:** `frontend/src/data/content/{pt,en}.json` (campo `projects.portifolio`),
  `frontend/src/pages/projects/ArchitecturePage.tsx`, `frontend/public/assets/projects/portifolio/architecture.svg`
- **Estado em 2026-05-14:** consumado. Commit `c3a5f79` "aba arquitetura com conteúdo real".
- **Critério de pronto:**
  - JSON shape conforme spec §4 (incluindo `costs`, `decisions`, `links`). ✅
  - Diagrama SVG estático em `public/assets/projects/portifolio/architecture.svg`. ✅
  - Critérios A1-A8. ✅

### `[x]` T-CONTENT-06 — Refresh do conteúdo do LinkedIn nos 3 JSONs (EN→PT→DE) + cv.pdf

- **Agente:** `[software-engineer]`
- **Dep:** T-CONTENT-01 (`[x]`)
- **Toca:**
  - `frontend/src/data/content/{en,pt,de}.json` (fonte de verdade EN; overlays PT/DE
    seguem mesma ordem de arrays — `deepMergeWithFallback` substitui arrays inteiros)
  - `frontend/src/types/content.ts` (somente se um campo novo for necessário, ex.
    nova categoria de skills)
  - `frontend/src/data/profile.ts` (validar `linkedinUrl =
    https://www.linkedin.com/in/marco-menezes-731542b9`)
  - `frontend/public/cv.pdf` (substituir pelo `Profile (1).pdf` atual em
    `/home/marco/workspace/dadaia/Profile (1).pdf` — copiar sem espaço no destino)
  - `frontend/src/hooks/useContent.test.ts` (atualizar string asserts hardcoded de
    `header.title` e quaisquer outras que mudem)
- **Contexto:** o JSON atual contém 4 erros factuais graves (Trie como "Junior Data
  Engineer" em vez de "Data Analyst Jr"; UFOP como "Fire Labs/Scholarship Recipient" em
  vez de UFOP/Laboratory Assistant; ausência completa do Colégio Técnico Inconfidentes;
  summary defasado vs LinkedIn) e 1 omissão de skills (sem AI/LLM/Devin = Top Skills do
  LinkedIn). O PDF de origem é `Profile (1).pdf` exportado do LinkedIn em 2026-05.
- **Critério de pronto:**
  - **Paridade estrutural:** `cd frontend && jq 'paths(scalars)'
    src/data/content/en.json src/data/content/pt.json src/data/content/de.json | sort -u
    | uniq -c` — todos os paths aparecem 3x (sem desvio entre idiomas).
  - **5 entries de experience corretas (não 4):**
    1. `Santander Brasil — F1rst` (renomeado de "F1rst Digital Services") — 3 cargos
       com responsibilities reescritas (Senior Accounts&Fees+Finance+DB2↔Aurora; Mid
       Internal Systems+ADLS/KeyVault/ADF; Junior Finance+Hadoop/Spark+Data Master cash
       award).
    2. `Trie Engenharia` — cargo `Data Analyst Jr` (NÃO "Data Engineer"); período
       `11/2020-05/2021`; responsibilities Python/Lambda cement industry +
       JupyterLab extension Python+React/OpenFOAM.
    3. **NOVA:** `Colégio Técnico Inconfidentes Álvares Maciel`, Adjunct Instructor
       `04/2015–07/2018`, Ouro Preto MG, 5 disciplinas (CNC, Hidráulica/Pneumática
       FluidSIM, Desenho Técnico II AutoCAD, Computação básica, Matemática Aplicada
       Eletrotécnica).
    4. `Universidade Federal de Ouro Preto` (NÃO "Fire Labs"!) — cargo `Laboratory
       Assistant` (NÃO "Scholarship Recipient"); responsibilities hardware
       controle/eletrônica + firmware C embarcado + forno a gás.
    5. `Analógica Instrumentação e Controle` — Summer Intern `01-02/2015`;
       responsibilities Raspberry Pi + TLS-300 + Python p/ inventory de postos.
  - **Skills:** nova categoria `"AI / Modern Tooling"` com `["AI", "LLM", "Devin"]`;
    `Languages` com 3 idiomas (`Portuguese (Native)`, `English (Native or Bilingual)`,
    `German (Full Professional)`); programming languages com antiguidade narrativa
    (Python 10+/SQL 5+/Shell 5+/Scala 2+); `Control-M` em on-prem; `Jira, ServiceNow`
    em DevOps.
  - **Certifications:** adicionar `AWS Certified AI Practitioner` (categoria AWS) +
    `Curso de Alemão Nível B1` (categoria Languages); revisar `validity` de Azure DP-203
    (vencida em Mar 2025); manter as outras 9.
  - **Header/Resume:** `header.title = "Data Engineer | Big Data | Azure | AWS |
    Databricks"`; `resume.short` e `resume.full` reescritos a partir do Summary do PDF
    (5 anos profissional, Cloudera on-prem, migração Azure+Databricks medallion,
    streaming DB2→Aurora via Kafka/MSK CDC, DevOps tooling Git/Jenkins/GHA/Jira/
    ServiceNow/Docker, Python 10+/SQL 5+/Shell 5+/Scala 2+, formação em Control &
    Automation/Mechatronics).
  - **Education:** UFOP mantida; `degree` expandido para `"Bachelor of Control and
    Automation / Mechatronics Engineering"` (alinha com Summary).
  - **3 idiomas alternados** no `npm run dev` (Header → seletor) sem fallback EN
    inadvertido em PT/DE.
  - **`useContent.test.ts` asserts atualizados** — `npm run test -- useContent` verde.
  - **`frontend/public/cv.pdf` substituído** pelo `Profile (1).pdf` atual; após deploy
    `curl -sI https://stage.marco-menezes.com/cv.pdf | head -1` retorna `200`.
  - PR único para `develop` (conteúdo + testes na mesma janela atômica).

### `[x]` T-CONTENT-05 — Otimização de assets globais

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

### `[x]` T-QA-01 — Setup Vitest + Testing Library + jsdom

- **Agente:** `[qa-engineer]`
- **Dep:** T-FE-01
- **Toca:** `frontend/vitest.config.ts`, `frontend/src/test-setup.ts`, `frontend/package.json` (devDeps)
- **Estado em 2026-05-14:** consumado. Commit `782292a` "setup Vitest + Testing Library + jsdom".
- **Critério de pronto:**
  - `vitest.config.ts` conforme qa §6.3. ✅
  - `test-setup.ts` importa `@testing-library/jest-dom`. ✅
  - `npm run test` passa. ✅
  - Coverage exclui `src/components/ui/**`. ✅

### `[x]` T-QA-02 — Testes unit dos hooks (`useIsMobile`, `useContent`)

- **Agente:** `[qa-engineer]`
- **Dep:** T-QA-01, T-FE-02
- **Toca:** `frontend/src/hooks/use-mobile.test.tsx`, `frontend/src/hooks/useContent.test.ts`
- **Estado em 2026-05-14:** consumado. Commit `38f8aed` "unit tests dos hooks useContent + useIsMobile".
- **Critério de pronto:**
  - 100% coverage em ambos os hooks. ✅
  - Teste de fallback `de → en` em `useContent.test.ts` passa. ✅

### `[x]` T-QA-03 — Testes unit dos componentes extraídos com lógica

- **Agente:** `[qa-engineer]`
- **Dep:** T-QA-01, T-FE-03, T-FE-04
- **Toca:** `frontend/src/components/portfolio/*.test.tsx`, `frontend/src/components/header/*.test.tsx`
- **Estado em 2026-05-14:** consumado. Commit `cadea36` "unit tests dos componentes Header e Portfolio extraídos".
- **Critério de pronto:**
  - Cobertura ≥ 60% branches+statements nos componentes alvo. ✅
  - Testes de fechamento via ESC e foco-retorno nos modais — bloqueado por T-FE-05;
    cobre apenas o esperado para os componentes hoje em árvore.

### `[x]` T-QA-04 — Setup Playwright + estrutura de diretórios

- **Agente:** `[qa-engineer]`
- **Dep:** —
- **Toca:** `frontend/playwright.config.ts`, `frontend/tests/e2e/`, `frontend/package.json` (devDeps)
- **Estado em 2026-05-14:** consumado. Commit `b07f5ce` "setup Playwright + estrutura tests/e2e/".
- **Critério de pronto:**
  - `playwright.config.ts` conforme qa §3.3 (5 projects). ✅
  - Estrutura de pastas criada (`pages/`, `fixtures/`, `setup/`). ✅
  - `npx playwright test` roda. ✅

### `[x]` T-QA-05 — Implementar E2E-01 a E2E-04 (home + i18n)

- **Agente:** `[qa-engineer]`
- **Dep:** T-QA-04, T-CONTENT-01
- **Toca:** `frontend/tests/e2e/pages/{home,language-switch}.spec.ts`, `frontend/tests/e2e/fixtures/routes.ts`
- **Estado em 2026-05-14:** consumado. Commit `2d70fa8` "E2E home + i18n + fallback de→en".
- **Critério de pronto:**
  - 4 cenários implementados e passando local. ✅
  - E2E-04 valida fallback `de → en`. ✅

### `[x]` T-QA-06 — Implementar E2E-05 a E2E-07 (3 abas de projeto)

- **Agente:** `[qa-engineer]`
- **Dep:** T-QA-04, T-CONTENT-02, T-CONTENT-03, T-CONTENT-04
- **Toca:** `frontend/tests/e2e/pages/project-tabs.spec.ts`
- **Estado em 2026-05-14:** consumado. Commit `ae75fc5` "E2E 3 abas de projeto".
- **Critério de pronto:**
  - 3 cenários implementados e passando. ✅
  - Cada cenário verifica href + atributos de link externo. ✅

### `[x]` T-QA-07 — Implementar E2E-08 (404)

- **Agente:** `[qa-engineer]`
- **Dep:** T-QA-04
- **Toca:** `frontend/tests/e2e/pages/not-found.spec.ts`
- **Estado em 2026-05-14:** consumado. Commit bundled `db93922` "E2E 404 + links seguros + responsivo + a11y + deep link".
- **Critério de pronto:** cenário passa local. ✅ (gate temporariamente non-blocking — vide T-QA-13)

### `[x]` T-QA-08 — Implementar E2E-09 (links externos seguros + URLs reais do operador)

- **Agente:** `[qa-engineer]`
- **Dep:** T-QA-04, T-FE-06
- **Toca:** `frontend/tests/e2e/pages/external-links.spec.ts`
- **Estado em 2026-05-14:** consumado. Commit bundled `db93922`.
- **Critério de pronto:**
  - Auditoria automatizada: nenhum `<a href="https://linkedin.com">` raiz. ✅
  - Todos os links `https://` com `target=_blank rel` contendo `noopener`. ✅

### `[x]` T-QA-09 — Implementar E2E-10 e E2E-11 (responsividade)

- **Agente:** `[qa-engineer]`
- **Dep:** T-QA-04, T-FE-04
- **Toca:** `frontend/tests/e2e/pages/responsive.spec.ts`
- **Estado em 2026-05-14:** consumado. Commit bundled `db93922`. Tech debt de seletores
  rastreado em T-QA-13.

### `[x]` T-QA-10 — Implementar E2E-13 (axe a11y) e E2E-15 (deep link)

- **Agente:** `[qa-engineer]`
- **Dep:** T-QA-04, T-FE-07
- **Toca:** `frontend/tests/e2e/pages/{a11y,deep-link}.spec.ts`
- **Estado em 2026-05-14:** consumado. Commit bundled `db93922`. Tech debt de seletores
  rastreado em T-QA-13.

### `[x]` T-QA-11 — Configurar Lighthouse CI (`lighthouserc.json`)

- **Agente:** `[qa-engineer]`
- **Dep:** T-CONTENT-04, T-FE-04
- **Toca:** `frontend/lighthouserc.json`
- **Estado em 2026-05-14:** consumado. Commit `b551802` "Lighthouse CI config + budgets P0".
  Budgets temporariamente relaxados (perf/seo 0.9→0.85, 404 0.85→0.7) por `b94b8d0` —
  recalibração rastreada em T-QA-13.

### `[x]` T-QA-12 — Wiring dos jobs `unit-tests`, `e2e`, `lighthouse` no `ci.yml`

- **Agente:** `[qa-engineer]` (com revisão `[devops-engineer]`)
- **Dep:** T-QA-01, T-QA-04, T-QA-11, T-DEVOPS-05
- **Toca:** `.github/workflows/ci.yml`
- **Estado em 2026-05-14:** consumado. Commit `1677847` "wire jobs reais para
  unit-tests/e2e/lighthouse". Jobs `e2e` e `lighthouse` estão `continue-on-error: true`
  desde `b94b8d0` para destrabar primeiro go-live — fechamento desse débito é T-QA-13.

### `[x]` T-QA-13 — Reativar gates Lighthouse + E2E (fechar tech debt b94b8d0)

- **Agente:** `[qa-engineer]`
- **Dep:** T-DEVOPS-08 (precisa de URL stage real para calibrar Lighthouse)
- **Toca:** `.github/workflows/ci.yml`, `frontend/lighthouserc.json`,
  `frontend/tests/e2e/pages/{a11y,responsive,deep-link}.spec.ts`
- **Contexto:** commit `b94b8d0` introduziu `continue-on-error: true` nos jobs `e2e` e
  `lighthouse` para destrabar o primeiro go-live. Gates ficaram não-bloqueantes — qualquer
  feature P1 pode regredir performance/a11y sem CI sinalizar. Esse débito precisa ser
  fechado antes de qualquer trabalho P1.
- **Critério de pronto:**
  - Remover `continue-on-error: true` dos jobs `CI / E2E` e `CI / Lighthouse` no `ci.yml`
    (linhas adicionadas em `b94b8d0`); ambos voltam a bloquear merge.
  - Ajustar seletores em `a11y.spec.ts`, `responsive.spec.ts`, `deep-link.spec.ts` para
    bater com o DOM real renderizado (asserções hoje quebram contra build atual).
  - Recalibrar `lighthouserc.json` contra perf real do CloudFront stage; subir budgets
    para os alvos originais documentados em `quality-gate/SPEC.md`: perf/seo 0.85 → 0.9
    e 404 0.7 → 0.85.
  - Lighthouse rodado ≥ 3x em CI (warm-up + amostragem) antes de bloquear, para evitar
    flakiness atribuível a cold-start de runner.
  - PR para `develop` com os 3 pontos acima; CI verde com gates ativos.
- **Justificativa:** regressão temporária introduzida em `b94b8d0`; o repo não pode
  entrar em fase P1 com gates de qualidade desativados.

### `[-]` T-QA-14 — Adicionar status checks às branch protections

- **Agente:** `[devops-engineer]` (operacional após T-QA-13 verde)
- **Dep:** T-QA-13, T-DEVOPS-07
- **Toca:** GitHub branch protection API (`main`, `develop`)
- **Critério de pronto:**
  - Required status checks em `main`: lint, build, unit-tests, e2e, lighthouse.
  - Em `develop`: mesmo conjunto.
- **Nota:** renumerada do antigo T-QA-13 para abrir espaço a T-QA-13 (reativação de
  gates). Conteúdo idêntico ao original.

---

## Fase 2b — Qualidade Frontend (frontend-engineer)

> Origem: rodada de revisão profunda (software-architect + frontend-engineer) em
> 2026-05-16. Reports:
> `.dadaia/reports/portifolio/software-architect/2026-05-16T030500Z-frontend-audit.html`
> e `.dadaia/reports/portifolio/frontend-engineer/2026-05-16T031944Z-consensus-positions.md`.
> Consenso entre os dois agentes em 5 dos 7 pontos; `[product-engineer]` decidiu os 2
> pontos restantes (D1 e D2 abaixo).

### Decisões do product-engineer (2026-05-16)

**D1 — sidebar.tsx replacement como pré-requisito de T-FE-PROJ-02 (bloqueante).**
Justificativa: ambos os agentes convergiram para HIGH em Q1. T-FE-PROJ-02 adiciona
`/projetos` ao `routes.ts` e o `AppSidebar` consome essa lista. Estender uma nav
construída sobre 761 LOC de `ui/sidebar.tsx` (Radix Sheet + 6 ui/ shadow files)
para depois substituir o primitivo seria retrabalho garantido. Substituir AGORA
significa adicionar a entrada `/projetos` em uma `<nav>` Tailwind de ~30 LOC ao
invés de em vendor code. Custo: ~3h hoje vs. risco de extender a primitiva
inflada e ter que refazer depois. T-FE-PROJ-02 ganha dependência explícita de
T-FE-QUAL-03 (atualizada acima).

**D2 — Bridges Header.tsx/Portfolio.tsx no sprint atual, mesmo PR de T-FE-QUAL-01.**
Justificativa: architect rateou HIGH (cognitive overhead, build-on-stale risk),
FE rateou MEDIUM mas recomendou incluir no sprint pelo baixo esforço. Custo de
~30 min é trivial e está diretamente relacionado a T-FE-QUAL-01 (ao deletar
`use-toast.ts` e consertar imports já se está mexendo na mesma camada). Marcar
como independente (`Dep: —`) para permitir bundling no mesmo PR de T-FE-QUAL-01
sem violar contrato de tasks atômicas; se forem PRs separados, qualquer ordem
funciona.

> Tasks abaixo: T-FE-QUAL-01 a T-FE-QUAL-10. Owner padrão: `frontend-engineer`.
> `qa-engineer` pareia em PR review (Axe + tipos + smoke).

### `[-]` T-FE-QUAL-01 — TypeScript hygiene: fix 13 erros de compilação + enable strict

- **Agente:** `[frontend-engineer]`
- **Dep:** —
- **Toca:**
  - `frontend/tsconfig.app.json` — habilitar `"strict": true`
  - `frontend/src/hooks/use-toast.ts` — **DELETAR** (192 linhas mortas, import quebrado,
    nenhum consumidor)
  - `frontend/src/hooks/useContent.ts` — corrigir 2 unsafe casts (lines 45-46)
  - `frontend/src/test-setup.ts` — limpar diretivas e mocks staleados
  - `frontend/src/**/*.test.tsx` que envolvem `LanguageProvider` — adicionar `children`
    prop missing nos render helpers
  - Arquivos de teste com `@ts-expect-error` stale (notadamente
    `frontend/src/hooks/useInView.test.tsx`) — remover diretivas que suprimem erros
    inexistentes
  - `.github/workflows/ci.yml` — adicionar job `typecheck` (`npx tsc --noEmit -p
    tsconfig.app.json`) como gate de merge
- **Contexto:** software-architect e frontend-engineer alinharam CRITICAL em Q6.
  FE rodou `tsc --noEmit --strict` empiricamente e confirmou que strict adiciona
  apenas ~3 erros novos em código de produção (vs. estimativa do architect de 30-80).
  A maior parte dos 13 erros existentes está em test files. Sequência: fix dos 13
  primeiro, depois enable strict, depois CI gate — evita misturar erros novos com
  legados no mesmo diff de review.
- **Critério de pronto:**
  - `cd frontend && npx tsc --noEmit -p tsconfig.app.json` retorna 0 erros
  - `frontend/src/hooks/use-toast.ts` deletado; `git status` confirma remoção
  - `frontend/tsconfig.app.json` contém `"strict": true`
  - `cd frontend && npm run build` passa sem warnings de tipo
  - Job `typecheck` adicionado a `.github/workflows/ci.yml` e bloqueia merge em
    caso de erro de tipo
  - PR isolado para `develop`; QA pareia em review (verifica que o gate trava)

### `[ ]` T-FE-QUAL-02 — Bridge collapse: Header.tsx e Portfolio.tsx

- **Agente:** `[frontend-engineer]`
- **Dep:** — (pode ser bundled no mesmo PR de T-FE-QUAL-01 por decisão D2; ou rodar
  como PR separado em qualquer ordem)
- **Toca:**
  - `frontend/src/components/Header.tsx` — reduzir a thin re-export de
    `components/header/HeaderShell` (ou inline do wrapper `<header className="fixed...">`
    em `HeaderShell` e deletar o arquivo)
  - `frontend/src/components/Portfolio.tsx` — **DELETAR** (8 linhas de re-export
    com `language` prop ignorada)
  - `frontend/src/pages/Index.tsx` — atualizar imports para apontar diretamente para
    `components/portfolio/Portfolio` e `components/header/HeaderShell`
- **Contexto:** Q2 do consensus report. `Header.tsx` (69 linhas) tem
  `DISPLAY_TO_LOCALE`/`LOCALE_TO_DISPLAY` + `isLegacy` branch que serve uma prop
  `language="Português"` que `Index.tsx:10` nunca passa (`<Header />` sem props).
  Bridge é fóssil de migração concluída. Architect: HIGH (build-on-stale).
  FE: MEDIUM (sem bug ativo). PE D2: incluir no sprint, baixo esforço (~30 min).
- **Critério de pronto:**
  - `frontend/src/components/Portfolio.tsx` deletado; `Index.tsx` importa
    diretamente de `components/portfolio/Portfolio`
  - `frontend/src/components/Header.tsx` reduzido a thin re-export de
    `components/header/HeaderShell` (ou removido se o wrapper `<header>` for
    inlined em `HeaderShell`)
  - Lógica `DISPLAY_TO_LOCALE`, `LOCALE_TO_DISPLAY`, `isLegacy` removida
    completamente do repo (`grep -rn 'DISPLAY_TO_LOCALE\|LOCALE_TO_DISPLAY\|isLegacy'
    frontend/src/` retorna vazio)
  - `cd frontend && npx tsc --noEmit` continua 0 erros após a mudança
  - `cd frontend && npm run build` verde; smoke E2E `home.spec.ts` passa
  - PR isolado (ou bundled com T-FE-QUAL-01) para `develop`

### `[ ]` T-FE-QUAL-03 — sidebar.tsx replacement: substituir AppSidebar por nav Tailwind nativa

- **Agente:** `[frontend-engineer]`
- **Dep:** T-FE-QUAL-01 (precisa de typecheck limpo + strict ligado para garantir
  que nenhum consumidor escondido de `ui/sidebar.tsx` quebre em silêncio)
- **Toca:**
  - `frontend/src/components/ui/sidebar.tsx` — **DELETAR** (761 LOC vendor; apenas
    8 dos ~26 exports são consumidos)
  - `frontend/src/components/AppSidebar.tsx` — REWRITE como `<nav>` Tailwind nativa
    (~30 LOC); consome `routes.ts`; mantém `aria-label="primary"`,
    `aria-current="location"` (preserva critério de T-FE-07)
  - `frontend/src/components/ui/{sheet,input,skeleton,separator,label}.tsx` —
    **DELETAR** se `grep -rn 'from "@/components/ui/<arquivo>"' frontend/src`
    confirmar zero consumidores fora de `ui/sidebar.tsx`
  - `frontend/src/App.tsx` — remover `SidebarProvider` wrap (e qualquer hook
    `useSidebar` correspondente em outros consumidores)
  - `frontend/package.json` — remover Radix runtime deps que ficarem órfãs
    (`@radix-ui/react-separator`, `@radix-ui/react-label` e Sheet/Tooltip/Skeleton
    que só sobreviviam pela `ui/sidebar.tsx`); validar com `npm ls` antes
- **Contexto:** Q1 do consensus report. Ambos os agentes convergiram em HIGH.
  FE empiricamente confirmou que `sheet.tsx`, `tooltip.tsx`, `skeleton.tsx` são
  importados unconditionally no topo de `sidebar.tsx` (lines 6-18) — esbuild
  module-level tree-shaking não remove. Decisão D1 do PE: bloqueante de
  T-FE-PROJ-02 (a nav `/projetos` deve ser adicionada na shape limpa).
- **Critério de pronto:**
  - `frontend/src/components/AppSidebar.tsx` reescrito como `<nav>` Tailwind
    sem importar `ui/sidebar.tsx`; ≤ 50 LOC
  - `frontend/src/components/ui/sidebar.tsx` deletado (`git status` confirma)
  - Dependências órfãs removidas de `frontend/package.json` quando `npm ls`
    confirmar zero consumidores; documentar no PR description quais foram
    removidas e quais foram mantidas (e por quê)
  - Visual/layout preservado (sidebar collapsível ou fixo conforme design atual);
    QA valida em review
  - Landmarks ARIA preservados: `<nav aria-label="primary">` + `aria-current="location"`
    no link da rota ativa (não regredir T-FE-07)
  - `cd frontend && npm run build` passa
  - **Bundle delta:** ≥ 100KB de redução minified vs. baseline (registrar
    snapshot antes/depois no PR description)
  - `cd frontend && npm run test:run` verde; E2E `home.spec.ts` verde (sidebar
    nav continua funcionando)
  - PR isolado para `develop`; QA pareia em review

### `[ ]` T-FE-QUAL-04 — Project layout shell: ProjectLayoutShell para `/projetos/*`

- **Agente:** `[frontend-engineer]`
- **Dep:** T-FE-QUAL-03 (AppSidebar precisa estar limpo antes de extrair shell;
  evita layering de shell sobre primitiva inflada)
- **Toca:**
  - `frontend/src/components/layout/ProjectLayoutShell.tsx` — NOVO; encapsula
    Header (com `LanguageSelector` + `ThemeToggle`), link "← Voltar para Home" e
    `<main>` com `<Outlet />` para conteúdo da página filha
  - `frontend/src/App.tsx` — wrapping das rotas `/projetos/*` dentro de
    `<Route element={<ProjectLayoutShell />}>...</Route>`
  - `frontend/src/data/content/{pt,en,de}.json` — chave nova
    `nav.backToHome` (PT: "Voltar para Home"; EN: "Back to Home";
    DE: "Zurück zur Startseite")
- **Contexto:** project pages atualmente perdem language selector e theme
  toggle (não compartilham Header). Shell unifica Header + back-link + main
  para todas as rotas `/projetos/*`. Pré-requisito de T-FE-QUAL-05 (que
  unifica os 3 templates de project page no shell).
- **Critério de pronto:**
  - `ProjectLayoutShell` renderiza Header completo (LanguageSelector +
    ThemeToggle) + link "← Voltar para Home" (router-link, não anchor) + `<main>`
    com `<Outlet />`
  - Todas as rotas `/projetos/*` (incluindo `/projetos`, `/projetos/<slug>`)
    renderizam dentro de `ProjectLayoutShell`
  - Navegação de volta funciona em todos os project pages (clique no link
    leva a `/` via SPA, sem reload)
  - LanguageSelector e ThemeToggle visíveis e funcionais nas project pages;
    troca de idioma persiste ao navegar de volta para `/`
  - E2E novo (ou estendido em E2E existente): navegar de `/` para
    `/projetos/dadaia-workspace` e de volta para `/` funciona; LanguageSelector
    visível em cada step
  - Paridade i18n confirmada: `nav.backToHome` nos 3 JSONs
  - `cd frontend && npm run test:run` verde; `npm run build` verde
  - PR isolado para `develop`; QA pareia em review (3 viewports)

### `[ ]` T-FE-QUAL-05 — ProjectTabPage unification: migrar TauanGamesPage e ArchitecturePage

- **Agente:** `[frontend-engineer]`
- **Dep:** T-FE-QUAL-04
- **Toca:**
  - `frontend/src/pages/projects/ProjectTabPage.tsx` — estender
    `ProjectSection` type com `"grid"` (game cards) e `"table"` (cost table);
    remover JSX ad-hoc embutido se houver
  - `frontend/src/pages/projects/TauanGamesPage.tsx` — REWRITE para compor via
    `ProjectTabPage` (sem JSX ad-hoc); estrutura de jogos em
    `frontend/src/data/content/{pt,en,de}.json` (já existe em `projects.tauan-games`)
  - `frontend/src/pages/projects/ArchitecturePage.tsx` — REWRITE para compor via
    `ProjectTabPage`; seções de costs/decisions/links via tipos `"table"`/`"grid"`
- **Contexto:** atualmente as 3 project pages divergem: `DadaiaWorkspacePage`
  usa `ProjectTabPage` corretamente, mas `TauanGamesPage` e `ArchitecturePage`
  têm JSX ad-hoc duplicando layout/heading/spacing. Unificar via tipos extras
  do `ProjectSection` evita drift visual entre páginas e simplifica
  `T-FE-PROJ-04` (templates per-kind dispatch) — embora T-FE-PROJ-04 vá
  substituir tudo eventualmente, esta unificação intermediária reduz risco
  do refator final.
- **Critério de pronto:**
  - `ProjectSection` type extendido com `"grid"` e `"table"` (verificável em
    `frontend/src/types/content.ts` ou onde quer que viva)
  - `TauanGamesPage` e `ArchitecturePage` compostos via `ProjectTabPage`
    (sem JSX ad-hoc específico de página); estrutura de dados em JSON
    content, não hardcoded em JSX
  - `DadaiaWorkspacePage` continua funcionando sem regressão
  - `cd frontend && npm run test:run` verde; `npm run build` verde
  - E2E `project-tabs.spec.ts` continua verde para os 3 slugs
  - Inspeção visual: layout/heading/spacing das 3 abas idênticos
  - PR isolado para `develop`; QA pareia em review (3 viewports)

### `[ ]` T-FE-QUAL-06 — i18n debt: externalizar ~28 strings hardcoded

- **Agente:** `[frontend-engineer]`
- **Dep:** T-FE-QUAL-01 (strict mode facilita detectar strings não tipadas
  via `noUnusedParameters` e tipo de `useContent()` retorno)
- **Toca:**
  - `frontend/src/components/portfolio/ExperienceCard.tsx:87-88` — "Progressão de
    carreira", "cargo", "cargos" (3 strings)
  - `frontend/src/components/portfolio/CertificationCard.tsx:83,94` —
    "Ver mais"/"Ver menos" (2; chaves existem em ContentData), "Emissor:" (1)
  - `frontend/src/components/portfolio/CertificationCategoryGroup.tsx:60` —
    "certificado/s" pluralization
  - `frontend/src/components/header/EmailModal.tsx:42,64` — "Contato por Email"
    (1), "Enviar Email" (1)
  - `frontend/src/components/header/HeaderDesktopLayout.tsx:34` — "Ver maior"
  - `frontend/src/components/header/HeaderMobileLayout.tsx:48` — "Ver maior"
  - `frontend/src/components/header/AvatarImageModal.tsx:24` — "Foto de ${name}"
    (sr-only, mas ainda assim wrong locale)
  - `frontend/src/components/header/HeaderDesktopLayout.tsx:30` e
    `HeaderMobileLayout.tsx:44` — "Foto de ${name}"
  - `frontend/src/pages/projects/ArchitecturePage.tsx` — 12 strings: "Infrastructure
    Diagram" (l.91), "Tech Stack" (l.114), "Layer"/"Technology" (l.121-126),
    "Monthly Costs" (l.154), "Service"/"USD / month" (l.162-165), "Architectural
    Decisions" (l.194), "Links" (l.225), "GitHub Repository"/"Terraform"/"Specs"
    (l.237,245,253)
  - `frontend/src/pages/projects/TauanGamesPage.tsx:132,134` — "Em construcao",
    "Os jogos serao listados..."
  - `frontend/src/pages/projects/ProjectTabPage.tsx:200,206-207` —
    "Em construcao", "O conteudo..."
  - `frontend/src/pages/NotFound.tsx` — "Oops! Page not found", "Return to Home"
  - `frontend/src/data/content/{pt,en,de}.json` — adicionar todas as chaves
    novas correspondentes
  - `frontend/src/types/content.ts` — estender tipos para refletir chaves novas
- **Contexto:** Q3 do consensus report. Architect contou ~20, FE recontou e
  achou ~28; lista canônica acima é o resultado da reconciliação. MEDIUM
  systematic gap. Esta task pode ser feita em paralelo com T-FE-QUAL-04/05
  (toca arquivos diferentes), mas a coordenação de PR fica mais simples se
  for feita após T-FE-QUAL-05 (que mexe em ArchitecturePage e TauanGamesPage).
- **Critério de pronto:**
  - Toda string user-visible da lista acima passa por `useContent()` ou chave de
    content JSON; `grep -rn '"Em construcao"\|"Os jogos serao\|"Foto de\|"Ver
    maior"\|"Progressão de carreira"\|"Emissor:"\|"Oops! Page not found"\|"Return
    to Home"' frontend/src/` retorna apenas matches em `data/content/*.json`
  - Novo conteúdo adicionado em `pt`, `en` (obrigatório); `de` opcional com
    fallback `en` (regra existente do `useContent`)
  - Tipos em `frontend/src/types/content.ts` estendidos
  - Paridade estrutural i18n: `jq 'paths(scalars)' src/data/content/{en,pt,de}.json
    | sort -u | uniq -c` — todos os paths novos aparecem 3x (em `pt` obrigatório;
    `de` opcional com fallback é aceitável)
  - `cd frontend && npm run build` e `npx tsc --noEmit` passam sem novos erros
  - `cd frontend && npm run test:run` verde
  - E2E `language-switch.spec.ts` continua verde após adapt das asserts
  - PR isolado para `develop`; QA pareia em review

### `[ ]` T-FE-QUAL-07 — Language persistence: localStorage em LanguageProvider

- **Agente:** `[frontend-engineer]`
- **Dep:** —
- **Toca:**
  - `frontend/src/contexts/LanguageContext.tsx` (ou onde `LanguageProvider`
    vive) — `setLanguage` escreve em `localStorage["lang"]`; `useState`
    initializer lê de `localStorage["lang"]` com fallback `"pt"`
  - `frontend/src/contexts/LanguageContext.test.tsx` (novo ou estendido) —
    teste de persistência via `localStorage` mockado
- **Contexto:** atualmente troca de idioma é resetada para default a cada
  page reload, anulando troca explícita do usuário. Esforço mínimo (~30 min).
  Mesma família de fix de `useTheme` (T-FE-WAVE1) que já persiste em
  `localStorage.theme`.
- **Critério de pronto:**
  - `setLanguage(lang)` escreve `localStorage.setItem("lang", lang)`
  - `useState` initializer lê `localStorage.getItem("lang")` com fallback `"pt"`
  - Page reload preserva idioma selecionado
  - E2E novo (ou estendido em `language-switch.spec.ts`): trocar idioma →
    `page.reload()` → idioma persistido (asserção em `<html lang>` ou no
    seletor de idioma do header)
  - `cd frontend && npm run test:run` verde
  - PR isolado para `develop`

### `[ ]` T-FE-QUAL-08 — RoleCollapsible dead props cleanup

- **Agente:** `[frontend-engineer]`
- **Dep:** T-FE-QUAL-01 (strict mode + `noUnusedParameters` facilitará detectar
  props não consumidos em refactors futuros)
- **Toca:**
  - `frontend/src/components/portfolio/RoleCollapsible.tsx` — remover
    `responsibilitiesLabel` e `technologiesLabel` do interface
    `RoleCollapsibleProps` (lines 12-13); função já não destruturava esses props
  - `frontend/src/components/portfolio/ExperienceCard.tsx:97-98` — parar de passar
    `responsibilitiesLabel={labels.responsibilities}` e
    `technologiesLabel={labels.technologies}`
  - `frontend/src/components/portfolio/RoleCollapsible.test.tsx` (e qualquer
    outro arquivo de teste que passe esses props) — atualizar
- **Contexto:** Q7 do consensus report. Architect: MEDIUM. FE inicialmente HIGH,
  revisou para MEDIUM após confirmar que props são silenciosamente ignorados
  (componente lê de `labels.responsibilities` e `labels.technologies`
  corretamente). Sem runtime bug; pure maintainability cleanup.
- **Critério de pronto:**
  - `responsibilitiesLabel` e `technologiesLabel` removidos do interface
    `RoleCollapsibleProps`
  - `ExperienceCard` para de passar os dead props
  - Arquivos de teste atualizados (não passam mais os props removidos)
  - `cd frontend && npx tsc --noEmit` passa (estrita ou não)
  - `cd frontend && npm run test:run` verde
  - PR isolado (ou bundled com T-FE-QUAL-06 se feito na mesma janela) para
    `develop`

### `[ ]` T-FE-QUAL-09 — EmailModal dark mode fix (design tokens)

- **Agente:** `[frontend-engineer]`
- **Dep:** —
- **Toca:**
  - `frontend/src/components/header/EmailModal.tsx` — substituir todas as
    classes de cor brutas por design tokens:
    - `bg-gray-50` → `bg-background` (ou `bg-muted` conforme contexto)
    - `bg-blue-100` → `bg-accent` (ou `bg-accent-subtle` para variant amber)
    - `text-gray-700` → `text-foreground` (ou `text-muted-foreground`)
    - `bg-blue-600` → `bg-primary`
    - `hover:bg-blue-700` → `hover:bg-primary/90`
- **Contexto:** modal foi escrito antes do dark mode toggle (T-FE-WAVE1) e
  carrega cores hardcoded que quebram em dark mode. Esforço ~30 min; isolado.
- **Critério de pronto:**
  - `grep -nE 'bg-(gray|blue|red|green|yellow|slate|zinc|neutral|stone)-[0-9]+|text-(gray|blue|red|green|yellow|slate|zinc|neutral|stone)-[0-9]+'
    frontend/src/components/header/EmailModal.tsx` retorna vazio
  - Modal visualmente correto em light mode (sem regressão) e em dark mode
    (verificável via `<html class="dark">` toggle no DevTools)
  - Axe DevTools no modal aberto: zero violações de contraste em ambos os modos
  - `cd frontend && npm run test:run` verde (testes do EmailModal continuam
    passando)
  - PR isolado para `develop`; QA pareia em review com Axe + screenshot
    light/dark

### `[ ]` T-FE-QUAL-10 — CV PDF assets: adicionar currículos EN e DE

- **Agente:** `[frontend-engineer]`
- **Dep:** —
- **Decisão do operador (2026-05-16):** adicionar os PDFs reais em EN e DE.
- **Toca:**
  - `frontend/public/resume-marco-aurelio.pdf` — currículo em inglês (operador fornece)
  - `frontend/public/lebenslauf-marco-aurelio.pdf` — currículo em alemão (operador fornece)
  - `frontend/src/data/profile.ts` — mapear `cvDownloadUrl` por idioma
    (`pt` → `/cv.pdf`, `en` → `/resume-marco-aurelio.pdf`,
    `de` → `/lebenslauf-marco-aurelio.pdf`)
  - `frontend/src/components/header/ContactStrip.tsx` (ou `HeaderDesktopLayout`
    / `HeaderMobileLayout`) — usar `cvDownloadUrl` do profile por idioma ativo
- **Contexto:** `cv.pdf` em PT existe em `public/`. Os equivalentes EN e DE
  estão ausentes, causando 404 silencioso no botão "Download CV" para visitantes
  EN e DE. O operador confirmou que irá fornecer os arquivos PDF.
- **Critério de pronto:**
  - Operador adiciona `resume-marco-aurelio.pdf` e `lebenslauf-marco-aurelio.pdf`
    em `frontend/public/` antes do merge da task
  - `profile.ts` (ou equivalente) mapeia `cvDownloadUrl` por idioma
  - Botão "Download CV" faz download do PDF correto para cada idioma (PT/EN/DE)
  - `curl -sI http://localhost:4173/resume-marco-aurelio.pdf` retorna 200 após
    `npm run preview`
  - E2E verifica download link correto nos 3 idiomas
  - `cd frontend && npm run test:run` verde
  - PR isolado para `develop`

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
- **Dep:** T-QA-14, T-DEVOPS-12
- **Toca:** PR `develop → main`
- **Critério de pronto:**
  - PR aberto; 5 status checks verdes.
  - Reviewer aprova; merge.
  - `deploy.yml` job `deploy-prod` completa em ≤ 6 min.
  - CloudFront invalidation criada.

### `[ ]` T-QA-15 — E2E pós-deploy contra URL real (stage bloqueante + prod smoke)

- **Agente:** `[qa-engineer]` + `[devops-engineer]` (workflow GHA)
- **Dep:** T-QA-13 (`[ ]` — gates reativados; precondição para que `e2e-stage`
  bloqueante faça sentido), T-DEVOPS-14 (URL prod no ar)
- **Toca:**
  - `frontend/playwright.config.ts` — `webServer: process.env.E2E_BASE_URL ?
    undefined : { command: 'npm run dev', port: 8080, timeout: 60_000 }` (sem isso,
    jobs externos tentam subir Vite e travam)
  - `frontend/tests/e2e/pages/{home,project-tabs}.spec.ts` — adicionar tag `@smoke`
    no nome do test (ex: `test('E2E-01 @smoke: home renders 200', ...)`) para o
    subset crítico de prod
  - `frontend/index.html` — `<meta name="commit" content="${VITE_COMMIT_SHA}">` (poll
    em CI até bater commit esperado, max 6 retries × 30s)
  - `frontend/vite.config.ts` — `define: { 'import.meta.env.VITE_COMMIT_SHA':
    JSON.stringify(process.env.GITHUB_SHA || 'dev') }`
  - `.github/workflows/deploy.yml` — 2 jobs novos (vide critério abaixo)
- **Critério de pronto:**
  - **`e2e-stage`** (needs `deploy-stage`, `if: github.ref ==
    'refs/heads/develop'`): após `aws cloudfront wait invalidation-completed`, roda
    `E2E_BASE_URL=https://stage.marco-menezes.com npx playwright test
    --project=chromium --project=mobile-chrome` (subset 2 projects ≈ 60% economia
    CI vs 5). **Bloqueante:** falha aborta promoção `develop → main`.
  - **`e2e-prod-smoke`** (needs `deploy-prod`, `if: github.ref ==
    'refs/heads/main'`): roda `E2E_BASE_URL=https://www.marco-menezes.com npx
    playwright test --grep="@smoke" --project=chromium`. **Falha cria issue auto**
    via `gh issue create --label prod-e2e-fail --title "prod E2E smoke failed @
    <sha>"` (não rollback automático — fica como improvement futuro).
  - `playwright.config.ts` `webServer` condicional `E2E_BASE_URL` aplicado e
    verificado (rodar `E2E_BASE_URL=https://stage.marco-menezes.com npx playwright
    test --project=chromium tests/e2e/pages/home.spec.ts` localmente sem subir Vite).
  - Tag `@smoke` aplicada em `home.spec.ts` (E2E-01) e `project-tabs.spec.ts` (E2E-05
    a E2E-07).
  - `<meta name="commit">` injetado via `vite.config.ts define` e visível em
    `view-source:https://stage.marco-menezes.com`.
  - `aws cloudfront wait invalidation-completed --distribution-id <id>
    --id <invalidation-id>` chamado **antes** do step de E2E stage.
  - **1 PR demo end-to-end** com mudança visível em stage prova ambos workflows
    funcionando (PR develop→main bloqueado em vermelho via `e2e-stage` simulado;
    depois verde após fix; merge em main dispara `e2e-prod-smoke` verde).
- **Justificativa:** classifica-se como CRÍTICO no plano operador
  (`agora-precisamos-que-nossos-twinkling-frost.md`). Garante que zero deploy stage
  promove para prod sem validação contra URL real, e zero deploy prod fica sem alerta
  de regressão funcional.

### `[ ]` T-QA-16 — Validar Lighthouse em prod

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

## Fase 6 — Identidade visual (Onda 1/2/3)

> Spec: `specs/features/visual-identity/SPEC.md` (F-P0-07, **Aprovado** em 2026-05-14).
> Sequencial: cada onda assume estilos da anterior. Owner único: `[software-engineer]`;
> `[qa-engineer]` pareia em PR review (Axe + Lighthouse local).

### `[x]` T-FE-WAVE1 — Identidade visual: paleta amber + Inter/JetBrains Mono + dark mode toggle

- **Agente:** `[software-engineer]`
- **Dep:** T-CONTENT-06
- **Toca:**
  - `frontend/src/index.css` — vars `:root` e `.dark` (adicionar `--accent: 28 90%
    55%`/`28 95% 62%`, `--accent-subtle: 28 90% 95%`/`28 40% 18%`, ajustar `--ring`)
  - `frontend/src/main.tsx` — `import "@fontsource/inter/{400,500,600,700}.css"` +
    `@fontsource/jetbrains-mono/{400,500}.css`
  - `frontend/tailwind.config.ts` — `fontFamily.sans = ['Inter', ...defaults]`,
    `fontFamily.mono = ['JetBrains Mono', ...defaults]`, color `accent-subtle`
  - `frontend/package.json` — adicionar `@fontsource/inter` e
    `@fontsource/jetbrains-mono` (justificativa: zero request externo, melhor LCP vs
    Google Fonts CDN)
  - `frontend/src/components/Header.tsx` — REMOVER `bg-gradient-to-b from-slate-900
    to-slate-800` hardcoded; trocar por `bg-header-bg`
  - `frontend/src/components/header/ThemeToggle.tsx` — NOVO (~30 linhas, Sun/Moon de
    `lucide-react`)
  - `frontend/src/hooks/useTheme.ts` — NOVO (~40 linhas; lê `localStorage.theme` >
    `prefers-color-scheme`; persiste; toggle classe `dark` em `<html>`)
  - `frontend/src/components/header/{HeaderDesktopLayout,HeaderMobileLayout}.tsx` —
    slot `<ThemeToggle />` ANTES do `<LanguageSelector />`
  - `frontend/index.html` — script inline no `<head>` ANTES do bundle React:
    `<script>try{const t=localStorage.theme||(matchMedia('(prefers-color-scheme:dark)')
    .matches?'dark':'light');if(t==='dark')document.documentElement.classList.add(
    'dark')}catch(e){}</script>` (evita flash no first paint)
  - `frontend/src/components/portfolio/HeroSection.tsx` — apenas tipografia maior
    (text-2xl→text-3xl no title, accent underline)
- **Critério de pronto:**
  - Lighthouse desktop+mobile: Performance ≥ 90 e Accessibility ≥ 90 (target
    F-P0-02).
  - Axe DevTools no painel Issues: contraste WCAG AA OK; **accent amber
    `28 90% 55%` light / `28 95% 62%` dark usado SOMENTE em CTAs/borders/badges,
    NUNCA em body text** (verificável por grep no JSX dos componentes Section/Card).
  - Toggle dark/light persiste após F5 (verificar `localStorage.theme` no DevTools).
  - **Zero flash de tema** no first paint com `prefers-color-scheme: dark` emulado
    no DevTools (script inline em `<head>` aplicado antes do bundle React).
  - Testes: `Header.test.tsx` adiciona caso "renders ThemeToggle";
    `ThemeToggle.test.tsx` (novo) verifica toggle altera `<html>.classList` e
    persiste em `localStorage` mockado; `useTheme.test.ts` (novo) respeita
    `prefers-color-scheme` no first mount.
  - PR isolado para `develop`; QA pareia em review com Axe + Lighthouse local.

### `[x]` T-FE-WAVE2 — Microinteractions + scroll-triggered + skill semantic colors

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-WAVE1
- **Toca:**
  - `frontend/tailwind.config.ts` — keyframes `fade-up`, `fade-in` + animations
    correspondentes
  - `frontend/src/hooks/useInView.ts` — NOVO (~25 linhas, IntersectionObserver
    wrapper)
  - `frontend/src/lib/skillCategoryColors.ts` — NOVO (mapper categoria→Tailwind
    class: cloud=blue, language=emerald, database=purple, ai-tooling=accent)
  - `frontend/src/components/portfolio/{ExperienceSection,EducationSection,
    CertificationsSection,SkillsSection}.tsx` — wrap section com `useInView` +
    className condicional `animate-fade-up`
  - `frontend/src/components/portfolio/{ExperienceCard,CertificationCard,
    SkillCategoryCard}.tsx` — `hover:-translate-y-1 hover:shadow-large
    hover:border-accent/40 transition-all duration-200`
  - `frontend/src/components/header/HeaderShell.tsx` — `backdrop-blur-md
    bg-header-bg/85` quando `scrollState !== "full"`
  - `frontend/src/test-setup.ts` — mock `IntersectionObserver` para jsdom
- **Critério de pronto:**
  - DevTools Performance trace ao scroll: **CLS = 0**.
  - DevTools Rendering > "Emulate prefers-reduced-motion: reduce": **animações
    desligam** (verificável visualmente + via media query no CSS gerado).
  - **Mock IntersectionObserver** aplicado no `test-setup.ts` do Vitest — `npm run
    test` verde.
  - **Cores semânticas por categoria** aplicadas: cloud=blue, language=emerald,
    database=purple, ai-tooling=accent (verificável por inspeção visual nas badges
    de SkillCategoryCard).
  - PR isolado para `develop`; QA valida `prefers-reduced-motion` e Performance
    trace.

### `[x]` T-FE-WAVE3 — Hero memorável: avatar+halo+tagline+stats+CTAs

- **Agente:** `[software-engineer]`
- **Dep:** T-FE-WAVE2
- **Toca:**
  - `frontend/src/components/portfolio/HeroSection.tsx` — REESCRITA: layout 2-col
    desktop (60% texto / 40% avatar+halo); mobile stack vertical
    - Esquerda: tagline `text-4xl md:text-6xl font-bold` (vem de
      `content.heroTagline` — campo novo); stats inline `<span className="font-mono
      text-accent">5+ years</span> · 9 certs · 4 clouds`; CTAs `Download CV`
      (variant=default) + `Ver experiência` (variant=outline, scroll para
      `#experience`)
    - Direita: avatar 192px com halo `box-shadow: 0 0 80px hsl(var(--accent)/0.3)`
      + radial gradient mesh atrás
  - `frontend/src/types/content.ts` — adicionar `heroTagline: string` e
    `heroStats: { years: number; certifications: number; clouds: number }`
  - `frontend/src/data/content/{pt,en,de}.json` — popular `heroTagline` (PT:
    "Construo pipelines de dados em escala"; EN: "I build data pipelines at scale";
    DE: "Ich baue Datenpipelines im Maßstab") e `heroStats`
  - `frontend/public/decorators/{dot-grid,blob-amber}.svg` — NOVOS estáticos ~2KB
    cada, com **`width`/`height` explícitos** para zero CLS
  - `frontend/src/components/portfolio/HeroSection.test.tsx` — NOVO (smoke + asserts
    dos 2 CTAs + ID `#hero-heading`)
- **Critério de pronto:**
  - **LCP ≤ 2.5s** (avatar com `loading="eager" fetchpriority="high"`); medido em
    Lighthouse mobile desktop.
  - **CLS ≤ 0.1** (decoradores SVG com width/height explícitos no `<img>` ou
    `<svg viewBox>`).
  - **Tab order:** ThemeToggle → LanguageSelector → CTA Download CV → CTA Ver
    experiência (verificável via `tab` manual + Playwright `keyboard.press("Tab")`).
  - **`heroTagline` traduzida nos 3 idiomas** sem fallback EN inadvertido em PT/DE.
  - **ID `#hero-heading` preservado** no `<h1>` para não quebrar `home.spec.ts`
    (E2E-01); rodar `npx playwright test home.spec.ts` antes do merge.
  - SVGs em `public/decorators/` referenciados via `<img src="/decorators/*.svg"
    width="..." height="...">`.
  - 3 viewports respondem: 1440 / 768 / 375 px.
  - PR isolado para `develop`; QA valida 3 viewports + 3 idiomas + LCP budget +
    atualiza seletores de E2E que dependiam do Hero antigo.

---

## Fase 7 — Content AI emphasis (Onda 5/6)

> Spec: `specs/features/content-ai-emphasis/SPEC.md` (F-P0-08, **Aprovado** em 2026-05-15).
> Sequencial: Onda 6 consome tipos + dados introduzidos pela Onda 5. Cada onda é 1 PR.
> Owner único: `[software-engineer]`; `[qa-engineer]` pareia em PR review (Axe +
> Lighthouse local). Não toca em rotas, projetos, header ou estrutura do `HeroSection`
> — apenas conteúdo + 2 componentes novos ancorados em tokens já estabelecidos por
> F-P0-07.

### `[-]` T-FE-WAVE5 — Content AI emphasis: conteúdo + tipos + skillCategoryColors matchers

- **Agente:** `[frontend-engineer]`
- **Dep:** T-FE-WAVE3 (`[x]`), T-CONTENT-06 (`[x]`)
- **Toca:**
  - `frontend/src/types/content.ts` — adicionar `interface HighlightProject` (com
    `title`, `body`, `impact?: string[]`, `links?: { label; url }[]`) e estender
    `Position` com `skills?: string[]` e `highlightProject?: HighlightProject`
  - `frontend/src/data/content/{pt,en,de}.json` —
    - `heroTagline` atualizado: PT `"AI-augmented data engineering em escala"` /
      EN `"AI-augmented data engineering at scale"` /
      DE `"KI-gestütztes Data Engineering im Maßstab"`
    - Cada `Position.skills` populado com ≥10 tags (Santander Senior: 15 tags
      incluindo `Claude Code`, `GitHub Copilot`, `Devin`, `Windsurf`,
      `Spec-Driven Development`, `TDD com AI`; Santander Pleno: ~12 tags;
      cargos anteriores: 10–12 tags contextualizadas)
    - **Santander Senior recebe `highlightProject`** com title "Migração SAS →
      Azure + Databricks", body de 1-2 parágrafos sobre execução solo com
      AI-augmented engineering, e `impact[]` incluindo
      `"Redução do tempo de migração: 12 meses → 2 meses (SLA de execução do projeto)"`
    - Bullets do Santander Senior generalizados para liderança técnica em
      AI-augmented engineering + 1–2 bullets de stack tradicional
  - `frontend/src/lib/skillCategoryColors.ts` — expandir array `KEYWORDS` da
    categoria `ai-tooling` com `/claude/i, /devin/i, /windsurf/i, /copilot/i,
    /codex/i, /opencode/i, /openclaw/i, /hermes/i, /spec[\s-]?driven/i,
    /tdd com ai/i, /ai[\s-]augmented/i, /\bai\b/i, /machine learning/i, /\bllm\b/i,
    /agent/i, /ai-tooling/i, /tooling/i, /ferramenta/i, /werkzeug/i`
  - `frontend/src/lib/skillCategoryColors.test.ts` — adicionar casos para as
    novas keywords (Claude, Devin, Windsurf, Copilot, SDD, TDD com AI)
  - `frontend/tests/e2e/pages/home.spec.ts` — adaptar assertion da tagline para
    o novo texto PT
  - `frontend/tests/e2e/pages/language-switch.spec.ts` — adaptar asserts das 3
    taglines (PT/EN/DE) para os novos textos
- **Critério de pronto:**
  - `cd frontend && npm run test:run` verde (incluindo `skillCategoryColors.test.ts`
    com novos casos de AI tooling).
  - **Paridade estrutural i18n**:
    `jq 'paths(scalars)' src/data/content/{en,pt,de}.json | sort -u | uniq -c` —
    todos os paths novos (`heroTagline`, `experience.positions[].skills`,
    `experience.positions[].highlightProject.title|body|impact[]`) presentes 3x.
  - `npm run dev` local com troca PT ↔ EN ↔ DE: nova tagline visível em cada
    idioma sem fallback EN inadvertido em PT/DE.
  - **Privacidade verificada via diff**: nenhum dos JSONs contém `R$`, `6M`,
    `6 milhões`, nem qualquer valor financeiro relacionado ao projeto SAS.
    Métrica de impacto é exclusivamente "12 meses → 2 meses".
  - `home.spec.ts` e `language-switch.spec.ts` verdes localmente
    (`npx playwright test home language-switch`).
  - Lighthouse desktop+mobile em `/`: Performance ≥ 90, Accessibility ≥ 90 (sem
    regressão vs. WAVE3).
  - PR isolado para `develop`; QA pareia em review.

### `[ ]` T-FE-WAVE6 — Content AI emphasis: RoleSkillBadges + HighlightProjectBlock

- **Agente:** `[frontend-engineer]`
- **Dep:** T-FE-WAVE5
- **Toca:**
  - `frontend/src/components/portfolio/RoleSkillBadges.tsx` (NOVO, ~30 linhas)
    — props `{ skills: string[] }`; renderiza cluster de `<Badge>` em
    `flex flex-wrap gap-2`; cor via `skillCategoryStyle(skill).badge`
  - `frontend/src/components/portfolio/HighlightProjectBlock.tsx` (NOVO, ~70
    linhas) — props `{ highlight: HighlightProject }`; visual
    `bg-accent-subtle border border-accent rounded-xl p-5`; header com badge
    `⚡ Impacto` (aria-label="Impacto") em `bg-accent text-accent-foreground` +
    título `font-bold text-lg`; body em `<p class="text-foreground">`
    (não em accent — preserva contraste WCAG AA); `impact[]` como lista
    vertical em `font-mono text-sm`; `links[]` opcional como botões `outline`
    com `rel="noopener noreferrer"`
  - `frontend/src/components/portfolio/ExperienceCard.tsx` — após bloco
    `technologies`, renderizar `<RoleSkillBadges>` (condicional) e
    `<HighlightProjectBlock>` (condicional)
  - `frontend/src/components/portfolio/RoleCollapsible.tsx` — dentro do
    `CollapsibleContent`, mesmo padrão de inserção
  - `frontend/src/components/portfolio/RoleSkillBadges.test.tsx` (NOVO) —
    smoke + assert de cor por categoria (`ai-tooling` aplica `bg-accent-subtle`;
    `cloud` aplica `bg-blue-100`)
  - `frontend/src/components/portfolio/HighlightProjectBlock.test.tsx` (NOVO)
    — smoke + render de `impact[]` como lista + render condicional de
    `links[]`
- **Critério de pronto:**
  - `npm run test:run` verde, incluindo os 2 testes novos.
  - **Axe DevTools** no painel Issues: zero violações em `/`. Contraste do
    `bg-accent-subtle` + `text-foreground` validado em light e dark mode.
  - **Lighthouse a11y ≥ 0.9** em `/` desktop + mobile.
  - Inspeção visual: cada `Position` com `skills` renderiza ≥10 badges
    colorizados (ai-tooling em amber, cloud em blue, language em emerald,
    database em purple); Santander Senior mostra o `HighlightProjectBlock`
    com "Redução do tempo de migração: 12 meses → 2 meses".
  - 3 viewports respondem: 1440 / 768 / 375 px.
  - `home.spec.ts` continua verde após render dos componentes novos.
  - PR isolado para `develop`; QA valida Axe + Lighthouse + 3 viewports.

---

## Fase 8 — Área de Projetos dedicada

> Specs: F-P0-09 a F-P0-15 (Grupo B do plano `algum-feedback-sobre-o-merry-kay.md`).
> Sequencial parcial: T-FE-PROJ-01 (modelo) destrava as 6 demais. T-FE-PROJ-04 (templates)
> é gate para T-FE-PROJ-05 (diagramas) e T-FE-PROJ-06 (link-out). Owner padrão:
> `frontend-engineer`; `devops-engineer` para qualquer bullet em `.github/workflows/`;
> `game-developer` apenas se a task tocar `repos/tauan-games/` (nenhuma desta Fase
> toca; publicação do GH Pages é PR separado naquele repo).
> `qa-engineer` pareia em review (Axe + Lighthouse local + 3 viewports).

### `[ ]` T-FE-PROJ-01 — Projects Content Model (modelo unificado por `kind`)

- **Spec:** `specs/features/projects-content-model/SPEC.md` (F-P0-09)
- **Agente:** `[frontend-engineer]`
- **Dep:** T-FE-WAVE5 (PR #25 — coordenação de merge no mesmo arquivo
  `frontend/src/data/content/{pt,en,de}.json`; áreas disjuntas — WAVE5 mexe em
  `heroTagline`/`experiences`, esta task mexe em `projects.*`), T-FE-WAVE6
- **Toca:**
  - `frontend/src/types/content.ts` — adicionar `ProjectKind`, `ProjectBase`,
    `ProjectCard`, `CaseStudyProject`, `MetaProject`, `GamesProject`, `GameLink`,
    `Project`, refator de `ProjectsContent` para `{ index, list }`
  - `frontend/src/lib/schemas/projects.ts` (NOVO) — `ProjectsContentSchema` Zod conforme
    F-P0-09 §3.3
  - `frontend/package.json` — adicionar `"zod": "^3.x"` em `dependencies`
  - `frontend/src/hooks/useContent.ts` — validação Zod no carregamento de `projects`
    (silenciosa em prod, `console.error` em dev/stage)
  - `frontend/src/data/content/{pt,en,de}.json` — reescrever bloco `projects` para
    `{ index, list: [dadaia-workspace, portifolio, tauan-games] }` na ORDEM FIXA
  - `frontend/src/types/content.test.ts` (se existir) — atualizar
- **Critério de pronto:**
  - `npm run build` verde, `tsc --noEmit` sem erros, `npm run test:run` verde
  - `jq '.projects.list | length' src/data/content/{pt,en,de}.json` retorna `3` para
    todos; `jq '[.projects.list[].slug]'` retorna
    `["dadaia-workspace","portifolio","tauan-games"]` nos 3 JSONs
  - Cada projeto tem `kind` correto (`case-study | meta | games`) e
    `card.{cover,summary,tech}` populados; ordem dos itens nos 3 JSONs idêntica
  - `useContent()` valida com Zod em modo dev — log de erro aparece no console se shape
    inválido
  - Consumidores velhos (`TauanGamesPage`, `ArchitecturePage`, `DadaiaWorkspacePage`)
    podem precisar de helper transitório `getProjectBySlug` para não quebrar
    typecheck durante a janela até T-FE-PROJ-04 — incluir no PR se necessário
  - PR isolado para `develop`; QA pareia em review

### `[ ]` T-FE-PROJ-02 — Projects Index Page (`/projetos`)

- **Spec:** `specs/features/projects-index-page/SPEC.md` (F-P0-10)
- **Agente:** `[frontend-engineer]`
- **Dep:** T-FE-PROJ-01, T-FE-QUAL-03 (bloqueante por decisão D1 do PE em
  2026-05-16; sidebar deve estar substituída antes de estender nav para `/projetos`)
- **Toca:**
  - `frontend/src/routes.ts` — adicionar entrada `projects-index`
    (path `/projetos`, `inNav: true`, `inHeaderNav: true` — flag novo definido em
    T-FE-PROJ-03; coordenar PR)
  - `frontend/src/App.tsx` — registrar rota `/projetos` → `<ProjectsIndexPage />`
  - `frontend/src/pages/projects/ProjectsIndexPage.tsx` (NOVO, ~80 linhas) —
    consome `content.projects.list`, renderiza grid de cards
  - `frontend/src/components/projects/ProjectCard.tsx` (NOVO, ~70 linhas) — props
    `{ project: Project }`, renderiza `<Link to={/projetos/${slug}}>` envolvendo Card
    com cover/title/summary/tech badges
  - `frontend/src/data/content/{pt,en,de}.json` — chaves
    `projects.index.{title,subtitle,seo}`, `projects.kindCaseStudy`,
    `projects.kindMeta`, `projects.kindGames`
  - `frontend/tests/e2e/pages/projects-index.spec.ts` (NOVO) — smoke + asserts ordem
- **Critério de pronto:**
  - `/projetos` renderiza grid responsivo (1/2/3 col) com 3 cards na ordem
    `dadaia-workspace → portifolio → tauan-games`
  - Cada card linka para `/projetos/<slug>` via SPA navigation; clique não recarrega
  - Tab order: hero h1 → card 1 → card 2 → card 3; foco visível
  - Lighthouse `/projetos` desktop+mobile: Performance ≥ 90, Accessibility ≥ 90,
    Best-Practices ≥ 95, SEO ≥ 90
  - CLS ≤ 0.1 (imagens com width/height explícitos)
  - Axe DevTools no painel Issues: zero violações
  - E2E `projects-index.spec.ts` verde
  - PR isolado para `develop`; QA pareia em review (3 viewports + Axe)

### `[ ]` T-FE-PROJ-03 — Nav Projects CTA (Header + Hero 3rd CTA)

- **Spec:** `specs/features/nav-projects-cta/SPEC.md` (F-P0-11)
- **Agente:** `[frontend-engineer]`
- **Dep:** T-FE-PROJ-02
- **Toca:**
  - `frontend/src/routes.ts` — adicionar campo `inHeaderNav: boolean` ao tipo `Route`;
    setar `inHeaderNav: true` apenas em `projects-index`; export `headerNavRoutes`
  - `frontend/src/components/header/HeaderDesktopLayout.tsx` — `<nav aria-label="Primary">`
    com `headerNavRoutes.map(...)` (NavLink react-router) antes do `LanguageSelector`
  - `frontend/src/components/header/HeaderMobileLayout.tsx` — seção "Navegação" no
    sheet/drawer com mesmos itens; `closeMobileMenu` no `onClick`
  - `frontend/src/components/portfolio/HeroSection.tsx` — adicionar 3º CTA `seeProjects`
    como `<Link to="/projetos">` variant=outline
  - `frontend/src/types/content.ts` — `HeroCTAs.seeProjects: string` (obrigatório)
  - `frontend/src/data/content/{pt,en,de}.json` — `heroCTAs.seeProjects`,
    `nav.projects`, `nav.section`
  - `frontend/tests/e2e/pages/home.spec.ts` — atualizar assertion para 3 CTAs
  - `frontend/tests/e2e/pages/nav-projects.spec.ts` (NOVO) — smoke do header e Hero CTA
- **Critério de pronto:**
  - Header desktop tem item "Projetos" antes do LanguageSelector; `aria-current="page"`
    quando em `/projetos`
  - Header mobile mostra "Projetos" no drawer; clique fecha drawer e navega
  - Hero tem 3 CTAs na ordem [downloadCv, seeExperience, seeProjects]; em 375px CTAs
    empilham sem quebra
  - Tab order desktop validado via Playwright: ThemeToggle → LanguageSelector → nav
    "Projetos" → Hero h1 → CTA Download CV → CTA Ver experiência → CTA Ver projetos
  - Lighthouse a11y ≥ 90 em `/` mobile+desktop, sem regressão
  - Axe DevTools: zero violações
  - E2E `home.spec.ts` e `language-switch.spec.ts` adaptados; `nav-projects.spec.ts`
    verde
  - Paridade i18n confirmada: `nav.projects`, `nav.section`, `heroCTAs.seeProjects`
    nos 3 JSONs
  - PR isolado para `develop`; QA pareia em review

### `[ ]` T-FE-PROJ-04 — Projects Page Templates (per-kind dispatch + `useDocumentSeo`)

- **Spec:** `specs/features/projects-page-templates/SPEC.md` (F-P0-12)
- **Agente:** `[frontend-engineer]`
- **Dep:** T-FE-PROJ-01
- **Toca:**
  - `frontend/src/hooks/useDocumentSeo.ts` (NOVO, ~25 linhas) — hook que seta
    `document.title` + `<meta description>` com cleanup
  - `frontend/src/pages/projects/ProjectDetailPage.tsx` (NOVO, ~30 linhas) — dispatch
    por `project.kind` (switch exhaustive); `<Navigate to="/404" replace />` em slug
    inexistente
  - `frontend/src/pages/projects/ProjectTabPage.tsx` — REFATOR para receber
    `project: CaseStudyProject` (não props ad-hoc); usar `useDocumentSeo`
  - `frontend/src/pages/projects/MetaProjectTemplate.tsx` (NOVO, ~80 linhas) —
    renderiza hero, diagram, sections, costs, decisions, stack, links
  - `frontend/src/pages/projects/GamesProjectTemplate.tsx` (NOVO, ~50 linhas) —
    renderiza grid de `<GameCard>` para `project.items`
  - `frontend/src/components/projects/{ProjectLayout,ProjectHero,ProjectSections,ProjectLinks,CostsTable,DecisionsList,GameCard}.tsx`
    (NOVOS, ≤ 70 linhas cada) — primitivos extraídos
  - `frontend/src/pages/projects/{DadaiaWorkspacePage,TauanGamesPage,ArchitecturePage}.tsx`
    — **DELETAR**
  - `frontend/src/routes.ts` — substituir 3 rotas estáticas por 1 dinâmica
    `/projetos/:slug → ProjectDetailPage`; remover entradas
    `dadaia-workspace`, `tauan-games`, `portifolio` (não confundir com slug do
    projeto meta, que continua sendo `portifolio` mas via slug param)
  - `frontend/src/App.tsx` — atualizar registro de rota
  - Testes obsoletos deletados; novos criados (`ProjectDetailPage.test.tsx`,
    `MetaProjectTemplate.test.tsx`, `GamesProjectTemplate.test.tsx`,
    `useDocumentSeo.test.ts`)
  - E2E adaptados — `tauan-games.spec.ts`/`architecture.spec.ts`/`dadaia-workspace.spec.ts`
    ou `project-tabs.spec.ts` conforme exista
- **Critério de pronto:**
  - `tsc --noEmit` limpo; switch exhaustive em `ProjectDetailPage` cobre os 3 kinds
  - `/projetos/dadaia-workspace`, `/projetos/portifolio`, `/projetos/tauan-games`
    renderizam respectivamente `ProjectTabPage`, `MetaProjectTemplate`,
    `GamesProjectTemplate`
  - `/projetos/inexistente` redireciona para `/404`
  - Componentes velhos removidos do repo (`git status` confirma deleção)
  - `useDocumentSeo` restaura title/description em unmount (testado)
  - Lighthouse desktop+mobile em cada `/projetos/<slug>`: Performance ≥ 90,
    Accessibility ≥ 90
  - Cobertura unit dos templates ≥ 60% branches+statements
  - E2E verde
  - PR isolado para `develop`; QA pareia em review (Axe + 3 viewports + cada um dos 3
    paths)

### `[ ]` T-FE-PROJ-05 — Projects Architecture Diagrams (light/dark SVG via `<picture>`)

- **Spec:** `specs/features/projects-architecture-diagrams/SPEC.md` (F-P0-13)
- **Agente:** `[frontend-engineer]` (componente, JSON i18n, Makefile target).
  O bullet de `.github/workflows/ci.yml` (gate de tamanho de SVG) deve ser coordenado
  com `[devops-engineer]` — separar em sub-PR ou hotfix-task se o ciclo de PR ficar
  estendido.
- **Dep:** T-FE-PROJ-04
- **Toca:**
  - `frontend/src/types/content.ts` — adicionar `DiagramAsset` (`light`, `dark`, `alt`);
    refatorar `ProjectBase.diagram` para `DiagramAsset | undefined`
  - `frontend/src/lib/schemas/projects.ts` — atualizar Zod para o novo shape
  - `frontend/src/components/projects/ArchitectureDiagram.tsx` (NOVO, ~30 linhas) —
    `<picture>` + `<source media="(prefers-color-scheme: dark)">`, width/height
    explícitos, `loading="lazy"`, sem hook de tema
  - `frontend/src/pages/projects/{ProjectTabPage,MetaProjectTemplate}.tsx` — consumir
    `<ArchitectureDiagram diagram={project.diagram} caption={...} />`
  - `frontend/src/data/content/{pt,en,de}.json` — campo
    `diagram.{light,dark,alt}` por projeto (paths convention
    `/assets/projects/<slug>/architecture-{light,dark}.svg`); `alt` traduzido
  - `frontend/public/assets/projects/<slug>/architecture-{light,dark}.svg` —
    PLACEHOLDERS informativos por enquanto (~5KB cada). SVGs definitivos virão em PR
    posterior do Marco (Excalidraw → svgo)
  - `frontend/public/assets/projects/_fallback-architecture.svg` (NOVO) — placeholder
    neutro
  - `frontend/Makefile` — target novo `assets-optimize-diagrams` rodando svgo
    multipass
  - `frontend/package.json` — `"svgo": "^3.x"` em `devDependencies` se ainda não tem
  - `.github/workflows/ci.yml` — step novo que falha se algum SVG em
    `public/assets/projects/` for > 50KB (`find ... -size +50k`)
  - E2E `architecture-diagram.spec.ts` (NOVO) — smoke + assert que em
    `prefers-color-scheme: dark` o `<picture>` resolve para variant dark
- **Critério de pronto:**
  - `<ArchitectureDiagram>` implementado; sem `useTheme`/`useEffect` de tema
  - 3 projetos têm `diagram.{light,dark,alt}` nos 3 JSONs (paths existem, podem ser
    placeholders)
  - CI gate `find public/assets/projects -name '*.svg' -size +50k` retorna lista vazia
  - Em DevTools simulando `prefers-color-scheme: dark`, diagrama mostra variante dark
    (verificado em E2E)
  - Lighthouse `/projetos/<slug>` mantém Performance ≥ 90 com diagrama carregado
  - CLS ≤ 0.1 em cada `/projetos/<slug>`
  - Axe: zero violações
  - PR isolado para `develop`; QA pareia em review (light + dark simulado)

### `[ ]` T-FE-PROJ-06 — Tauan Games Link-Out (GH Pages, sem iframe)

- **Spec:** `specs/features/tauan-games-link-out/SPEC.md` (F-P0-14)
- **Agente:** `[frontend-engineer]` (portfólio — esta task: JSON i18n, GameCard,
  atributos de link, E2E). Publicação dos 2 jogos no GH Pages do repo `tauan-games`
  é PR **separado** contra `repos/tauan-games/`, domínio do `[game-developer]`
  (pré-condição operacional, não step desta task).
- **Dep:** T-FE-PROJ-04
- **Toca:**
  - `frontend/src/data/content/{pt,en,de}.json` — bloco `projects.list` no item
    `slug: "tauan-games"`:
    - Substituir os 4 items atuais por **2 items** apenas: `aero-fighters` (engine
      `"Three.js"`) + `tauan-trex` (engine `"Phaser"`)
    - Cada item ganha `playUrl` no formato
      `https://marcoaureliomenezes.github.io/tauan-games/<slug>/`
    - Corrigir drift de engine label (era `Babylon.js`, é `Three.js`)
    - `card.summary`, `card.tech`, `hero`, `seo`, `body` revisados pelo operador
      (DE pode ser rascunhado por AI/LLM, operador revisa)
  - `frontend/public/assets/projects/tauan-games/{aero-fighters,tauan-trex,cover}.webp`
    — screenshots otimizadas ≤ 200KB cada
  - `frontend/tests/e2e/pages/tauan-games-link-out.spec.ts` (NOVO) — smoke + asserts
    de atributos (`target="_blank"`, `rel="noopener noreferrer"`, `href` exato)
  - **NÃO TOCA:** `repos/tauan-games/` (regra `game-developer-scope.md`); Makefile
    games:sync (deletado do plano); Terraform Cache-Control `/games/*` (deletado);
    componente iframe (deletado)
- **Critério de pronto:**
  - Bloco `projects[?slug==tauan-games]` nos 3 JSONs tem `items.length === 2` com
    slugs `aero-fighters` e `tauan-trex`; engine labels corretos (`Three.js`,
    `Phaser`)
  - Itens `aero-fighters-babylon`, `aero-fighters-godot`, `aero-fighters-unity`
    **removidos**
  - `/projetos/tauan-games` renderiza 2 `<GameCard>` (via `GamesProjectTemplate` de
    T-FE-PROJ-04)
  - Cada botão "Jogar" é `<a target="_blank" rel="noopener noreferrer"
    href="https://marcoaureliomenezes.github.io/tauan-games/<slug>/">`; cada botão
    "Ver repo" idem para o URL do repo
  - `aria-label` explícito ("Jogar Aero Fighters (abre em nova aba)") em cada
    botão "Jogar" — verificado em Axe
  - Imagens ≤ 200KB cada com width/height explícitos; CLS ≤ 0.1
  - Lighthouse `/projetos/tauan-games` ≥ 90 Performance + a11y
  - E2E `tauan-games-link-out.spec.ts` verde — checagens só de atributos (sem
    `expect 200` no `playUrl` externo)
  - **Pré-condição operacional (verificada antes de merge para `main`, não para
    `develop`):** Marco confirma que
    `https://marcoaureliomenezes.github.io/tauan-games/aero-fighters/` e
    `.../tauan-trex/` respondem 200 (deploy GH Pages no repo `tauan-games`,
    domínio do `game-developer`)
  - PR isolado para `develop`; QA pareia em review (Axe + Lighthouse + verificação
    manual dos atributos)

### `[ ]` T-FE-PROJ-07 — Projects Content i18n Parity (CI gate)

- **Spec:** `specs/features/projects-content-i18n-parity/SPEC.md` (F-P0-15)
- **Agente:** `[frontend-engineer]` (script TypeScript, testes, package.json,
  README) + `[devops-engineer]` (job `i18n-parity` no `.github/workflows/ci.yml` e
  branch protection) + `[qa-engineer]` (valida que o gate efetivamente bloqueia
  merge ao introduzir drift).
- **Dep:** T-FE-PROJ-01
- **Toca:**
  - `frontend/scripts/check-projects-i18n-parity.ts` (NOVO, ~120 linhas) — script
    de validação (Zod por idioma + paridade de slugs/ordem + paridade de items
    nos `GamesProject` + paridade de paths escalares)
  - `frontend/scripts/check-projects-i18n-parity.test.ts` (NOVO) — casos
    paritários/com drift/com slugs desordenados/com Zod inválido/com `projects`
    ausente
  - `frontend/package.json` — script novo `"check:i18n-projects":
    "tsx scripts/check-projects-i18n-parity.ts"`; `tsx` em `devDependencies` se
    ainda não está
  - `frontend/README.md` — seção "Conteúdo i18n" com instruções de uso local
  - `.github/workflows/ci.yml` — job novo `i18n-parity` (cf. F-P0-15 §3.3)
  - **Branch protection (`develop` e `main`):** adicionar status check
    `i18n-parity` à lista de checks bloqueantes — coordenar com T-QA-14 se ainda
    aberta; senão, hotfix-task para o `[devops-engineer]`/`[qa-engineer]` aplicar
- **Critério de pronto:**
  - `npm run check:i18n-projects` retorna exit 0 com os 3 JSONs paritários (estado
    pós T-FE-PROJ-06); exit 1 com mensagem útil em qualquer drift
  - Job `i18n-parity` no `ci.yml` executa em PR contra `develop`/`main`; tempo de
    execução < 30s
  - Status check `i18n-parity` adicionado à branch protection de `develop` e `main`
  - Suite de testes do script verde (≥ 6 casos)
  - Documentação no README do `frontend/` atualizada
  - PR isolado para `develop`; QA valida que o gate bloqueia merge ao introduzir
    drift artificial

---

## Matriz de paralelismo (resumo)

Estado em 2026-05-14: Fases 0 (parcial), 2, 3 (parcial) e 4 (parcial) entregues.
Pendências consolidadas para retomada:

| Janela | Tarefas paralelas — estado atual |
|---|---|
| W0 ✅ DONE | T-DEVOPS-01, T-DEVOPS-04, T-DEVOPS-06 (consumados); T-DEVOPS-02 já executado em 2026-05-14 (Fluxo B) |
| W1 — em curso | T-DEVOPS-02a, T-DEVOPS-02a-fix (formalização), T-DEVOPS-03, T-DEVOPS-05, T-DEVOPS-07 |
| W2 — bloqueada por W1 | T-DEVOPS-08 (stage apply via CI), T-DEVOPS-09 (secrets stage), T-QA-13 (recalibrar gates contra stage real) |
| W3 — frontend resíduo | T-FE-05 (Radix Dialog), T-CONTENT-05 (otimização assets) — independentes de DEVOPS |
| W4 — branch protection | T-QA-14 (status checks) após T-QA-13 verde + T-DEVOPS-07 |
| W5 — Fase 5 (go-live) | T-DEVOPS-10 → T-DEVOPS-11 → T-DEVOPS-12 → T-DEVOPS-13 → T-DEVOPS-14 → T-QA-16 |
| W6 — conteúdo refresh | T-CONTENT-06 (LinkedIn → JSONs i18n + cv.pdf) — independente; pode rodar paralelo a W1/W2 |
| W7 — identidade visual (sequencial) | T-FE-WAVE1 → T-FE-WAVE2 → T-FE-WAVE3; cada onda é 1 PR; QA pareia em PR review |
| W8 — E2E pós-deploy | T-QA-15 (stage bloqueante + prod smoke); precisa T-QA-13 verde + T-DEVOPS-14 |
| W9 — content AI emphasis (sequencial) | T-FE-WAVE5 → T-FE-WAVE6; depende de T-FE-WAVE3 e T-CONTENT-06 (`[x]`); paralelo seguro com W2/W4/W5/W8 |
| W10 — área de Projetos (Grupo B, parcialmente paralelizável) | T-FE-PROJ-01 destrava todas; T-FE-PROJ-02 e T-FE-PROJ-04 e T-FE-PROJ-07 podem rodar em paralelo após T-FE-PROJ-01; T-FE-PROJ-03 espera T-FE-PROJ-02; T-FE-PROJ-05 e T-FE-PROJ-06 esperam T-FE-PROJ-04; T-FE-PROJ-07 fecha o ciclo com gate CI. **NOVA dep (D1, 2026-05-16):** T-FE-PROJ-02 também espera T-FE-QUAL-03 (sidebar replacement) |
| W11 — Fase 2b qualidade frontend (Q1-Q7 consensus 2026-05-16) | T-FE-QUAL-01 (TS hygiene + strict) é o destravador da maior parte do bloco. T-FE-QUAL-02 (bridges) e T-FE-QUAL-07 (lang persistence) e T-FE-QUAL-09 (EmailModal dark) e T-FE-QUAL-10 (CV PDFs) são INDEPENDENTES e podem rodar em paralelo a qualquer momento. T-FE-QUAL-03 (sidebar) → T-FE-QUAL-04 (shell) → T-FE-QUAL-05 (page unification) é a cadeia sequencial principal. T-FE-QUAL-06 (i18n) e T-FE-QUAL-08 (RoleCollapsible) dependem de T-FE-QUAL-01 e podem rodar em paralelo entre si. T-FE-QUAL-03 também é PRÉ-REQUISITO de T-FE-PROJ-02 (decisão D1) |

## Próxima tarefa imediata

**Frente DevOps (em execução pelo `devops-engineer` agora):** T-DEVOPS-02a, T-DEVOPS-02a-fix,
T-DEVOPS-03, T-DEVOPS-05 são o caminho crítico para destravar T-DEVOPS-08 (stage apply).

**Frente Frontend (independente):** T-FE-05 (Radix Dialog para modais) e T-CONTENT-05
(otimização de assets) podem ser pegos pelo `software-engineer` em paralelo — não dependem
de nenhuma task DevOps em curso.

**Frente Conteúdo + Identidade Visual (sequencial, alta prioridade do operador):**
T-CONTENT-06 (refresh LinkedIn nos 3 JSONs + cv.pdf) é o destravador de T-FE-WAVE1
(paleta amber + dark mode toggle), seguido de T-FE-WAVE2 (microinteractions) e
T-FE-WAVE3 (Hero memorável). Owner: `software-engineer`; QA pareia em PR review com
Axe + Lighthouse local. **Concluído em 2026-05-15.**

**Frente Content AI emphasis (Fase 7, próxima da fila do `software-engineer`):**
T-FE-WAVE5 (conteúdo refresh AI-aware: nova tagline, `Position.skills`,
`highlightProject` no Santander Senior, matchers `ai-tooling` expandidos) →
T-FE-WAVE6 (componentes `RoleSkillBadges` + `HighlightProjectBlock`). Owner:
`software-engineer`; QA pareia em PR review com Axe + Lighthouse local.
Especificada em `specs/features/content-ai-emphasis/SPEC.md` (F-P0-08).

**Frente QA (bloqueada):** T-QA-13 fica em fila — só destrava após T-DEVOPS-08 (precisa de
URL `https://stage.marco-menezes.com` real para calibrar Lighthouse). É o próximo da
qa-engineer assim que stage estiver no ar. Em seguida, T-QA-15 (E2E pós-deploy stage
bloqueante + prod smoke) é o gate crítico classificado pelo operador como CRÍTICO no
plano `agora-precisamos-que-nossos-twinkling-frost.md`.

**Frente Área de Projetos (Fase 8 — Grupo B do plano `algum-feedback-sobre-o-merry-kay.md`):**
T-FE-PROJ-01 (modelo `Project` discriminated union + Zod) é o destravador único — após
mergeado, T-FE-PROJ-02 (`/projetos` index), T-FE-PROJ-04 (templates per-kind) e
T-FE-PROJ-07 (CI parity gate) podem ser pegos em paralelo. T-FE-PROJ-03 (nav header +
3º CTA) segue T-FE-PROJ-02; T-FE-PROJ-05 (diagramas SVG light/dark) e T-FE-PROJ-06
(link-out de tauan-games para GH Pages) seguem T-FE-PROJ-04. **Atualização 2026-05-16
(decisão D1 do PE):** T-FE-PROJ-02 ganhou dep adicional em T-FE-QUAL-03 (sidebar
replacement) — a nav `/projetos` deve ser adicionada na shape limpa, não na primitiva
de 761 LOC. Owner padrão: `frontend-engineer`; publicação dos 2 jogos no GH Pages do
repo `tauan-games` (pré-condição de T-FE-PROJ-06 para merge `main`) é PR separado,
domínio do `game-developer`. Especificadas em `specs/features/projects-{content-model,
index-page,nav-projects-cta,page-templates,architecture-diagrams,tauan-games-link-out,
content-i18n-parity}/SPEC.md` (F-P0-09..15).

**Frente Qualidade Frontend (Fase 2b — Q1–Q7 consensus 2026-05-16):**
Decorre da rodada de revisão profunda software-architect + frontend-engineer
(reports em `.dadaia/reports/portifolio/{software-architect,frontend-engineer}/`).
Tarefas T-FE-QUAL-01 a T-FE-QUAL-10. Caminho crítico:
T-FE-QUAL-01 (TypeScript hygiene + strict + CI gate, ~2h) é o desbloqueador da
maior parte do bloco; libera T-FE-QUAL-03, T-FE-QUAL-06, T-FE-QUAL-08. A cadeia
sequencial principal é T-FE-QUAL-03 (sidebar, ~3h) → T-FE-QUAL-04 (project layout
shell, ~3h) → T-FE-QUAL-05 (page unification, ~3h) — fundamental para Fase 8 (D1
do PE marca T-FE-QUAL-03 como bloqueante de T-FE-PROJ-02). Tarefas independentes
que podem rodar em qualquer momento e ser paralelizadas com qualquer outra frente:
T-FE-QUAL-02 (bridges, ~30min — bundlable com QUAL-01), T-FE-QUAL-07 (language
persistence, ~30min), T-FE-QUAL-09 (EmailModal dark mode, ~30min), T-FE-QUAL-10
(CV PDFs, ~15-30min, **decisão de produto pendente do operador entre Opção A e
Opção B na própria task**). Owner: `frontend-engineer`; QA pareia em PR review
(Axe + tipos + smoke).
