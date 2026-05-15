# F-P0-07 — Identidade Visual (Amber + Tipografia + Dark Mode + Hero Memorável)

**Status:** Aprovado

## 1. Contexto

O portfólio retomado em 2026-05-14 herdou layout monocromático azul-cinza, fontes do
sistema, header com `bg-gradient-to-b from-slate-900 to-slate-800` hardcoded em JSX, sem
toggle interativo de dark mode, sem microinteractions, e Hero rebaixado a um Card simples
com botão "ver mais". Resultado: o site não se diferencia visualmente de qualquer
LinkedIn renderizado.

O operador formalizou (via AskUserQuestion) o plano em
`/home/marco/.claude/plans/agora-precisamos-que-nossos-twinkling-frost.md` e cravou as
seguintes decisões:

- **Accent color:** Amber `#F08A2B` light / `#F89C44` dark (HSL `28 90% 55%` light /
  `28 95% 62%` dark). Uso restrito a CTAs, borders e badges — **nunca em body text**, para
  preservar contraste WCAG AA.
- **Tipografia:** Inter (sans, peso 400/500/600/700) + JetBrains Mono (peso 400/500),
  ambas via `@fontsource/*` (zero request externo, melhor LCP que Google Fonts CDN).
- **Dark mode:** toggle interativo (Sun/Moon `lucide-react`) que persiste em
  `localStorage`, respeita `prefers-color-scheme` no first mount, e **não pode causar
  flash** de tema claro no first paint (script inline no `<head>` antes do bundle React).
- **Hero memorável:** layout 2-col desktop (60% texto / 40% avatar+halo), avatar 192px
  com halo `box-shadow: 0 0 80px hsl(var(--accent)/0.3)`, tagline grande
  (`text-4xl md:text-6xl`), stats em mono (`5+ years · 9 certs · 4 clouds`), 2 CTAs
  (`Download CV` default + `Ver experiência` outline com scroll para `#experience`).
- **Microinteractions:** scroll-triggered `fade-up`/`fade-in` via IntersectionObserver +
  hover-lift em cards (`-translate-y-1 shadow-large border-accent/40`) + backdrop-blur no
  header quando scrolled. Tudo respeita `prefers-reduced-motion`.
- **Skill semantic colors:** mapper categoria→cor (cloud=blue, language=emerald,
  database=purple, ai-tooling=accent) para reforçar leitura visual sem perder coerência.

## 2. Objetivo

Entregar uma identidade visual autoral em 3 ondas sequenciais (cada onda é 1 PR), sem
regredir nenhum gate de qualidade já estabelecido (Lighthouse Performance ≥ 90,
Accessibility ≥ 90, CLS = 0, LCP ≤ 2.5s) e sem quebrar a suíte E2E existente.

## 3. Ondas (sequencial; cada onda é uma task em `TASKS.md`)

### Onda 1 — Paleta amber + tipografia + dark mode toggle (T-FE-WAVE1)

Substitui CSS vars (`:root` e `.dark` em `src/index.css`) com `--accent`, `--accent-subtle`
e `--ring` derivados; instala fonts via `@fontsource/inter` e `@fontsource/jetbrains-mono`;
extende `tailwind.config.ts` com `fontFamily.sans/mono` e color `accent-subtle`; cria
`hooks/useTheme.ts` e `components/header/ThemeToggle.tsx`; injeta script anti-flash em
`index.html`; remove gradient hardcoded de `Header.tsx`.

**Critério de pronto:**
- Lighthouse Performance ≥ 90 e Accessibility ≥ 90 (desktop + mobile).
- Axe DevTools sem violações WCAG AA.
- Toggle persiste após F5; `prefers-color-scheme: dark` emulado no DevTools não causa
  flash.
- Accent amber usado exclusivamente em CTAs/borders/badges; **zero ocorrências em body
  text**.

### Onda 2 — Microinteractions + scroll-triggered + skill semantic colors (T-FE-WAVE2)

Adiciona keyframes `fade-up`/`fade-in` em `tailwind.config.ts`; cria `hooks/useInView.ts`
(IntersectionObserver wrapper); cria `lib/skillCategoryColors.ts`; aplica wrappers nas 4
sections (Experience/Education/Certifications/Skills); aplica hover-lift nos cards;
adiciona backdrop-blur no `HeaderShell` quando `scrollState !== "full"`. Mocka
IntersectionObserver no `tests/setup.ts` do Vitest para jsdom não quebrar.

**Critério de pronto:**
- CLS = 0 em DevTools Performance trace.
- DevTools Rendering "Emulate prefers-reduced-motion: reduce" desliga animações.
- Skill cards usam cor semântica por categoria (cloud=blue, language=emerald,
  database=purple, ai-tooling=accent).
- Vitest unit tests verdes com IntersectionObserver mockado.

### Onda 3 — Hero memorável (T-FE-WAVE3)

Reescreve `HeroSection.tsx` com layout 2-col; adiciona `heroTagline: string` e
`heroStats: { years; certifications; clouds }` em `types/content.ts`; popula nos 3 JSONs
(PT: "Construo pipelines de dados em escala"; EN: "I build data pipelines at scale";
DE: "Ich baue Datenpipelines im Maßstab"); adiciona `public/decorators/{dot-grid,
blob-amber}.svg` com `width`/`height` explícitos; cria `HeroSection.test.tsx`.

**Critério de pronto:**
- LCP ≤ 2.5s (avatar com `loading="eager" fetchpriority="high"`).
- CLS ≤ 0.1 (decoradores com width/height explícitos).
- Tab order: ThemeToggle → LanguageSelector → CTA Download → CTA Ver experiência.
- Tagline traduzida nos 3 idiomas.
- ID `#hero-heading` preservado para não quebrar `home.spec.ts`.

## 4. Riscos atravessados

- **E2E `home.spec.ts`** assume `#hero-heading` — Onda 3 deve preservar esse ID.
- **`language-switch.spec.ts`** assume tab order pre-ThemeToggle — Onda 1 pode requerer
  ajuste de seletor.
- **Lighthouse LCP** pode regredir em Onda 1 (fonts) e Onda 3 (avatar) — mitigado por
  `@fontsource` (sem fetch externo) + `loading="eager" fetchpriority="high"` no avatar.

## 5. Dependências

- T-CONTENT-06 (refresh do conteúdo) deve estar `[x]` antes de T-FE-WAVE1 (evita
  retrabalho de tradução de `heroTagline` em string desatualizada).
- T-FE-WAVE1 → T-FE-WAVE2 → T-FE-WAVE3 sequencial (cada onda assume estilos da anterior).

## 6. Justificativa de design

A escolha de **amber** (e não roxo/verde/azul) responde a 3 requisitos do operador:

1. **Diferenciação** — paletas roxas/azuis são default em portfólios de SWE; amber sinaliza
   identidade própria.
2. **Hierarquia visual sem peso emocional** — amber em pequenas doses (≤ 5% do viewport)
   atrai olho para CTAs sem evocar urgência (vermelho) ou frieza (azul-cinza).
3. **Compatibilidade com dark mode** — `28 95% 62%` no dark mantém contraste 4.5:1+ contra
   background `0 0% 9%`, validável no Axe.

A tipografia **Inter + JetBrains Mono** foi escolhida porque:

- Inter é otimizada para UI screen rendering (open-source, métricas calibradas para 14-18px).
- JetBrains Mono em stats reforça o tom técnico ("data engineer that knows monospace
  matters") sem virar pastiche de IDE.
- Ambas via `@fontsource` evitam request externo (Google Fonts) que regrediria LCP.
