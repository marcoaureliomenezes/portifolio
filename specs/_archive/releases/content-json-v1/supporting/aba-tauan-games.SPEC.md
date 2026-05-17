# F-P0-04 — Aba "tauan-games"

**Status:** Aprovado

## 1. Contexto

Aba de projeto que apresenta os jogos desenvolvidos com o filho (Tauan): 3 protótipos
`aero-fighters` (em Babylon.js, Godot, Unity) + `tauan-trex`. Mostra polivalência técnica e
lado pessoal — diferencial frente a portfólios genéricos.

## 2. Objetivo

Entregar página `/projetos/tauan-games` com cards de projeto, screenshots/gifs otimizados,
links para repositórios. Em pt+en obrigatórios, de opcional com fallback en.

## 3. Rota e estrutura

- **Rota:** `/projetos/tauan-games`
- **Componente:** `pages/projects/TauanGamesPage.tsx` (instância de `ProjectTabPage`).
- **Estrutura:**
  1. Hero: título + 1 linha de pitch ("Jogos feitos em casa com meu filho").
  2. Grid de cards (1 por jogo/protótipo), com:
     - Screenshot ou gif (≤ 200KB).
     - Título do jogo.
     - Engine tag (Babylon, Godot, Unity, etc.).
     - 1 parágrafo descritivo.
     - Link para o repo correspondente (`target=_blank rel=noopener`).
     - (Opcional) Link para demo jogável externa, se existir build público.

## 4. Conteúdo (placeholders entregues pelo PE; copy real do operador)

```json
{
  "projects": {
    "tauan-games": {
      "hero": {
        "title": "tauan-games",
        "tagline": "Jogos feitos em casa com meu filho Tauan."
      },
      "items": [
        {
          "slug": "aero-fighters-babylon",
          "title": "Aero Fighters (Babylon.js)",
          "engine": "Babylon.js",
          "image": "/assets/projects/tauan-games/aero-fighters-babylon.webp",
          "body": "<operador preenche>",
          "repo": "https://github.com/marcoaureliomenezes/tauan-games"
        },
        {
          "slug": "aero-fighters-godot",
          "title": "Aero Fighters (Godot)",
          "engine": "Godot",
          "image": "/assets/projects/tauan-games/aero-fighters-godot.webp",
          "body": "<operador preenche>",
          "repo": "https://github.com/marcoaureliomenezes/tauan-games"
        },
        {
          "slug": "aero-fighters-unity",
          "title": "Aero Fighters (Unity)",
          "engine": "Unity",
          "image": "/assets/projects/tauan-games/aero-fighters-unity.webp",
          "body": "<operador preenche>",
          "repo": "https://github.com/marcoaureliomenezes/tauan-games"
        },
        {
          "slug": "tauan-trex",
          "title": "tauan-trex",
          "engine": "<engine>",
          "image": "/assets/projects/tauan-games/tauan-trex.webp",
          "body": "<operador preenche>",
          "repo": "https://github.com/marcoaureliomenezes/tauan-games"
        }
      ],
      "seo": {
        "title": "tauan-games — Marco Menezes",
        "description": "Protótipos de jogos desenvolvidos com Tauan em Babylon.js, Godot e Unity."
      }
    }
  }
}
```

## 5. Critérios de aceite

- **A1.** Rota `/projetos/tauan-games` renderiza `TauanGamesPage`.
- **A2.** Pelo menos **2 cards** de protótipo são renderizados no go-live (recomendação:
  `aero-fighters-babylon` + `tauan-trex` — operador escolhe — vide briefing 2.0 F-P0-04).
- **A3.** Cada card tem: imagem visível, título não-vazio, parágrafo não-vazio, link com
  href contendo `github.com` e atributos `target="_blank" rel="noopener noreferrer"`
  (E2E-06).
- **A4.** Imagens otimizadas ≤ 200KB cada, formato **WebP** (com fallback PNG se
  necessário); todos com `loading="lazy"` quando below-the-fold.
- **A5.** Lighthouse Performance ≥ 90 mantido mesmo com 4 imagens na página.
- **A6.** Conteúdo em pt+en com paridade; de com fallback en.
- **A7.** Meta-tags SEO próprias.
- **A8.** Aparece no menu principal.

## 6. Fora de escopo

- Hospedar os jogos jogáveis no portfólio (P2).
- Galeria de screenshots interativa (lightbox/carousel) — embla foi marcado REMOVE.
- Vídeos embedded (peso alto + cookies third-party).

## 7. Dependências

- `useContent()` (T-FE-02).
- `ProjectTabPage` (T-FE-15).
- Assets otimizados em `frontend/public/assets/projects/tauan-games/` (T-CONTENT-03).

## 8. Decisões fechadas

- **D-PROJ-04.** Cards são links para o repo (mesma URL todas — o repo é monolítico
  `tauan-games`). Se evoluir para repos separados, o JSON é trivial de ajustar.
- **D-PROJ-05.** Engine como `tag` visual (badge) para facilitar scanning.

## 9. Referências

- Briefing 2.0 §4 F-P0-04.
- qa §4 E2E-06.
