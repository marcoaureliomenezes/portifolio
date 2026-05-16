# F-P0-13 — Projects Architecture Diagrams (`light + dark` SVG convention)

**Status:** Draft

## 1. Contexto

A área de projetos precisa de **diagramas de arquitetura** por projeto — esse é o sinal
técnico mais alto do portfólio (operador define posicionamento como
"Arquitetura + Cloud + Software Engineering"). Hoje:

- `DadaiaWorkspacePage` referencia um único `diagram: string` em `dadaia-workspace.png`
  (legível, mas raster — sem suporte a dark mode, sem zoom limpo).
- `TauanGamesPage` não tem diagrama.
- `ArchitecturePage` (slug `portifolio`) tem `diagram` no JSON mas não está renderizado
  com qualidade — placeholder.

WAVE1/WAVE3 introduziram dark mode toggle no portfólio. Diagramas raster pretos sobre
branco viram visualmente quebrados em dark mode (alto contraste agressivo). Falta uma
convention.

**Decisão fixada pelo operador (sem grill-me adicional):**

- **Dois SVGs separados por projeto:** `architecture-light.svg` + `architecture-dark.svg`
  (não 1 SVG com `currentColor`). Razão: Excalidraw (ferramenta que o operador usa)
  exporta SVG estático sem `currentColor`; manter duplicação é mais simples que pós-
  processar. Custo: 2x storage (irrelevante, ~30KB cada).
- **Picture element + `prefers-color-scheme`** seleciona variante no browser (zero JS).
- **Marco produz os SVGs** em PR posterior (Excalidraw → export SVG → otimizar com
  `svgo`). Esta SPEC fixa **convention de path** e **componente de render**, não os
  assets em si.

## 2. Objetivo

Definir e implementar:

1. Convention de path por projeto.
2. Componente `<ArchitectureDiagram>` que carrega o par light/dark via `<picture>`.
3. Otimização (≤ 50KB cada SVG após svgo).
4. Atualizar `Project.diagram` em F-P0-09 para refletir convention.

## 3. Convention

### 3.1 Path

```
frontend/public/assets/projects/<slug>/architecture-light.svg
frontend/public/assets/projects/<slug>/architecture-dark.svg
```

Onde `<slug>` casa com `Project.slug` de F-P0-09. Cada projeto **deve** ter o par;
ausência cai no fallback `/assets/projects/_fallback-architecture.svg` (placeholder neutro
informativo: "Diagrama em construção").

### 3.2 Tipo em `Project.diagram`

Hoje `Project.diagram?: string` (path único). Refator:

```ts
export interface DiagramAsset {
  light: string;   // /assets/projects/<slug>/architecture-light.svg
  dark: string;    // /assets/projects/<slug>/architecture-dark.svg
  alt: string;     // descrição i18n para a11y
}

export interface ProjectBase {
  // ... outros campos
  diagram?: DiagramAsset;
}
```

Atualização **breaking** do tipo introduzido em F-P0-09 (`diagram?: string`). Como F-P0-09
é a SPEC base que ainda **não foi implementada** quando esta SPEC chegar (B-1 → B-4 → B-5
em ordem), a mudança é absorvida no PR de F-P0-13 sem rework adicional. F-P0-09 e F-P0-13
serão coordenadas no PLAN.md.

### 3.3 Componente `<ArchitectureDiagram>`

`frontend/src/components/projects/ArchitectureDiagram.tsx`:

```tsx
interface ArchitectureDiagramProps {
  diagram: DiagramAsset;
  caption?: string;
}

export function ArchitectureDiagram({ diagram, caption }: ArchitectureDiagramProps) {
  return (
    <figure className="my-8">
      <picture>
        <source
          srcSet={diagram.dark}
          media="(prefers-color-scheme: dark)"
        />
        <img
          src={diagram.light}
          alt={diagram.alt}
          width={1200}
          height={675}
          loading="lazy"
          className="w-full h-auto rounded-lg border border-border"
        />
      </picture>
      {caption && (
        <figcaption className="text-sm text-muted-foreground mt-2 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
```

**Notas técnicas críticas:**

- `<picture>` + `<source media>` é resolvido pelo browser **antes** do JS de tema rodar —
  evita flash light→dark no first paint.
- O componente **não escuta** `useTheme()` (não cria dependência circular com toggle
  manual). Para o caso do usuário fazer toggle manual (que **não** muda
  `prefers-color-scheme`), o diagrama fica na variante do sistema operacional. Tradeoff
  aceito: a) maioria dos usuários usa system preference; b) toggle manual é frequência
  baixa; c) JS-based swap criaria CLS e dependência adicional.
- Width/height explícitos (1200×675, ratio 16:9 conveniente) → zero CLS. Cada SVG deve
  ter `viewBox` consistente.

### 3.4 Otimização dos SVGs

Cada arquivo passa por `svgo` antes de commit, com `--multipass` e config padrão.
Tamanho alvo:

| Asset | Alvo bruto Excalidraw | Alvo otimizado svgo | Aceitável até |
|---|---|---|---|
| `architecture-light.svg` | ~100KB | ~30KB | 50KB |
| `architecture-dark.svg` | ~100KB | ~30KB | 50KB |

Total por projeto ≤ 100KB. Para 3 projetos = 300KB max para diagramas — abaixo do orçamento
de assets de qualquer página individual.

Comando reproduzível (documentado em Makefile target `assets:optimize-diagrams`):

```makefile
assets-optimize-diagrams:
	cd frontend && npx svgo --multipass \
	  -f public/assets/projects/dadaia-workspace \
	  public/assets/projects/portifolio \
	  public/assets/projects/tauan-games
```

(`svgo` é dev-only — adicionar `"svgo": "^3.x"` em `devDependencies` se ainda não tem.
Não vai para bundle de produção.)

### 3.5 Conteúdo i18n — `alt`

Cada idioma traduz a descrição de a11y. Exemplo para `dadaia-workspace`:

```json
{
  "projects": {
    "list": [
      {
        "slug": "dadaia-workspace",
        "diagram": {
          "light": "/assets/projects/dadaia-workspace/architecture-light.svg",
          "dark":  "/assets/projects/dadaia-workspace/architecture-dark.svg",
          "alt": "Diagrama de arquitetura do dadaia-workspace: orquestrador SDD..."
        }
      }
    ]
  }
}
```

Pareado em PT/EN/DE — paridade obrigatória (F-P0-15).

## 4. Critérios de aceite

- **A1.** `frontend/src/types/content.ts` exporta `DiagramAsset` com `light`, `dark`,
  `alt`. `ProjectBase.diagram` tipa para `DiagramAsset | undefined`.
- **A2.** `<ArchitectureDiagram>` componente implementado conforme §3.3. Usa
  `<picture>` + `<source media="(prefers-color-scheme: dark)">`; nenhum `useEffect`,
  nenhum hook de tema.
- **A3.** Os 3 projetos têm entradas `diagram.{light,dark,alt}` nos 3 JSONs
  (`pt/en/de.json`). Os arquivos físicos SVG em `frontend/public/assets/projects/<slug>/`
  podem ser placeholders informativos enquanto Marco não produz os definitivos —
  **mas o path no JSON deve existir**.
- **A4.** Fallback `/assets/projects/_fallback-architecture.svg` existe como placeholder
  neutro (~5KB). Renderizado quando `project.diagram === undefined`.
- **A5.** Cada SVG ≤ 50KB após svgo. CI gate: `find frontend/public/assets/projects -name
  '*.svg' -size +50k` retorna lista vazia (job no `ci.yml`).
- **A6.** Lighthouse `/projetos/<slug>` continua com Performance ≥ 90 mesmo com diagrama
  carregado (lazy load garante).
- **A7.** Em dark mode (DevTools → `prefers-color-scheme: dark`), o diagrama mostra a
  variante `dark.svg`. Verificado em E2E `architecture-diagram.spec.ts` (smoke).
- **A8.** Zero CLS na carga da página de detalhe (width/height explícitos no `<img>`).
- **A9.** A11y: `alt` localizado lido por screen reader (testável via Axe).

## 5. Riscos e mitigações

- **Risco:** Marco demora a produzir os SVGs definitivos → área de projetos vai pra prod
  com placeholders.
  **Mitigação:** Placeholder informativo (`_fallback-architecture.svg` ou variante
  per-project) é aceitável; SPEC garante que a estrutura está pronta para receber os
  assets definitivos sem novo PR estrutural. Marco abre PR só com `.svg`s atualizados
  quando estiverem prontos.
- **Risco:** Toggle manual de tema (não-system) deixa diagrama na variante "errada".
  **Mitigação:** Decisão consciente — fluxo de usuário típico (system preference) tem
  diagrama coerente. Frequência de toggle manual é baixa. Pode evoluir para JS-swap em
  F-P1 se virar problema real.
- **Risco:** SVG do Excalidraw inclui texto que vira raster em browsers antigos.
  **Mitigação:** browsers alvo (últimas 2 versões evergreen) suportam SVG nativo com
  texto. Validável em E2E.

## 6. Dependências

- **F-P0-09** (`projects-content-model`) — **Hard dependency.** Estende `Project.diagram`
  de `string?` para `DiagramAsset?`. Coordenação no PLAN.md: F-P0-09 entrega `Project`
  com `diagram?: string`; F-P0-13 reescreve para `DiagramAsset` antes de qualquer
  consumidor estar implementado (F-P0-12 depende de F-P0-09 mas espera F-P0-13 para o
  shape final do diagrama).
- **F-P0-12** (`projects-page-templates`) — consome `<ArchitectureDiagram>`.
- **T-FE-WAVE1** (dark mode toggle) — base do dark mode. Esta SPEC **não** depende do
  toggle manual; só do CSS `.dark` aplicado em `<html>` (que vem do WAVE1).

## 7. Out of scope

- SVG interativo (zoom, pan, click em nós). Decisão futura (P2).
- Geração automática de diagramas a partir de Terraform/código. Decisão futura.
- Versionamento de diagramas (changelog). Não justifica em P0.
- Format alternativo (PNG/WebP) para browsers que não renderizam SVG. Suporte universal
  hoje — desnecessário.

## 8. Justificativa de design

- **Por que 2 SVGs e não 1 com `currentColor`.** Excalidraw exporta cores literais
  (#000, #1971c2, etc.). Pós-processar para `currentColor` exige script custom que muda
  a forma de trabalho do operador (Excalidraw → svgo → script de patching). Tradeoff: 2x
  espaço de disco (irrelevante, 60KB total por projeto) por workflow simples. **Decisão
  do operador.**
- **Por que `<picture>` + `prefers-color-scheme` e não JS swap.** Resolvido pelo browser
  antes do JS rodar — zero flash, zero CLS, zero dependência de `useTheme`. JS-swap
  introduz dependência circular (tema → diagrama → tema novamente) sem benefício real.
- **Por que `loading="lazy"`.** Diagrama é abaixo da fold em todas as 3 páginas de
  projeto. Lazy load economiza ~30KB de download inicial sem custo de a11y (alt está no
  HTML).
- **Por que SVG e não WebP.** SVG escala sem perda em qualquer resolução; texto fica
  selecionável; tamanho equivalente para diagrama. Marco produz no Excalidraw que exporta
  nativamente SVG.
