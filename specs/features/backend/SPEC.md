# Feature Spec: backend

> **Status:** [x] Aprovado
> **Owner:** portifolio
> **Tipo:** tooling de desenvolvimento e qualidade

## Problema

O portfolio precisa ser validado visualmente antes de cada deploy — responsividade, design, navegacao entre idiomas e comportamento de SPA. Sem um servidor local que sirva o build final (`frontend/dist`), o ciclo de validacao exige subir para producao sem confianca.

Alem disso, testes E2E com Playwright precisam de um servidor HTTP real rodando localmente para navegar no site como um usuario faria.

## Objetivos

1. Prover servidor Flask local que sirva `frontend/dist` com SPA fallback para `index.html`.
2. Permitir que testes Playwright rodem contra o build local antes do deploy.
3. Consolidar os servidores Flask existentes em um unico ponto de entrada parametrizavel.
4. Documentar o fluxo de validacao local obrigatorio antes de qualquer push para `main`.

## Fora De Escopo

- Deploy de producao via Flask ou Gunicorn.
- API produtiva de qualquer tipo.
- Backend com banco de dados (Lambda + DynamoDB sera spec separada futura).
- Exposicao do servidor local para internet.
- Coleta de dados de visitantes.

## Arquitetura Local

```
frontend/dist/          ← build gerado por `npm run build`
backend/preview_server.py  ← servidor Flask unificado
    --port 8000         ← porta configuravel
    --reload            ← modo dev com auto-reload (opcional)
tests/e2e/              ← testes Playwright
    playwright.config.ts
    tests/
```

Fluxo de uso:

```bash
cd frontend && npm run build   # gerar dist/
cd backend && python preview_server.py --port 8000
npx playwright test            # rodar E2E contra localhost:8000
```

## Requisitos Funcionais

- **FR-001:** O servidor deve servir `frontend/dist` na porta configuravel (padrao: 8000).
- **FR-002:** O servidor deve fazer SPA fallback: qualquer rota nao encontrada retorna `index.html` com status 200.
- **FR-003:** O servidor deve aceitar flag `--reload` para modo desenvolvimento com auto-reload.
- **FR-004:** Deve existir um unico arquivo de servidor (`backend/preview_server.py`) — os tres servidores atuais (`auto_reload_server.py`, `stable_server.py`, `test_server.py`) devem ser consolidados ou removidos.
- **FR-005:** Testes Playwright devem cobrir ao menos: carregamento da pagina principal, troca de idioma (PT/EN/DE), responsividade (viewport mobile e desktop), e links do header (LinkedIn, GitHub, download de CV).
- **FR-006:** O `Makefile` deve expor comandos `make serve` (inicia servidor) e `make test-e2e` (roda Playwright).
- **FR-007:** `backend/README.md` deve documentar exclusivamente uso local — sem instrucoes de deploy, Gunicorn ou exposicao publica.

## Requisitos Nao Funcionais

- **NFR-001:** O servidor nunca deve ser configurado para rodar como servico de producao.
- **NFR-002:** `gunicorn` deve ser removido de `backend/requirements.txt` — nao e usado.
- **NFR-003:** O servidor nao deve imprimir secrets ou variaveis de ambiente.
- **NFR-004:** Testes Playwright devem rodar em modo headless no CI (opcional) e headed localmente.
- **NFR-005:** O servidor deve iniciar em menos de 3 segundos para nao bloquear o fluxo de desenvolvimento.

## Criterios De Aceite

- Um unico `backend/preview_server.py` substitui os tres servidores atuais.
- `make serve` inicia o servidor e serve o site em `localhost:8000`.
- `make test-e2e` roda Playwright e valida ao menos os 5 cenarios do FR-005.
- `backend/README.md` nao contem instrucoes de deploy com Gunicorn.
- `gunicorn` removido de `backend/requirements.txt`.
- Testes Playwright passam localmente contra o build mais recente de `frontend/dist`.

## Riscos

- Playwright pode exigir browsers instalados (`npx playwright install`) — documentar como pre-requisito.
- SPA fallback deve ser consistente com o comportamento do CloudFront em producao (custom_error_response para 404 retornando index.html).
- Se `frontend/dist` nao existir, o servidor deve falhar com mensagem clara, nao erro silencioso.
