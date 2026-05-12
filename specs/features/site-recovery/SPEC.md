# Feature Spec: site-recovery

> **Status:** Aprovado
> **Owner:** portifolio
> **Tipo:** recuperacao operacional + base de conteudo

## Problema

O site `marco-menezes.com` precisa ficar funcional, atualizavel e recuperavel com seguranca.

Hoje existem dois problemas ao mesmo tempo:
1. Risco operacional: possivel drift entre frontend, CI/CD e Terraform.
2. Risco de conteudo: portfolio desatualizado em relacao aos dados profissionais reais.

Ja existem dados confiaveis no ambiente OpenClaw (curriculos e arquivos de habilidades/experiencia), mas ainda nao existe processo especificado para transformar essa base em conteudo publico versionado no portfolio.

## Objetivos

1. Validar se o site publico esta acessivel.
2. Validar se o frontend ainda compila localmente e no CI.
3. Validar se a infraestrutura AWS pode ser reconciliada pelo Terraform.
4. Garantir que o dominio canonico `marco-menezes.com` esteja documentado e usado.
5. Produzir um caminho seguro para redeploy sem destruicao acidental.
6. Definir a fonte canonica de dados profissionais para atualizar o portfolio.
7. Definir processo repetivel de atualizacao de conteudo sem publicar dados sensiveis.

## Fora De Escopo

- Redesign visual.
- Criacao das paginas de projetos.
- Migracao para outro provedor de hosting.
- Alteracao manual no console AWS como fluxo principal.
- Publicar informacoes de candidaturas, salario, estrategia de job hunt ou dados privados.

## Fonte Canonica De Conteudo

Para esta feature, a fonte canonica de dados profissionais e:

- OpenClaw workspace:
  - `/home/ubuntu/workspace/mnt/openclaw/data/.openclaw/workspace/marco-skills.md`
  - `/home/ubuntu/workspace/mnt/openclaw/data/.openclaw/workspace/output/Marco_Menezes_CV_*.pdf`

Fallback permitido:

- Conteudo atual em `frontend/src/data/content/{pt,en,de}.ts` apenas para preencher lacunas.

Fonte nao-canonica (nao publicar):

- Arquivos de applications/job hunt (ex.: `marco-applications.md`, `marco-job-hunt.md`).

## Requisitos Funcionais

- **FR-001:** O processo de recovery deve iniciar com validacao local do frontend usando npm.
- **FR-002:** O processo deve verificar disponibilidade publica de `https://marco-menezes.com`.
- **FR-003:** O processo deve verificar que Terraform CLI e AWS CLI existem antes de qualquer validacao de infra.
- **FR-004:** O processo deve confirmar identidade AWS com `aws sts get-caller-identity`.
- **FR-005:** O processo deve rodar `terraform init` e `terraform plan` antes de qualquer `apply`.
- **FR-006:** O processo deve rejeitar qualquer plano que destrua S3, CloudFront, ACM ou Route 53 sem aprovacao explicita.
- **FR-007:** O processo deve registrar os GitHub Secrets necessarios para deploy.
- **FR-008:** O processo deve verificar que GitHub Actions consegue fazer build antes de deploy de producao.
- **FR-009:** O processo deve gerar um inventario versionado de fontes de conteudo usadas na atualizacao (arquivos + data de coleta).
- **FR-010:** O processo deve mapear campos publicos do portfolio para as fontes canonicas (resumo, experiencias, skills, certificacoes, educacao).
- **FR-011:** O processo deve atualizar o conteudo publico em PT/EN/DE com a mesma estrutura tipada.
- **FR-012:** O processo deve bloquear a publicacao de dados nao profissionais (job hunt, salario, notas privadas).
- **FR-013:** O processo deve registrar conflitos entre fontes (quando existirem) e a decisao aplicada.
- **FR-014:** O processo deve preferir a versao de CV mais recente da pasta `workspace/output` quando houver divergencia temporal.

## Requisitos Nao Funcionais

- **NFR-001:** Recovery deve ser reversivel sempre que possivel.
- **NFR-002:** Recovery nao deve depender de `frontend/dist` versionado.
- **NFR-003:** Recovery deve tratar AWS como fonte operacional, mas Terraform como fonte desejada.
- **NFR-004:** Recovery deve documentar qualquer drift encontrado.
- **NFR-005:** Atualizacao de conteudo deve ser auditavel por PR (diff legivel, sem fonte implicita).
- **NFR-006:** O contrato de conteudo deve manter compatibilidade entre idiomas (PT/EN/DE).
- **NFR-007:** A atualizacao deve evitar alteracoes manuais repetitivas fora da base de dados.

## Criterios De Aceite

- Build local do frontend concluido com sucesso.
- `terraform plan` executado e revisado.
- GitHub Secrets confirmados ou listados como pendentes.
- Dominio canonico resolvendo para CloudFront.
- HTTPS valido em `https://marco-menezes.com`.
- Procedimento de redeploy documentado sem passos ocultos.
- Inventario de fontes de conteudo criado e versionado no repositorio.
- Conteudo publico refletindo dados profissionais recentes da base canonica.
- Nenhum dado de candidatura/salario publicado no site.
- PT/EN/DE compilando sem quebra de tipos.

## Verificacao

Comandos esperados quando a feature tiver PLAN/TASKS aprovados:

```bash
cd frontend
npm ci
npm run build
npm run lint
```

```bash
terraform -version
aws --version
aws sts get-caller-identity
cd terraform
terraform init
terraform plan
```

```bash
curl -I https://marco-menezes.com
```

Revisao de conteudo esperada:

- Conferir atualizacao de:
  - `frontend/src/data/content/pt.ts`
  - `frontend/src/data/content/en.ts`
  - `frontend/src/data/content/de.ts`
  - `frontend/src/data/content/types.ts` (se houver extensao de contrato)
- Conferir que nao existem referencias publicas a job hunt/salario.

## Riscos

- Terraform e AWS CLI nao estao instalados no ambiente atual.
- O dominio no exemplo de Terraform diverge do dominio canonico.
- A infraestrutura pode existir parcialmente e exigir import ou reconciliacao.
- GitHub Actions pode estar configurado com secrets antigos ou ausentes.
- Divergencias entre versoes de curriculo podem gerar conflitos de narrativa.
- Traducao automatica para EN/DE pode introduzir imprecisao sem revisao humana final.
