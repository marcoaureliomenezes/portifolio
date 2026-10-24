# F-P0-11 — Nav Projects CTA (Header render + Hero 3rd CTA)

**Status:** Draft

## 1. Contexto

Gap **CRITICAL** identificado pelo `software-architect`: `navRoutes` é declarado em
`frontend/src/routes.ts:43` mas **nenhum consumidor** o renderiza. O resultado prático é
que os 3 projetos hoje só são alcançáveis por digitar URL direta — fato que destrói o
funil de descoberta da área de projetos.

Esta SPEC fecha o gap em duas frentes:

1. **Header** — renderiza um item de menu "Projetos" no `HeaderDesktopLayout` e
   `HeaderMobileLayout`, levando para `/projetos` (a página índice de F-P0-10). Os 3
   sub-projetos são alcançados via cards dentro de `/projetos`, **não** via dropdown no
   header. Decisão deliberada: o header fica enxuto (Home + Projetos + dois ícones de
   contato + LanguageSelector + ThemeToggle), e a descoberta dos projetos individuais
   acontece no hub `/projetos`.
2. **Hero** — adiciona um **3º CTA `seeProjects`** ao lado dos 2 existentes (`downloadCv`,
   `seeExperience`), linkando para `/projetos`. Posicionamento depois de
   `seeExperience` para não competir com o CTA primário.

**Decisão fixada pelo operador (sem grill-me adicional):** ordem fixa dos cards no
`/projetos` é `dadaia-workspace → portifolio → tauan-games`. O CTA no header e no Hero
levam apenas para o índice — sem dropdown, sem mega-menu.

## 2. Objetivo

Tornar a área de projetos **descobrível** sem inflar o header. Manter Lighthouse a11y ≥
90, CLS = 0, e tab order coerente com WAVE3.

## 3. Mudanças

### 3.1 `frontend/src/routes.ts` — flag `inHeaderNav`

Hoje `navRoutes = routes.filter((r) => r.inNav)` retorna 3 entradas (os 3 slugs de
projeto), todos com `inNav: true`. Após F-P0-10, há também `projects-index` com
`inNav: true` — totalizando 4. O header **só** deve mostrar `projects-index`.

Adicionar segundo flag explícito ao tipo `Route`:

```ts
export interface Route {
  slug: string;
  path: string;
  labelKey: string;
  /** Whether this route appears in the sidebar nav (legacy/sidebar). */
  inNav: boolean;
  /** Whether this route appears in the top-bar Header menu. */
  inHeaderNav: boolean;
}

export const headerNavRoutes = routes.filter((r) => r.inHeaderNav);
```

Configuração:

| slug | inNav | inHeaderNav |
|---|---|---|
| home | false | false |
| projects-index | true | **true** |
| dadaia-workspace | true | false |
| tauan-games | true | false |
| portifolio | true | false |
| not-found | false | false |

`navRoutes` continua existindo para retrocompatibilidade — qualquer consumidor legado
(nenhum, hoje) continua funcionando. Não é breaking change.

### 3.2 `HeaderDesktopLayout` — render do menu

Hoje o desktop layout tem: avatar + nome + LanguageSelector + ThemeToggle + ícones de
contato. Adicionar uma `<nav aria-label="Primary">` entre o nome e o LanguageSelector:

```tsx
<nav aria-label="Primary" className="flex items-center gap-4">
  {headerNavRoutes.map((r) => (
    <NavLink
      key={r.slug}
      to={r.path}
      className={({ isActive }) =>
        cn(
          "text-sm font-medium transition-colors",
          isActive
            ? "text-accent"
            : "text-foreground/80 hover:text-foreground"
        )
      }
    >
      {label(r.labelKey)}
    </NavLink>
  ))}
</nav>
```

Hoje o `headerNavRoutes` tem 1 entrada (`projects-index`); o `<nav>` mostra apenas
"Projetos". Quando, no futuro, outras rotas (ex: `/blog`, `/talks`) virarem `inHeaderNav:
true`, aparecem automaticamente — Open/Closed Principle.

`aria-current="page"` é setado pelo `NavLink` quando ativo (default do react-router).
Tabela conforme `architecture §3`.

### 3.3 `HeaderMobileLayout` — render no menu mobile

O mobile layout já tem um sheet/drawer com itens (LanguageSelector, ThemeToggle, ícones de
contato). Adicionar uma seção "Navegação" antes desses:

```tsx
<section aria-label="Primary navigation">
  <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
    {label("nav.section")}
  </h2>
  <ul className="space-y-2">
    {headerNavRoutes.map((r) => (
      <li key={r.slug}>
        <NavLink to={r.path} onClick={closeMobileMenu}
                 className="block py-2 text-base font-medium hover:text-accent">
          {label(r.labelKey)}
        </NavLink>
      </li>
    ))}
  </ul>
</section>
```

`closeMobileMenu` é o handler já existente que fecha o sheet ao clicar em um item interno
(prática consistente com `LanguageSelector` no mobile).

### 3.4 `HeroSection` — 3º CTA `seeProjects`

Hoje o Hero (T-FE-WAVE3) tem 2 CTAs:

- `downloadCv` (`variant=default`, accent)
- `seeExperience` (`variant=outline`, scroll suave para `#experience`)

Adicionar **3º CTA** `seeProjects` (`variant=outline`, navegação via `<Link to="/projetos">`).
Posicionamento à direita de `seeExperience`. Em mobile (375px), CTAs empilham — `seeProjects`
fica abaixo dos outros dois.

```tsx
<div className="flex flex-wrap gap-3">
  <Button asChild variant="default">
    <a href="/cv.pdf" download>{labels.heroCTAs.downloadCv}</a>
  </Button>
  <Button asChild variant="outline">
    <a href="#experience">{labels.heroCTAs.seeExperience}</a>
  </Button>
  <Button asChild variant="outline">
    <Link to="/projetos">{labels.heroCTAs.seeProjects}</Link>
  </Button>
</div>
```

### 3.5 Tipos — `heroCTAs.seeProjects`

`frontend/src/types/content.ts`:

```ts
export interface HeroCTAs {
  downloadCv: string;
  seeExperience: string;
  seeProjects: string;  // NOVO
}
```

Campo é **obrigatório** (não opcional) porque a página `/projetos` existe a partir desta
SPEC e o CTA precisa estar presente. Roles antigos sem este campo causam erro de typecheck
em build — pega drift em CI.

### 3.6 Conteúdo i18n

Novas chaves em `pt/en/de.json`:

```json
{
  "heroCTAs": {
    "downloadCv": "...",
    "seeExperience": "...",
    "seeProjects": "Ver projetos" /* en: "See projects"; de: "Projekte ansehen" */
  },
  "nav": {
    "home": "...",
    "projects": "Projetos" /* en: "Projects"; de: "Projekte" */,
    "section": "Navegação" /* en: "Navigation"; de: "Navigation" */
  }
}
```

Paridade obrigatória (validada em F-P0-15).

## 4. Critérios de aceite

- **A1.** `routes.ts` exporta `headerNavRoutes` com exatamente 1 entrada (`projects-index`)
  hoje. Tipo `Route` tem campo novo `inHeaderNav: boolean`.
- **A2.** `HeaderDesktopLayout` renderiza `<nav aria-label="Primary">` com o item
  "Projetos" antes do `LanguageSelector`. Item é `NavLink` (react-router-dom), com
  `aria-current="page"` ativo quando URL bate.
- **A3.** `HeaderMobileLayout` mostra "Projetos" no sheet/drawer; clique fecha o drawer e
  navega para `/projetos`.
- **A4.** `HeroSection` renderiza 3 CTAs na ordem `[downloadCv, seeExperience, seeProjects]`.
  O 3º CTA usa `<Link to="/projetos">` (não anchor).
- **A5.** Tab order desktop: ThemeToggle → LanguageSelector → "Projetos" (header nav) →
  Avatar (se focável) → Hero h1 → CTA Download CV → CTA Ver experiência → **CTA Ver
  projetos** → próximo bloco. Verificável via Playwright `keyboard.press("Tab")`.
- **A6.** Lighthouse a11y ≥ 90 em `/` desktop+mobile. Axe DevTools: zero violações.
- **A7.** E2E novo `nav-projects.spec.ts`:
  - Em `/`, "Projetos" no header está visível e clicável → navega para `/projetos`.
  - Em `/`, o 3º CTA "Ver projetos" no Hero está visível e clicável → navega para
    `/projetos`.
  - Em `/projetos`, "Projetos" no header tem `aria-current="page"`.
- **A8.** Paridade i18n: chaves `nav.projects`, `nav.section`, `heroCTAs.seeProjects`
  presentes nos 3 JSONs (validado em F-P0-15).
- **A9.** Sem regressão em `home.spec.ts` e `language-switch.spec.ts` (atualizar
  seletor "CTAs do Hero" para esperar 3, não 2).

## 5. Riscos e mitigações

- **Risco:** atualizar `home.spec.ts` para 3 CTAs pode ser feito antes da implementação
  → vermelho temporário em CI.
  **Mitigação:** PR de implementação atualiza spec + teste no mesmo commit (padrão já
  estabelecido em T-FE-WAVE3 / T-FE-WAVE5).
- **Risco:** mobile (375px) com 3 CTAs em linha pode quebrar layout do Hero.
  **Mitigação:** `flex-wrap gap-3` já no design; em 375px CTAs empilham — verificado em
  E2E-10/E2E-11 (responsividade).

## 6. Dependências

- **F-P0-10** (`projects-index-page`) — **Hard dependency.** Esta SPEC só faz sentido se
  `/projetos` existe.
- **T-FE-WAVE3** (Hero memorável) — base do Hero atual com 2 CTAs.
- **F-P0-08** (`content-ai-emphasis`) — sem conflito; áreas disjuntas no JSON.

## 7. Out of scope

- Dropdown / mega-menu por kind de projeto (decisão: hub `/projetos` resolve descoberta).
- Sidebar nav (legacy — `inNav` mantido por retrocompat mas não consumido em P0).
- Breadcrumb (`/projetos > tauan-games`) — adicionar quando volume de projetos justificar.
- Hover-preview do card de projeto direto do header — overkill para P0.

## 8. Justificativa de design

- **Por que dois flags (`inNav` vs `inHeaderNav`).** Manter `inNav` evita breaking change
  no tipo `Route`. `inHeaderNav` deixa explícito o consumo do Header. Quando o legacy
  sidebar morrer, dá pra deprecar `inNav` em uma sweep separada.
- **Por que header sem dropdown.** Mantém Lighthouse Performance (zero JS extra para
  hover-intent) e a11y (dropdowns acessíveis exigem `aria-expanded`, focus-trap,
  Esc-fecha — complexidade desnecessária para 3 itens).
- **Por que 3º CTA é `variant=outline` e não `variant=default`.** Hierarquia visual:
  `downloadCv` é primário (recrutadores), `seeExperience` é secundário (rolagem
  diegética), `seeProjects` é terciário (mudança de contexto). 3 botões accent
  competiriam.
- **Por que `<Link>` no CTA e `<a>` nos outros.** `<a href="#experience">` é anchor scroll
  na mesma página (não navegação); `<a href="/cv.pdf" download>` é download de arquivo
  estático. `<Link to="/projetos">` é navegação SPA — diferente domínio semântico, ferramenta
  diferente.
