# F-P0-14 — Tauan Games Link-Out (GH Pages, sem iframe)

**Status:** Draft

## 1. Contexto

A proposta original do `software-architect` (`B-6` no plano de referência) era servir os
jogos de `tauan-games` **embedded via iframe sandboxed**, com Makefile `games:sync` que
copiava `repos/tauan-games/*` para `frontend/public/games/` e Terraform aplicando
`Cache-Control: public, max-age=3600` no prefixo `games/*`.

**Decisão fixada pelo operador (sem grill-me adicional) muda substancialmente este
escopo:**

- **Os jogos NÃO ficam no S3 do portfólio.** Ficam no **GitHub Pages** do próprio repo
  `tauan-games` (workspace dadaia: `repos/tauan-games/`, deploy via GH Actions naquele
  repo). URL canônica: `https://marcoaureliomenezes.github.io/tauan-games/<slug>/`.
- **O portfólio apenas REFERENCIA.** Card de cada jogo tem botão "Jogar" que abre a URL
  externa em **nova aba** (`target="_blank" rel="noopener noreferrer"`).
- **Zero iframe.** GH Pages aplica `X-Frame-Options: SAMEORIGIN` ou similar — embedded
  iframe seria bloqueado ou inseguro. Decisão arquitetural: portfólio = vitrine; jogos =
  produto independente no seu próprio domínio.
- **Sem Makefile `games:sync`** no portfólio. Sem Terraform Cache-Control para `games/*`
  (não há `games/*` no bucket do portfólio).
- **Limitação de escopo dos jogos publicados:** apenas os **fully implemented** —
  `aero-fighters` (Three.js) e `tauan-trex` (Phaser). Outras 3 pastas em
  `repos/tauan-games/` (`aero-fighters-babylon`, `aero-fighters-godot`,
  `aero-fighters-unity`) são experimentos incompletos e **não** entram nesta SPEC.
- **Drift LOW a corrigir no JSON existente:** `aero-fighters` está marcado como `engine:
  "Babylon.js"` no JSON atual (`aba-tauan-games/SPEC.md §4`). O engine real é **Three.js**.
  Esta SPEC corrige.
- **Workspace rule respeitada:** qualquer mudança no próprio repo `tauan-games` (publicar
  os jogos no GH Pages, ajustar `AGENTS.md` daquele repo, configurar workflow de deploy)
  é domínio exclusivo do agente `game-developer` (`.claude/rules/game-developer-scope.md`).
  Esta SPEC trata **apenas** do portfólio referenciando. As tasks de implementação do GH
  Pages no repo `tauan-games` ficam de fora — owner: `game-developer`, em PR separado
  contra `repos/tauan-games/`.

## 2. Objetivo

Implementar a aba `/projetos/tauan-games` como **vitrine de link-out**, com 2 cards de
jogo (aero-fighters Three.js + tauan-trex Phaser) cada um com:

- Screenshot/cover (`/assets/projects/tauan-games/<slug>.webp`, ≤ 200KB).
- Título + engine badge.
- Descrição curta.
- Botão "Jogar" → URL externa GH Pages, nova aba, com atributos de segurança.
- Botão secundário "Ver repo" → URL do repo no GitHub.

Manter Lighthouse Performance ≥ 90 e a11y ≥ 90. Sem dependência adicional de runtime.

## 3. Mudanças

### 3.1 Tipo `GameLink` em F-P0-09

Já definido em F-P0-09 §3.1; **esta SPEC só usa o tipo, não cria.** Recap:

```ts
export interface GameLink {
  slug: string;        // "aero-fighters" | "tauan-trex"
  title: string;
  engine: string;      // "Three.js" | "Phaser"
  cover: string;       // /assets/projects/tauan-games/<slug>.webp
  body: string;
  repo: string;        // URL do repo (mesmo para os 2 hoje)
  playUrl: string;     // https://marcoaureliomenezes.github.io/tauan-games/<slug>/
}

export interface GamesProject extends ProjectBase {
  kind: "games";
  items: GameLink[];   // exatamente 2 itens em P0
}
```

### 3.2 Conteúdo `pt/en/de.json` — bloco `tauan-games`

```json
{
  "projects": {
    "list": [
      /* ... outros projetos ... */
      {
        "slug": "tauan-games",
        "kind": "games",
        "hero": {
          "title": "tauan-games",
          "tagline": "Jogos feitos em casa com meu filho Tauan."
        },
        "card": {
          "cover": "/assets/projects/tauan-games/cover.webp",
          "summary": "Jogos browser construídos com meu filho — Three.js e Phaser.",
          "tech": ["Three.js", "Phaser", "TypeScript", "Vite", "GitHub Pages"]
        },
        "items": [
          {
            "slug": "aero-fighters",
            "title": "Aero Fighters",
            "engine": "Three.js",
            "cover": "/assets/projects/tauan-games/aero-fighters.webp",
            "body": "Shooter aéreo em 3D com Three.js. Controles por teclado, ondas progressivas, modelagem simples mas funcional.",
            "repo": "https://github.com/marcoaureliomenezes/tauan-games",
            "playUrl": "https://marcoaureliomenezes.github.io/tauan-games/aero-fighters/"
          },
          {
            "slug": "tauan-trex",
            "title": "tauan-trex",
            "engine": "Phaser",
            "cover": "/assets/projects/tauan-games/tauan-trex.webp",
            "body": "Variação do dino game do Chrome em Phaser. Loop simples, foco em juice (animação + som) que faz a diferença na percepção de qualidade.",
            "repo": "https://github.com/marcoaureliomenezes/tauan-games",
            "playUrl": "https://marcoaureliomenezes.github.io/tauan-games/tauan-trex/"
          }
        ],
        "seo": {
          "title": "tauan-games — Marco Menezes",
          "description": "Jogos browser construídos em casa com Tauan: Three.js (Aero Fighters) e Phaser (tauan-trex)."
        }
      }
    ]
  }
}
```

Paridade em EN/DE (operador revisa traduções; AI/LLM pode rascunhar conforme decisão
fixada).

### 3.3 Componente `<GameCard>`

Especificado em F-P0-12 §3.5. Recap dos pontos relevantes a esta SPEC:

- Botão "Jogar" usa `<a href={game.playUrl} target="_blank" rel="noopener noreferrer">` —
  **nunca** `<Link>` (link interno SPA), **nunca** sem `rel="noopener noreferrer"`
  (segurança — protege contra `window.opener` abuse), **nunca** iframe.
- Botão "Ver repo" segue mesmo padrão para `game.repo`.
- Acessibilidade: o botão "Jogar" tem `aria-label="Jogar <title> (abre em nova aba)"` para
  comunicar a navegação externa (regra de a11y — links que abrem nova aba devem ser
  explícitos para leitores de tela).

### 3.4 Assets em `frontend/public/assets/projects/tauan-games/`

| Arquivo | Origem | Tamanho alvo |
|---|---|---|
| `cover.webp` | Marco produz | ≤ 200KB |
| `aero-fighters.webp` | screenshot do jogo no GH Pages | ≤ 200KB |
| `tauan-trex.webp` | screenshot do jogo no GH Pages | ≤ 200KB |

Esta SPEC **não** publica os jogos no GH Pages. Apenas referencia. **Pré-condição
operacional:** Marco (via agente `game-developer`) deve ter publicado os 2 jogos no GH
Pages **antes** do merge desta feature em `main`. Mitigação em `develop`: os botões
"Jogar" abrem URLs que retornam 404 — aceitável durante desenvolvimento; bloqueia merge
para `main` somente se T-FE-PROJ-06 (esta tarefa) tiver "smoke E2E em playUrl" como
acceptance — **não tem** (vide §4 A8).

### 3.5 Correção do drift (engine label)

JSON existente em `frontend/src/data/content/{pt,en,de}.json` (bloco `projects.tauan-games`)
hoje tem 4 itens, incluindo `aero-fighters-babylon` com `engine: "Babylon.js"`. **Esta SPEC
substitui completamente** o bloco com:

- 2 itens (não 4): `aero-fighters` (engine `"Three.js"`) + `tauan-trex` (engine `"Phaser"`).
- Os itens `aero-fighters-babylon`, `aero-fighters-godot`, `aero-fighters-unity` são
  **removidos**.

Correção do drift é **atômica**: novo bloco substitui o antigo no mesmo PR (atomicidade
de specs — `constitution §3.10`).

### 3.6 O que NÃO está nesta SPEC

- **Sem Makefile `games:sync`** — removido do plano. Não há `frontend/public/games/`.
- **Sem Terraform Cache-Control para `games/*`** — não há prefixo `games/` no bucket S3
  do portfólio.
- **Sem iframe `<GamePlayer>` componente** — removido. `<GameCard>` cobre o caso.
- **Sem rota `/projetos/tauan-games/<game-slug>`** — não há detalhe in-portfolio para
  jogo individual. Clique em "Jogar" sai do portfólio.
- **Sem mudanças em `repos/tauan-games/`** — domínio do agente `game-developer`.

## 4. Critérios de aceite

- **A1.** `frontend/src/data/content/{pt,en,de}.json` no bloco `projects.list` tem entrada
  `slug: "tauan-games"` com `kind: "games"` e exatamente **2 itens** em `items[]`:
  `aero-fighters` (engine `"Three.js"`) e `tauan-trex` (engine `"Phaser"`). Itens
  `aero-fighters-babylon`, `aero-fighters-godot`, `aero-fighters-unity` **removidos**.
- **A2.** Cada item tem `playUrl` no formato
  `https://marcoaureliomenezes.github.io/tauan-games/<slug>/` — exato, sem barra final
  faltando, sem typo no domínio.
- **A3.** `/projetos/tauan-games` renderiza `GamesProjectTemplate` (F-P0-12) com 2
  `<GameCard>`.
- **A4.** Botão "Jogar" em cada card é `<a target="_blank" rel="noopener noreferrer">`
  apontando para `playUrl`. Verificado em E2E (`tauan-games-link-out.spec.ts`).
- **A5.** Botão "Ver repo" idem — `target="_blank" rel="noopener noreferrer"` apontando
  para `repo`.
- **A6.** Imagens `aero-fighters.webp` e `tauan-trex.webp` ≤ 200KB cada, com
  `loading="lazy"` e width/height explícitos (CLS = 0).
- **A7.** Lighthouse a11y ≥ 90 em `/projetos/tauan-games`. Axe: zero violações. Cada
  botão de link externo tem `aria-label` explícito ("Jogar <título> (abre em nova aba)").
- **A8.** Smoke E2E `tauan-games-link-out.spec.ts`:
  - Assert: 2 cards renderizados, na ordem [aero-fighters, tauan-trex].
  - Assert: cada botão "Jogar" tem `target="_blank"` e `href` casando com
    `https://marcoaureliomenezes.github.io/tauan-games/<slug>/`.
  - **Sem** asserção de HTTP 200 contra o `playUrl` real — teste fica resiliente a
    falha do GH Pages externo (decisão consciente: não acoplar CI do portfólio à
    saúde de outro repo).
- **A9.** Paridade i18n: shape idêntico de `projects.list[?slug==tauan-games]` nos 3
  JSONs; tradução de `body`, `card.summary`, `hero.tagline`, `seo.description` revisada
  pelo operador (pode usar AI/LLM como rascunho). Validado em F-P0-15.

## 5. Riscos e mitigações

- **Risco:** `playUrl` aponta para GH Pages que ainda não existe → usuário clica "Jogar"
  e bate em 404.
  **Mitigação:** task explícita em TASKS.md (`T-FE-PROJ-06`) tem como pré-condição
  operacional confirmação visual de que `https://marcoaureliomenezes.github.io/tauan-games/aero-fighters/`
  e `https://marcoaureliomenezes.github.io/tauan-games/tauan-trex/` respondem 200.
  Trabalho de publicar no GH Pages é do agente `game-developer` em PR separado contra
  `repos/tauan-games/`.
- **Risco:** Engine label `Three.js` está correto no documento; verificar se o jogo no
  repo realmente é Three.js (não Babylon.js).
  **Mitigação:** `repos/tauan-games/aero-fighters/` (não o `aero-fighters-babylon/`) é
  Three.js, confirmado pelo operador. SPEC trata o jogo correto.
- **Risco:** Botão "Jogar" sem `rel="noopener"` em algum caso → vetor de `window.opener`
  abuse.
  **Mitigação:** lint rule + E2E checa atributos em **todos** os botões "Jogar" e "Ver
  repo".
- **Risco:** Conteúdo em DE traduzido por AI sem revisão → publicação com erro de
  idioma.
  **Mitigação:** operador revisa DE antes do merge — task explícita em TASKS.md.

## 6. Dependências

- **F-P0-09** (`projects-content-model`) — **Hard dependency.** Esta SPEC consome `GameLink`
  e `GamesProject`.
- **F-P0-12** (`projects-page-templates`) — **Hard dependency.** Esta SPEC depende do
  template `GamesProjectTemplate` e do componente `<GameCard>`.
- **F-P0-15** (`projects-content-i18n-parity`) — gate de paridade do bloco completo nos 3
  JSONs.
- **Pré-condição operacional externa (não SPEC):** publicação dos 2 jogos no GH Pages do
  repo `tauan-games` — owner agente `game-developer`, fora deste workspace.

## 7. Out of scope

- Iframe embedded (decisão revertida).
- Makefile `games:sync` (decisão revertida).
- Terraform Cache-Control em `/games/*` (não há prefixo `games/` no bucket).
- Detalhe in-portfolio para jogo individual (`/projetos/tauan-games/<game-slug>` no
  portfólio). Clique sai do portfólio.
- Workflow de deploy dos jogos no GH Pages — domínio do `game-developer` em PR separado.
- Auto-detect quando GH Pages do jogo está offline (graceful degradation). Decisão futura
  se virar problema real.
- Outras pastas em `repos/tauan-games/` (Godot, Unity, Babylon) — out of scope; podem
  voltar quando estiverem fully implemented.

## 8. Justificativa de design

- **Por que sair do portfólio (nova aba) e não iframe.** GH Pages bloqueia framing por
  default. Mesmo se permitisse, embedded games requerem isolamento (fullscreen API,
  gamepad API, audio context) que sandboxed iframe restringe. Tradeoff: nova aba mantém
  Lighthouse do portfólio limpo (zero peso de jogo no bundle do portfólio), e cada jogo
  hospeda-se no seu próprio domínio com sua própria CSP, sem acoplamento.
- **Por que só 2 jogos.** Operador definiu que os outros 3 são experimentos incompletos.
  Publicar incompletos prejudica posicionamento (visitante avalia pelo que vê funcionar,
  não pelo que poderia ter funcionado).
- **Por que `aria-label` explícito no botão "Jogar".** Regra de a11y bem documentada:
  links que abrem nova aba devem informar via label (não basta `target="_blank"` — leitor
  de tela não anuncia sozinho na maioria dos casos).
- **Por que não testar HTTP 200 do `playUrl` em CI.** Acoplaria health do portfólio à
  health de outro projeto. Falha do GH Pages do `tauan-games` não deve quebrar deploy
  do portfólio. Smoke fica em propriedades do anchor (atributos), não em status code.
- **Por que `repo` aponta para o mesmo URL nos 2 jogos.** `tauan-games` é monorepo —
  jogos vivem em subpastas. URL única é canônica. Se evoluir para repos separados, JSON
  é trivial de ajustar.
