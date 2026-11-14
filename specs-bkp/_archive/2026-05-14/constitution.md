# Constitution: portifolio

> Leis imutáveis. Todo agente de IA trabalhando neste projeto DEVE seguir estas regras.
> Nunca implemente sem um SPEC.md aprovado. Nunca avance de fase sem aprovação humana explícita.

---

## Propósito do Projeto

Site pessoal de portfólio profissional — apresenta projetos, certificações e experiência de Marco Aurélio. Frontend estático (React/Vite) hospedado via AWS S3 + CloudFront. Backend Flask para dados dinâmicos.

---

## Stack Tecnológica

| Componente | Tecnologia |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Python, Flask |
| Infra | AWS S3 + CloudFront (static), Terraform (IaC) |
| CI/CD | GitHub Actions |
| Package Manager | Bun (frontend) |

---

## Princípios de Desenvolvimento

1. **Frontend-first** — o site deve carregar sem depender do backend
2. **Infra como código** — toda infra AWS declarada em Terraform, nunca via console
3. **Imagens otimizadas** — assets públicos sempre comprimidos e com cache adequado

---

## Fluxo SDD (Spec-Driven Development)

```
SPEC.md [x Approved] → PLAN.md [x Approved] → TASKS.md [x Approved] → Implementação
```

Cada seta requer aprovação humana explícita. Não há exceção automática.

---

## Estrutura do Repositório

```
specs/
  constitution.md       ← este arquivo
  features/
    frontend/           ← features de UI/UX
    backend/            ← features de API
    infra/              ← features de infraestrutura
  memory/
    product.md
    tech-stack.md
  security/
    SPEC.md
frontend/               ← código React/Vite
backend/                ← código Flask
terraform/              ← IaC AWS
scripts/                ← automação
```
