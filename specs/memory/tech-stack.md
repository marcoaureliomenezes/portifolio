# Tech Stack Memory: portifolio

## Frontend

- Framework: React 18.
- Linguagem: TypeScript 5.
- Build tool: Vite 5.
- CSS: Tailwind CSS 3.
- UI: shadcn/ui, Radix UI, lucide-react.
- Roteamento: react-router-dom.
- Estado local: React state.
- Data fetching: TanStack Query esta instalado, mas o site atual e static-first.
- Package manager canonico: npm.
- Lockfile canonico: `frontend/package-lock.json`.

Comandos:

```bash
cd frontend
npm ci
npm run build
npm run lint
npm run preview
```

## Conteudo

O conteudo publico esta versionado em TypeScript:

- `frontend/src/data/content/types.ts`
- `frontend/src/data/content/pt.ts`
- `frontend/src/data/content/en.ts`
- `frontend/src/data/content/de.ts`

Qualquer novo campo publico deve ser refletido no tipo compartilhado e preenchido nos tres idiomas.

## Backend Local

`backend/` contem servidores Flask para desenvolvimento e preview local.

Uso atual:

- Servir `frontend/dist` em `localhost:8000`.
- Facilitar teste em rede local/mobile.
- Fazer fallback para `index.html` em rotas SPA.

Nao e parte obrigatoria da arquitetura de producao.

## Infraestrutura AWS

Terraform define:

- S3 para hosting estatico.
- Versionamento e criptografia server-side no S3.
- Public access block controlado para uso com CloudFront.
- CloudFront com Origin Access Control.
- ACM certificate em `us-east-1`.
- Route 53 alias para o dominio raiz.
- IAM user opcional para manutencao/deploy.
- Remote backend S3 para state: bucket `dadaia-s3-bucket-terraform-rm-state`, key `portifolio/terraform.tfstate`.

Pre-requisitos para recovery:

```bash
terraform -version
aws --version
aws sts get-caller-identity
```

## CI/CD

- `.github/workflows/test.yml`
  - Executa em pull requests para `main`.
  - Roda `npm ci`.
  - Roda `npm run build`.
  - Verifica `dist/index.html`, `dist/assets` e arquivo nao vazio.

- `.github/workflows/production-deploy.yml`
  - Executa em push para `main` ou PR mergeado.
  - Roda build do frontend.
  - Sincroniza `frontend/dist` para S3.
  - Invalida CloudFront.

Secrets esperados:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `CLOUDFRONT_DISTRIBUTION_ID`

## Inconsistencias Conhecidas

- `README.md` ainda menciona Bun, mas a automacao real usa npm.
- `terraform/terraform.tfvars.example` usa `marcomenezes.com`, enquanto o dominio canonico informado e `marco-menezes.com`.
- Alguns scripts e docs contem trechos duplicados ou antigos.
- `scripts/check_infrastructure.sh` contem bloco duplicado no meio da funcao `check_frontend`.
- `backend/README.md` menciona uso de Gunicorn, mas o deploy canonico atual e estatico via AWS.

Essas inconsistencias devem virar tarefas depois que as specs forem aprovadas.

## Validacao Local Esperada

Validacao minima de frontend:

```bash
cd frontend
npm ci
npm run build
npm run lint
```

Validacao minima de infra:

```bash
cd terraform
terraform init
terraform plan
```

Validacao de producao:

```bash
curl -I https://marco-menezes.com
```
