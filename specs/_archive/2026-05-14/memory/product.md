# Product Memory: portifolio

## O que é

Site de portfólio pessoal de Marco Aurélio — Data Engineer / AI Engineer. Apresenta projetos, certificações (AWS, Azure, Databricks) e experiência profissional.

## Para quem

Recrutadores e profissionais da área de dados/engenharia que avaliam o perfil técnico do autor.

## Features Atuais

| Feature | Descrição | Status |
|---|---|---|
| Home / Hero | Apresentação pessoal e bio | Funcional |
| Projetos | Cards com links para repositórios GitHub | Funcional |
| Certificações | Badges AWS, Azure, Databricks | Funcional |
| Deploy CI/CD | GitHub Actions → S3 + CloudFront invalidation | Funcional |

## Domínio / Deploy

- Hospedado em AWS S3 + CloudFront
- CI/CD via GitHub Actions (`workflows/`)
- Terraform gerencia toda a infra AWS
