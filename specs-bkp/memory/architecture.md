# Architecture Memory: portifolio (2.0)

**Status:** Aprovado

## 1. Visão arquitetural

Portfólio 2.0 é um **SPA estático servido por CloudFront**, com camada futura de escrita
serverless (CMS-lite P1). Sem servidor de aplicação em produção. Toda renderização é
client-side a partir do `index.html` + assets hashed; conteúdo (textos/listas) é JSON
estático lido em build-time ou runtime.

```
                          ┌──────────────────────────┐
                          │ Browser (React + Router) │
                          └────────────┬─────────────┘
                                       │ HTTPS
                                       ▼
                          ┌──────────────────────────┐
                          │   CloudFront (per env)   │
                          │   ACM (us-east-1)        │
                          └────────────┬─────────────┘
                                       │ OAC
                                       ▼
                          ┌──────────────────────────┐
                          │   S3 (privado, por env)  │
                          │   index.html, assets/*   │
                          │   content/*.json (P1)    │
                          └──────────────────────────┘
```

**P1 (não implementar agora):**

```
[ Browser ] ── /admin (React lazy) ──► API Gateway HTTP API
                                            │  ──► Cognito JWT authorizer
                                            │      └─► Lambda Go (arm64)
                                            │            └─► AWS SDK v2 → S3 PutObject
                                            │                  content/{lang}.json
                                            ▼
                                       (resposta 204)
```

## 2. Camadas

| # | Camada | Responsabilidade | Tecnologia |
|---|---|---|---|
| 1 | Edge / CDN | TLS, cache, SPA fallback (`/*` → `/index.html`) | CloudFront + ACM |
| 2 | Storage estático | HTML + assets hashed + JSON | S3 com OAC |
| 3 | Roteamento client | Path-based SPA routing | `react-router-dom` |
| 4 | Apresentação | Composição React (Hero, Skills, Experience, Projects, etc.) | React 18 + Tailwind + shadcn (podado) |
| 5 | Estado de UI | `useState` local, `useContext` para idioma | Hook `useContent()` (única dependência de fonte de conteúdo) |
| 6 | Conteúdo | JSON por idioma (`pt`, `en`, `de`) | F-P0-06 (build-time inline ou runtime fetch) |
| 7 | Escrita (P1) | API Gateway → Lambda Go → S3 PutObject | F-P1-01 |
| 8 | Auth (P1) | Cognito Hosted UI + JWT authorizer no API Gateway | F-P1-01 |

## 3. Regras de fronteira

1. **Frontend nunca chama AWS direto.** Toda escrita (P1) passa por API Gateway + Lambda.
   Leitura pública é via CloudFront sobre S3 (OAC).
2. **Lambda nunca lê fora do prefix `content/*`.** Permissão IAM mínima: `s3:PutObject` em
   `arn:aws:s3:::<bucket>/content/*`. Sem `s3:GetObject` no Lambda — leitura é responsabilidade
   do CloudFront.
3. **Hook `useContent()` é o único ponto de carga de conteúdo.** Componentes recebem
   `labels` localizados; não importam `getContent` diretamente. Isso habilita F-P0-06 e
   F-P1-01 sem refator em cada consumidor.
4. **Fallback de idioma:** `useContent()` resolve para `en` quando chave faltar em `de`.
   Nunca para `pt`. (Resolve conflito PE-08 com `data/content/index.ts:13`.)
5. **Roteamento por rotas, não por tabs de UI.** Abas de projeto são rotas
   (`/projetos/<slug>`) — deep-linkáveis, SEO-friendly, sem dependência do componente Tabs
   do shadcn.
6. **Estado de UI fica no componente que possui a interação.** `RoleCollapsible` mantém
   seu próprio `open`; orquestrador `Portfolio` é stateless.
7. **Variantes desktop/mobile: 1 componente + Tailwind responsive utilities** (`md:*`),
   **não** dois componentes duplicados. `useIsMobile()` apenas para casos onde DOM precisa
   ser estruturalmente diferente.

## 4. Decomposição alvo do Portfolio.tsx (21 componentes)

Vide architect §3. Resumo:

- `components/portfolio/` — `HeroSection`, `ExperienceSection`, `ExperienceCard`,
  `RoleCollapsible`, `EducationSection`, `CertificationsSection`, `CertificationCategoryGroup`,
  `CertificationCard`, `SkillsSection`, `SkillCategoryCard`, `MobileCollapsibleSection`,
  `Portfolio` (orquestrador ≤ 80 linhas, sem `useState`).
- `components/header/` — `HeaderShell`, `HeaderDesktopLayout`, `HeaderMobileLayout`,
  `LanguageSelector`, `ContactStrip`, `EmailModal`, `AvatarImageModal`.
- `pages/projects/` — `ProjectTabPage` (layout genérico), `ProjectsIndex` (lista, opcional).

Métricas alvo:

- `Portfolio.tsx` orquestrador: ≤ 80 linhas (atual: 1007).
- `Header.tsx` orquestrador: ≤ 80 linhas (atual: 540).
- Componentes filhos: ≤ 200 linhas (maioria 50–120).
- Total em `src/components/`: 1547 → 1100–1200 (redução ~30% por desduplicação desktop/mobile).

## 5. Princípios SOLID aplicáveis

- **S (SRP):** corrigido pela decomposição. God-component `Portfolio.tsx` é violação CRITICAL
  do AS-IS.
- **O (OCP):** `getProviderIcon` / `getSkillIcon` (switches por string) viram mapas declarativos
  em `data/content/<lang>.json` ou em constantes nomeadas. Adicionar 5ª seção não exige tocar
  no orquestrador — apenas declarar.
- **D (DIP):** `useContent()` abstrai a fonte (`.ts` constants → JSON → CMS endpoint). Único
  ponto de troca.

## 6. Anti-patterns proibidos

- **God Component** — qualquer componente > 250 linhas deve ser decomposto.
- **Prop Drilling de `language`** — proibido. Usar `LanguageContext` ou `useContent()`.
- **Speculative Generality** — não instalar libs "por precaução" (lição
  `@tanstack/react-query` montado sem uso).
- **Magic Strings** — `language === "Português"` proibido. Usar tipo discriminado
  `SupportedLanguages = "pt" | "en" | "de"` ou enum.
- **Modais sem Radix Dialog** — proibido. Sempre `dialog.tsx` (focus trap + ARIA + ESC).

## 7. Cache-Control policy (CloudFront / S3 sync)

| Prefix | Cache-Control | Justificativa |
|---|---|---|
| `/index.html` | `no-cache, no-store, must-revalidate` | Aponta para assets hashed; nunca pode ficar cached. |
| `/assets/*` | `public, max-age=31536000, immutable` | Vite incorpora hash de conteúdo no filename. |
| `/content/*.json` (P1) | `public, max-age=60, s-maxage=300` | TTL curto substitui invalidação ativa após edição CMS. |

## 8. Conflito PE-08 — resolvido

> `data/content/index.ts:13` faz fallback para `Português`; PE-06 estabelece fallback para
> `English`.

**Decisão arquitetural:** o fallback default DEVE ser `en` quando chave faltar (idioma
internacional de portfólios técnicos). Implementação:

```typescript
// frontend/src/hooks/useContent.ts (pseudo — produzido pelo software-engineer)
const FALLBACK_LANG: SupportedLanguages = 'en';

export function useContent() {
  const { language } = useContext(LanguageContext);
  return {
    label(key) {
      return content[language]?.[key] ?? content[FALLBACK_LANG]?.[key] ?? key;
    }
  };
}
```

Esse ajuste é tarefa explícita em `TASKS.md` (T-FE-02) e critério de aceite em
`features/quality-gate/SPEC.md` (E2E-04).

## 9. Riscos arquiteturais conhecidos

| Risco | Mitigação |
|---|---|
| URLs sociais default `https://linkedin.com` e `https://github.com` no Header | Defeito CRITICAL do architect §7. Tornar props obrigatórias ou centralizar em `data/profile.ts`. Critério em quality-gate. |
| Modais inline sem Radix Dialog (a11y) | Substituir por `dialog.tsx`. Bloqueia Lighthouse Accessibility ≥ 90. |
| Bundle arrastando deps órfãs | Resolver na podagem (tech-stack §2 REMOVE). Bloqueia Lighthouse Performance. |
| Conteúdo dos 3 idiomas no bundle inicial | Resolver com dynamic import por idioma em F-P0-06. |
| `de` quebra sem aviso | Cenário E2E-04 (fallback de→en) é gate de merge. |

## 10. Esqueleto Go (P1 — não criar agora)

```
backend-go/
├── cmd/cms-writer/main.go              # entry-point Lambda
├── internal/
│   ├── config/config.go                # env vars
│   ├── handler/
│   │   ├── content.go                  # PUT /content/{lang}
│   │   ├── content_test.go             # table-driven
│   │   └── errors.go                   # erros tipados → HTTP
│   ├── store/
│   │   ├── store.go                    # interface ContentStore (porta)
│   │   ├── s3.go                       # implementação aws-sdk-go-v2
│   │   └── s3_test.go                  # mock via interface
│   └── schema/
│       ├── validator.go                # santhosh-tekuri/jsonschema/v5
│       └── content.schema.json         # go:embed; gerado de types.ts via CI do frontend
├── go.mod                              # module github.com/marcoaureliomenezes/portifolio/backend-go
├── go.sum
└── Makefile
```

`go.mod`:

```
module github.com/marcoaureliomenezes/portifolio/backend-go

go 1.23

require (
    github.com/aws/aws-lambda-go v1.47.0
    github.com/aws/aws-sdk-go-v2 v1.30.0
    github.com/aws/aws-sdk-go-v2/config v1.27.0
    github.com/aws/aws-sdk-go-v2/service/s3 v1.55.0
    github.com/santhosh-tekuri/jsonschema/v5 v5.3.1
)
```
