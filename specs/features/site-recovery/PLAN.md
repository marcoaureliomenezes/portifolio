# Plan: site-recovery

> **Status:** Aprovado
> **Owner:** portifolio
> **Spec:** `specs/features/site-recovery/SPEC.md`

## Objetivo Do Plano

Executar a recuperacao funcional do portfolio em duas frentes integradas:
1. Recuperacao operacional (build, CI/CD, terraform e disponibilidade publica).
2. Recuperacao de conteudo (atualizacao profissional com base canonica OpenClaw).

## Estrategia

### Fase 1 — Baseline Operacional

1. Validar build local do frontend (`npm ci`, `npm run build`, `npm run lint`).
2. Validar dominio publico (`curl -I https://marco-menezes.com`).
3. Validar precondicoes de infra (AWS CLI, Terraform CLI, identidade AWS).
4. Executar `terraform init` e `terraform plan` com analise de risco.
5. Registrar drift e bloqueadores para deploy seguro.

### Fase 2 — Baseline De Conteudo Canonico

1. Inventariar fontes canonicas do OpenClaw:
   - `marco-skills.md`
   - CV mais recente em `workspace/output/`
2. Gerar matriz campo->fonte para dados publicos:
   - resumo, experiencias, skills, certificacoes, educacao.
3. Definir regras de conflito:
   - prevalece CV mais recente quando houver divergencia temporal.
   - dados ausentes podem usar fallback dos arquivos `content/*.ts`.
4. Definir blacklist de publicacao:
   - job hunt, salario, candidaturas e notas privadas.

### Fase 3 — Atualizacao Do Conteudo Do Portfolio

1. Atualizar arquivos de conteudo:
   - `frontend/src/data/content/pt.ts`
   - `frontend/src/data/content/en.ts`
   - `frontend/src/data/content/de.ts`
2. Ajustar `types.ts` apenas se houver lacunas de contrato para FR-009..FR-014.
3. Garantir compatibilidade estrutural PT/EN/DE.
4. Validar links, badges e coerencia de periodos/cargos.

### Fase 4 — Validacao Final E Deploy Readiness

1. Revalidar build/lint apos atualizacao de conteudo.
2. Verificar que nenhuma informacao sensivel foi publicada.
3. Consolidar checklist de release:
   - build ok
   - dominio/https ok
   - terraform plan revisado
   - CI pronto para merge/deploy
4. Documentar procedimento de redeploy sem passos ocultos.

## Entregaveis

1. Site funcional e compilando localmente.
2. Conteudo profissional atualizado e consistente em PT/EN/DE.
3. Inventario e matriz de fontes de conteudo versionados.
4. Diagnostico de drift operacional com acao recomendada.
5. Checklist final de deploy readiness.

## Dependencias E Riscos

1. Dependencia de acesso aos arquivos OpenClaw no host.
2. Possivel ausencia local de ferramentas Terraform/AWS CLI.
3. Possivel drift entre Terraform e estado real AWS.
4. Necessidade de revisao humana final de narrativa/traducao EN/DE.

## Criterio De Conclusao

Plano concluido quando todos os itens de TASKS estiverem completos, com evidencia de:
1. operacional validado,
2. conteudo atualizado pela fonte canonica,
3. zero exposicao de dados sensiveis,
4. readiness para deploy documentado.
