# F-P0-06 — Migração de Conteúdo `.ts` → `.json`

**Status:** Aprovado

## 1. Contexto

Hoje o conteúdo i18n vive em arquivos TypeScript constantes:
`frontend/src/data/content/{pt,en,de}.ts` + `index.ts` com fallback hardcoded para `pt`
(linha 13). Para o CMS-lite (P1) funcionar sem refator de componentes, **o frontend P0 já
deve ler de JSON** — não de `.ts` constants.

Esta feature é o piso técnico que destrava o CMS no P1: quando o CMS chegar, a única
mudança é substituir a fonte do JSON (do bundle local para um endpoint CloudFront sobre
S3) — nenhum componente precisa mudar.

## 2. Objetivo

Migrar todo o conteúdo i18n para arquivos JSON, manter SSG-friendly (zero impacto Lighthouse
Performance), introduzir o hook `useContent()` como ponto único de acesso, e ajustar
fallback de idioma para `en` (não `pt`) — resolvendo conflito PE-08.

## 3. Mudanças

### 3.1 Conteúdo

- Mover `src/data/content/pt.ts` → `src/data/content/pt.json` (ou
  `public/content/pt.json` — decidir conforme estratégia §4).
- Idem para `en.ts` e `de.ts`.
- Remover hardcoded `.ts` constants do bundle.

### 3.2 Estratégia de carregamento

**Decisão (architect §4 + memory/architecture.md §3):** carregar via **dynamic import** por
idioma (`const content = await import('./content/${lang}.json')`), gerando chunks separados
no Vite. Resultado: usuário em pt baixa só pt; troca para en lazy-loads en.json. Pequeno
overhead na 1ª troca (≤ 30ms em 4G), zero overhead no carregamento inicial.

Path alternativo (descartado): inlinar tudo no bundle via `import contentPt from './pt.json'`.
Mantém comportamento atual mas perde code-splitting.

### 3.3 Hook `useContent()`

Cria `frontend/src/hooks/useContent.ts` como ponto único de carregamento de conteúdo.
Componentes consomem via:

```typescript
const { label, content, language, setLanguage } = useContent();
// label('header.title') → string localizada
```

Internamente:

```typescript
const FALLBACK_LANG: SupportedLanguages = 'en';  // PE-08 ajuste

export function useContent() {
  const { language, setLanguage } = useContext(LanguageContext);
  const [content, setContent] = useState<ContentData | null>(null);

  useEffect(() => {
    import(`../data/content/${language}.json`)
      .then(m => setContent(m.default ?? m));
  }, [language]);

  const label = (key: string): string => {
    const value = getByPath(content, key);
    if (value !== undefined) return value;
    // fallback determinístico para en
    const fallback = getByPath(fallbackCache[FALLBACK_LANG], key);
    return fallback ?? key;
  };

  return { content, label, language, setLanguage };
}
```

> O bloco acima é orientação para o software-engineer — implementação exata fica a critério
> do engineer respeitando o contrato: 1) fallback `en` (não `pt`); 2) componentes não
> importam `getContent` diretamente; 3) trocar idioma re-baixa apenas o JSON do idioma novo.

### 3.4 Provider de idioma

`LanguageProvider` em `App.tsx` envolve toda a árvore. Substitui o `language: string` prop
em 5 componentes (Header, AppSidebar, Portfolio, etc. — vide architect §7 HIGH "Prop-drilling").

Estado de idioma:

- Inicial: detectado de `navigator.language` (ou fallback `pt`).
- Persistência: `localStorage` (`portfolio.language`) — opcional, decisão do engineer.

## 4. Localização dos arquivos JSON

Decisão: arquivos **em `frontend/src/data/content/<lang>.json`** (não em `public/`).

**Justificativa:**

- Mantidos no source tree para validação TypeScript (`JSON.parse` type assertion em
  `useContent`).
- Vite faz tree-shake e code-split automático em dynamic imports.
- No P1, quando vier do CMS, o caminho muda para `fetch('/content/<lang>.json')` apontando
  para CloudFront sobre S3 prefix `content/` (vide `features/cms-lite/SPEC.md`). A troca é
  no corpo do hook, não nos consumers.

`public/content/<lang>.json` é descartado para o P0 porque adicionaria fetch HTTP no
carregamento inicial sem benefício (no P0 não há escrita).

## 5. Schema do JSON

Tipo declarativo em `src/types/content.ts`:

```typescript
export interface ContentData {
  header: { title: string; subtitle: string; ... };
  hero: { resumeTitle: string; resume: { short: string; full: string }; ... };
  experiences: Experience[];
  education: Education;
  certifications: Certification[];
  skills: SkillCategory[];
  projects: {
    'dadaia-workspace': ProjectContent;
    'tauan-games': TauanGamesContent;
    'portifolio': ArchitectureContent;
  };
  labels: Record<string, string>;
}
```

P1 (CMS): gerar `JSON Schema` deste arquivo via `ts-json-schema-generator` para validação
no Lambda Go (vide architect §5 Ajuste 3 / cms-lite spec).

## 6. Critérios de aceite

- **A1.** Nenhum componente importa `getContent` ou `content/<lang>.ts` diretamente. Apenas
  `useContent()`.
- **A2.** `frontend/src/data/content/<lang>.json` existem para pt, en, de. Arquivos `.ts`
  antigos removidos.
- **A3.** Troca de idioma funciona em ≤ 100ms na 1ª troca (já com chunk baixado) e ≤ 30ms
  nas trocas subsequentes.
- **A4.** Fallback `de` → `en` é determinístico e testado (E2E-04 + unit test em
  `useContent.test.ts`).
- **A5.** Lighthouse Performance ≥ 90 mantido (medido antes e depois — não pode regredir).
- **A6.** Bundle inicial em pt é **menor** que antes (code-splitting funcionou — métrica:
  tamanho de `dist/assets/*.js` em ≥ 30% menor para o chunk de conteúdo do idioma default).
- **A7.** `LanguageContext` é o único provedor de `language`. Prop drilling `language: string`
  é eliminado.
- **A8.** Conteúdo das 3 abas novas (F-P0-03/04/05) vive no JSON sob `projects.*`.

## 7. Fora de escopo

- Endpoint HTTP para leitura (P1 — CMS).
- Geração do JSON Schema (P1 — junto com Lambda).
- Auto-translation (humano traduz).

## 8. Dependências

- Refator de `Portfolio.tsx`/`Header.tsx` (T-FE-01..T-FE-09) — todos componentes usam
  `useContent()` após o refator.

## 9. Decisões fechadas

- **D-CONT-01.** Localização: `src/data/content/<lang>.json` (não `public/`).
- **D-CONT-02.** Carregamento: dynamic import (code-split por idioma).
- **D-CONT-03.** Fallback: `en` (não `pt`) — resolve PE-08.
- **D-CONT-04.** `LanguageContext` substitui prop drilling.
- **D-CONT-05.** Schema TypeScript declarativo em `src/types/content.ts`; geração de JSON
  Schema é P1.

## 10. Referências

- Briefing 2.0 §4 F-P0-06 + §3.2 PE-06 + §9 Q9 C1-C5.
- Architect §5 (CMS topologia) + §7 HIGH (`useContent` / DIP) + §8 PE-08.
- Memory/architecture.md §8 (conflito PE-08 resolvido).
- qa §6.6 (exemplos de teste para `getContent`/`useContent`).
