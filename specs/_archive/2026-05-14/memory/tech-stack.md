# Tech-Stack Memory: portifolio

## Frontend

| Componente | Tecnologia | Versão |
|---|---|---|
| Framework | React | 18+ |
| Linguagem | TypeScript | 5+ |
| Build tool | Vite | latest |
| CSS | Tailwind CSS | 3+ |
| Package manager | Bun | latest |
| UI Components | shadcn/ui | latest |

## Backend

| Componente | Tecnologia | Notas |
|---|---|---|
| Framework | Flask | Python 3.x |
| Servidor prod | Gunicorn | `stable_server.py` |
| Dev server | Flask dev | `auto_reload_server.py` |

## Infraestrutura AWS

| Serviço | Uso |
|---|---|
| S3 | Hosting do build estático do frontend |
| CloudFront | CDN + HTTPS + cache |
| Route 53 | DNS (se configurado) |
| IAM | Usuário de deploy com permissões mínimas |

## CI/CD

- **GitHub Actions** — `.github/workflows/`
- Build do frontend + sync para S3 + invalidação do CloudFront
- Secrets gerenciados via GitHub Secrets (nunca em código)

## Terraform

- Estado local (sem remote backend por padrão)
- `terraform.tfvars` gitignored — `terraform.tfvars.example` é o template
