# Content Field Mapping — site-recovery

## Matriz campo publico -> fonte

| Campo publico | Fonte primaria | Fallback |
|---|---|---|
| `header.title` | `marco-skills.md` (perfil senior + AI engineering) | conteúdo atual `content/*.ts` |
| `header.location` | conteúdo atual validado | conteúdo atual `content/*.ts` |
| `resume.short` | `marco-skills.md` + CV canônico | conteúdo atual `content/*.ts` |
| `resume.full` | `marco-skills.md` + CV canônico | conteúdo atual `content/*.ts` |
| `skills[]` | `marco-skills.md` | conteúdo atual `content/*.ts` |
| `experiences[]` | `marco-skills.md` + CV canônico | conteúdo atual `content/*.ts` |
| `education` | `marco-skills.md` + conteúdo atual | conteúdo atual `content/*.ts` |
| `certifications[]` | `marco-skills.md` + conteúdo atual | conteúdo atual `content/*.ts` |

## Conflitos e resolucoes

1. Diferenca entre narrativa antiga e atual sobre escopo de IA:
   - Resolucao: incluir explicitamente iniciativas com Devin e Windsurf no papel atual.
2. Diferenca de stack em linguagens de programacao:
   - Resolucao: remover `Java` e refletir `Shell Script (Bash/Linux)` conforme fonte canônica.
3. Certificacao adicional recente em IA:
   - Resolucao: incluir `AWS AI Practitioner` nas 3 linguas.

## Blacklist validada

Nao publicado:
1. candidaturas,
2. salario atual/alvo,
3. estrategia interna de job hunt,
4. notas operacionais privadas.
