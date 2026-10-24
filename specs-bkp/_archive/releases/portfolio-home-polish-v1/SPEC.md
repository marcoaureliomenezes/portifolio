# Release SPEC — portfolio-home-polish-v1

**Status:** Aprovado

## 1. Objetivo

Polir a home do portfólio na primeira dobra e nas seções de conteúdo para eliminar
ruído visual, padronizar leitura e melhorar clareza de navegação para a área de projetos,
sem alterar o conteúdo interno da seção de projetos.

## 2. Escopo do release (delta de produto)

Escopo estrito aos findings consolidados de design-specialist/frontend-engineer/qa-engineer:

1. Header/Hero:
- Remover duplicidade visual de foto no first fold.
- Modernizar composição visual/responsiva do first fold.

2. Hero copy e escala:
- Ajustar título para: `Data Engineering at Scale with AI Augmented Capabilities`.
- Reduzir escala tipográfica do título em aproximadamente 50% vs estado atual.

3. Ordem de seções:
- Mover Education antes de Professional Experience.
- Education em modelo compacto e expansível.

4. Professional Experience:
- Unificar todas as experiências no mesmo modelo de card.
- Informações principais visíveis por padrão.
- Teaser de descrição por role com clamp de 3 linhas.
- Expansão para detalhes completos sob interação do usuário.
- Label exata para Santander: `Santander Brazil - F1rst Digital Services`.
- Melhorar layout e spacing geral da seção.

5. Certifications:
- Aumentar densidade visual com versão compacta.

6. Skills:
- Incluir em AI/Modern Tooling:
  `OpenAI Codex`, `Claude Code`, `Opencode`, `Hermes agent`, `Openclaw`,
  `Spec Driven Development`, `Harness`, `Context engineering`.

7. Projects navigation/CTA:
- Renomear a aba para `Personal Projects`.
- Destacar nav/CTA de projetos.
- Melhorar affordance de abrir/clicar.
- Manter conteúdo interno da seção de projetos sem alterações.

8. QA e regressão:
- Cobrir visual/responsivo.
- Validar nova ordem de seções.
- Validar strings mandatórias.
- Validar comportamento default colapsado.
- Validar estado ativo de navegação de projetos.

## 3. Fora de escopo

- Alterar conteúdo textual interno dos cards/projetos em `/projetos/*`.
- Alterar arquitetura de rotas de projetos.
- Mudanças de backend/infra/deploy.
- Mudanças em specs/memory neste release (somente se houver drift confirmado no CLOSURE).

## 4. Delta de arquitetura

- Sem novos módulos de domínio.
- Ajustes de composição e apresentação em componentes já existentes da home.
- Eventual consolidação de padrões de card/collapsible para Experience/Education,
  sem alterar contrato de dados estrutural.

## 5. Delta de tech-stack

- Sem inclusão de tecnologia nova obrigatória.
- Reuso de stack atual de frontend (React + Tailwind + componentes existentes).

## 6. Segurança / operações

- Sem impacto direto de segurança operacional.
- Manter políticas de acessibilidade e regressão já vigentes (CI/E2E/Lighthouse conforme baseline).

## 7. Arquivos de memória potencialmente afetados no CLOSURE

- `specs/memory/product/overview.html` (se o comportamento funcional da home mudar na descrição canônica).
- `specs/memory/product/index.html` (apenas se houver ajuste de catálogo/ordem funcional global).

## 8. Critérios de aceite

- Hero sem duplicidade visual de foto e com first fold responsivo consistente em mobile/tablet/desktop.
- Título do hero exatamente `Data Engineering at Scale with AI Augmented Capabilities`.
- Escala do título visivelmente reduzida (~50%) e validada por QA visual.
- Education aparece antes de Professional Experience e inicia em modo compacto/expansível.
- Professional Experience com card model uniforme, teaser clamp 3 linhas e expansão funcional.
- String `Santander Brazil - F1rst Digital Services` visível e correta.
- Certifications em layout compacto/denso.
- Skills com todos os 8 itens novos listados.
- Navegação/CTA de projetos com rótulo `Personal Projects`, destaque visual e affordance clara.
- Conteúdo interno de `/projetos/*` preservado.
- Testes QA de regressão (visual/responsivo/ordem/strings/default collapsed/nav ativa) aprovados.

## 9. Dependências e riscos

Dependências:
- Disponibilidade de `frontend-engineer` para execução integral da home polish.
- Disponibilidade de `qa-engineer` para checklist de regressão visual.

Riscos:
- Ajustes de densidade podem impactar legibilidade em breakpoints menores.
- Unificação de cards em Experience pode introduzir regressão de spacing se tokens não forem reutilizados.
- Destaque de nav/CTA pode conflitar com estados de active existentes.
