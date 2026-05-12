# Constitution: portifolio

> Leis permanentes do projeto. Todo agente trabalhando neste repositório deve seguir estas regras antes de alterar código, infraestrutura ou conteúdo.

## Propósito

`portifolio` é o site pessoal de Marco Aurélio Menezes em `marco-menezes.com`.

O produto deve apresentar, com clareza profissional:

- Identidade, contato e posicionamento profissional.
- Experiência, educação, habilidades e certificações.
- Projetos pessoais e estudos técnicos, com páginas próprias no futuro.
- Evidência pública de atuação em dados, cloud, engenharia e IA.

## Princípios

- **Static-first:** o site de produção deve funcionar como frontend estático gerado por build.
- **Conteúdo estruturado:** informações pessoais, experiências, certificações e projetos devem viver em estruturas de dados versionadas, não espalhadas em JSX.
- **Multi-idioma por contrato:** português, inglês e alemão são idiomas suportados pelo modelo atual.
- **Infra como código:** AWS deve ser descrita por Terraform; mudanças manuais no console são exceção operacional e devem ser reconciliadas depois.
- **Deploy reprodutível:** produção deve ser recuperável a partir de GitHub Actions, Terraform, S3, CloudFront, ACM e Route 53.
- **Sem backend obrigatório em produção:** Flask é servidor local de desenvolvimento e E2E testing — não é API produtiva em produção. Backend produtivo futuro via AWS Lambda + DynamoDB, especificado por feature quando o site começar a hospedar projetos interativos.

## Stack Canônica

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Radix UI.
- Package manager: npm, com `frontend/package-lock.json` como lockfile canônico.
- Build: `npm ci` e `npm run build` dentro de `frontend/`.
- Dev/Test local: Flask servindo `frontend/dist` + Playwright para E2E. Alternativa: `npm run preview`.
- Produção: AWS S3 privado, CloudFront, ACM em `us-east-1`, Route 53, IAM mínimo para deploy.
- CI/CD: GitHub Actions.
- Infra state: Terraform remote backend S3, conforme `terraform/main.tf`.

## Fluxo SDD

Pipeline obrigatório:

```text
SPEC.md [x Approved] -> PLAN.md [x Approved] -> TASKS.md [x Approved] -> Implementação
```

Regras:

- Nenhuma implementação sem SPEC, PLAN e TASKS aprovados para a feature.
- Specs novas começam como `[ ] Draft`.
- Aprovação humana explícita é obrigatória para avançar de fase.
- `specs/` é a fonte de verdade do trabalho planejado.
- Código, Terraform e workflows devem obedecer às specs aprovadas, não ao README se houver divergência.

## Guardrails

Nunca commitar:

- Credenciais AWS.
- `terraform/terraform.tfvars`.
- Estado local do Terraform.
- `frontend/node_modules/`.
- `frontend/dist/`.
- `.env` ou variações locais.

Mudanças sensíveis exigem SPEC aprovada:

- Terraform.
- GitHub Actions.
- Políticas IAM.
- DNS, CloudFront, ACM ou S3.
- Modelo de conteúdo público.
- Rotas públicas e páginas de projeto.

## Estrutura Esperada

```text
specs/
  constitution.md
  memory/
    product.md
    tech-stack.md
  security/
    SPEC.md
  features/
    site-recovery/
      SPEC.md
    content-system/
      SPEC.md
    project-pages/
      SPEC.md
    deploy-pipeline/
      SPEC.md
```
