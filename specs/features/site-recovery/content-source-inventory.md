# Content Source Inventory — site-recovery

Data de coleta (UTC): 2026-05-10

## Fontes canonicas usadas

1. `/home/ubuntu/workspace/mnt/openclaw/data/.openclaw/workspace/marco-skills.md`
2. `/home/ubuntu/workspace/mnt/openclaw/data/.openclaw/workspace/output/Marco_Menezes_CV_PlainConcepts_SAFE_20260501.pdf`

## Fontes auxiliares (fallback)

1. `frontend/src/data/content/pt.ts`
2. `frontend/src/data/content/en.ts`
3. `frontend/src/data/content/de.ts`

## Fontes explicitamente proibidas para publicacao

1. `/home/ubuntu/workspace/mnt/openclaw/data/.openclaw/workspace/marco-applications.md`
2. `/home/ubuntu/workspace/mnt/openclaw/data/.openclaw/workspace/marco-job-hunt.md`

## Regras de selecao aplicadas

1. Preferencia por dados profissionais em `marco-skills.md`.
2. Em caso de divergencia temporal de curriculo, prevalece arquivo mais recente em `workspace/output/`.
3. Informacoes sensiveis (candidaturas, salario, estrategia de job hunt) nao entram no conteudo publico.
