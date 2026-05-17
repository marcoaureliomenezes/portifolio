# F-P0-15 — Projects Content i18n Parity (CI gate)

**Status:** Draft

## 1. Contexto

`constitution §2` declara que `pt` e `en` são first-class e `de` está em **manutenção
com fallback `en`**. Para a área de projetos (F-P0-09..14), no entanto, o operador
fixou decisão diferente:

**Decisão fixada pelo operador (sem grill-me adicional):**

- **Paridade total** entre `pt/en/de` para o bloco `projects.*`. Sem fallback automático.
- Operador pode usar AI/LLM para rascunhar a tradução em DE, mas **revisa** antes do
  merge.
- Falha de paridade é **gate de merge bloqueante** no CI.

Razão: a área de projetos é o sinal técnico mais alto do portfólio. Visitante alemão (ou
recrutador que troca para DE no LanguageSelector) bater num projeto que cai para EN sem
aviso prejudica a percepção de cuidado do produto.

A mesma regra **não** se aplica ao restante do site (home, certificações, experiência) —
lá o fallback `de → en` continua válido conforme `architecture §3.4`. Esta SPEC é
**escopo cirúrgico**: paridade obrigatória **apenas** sob `content.projects`.

## 2. Objetivo

Implementar **script CI** que valida paridade estrutural e de slugs no bloco `projects` de
`pt.json`, `en.json` e `de.json`. Falha em drift bloqueia merge para `develop` e `main`.

Cobertura:

1. Paridade de **chaves estruturais** (mesmas paths em todos os 3 JSONs sob `projects`).
2. Paridade de **slugs** em `projects.list[].slug` — mesmo array, mesma ordem.
3. Paridade de **subitens** dentro de cada projeto (`items[].slug` para
   `GamesProject.items`).
4. Validação Zod (reusa `ProjectSchema` de F-P0-09) por idioma — bloqueia se shape inválido.

## 3. Implementação

### 3.1 Script

`frontend/scripts/check-projects-i18n-parity.ts` (ts-node ou tsx para rodar TypeScript
diretamente):

```ts
#!/usr/bin/env tsx
import { readFileSync } from "node:fs";
import { ProjectsContentSchema } from "../src/lib/schemas/projects";

const LANGUAGES = ["pt", "en", "de"] as const;
type Lang = typeof LANGUAGES[number];

interface ParityIssue {
  severity: "error";
  message: string;
}

const issues: ParityIssue[] = [];

const data: Record<Lang, any> = {} as any;
for (const lang of LANGUAGES) {
  const raw = readFileSync(`src/data/content/${lang}.json`, "utf-8");
  data[lang] = JSON.parse(raw).projects;
}

// 1. Validar shape Zod por idioma
for (const lang of LANGUAGES) {
  const result = ProjectsContentSchema.safeParse(data[lang]);
  if (!result.success) {
    issues.push({
      severity: "error",
      message: `[${lang}] invalid projects shape: ${result.error.message}`,
    });
  }
}

// 2. Paridade de slugs e ordem
const slugsByLang = LANGUAGES.map(
  (lang) => [lang, (data[lang]?.list ?? []).map((p: any) => p.slug)] as const,
);
const refSlugs = slugsByLang[0][1];  // pt como referência

for (const [lang, slugs] of slugsByLang) {
  if (lang === "pt") continue;
  if (JSON.stringify(slugs) !== JSON.stringify(refSlugs)) {
    issues.push({
      severity: "error",
      message: `[${lang}] projects.list slugs/order differ from pt: got ${JSON.stringify(slugs)} expected ${JSON.stringify(refSlugs)}`,
    });
  }
}

// 3. Paridade de items[] dentro de cada projeto kind: games
for (const slug of refSlugs) {
  const ptProject = data.pt.list.find((p: any) => p.slug === slug);
  if (ptProject?.kind !== "games") continue;
  const ptItemSlugs = ptProject.items.map((i: any) => i.slug);
  for (const lang of ["en", "de"] as const) {
    const langProject = data[lang]?.list?.find((p: any) => p.slug === slug);
    const langItemSlugs = (langProject?.items ?? []).map((i: any) => i.slug);
    if (JSON.stringify(ptItemSlugs) !== JSON.stringify(langItemSlugs)) {
      issues.push({
        severity: "error",
        message: `[${lang}] projects[${slug}].items slugs differ from pt: got ${JSON.stringify(langItemSlugs)} expected ${JSON.stringify(ptItemSlugs)}`,
      });
    }
  }
}

// 4. Paridade de paths escalares (todos os campos string presentes nos 3)
function collectScalarPaths(obj: any, prefix = ""): Set<string> {
  const paths = new Set<string>();
  if (obj === null || obj === undefined) return paths;
  if (typeof obj !== "object") {
    paths.add(prefix);
    return paths;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      collectScalarPaths(item, `${prefix}[${idx}]`).forEach((p) => paths.add(p));
    });
    return paths;
  }
  for (const key of Object.keys(obj)) {
    collectScalarPaths(obj[key], prefix ? `${prefix}.${key}` : key).forEach((p) =>
      paths.add(p),
    );
  }
  return paths;
}

const pathsByLang = Object.fromEntries(
  LANGUAGES.map((lang) => [lang, collectScalarPaths(data[lang])]),
) as Record<Lang, Set<string>>;

const refPaths = pathsByLang.pt;
for (const lang of ["en", "de"] as const) {
  const missing = [...refPaths].filter((p) => !pathsByLang[lang].has(p));
  const extra = [...pathsByLang[lang]].filter((p) => !refPaths.has(p));
  if (missing.length > 0) {
    issues.push({
      severity: "error",
      message: `[${lang}] missing paths under projects: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? ` (+${missing.length - 5} more)` : ""}`,
    });
  }
  if (extra.length > 0) {
    issues.push({
      severity: "error",
      message: `[${lang}] extra paths under projects: ${extra.slice(0, 5).join(", ")}${extra.length > 5 ? ` (+${extra.length - 5} more)` : ""}`,
    });
  }
}

if (issues.length > 0) {
  console.error("\n❌ projects i18n parity check FAILED:\n");
  for (const issue of issues) console.error(` - ${issue.message}`);
  process.exit(1);
}

console.log("✅ projects i18n parity OK");
```

### 3.2 Comando npm

Em `frontend/package.json`:

```json
{
  "scripts": {
    "check:i18n-projects": "tsx scripts/check-projects-i18n-parity.ts"
  },
  "devDependencies": {
    "tsx": "^4.x"
  }
}
```

`tsx` provavelmente já está como dev-dep (usada em testes); se não, adicionar.

### 3.3 Wiring no `ci.yml`

Job novo `i18n-parity` no `.github/workflows/ci.yml`:

```yaml
i18n-parity:
  name: i18n parity (projects)
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: "20"
        cache: "npm"
        cache-dependency-path: frontend/package-lock.json
    - working-directory: frontend
      run: npm ci
    - working-directory: frontend
      run: npm run check:i18n-projects
```

Esse job entra na lista de **status checks bloqueantes** em `develop` e `main` (T-QA-14
já em vôo cobre o setup de branch protection — adicionar `i18n-parity` à lista de checks
quando esta SPEC for implementada).

### 3.4 Mensagens de erro pedagógicas

Toda mensagem de erro inclui:

- Idioma com problema.
- Path do drift (até 5 paths listados; "(+N more)" para evitar log gigante).
- Sugestão implícita pela natureza do erro (faltando vs. excedendo).

Exemplo:

```
❌ projects i18n parity check FAILED:

 - [de] missing paths under projects: list[2].items[1].body, list[2].items[1].engine
 - [en] extra paths under projects: list[0].sections[3].extraField
```

### 3.5 Caso degenerado — `projects` ausente

Se algum dos 3 JSONs **não** tem o bloco `projects` (cenário durante desenvolvimento
inicial antes do merge de F-P0-09), o script falha com mensagem clara:

```
[de] projects block is undefined — F-P0-09 (projects-content-model) requires it
```

## 4. Critérios de aceite

- **A1.** `frontend/scripts/check-projects-i18n-parity.ts` implementado conforme §3.1.
- **A2.** `npm run check:i18n-projects` no diretório `frontend/` retorna exit code 0
  quando os 3 JSONs estão paritários, e exit code 1 com mensagem útil quando há drift.
- **A3.** Job `i18n-parity` adicionado em `.github/workflows/ci.yml`. Executa em todo PR
  contra `develop` e `main`.
- **A4.** Status check `i18n-parity` adicionado à lista de checks bloqueantes de
  `develop` e `main` (atualização de T-QA-14 — se T-QA-14 já estiver fechada, abrir
  hotfix-task para incluir esse check).
- **A5.** Suite de testes do próprio script: `scripts/check-projects-i18n-parity.test.ts`
  com casos:
  - 3 JSONs paritários → exit 0.
  - DE faltando 1 path → exit 1 com mensagem listando o path.
  - EN tendo path extra → exit 1.
  - Slugs em ordem diferente → exit 1 com diff.
  - Shape Zod inválido em algum idioma → exit 1.
  - `projects` ausente em DE → exit 1.
- **A6.** Desempenho: o script roda em < 2s em CI (negligenciável; sem network, sem
  AWS).
- **A7.** Documentação: README do `frontend/` ganha seção "Conteúdo i18n" com instrução
  de uso do script para o operador rodar local antes de PR (`npm run check:i18n-projects`).

## 5. Riscos e mitigações

- **Risco:** script falha em prod-blocking quando operador está iterando texto em PT
  sem ter ainda traduzido — atrito de fluxo.
  **Mitigação:** operador roda `check:i18n-projects` local antes de abrir PR. Se for
  drift intencional (mudança em PT primeiro, EN/DE a seguir), faz no mesmo commit ou usa
  draft PR.
- **Risco:** script desatualiza se `ProjectsContentSchema` evoluir (F-P0-09 + extensões
  futuras).
  **Mitigação:** o schema é a fonte de verdade. Script importa do mesmo lugar (`src/lib/
  schemas/projects.ts`). Evolução do schema propaga automaticamente.
- **Risco:** comparação por `JSON.stringify` de paths pode dar falso positivo em ordem
  diferente de elementos array iguais.
  **Mitigação:** ordem em `projects.list` é semanticamente importante (decisão do
  operador: `dadaia-workspace → portifolio → tauan-games`). Comparar order-sensitive é
  correto. Para `items[]` dentro de `GamesProject`, idem (ordem visual da grid).

## 6. Dependências

- **F-P0-09** (`projects-content-model`) — **Hard dependency.** Reusa
  `ProjectsContentSchema`.
- **T-QA-14** (status checks em branch protection) — esta SPEC adiciona um check à lista
  cuidada por essa task.
- **T-FE-WAVE5 / T-FE-WAVE6** (em curso) — sem conflito; áreas disjuntas no JSON.

## 7. Out of scope

- Validação de tradução semântica (DE realmente significa o mesmo que PT). Decisão:
  responsabilidade do operador. LLM pode rascunhar, mas SPEC não automatiza.
- Paridade fora de `projects.*` (resto do JSON segue regra fallback `de → en` do
  constitution). Decisão consciente — escopo cirúrgico desta SPEC.
- Verificação de length de strings (ex: PT muito mais longo que EN/DE). Decisão futura.
- Bot que abre PR automático quando drift é detectado. Decisão futura.

## 8. Justificativa de design

- **Por que TS e não bash/jq.** Reusa `ProjectsContentSchema` direto (sem duplicar regras
  de validação em outra linguagem). TS dá tipos para o próprio script. `tsx` roda
  direto sem compile step.
- **Por que falha hard (exit 1) e não warning.** Drift silencioso é a única coisa que a
  paridade evita. Warning = continua mergeando → derrota o propósito.
- **Por que comparar slugs em ordem.** Ordem de `projects.list` é dado intencional
  (ordem visual na grid `/projetos`). Drift de ordem entre idiomas = bug.
- **Por que escopo restrito a `projects.*` e não site inteiro.** Resto do site segue
  regra de fallback `de → en` (constitution §2). Aplicar paridade total no site inteiro
  hoje é trabalho gigante sem retorno proporcional. Quando volume de tráfego DE
  justificar, expande.
