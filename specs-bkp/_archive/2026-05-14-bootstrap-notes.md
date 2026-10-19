# Bootstrap OIDC — registro histórico (2026-05-14)

> Arquivo de histórico. Não é spec ativa. Documenta a execução pontual de T-DEVOPS-02
> (bootstrap inicial do OIDC provider + bootstrap role) realizada em 2026-05-14, e a
> decisão de papéis que a autorizou (foundation/SPEC.md §10.b).

---

## 1. O que foi feito

Execução de T-DEVOPS-02 — bootstrap do GitHub Actions OIDC para o projeto `portifolio`.

### Recursos criados na conta AWS `016098071081`

- **OIDC provider:**
  `arn:aws:iam::016098071081:oidc-provider/token.actions.githubusercontent.com`
  - Thumbprint: `6938fd4d98bab03faadb97b34396831e3780aea1`
  - Audience: `sts.amazonaws.com`
- **Bootstrap IAM role:**
  `arn:aws:iam::016098071081:role/github-actions-portfolio-bootstrap`
  - Trust: `repo:marcoaureliomenezes/portifolio:*` (StringLike em `sub`).
  - Policy attached: `AdministratorAccess` (gerenciada AWS).
  - Status: temporária — será deletada via T-DEVOPS-13 após o primeiro
    `terraform-prod-apply` bem-sucedido criar a role OIDC final
    `github-actions-portfolio-deploy`.

### Quem executou

- **Operador:** marco (marcoaurelioreislima@gmail.com).
- **Papel acionado:** **Infra Specialist** (foundation/SPEC.md §10.b).
- **Fluxo usado:** **Fluxo B** — máquina local com credenciais AWS de privilégio IAM
  (não Fluxo A / CloudShell).

### Por que Fluxo B (e não Fluxo A)

Decisão registrada em chat pelo operador (citação literal):

> "Aqui estamos nas configurações iniciais. Não são os desenvolvedores com as credenciais,
> são os especialistas em Infra. Continua ativo que nada se criará via SDK posteriormente.
> Isso busca mantermos uma governança. Mas nessas configurações agora, iniciais,
> precisamos para automatizar o serviço."

Interpretação consolidada:

- **Developer:** continua sem credenciais AWS locais. Nada muda no fluxo de Developer.
- **Infra Specialist:** tem credenciais durante o bootstrap inicial. Exceção autorizada
  por persona, não por usuário individual.
- **Pós-bootstrap:** todo o ciclo de aplicação volta a passar via GitHub Actions OIDC.
  Nenhuma operação de aplicação ocorre localmente após este ponto.
- **Motivação declarada:** preservar governança (audit log centralizado via CloudTrail,
  blast radius limitado, identidade auditável) ao mesmo tempo em que se adota pragmatismo
  no setup inicial em que não há ainda caminho via CI.

A decisão foi incorporada às specs em:

- `foundation/SPEC.md §10` (reformulado com §10.a Developer / §10.b Infra Specialist /
  §10.c checklist de break-glass / §10.d proibições absolutas / §10.e autorizado / §10.f
  racional).
- `security/SPEC.md §6b FR-S29..S31` (atualizado por papel).
- `features/infra-retomada/SPEC.md §5` (Fluxo A vs Fluxo B explicitados).
- `specs/SPEC.md §4b CT-01..CT-04` (constraints transversais por papel).
- `specs/TASKS.md` (T-DEVOPS-02 marcado `[x]`, nova task T-DEVOPS-02a-fix adicionada).

---

## 2. Pendências derivadas

### T-DEVOPS-02a-fix (devops-engineer, PR separado, não-bloqueante)

O script `scripts/bootstrap-oidc.sh` (criado em T-DEVOPS-02a) atualmente tem guard estrito
de `AWS_EXECUTION_ENV` que aborta execução fora de CloudShell. Esse guard precisa ser
relaxado para suportar `INFRA_SPECIALIST_MODE=1` (vide spec atualizada em
`features/infra-retomada/SPEC.md §5.2`).

Como o bootstrap já foi executado, esta pendência **não bloqueia** nenhuma task downstream.
Ela formaliza no artefato versionado o caminho que foi de fato adotado. Próximo rerun
(caso necessário por destruição acidental) deve usar a versão dual-mode do script.

### T-DEVOPS-13 (devops-engineer, futuro)

Após o primeiro `terraform-prod-apply` bem-sucedido criar a role OIDC final
`github-actions-portfolio-deploy`, a bootstrap role acima deve ser deletada via job CI
dedicado (workflow `cleanup-bootstrap.yml` ou step manual-trigger). Vide T-DEVOPS-13 em
`specs/TASKS.md`.

---

## 3. Audit trail

A operação de bootstrap é auditável via CloudTrail na conta `016098071081`:

- Eventos `CreateOpenIDConnectProvider` e `CreateRole` com principal sendo a identidade
  humana de marco (via SSO/console ou via access key local com privilégio IAM —
  configuração de Infra Specialist).
- Janela temporal: 2026-05-14 (data de criação).
- Pós-bootstrap, qualquer operação subsequente em IAM ou recursos do projeto que apareça
  no CloudTrail com principal humano (não `assumed-role/github-actions-portfolio-*`) deve
  ser investigada — é um desvio da política pós-bootstrap descrita em
  `foundation/SPEC.md §10.d`.

---

## 4. Decisão de arquivo

Este registro vive em `specs/_archive/` (não em `specs/features/` nem em `specs/memory/`)
porque é um registro histórico de execução, não uma spec ativa. Foundation §10 e
infra-retomada §5 incorporaram o conteúdo normativo da decisão; este arquivo preserva
apenas o contexto, a citação literal do operador, e os ARNs criados.
