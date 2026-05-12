# Tasks: site-recovery

> **Status:** Aprovado
> **Owner:** portifolio
> **Spec:** `specs/features/site-recovery/SPEC.md`
> **Plan:** `specs/features/site-recovery/PLAN.md`

## Bloco A — Baseline Operacional

- [x] A1. Validar frontend local com `npm ci`, `npm run build`, `npm run lint`.
- [ ] A2. Validar disponibilidade publica de `https://marco-menezes.com` (headers/status HTTPS). `Bloqueio: DNS indisponivel neste ambiente.`
- [x] A3. Verificar precondicoes locais: `terraform -version`, `aws --version`. `Resultado: ambos ausentes no host.`
- [ ] A4. Verificar identidade AWS com `aws sts get-caller-identity`. `Bloqueio: sem credenciais/acesso AWS neste ambiente.`
- [ ] A5. Executar `terraform init` e `terraform plan`. `Bloqueio: Terraform CLI ausente e sem acesso AWS.`
- [x] A6. Registrar riscos de drift (destruicao de S3/CloudFront/ACM/Route53 bloqueia avanco sem aprovacao explicita).

## Bloco B — Fonte Canonica E Curadoria

- [x] B1. Inventariar fontes canonicas usadas nesta rodada:
  - `.../.openclaw/workspace/marco-skills.md`
  - CV mais recente em `.../.openclaw/workspace/output/`.
- [x] B2. Registrar data de coleta e arquivo selecionado como CV canonico.
- [x] B3. Criar matriz de mapeamento campo publico -> fonte (resumo, experiencias, skills, certificacoes, educacao).
- [x] B4. Definir conflitos e resolucoes aplicadas (quando houver divergencia entre fontes).
- [x] B5. Definir e validar blacklist de campos proibidos (job hunt, salario, candidaturas, notas privadas).

## Bloco C — Atualizacao De Conteudo

- [x] C1. Atualizar `frontend/src/data/content/pt.ts` com dados profissionais atuais.
- [x] C2. Atualizar `frontend/src/data/content/en.ts` mantendo equivalencia estrutural.
- [x] C3. Atualizar `frontend/src/data/content/de.ts` mantendo equivalencia estrutural.
- [x] C4. Ajustar `frontend/src/data/content/types.ts` somente se necessario para requisitos FR-009..FR-014.
- [x] C5. Revisar consistencia de periodos, cargos, skills e certificacoes entre idiomas.
- [x] C6. Revisar links de certificacao e disponibilidade de assets de badges.

## Bloco D — Validacao Final E Readiness

- [x] D1. Reexecutar `npm run build` e `npm run lint` apos alteracoes de conteudo.
- [x] D2. Verificar ausencia de dados sensiveis no conteudo publico.
- [x] D3. Consolidar checklist de readiness para deploy (build/CI/domain/terraform).
- [x] D4. Documentar procedimento de redeploy sem passos ocultos.

## Bloco F — Correcoes De Contrato P1 (pre-requisito para content-system)

- [x] F1. Adicionar AI-900, SC-900, DP-900 em `en.ts` e `de.ts` mantendo mesma estrutura de `pt.ts`.
- [x] F2. Versionar PDFs de CV em `frontend/public/cv/`; atualizar hrefs em `Header.tsx` para `/cv/*.pdf`.
- [x] F3. Mover `contact` (email, linkedinUrl, githubUrl) para `ContentData`; corrigir email (`marcoaurelioreislima@gmail.com`); passar URLs reais de LinkedIn e GitHub.
- [x] F4. Mover strings PT hardcoded em componentes para `ContentData` (`careerProgression`, `position(s)`, `issuerLabel`, `viewLarger`, `resumeFileLabel`, `emailModalTitle`, `emailSendButton`, `nav.*`).
- [x] F5. Ligar `"strict": true` em `tsconfig.app.json`; remover overrides permissivos em `tsconfig.json`; corrigir erros de compilacao resultantes.
- [x] F6. Adicionar `frontend/src/data/content/_validate.ts` que falha o build se PT/EN/DE divergirem em estrutura de `certifications` e `experiences`.

## Criterios De Aceite Da Feature

- [x] E1. Build local concluido com sucesso.
- [ ] E2. Dominio canonicamente acessivel em HTTPS. `Pendente por bloqueio de DNS no ambiente atual.`
- [ ] E3. `terraform plan` executado e revisado. `Pendente por ausencia de Terraform/AWS no ambiente atual.`
- [x] E4. Conteudo PT/EN/DE atualizado pela fonte canonica OpenClaw.
- [x] E5. Nenhum dado de job hunt/salario/candidatura publicado.
- [x] E6. Checklist de deploy readiness finalizado.
