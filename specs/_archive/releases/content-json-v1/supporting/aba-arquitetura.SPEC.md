# F-P0-05 — Aba "Arquitetura deste portfólio"

**Status:** Aprovado

## 1. Contexto

Meta-página auto-referencial: explica como o próprio portfólio é construído (stack,
terraform, OIDC, custo mensal). Diferencia o portfólio de um currículo genérico: "leia o
que eu construí para te mostrar".

Para a comunidade técnica é a aba mais interessante; é também o caminho para discussão
técnica em entrevistas.

## 2. Objetivo

Entregar página `/projetos/portifolio` (ou `/arquitetura` — operador decide URL final) com
diagrama da topologia AWS, tabela de custos mensais, lista de decisões arquiteturais
resumidas com links para specs/ADRs.

## 3. Rota e estrutura

- **Rota:** `/projetos/portifolio` (default — consistente com `/projetos/<slug>`).
- **Componente:** `pages/projects/ArchitecturePage.tsx` (instância de `ProjectTabPage`).
- **Estrutura:**
  1. Hero: título + 1 linha de pitch ("Este portfólio em produção").
  2. **Diagrama**: S3 → CloudFront → ACM → Route53 (SVG estático).
  3. **Stack**: tabela de tecnologias (link para `specs/memory/tech-stack.md` no repo).
  4. **Tabela de custos mensais** (manual no P0; automatizada no P1).
  5. **Decisões arquiteturais resumidas**: bullet list com link para spec/ADR.
  6. **Links**: GitHub repo do portfólio, terraform/, specs/.

## 4. Conteúdo (placeholders + dados reais)

```json
{
  "projects": {
    "portifolio": {
      "hero": {
        "title": "Arquitetura deste portfólio",
        "tagline": "Como este site é construído, hospedado e mantido."
      },
      "diagram": "/assets/projects/portifolio/architecture.svg",
      "stack": [
        { "layer": "Frontend", "tech": "React 18 + Vite 7 + TypeScript 5" },
        { "layer": "UI", "tech": "Tailwind CSS 3 + shadcn/ui (podado)" },
        { "layer": "Testes", "tech": "Vitest + Playwright + LHCI" },
        { "layer": "Infra", "tech": "S3 + CloudFront + ACM + Route53" },
        { "layer": "IaC", "tech": "Terraform 1.9, backend S3 remoto" },
        { "layer": "CI/CD", "tech": "GitHub Actions com OIDC" }
      ],
      "costs": [
        { "service": "Route53 hosted zone", "monthly_usd": 0.50 },
        { "service": "S3 storage", "monthly_usd": 0.00 },
        { "service": "CloudFront", "monthly_usd": 0.00 },
        { "service": "ACM cert", "monthly_usd": 0.00 },
        { "service": "Total estimado", "monthly_usd": 0.51 }
      ],
      "decisions": [
        { "title": "React/Vite refator (não Next.js/Astro)", "rationale": "ROI alto para 5 rotas estáticas; sem benefícios SSR/edge necessários.", "spec": "specs/memory/architecture.md" },
        { "title": "2 ambientes AWS (stage + prod), dev local", "rationale": "Gate explícito antes de prod sem custo extra.", "spec": "specs/foundation/SPEC.md" },
        { "title": "OIDC sem long-lived keys", "rationale": "Sem secret manager exposto; trust restrito ao repo.", "spec": "specs/security/SPEC.md" },
        { "title": "CMS-lite no roadmap (não no P0)", "rationale": "Sem redeploy para mudar texto, sem complexidade adicional agora.", "spec": "specs/features/cms-lite/SPEC.md" }
      ],
      "links": {
        "repo": "https://github.com/marcoaureliomenezes/portifolio",
        "terraform": "https://github.com/marcoaureliomenezes/portifolio/tree/main/terraform",
        "specs": "https://github.com/marcoaureliomenezes/portifolio/tree/main/specs"
      },
      "seo": {
        "title": "Arquitetura deste portfólio — Marco Menezes",
        "description": "Stack, infra terraform, custos mensais e decisões arquiteturais do site marco-menezes.com."
      }
    }
  }
}
```

## 5. Critérios de aceite

- **A1.** Rota renderiza com `<h1>` único e diagrama visível.
- **A2.** Diagrama legível em mobile e desktop (SVG responsivo).
- **A3.** Tabela de custos tem ≥ 1 linha real (E2E-07).
- **A4.** Link para o GitHub do `portifolio` é visível e correto (E2E-07).
- **A5.** Lighthouse Performance ≥ 90 (diagrama SVG, sem imagens raster pesadas).
- **A6.** Decisões arquiteturais linkam para arquivos de spec **no GitHub** (não rotas
  internas) — facilitam descoberta para visitantes técnicos.
- **A7.** Conteúdo em pt+en com paridade.
- **A8.** Aparece no menu principal.

## 6. Fora de escopo

- Dashboard de custo em tempo real (P2).
- Embed Lighthouse score live (P2).
- Auto-geração do diagrama a partir do terraform (P2).

## 7. Dependências

- `useContent()` (T-FE-02).
- `ProjectTabPage` (T-FE-15).
- Diagrama SVG criado (T-CONTENT-04 — operador entrega via Excalidraw/draw.io/Mermaid CLI).

## 8. Decisões fechadas

- **D-ARCH-01.** Custos atualizados manualmente no JSON. Operador atualiza
  trimestralmente. P1 considera automatização via Cost Explorer + Lambda agendado.
- **D-ARCH-02.** Diagrama é SVG estático (não Mermaid runtime — economiza bundle JS).
  Operador gera com Excalidraw/draw.io; PE arquiva fonte editável em `docs/diagrams/`.
- **D-ARCH-03.** Links para specs vão para GitHub web (não rota interna do portfólio) —
  evita rota `/specs/*` e expõe a auditoria pública.

## 9. Referências

- Briefing 2.0 §4 F-P0-05.
- qa §4 E2E-07.
- devops §8 (tabela de custos como fonte).
