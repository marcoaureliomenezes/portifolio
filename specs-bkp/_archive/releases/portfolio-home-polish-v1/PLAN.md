# Release PLAN — portfolio-home-polish-v1

**Status:** Aprovado

## 1. Estratégia

Executar em 4 ondas curtas para reduzir regressão visual:

1. First fold (Header/Hero) com correção de duplicidade e copy/escala.
2. Reordenação e compactação de Education/Professional Experience/Certifications.
3. Skills + Projects nav/CTA polish sem mexer no conteúdo de `/projetos/*`.
4. QA visual/responsivo + regressão de conteúdo/ordem/estados default.

## 2. Layers afetadas

- Components/layout da home.
- Seções de conteúdo (Education, Experience, Certifications, Skills).
- Header/nav/CTA states na home.
- Testes E2E/QA de regressão para home.

## 3. Ordem de execução

1. Refatorar first fold:
- remover foto duplicada,
- aplicar nova copy do hero,
- reduzir escala do título,
- garantir responsividade nos 3 breakpoints principais.

2. Reestruturar seção Education + Experience:
- Education antes de Experience,
- Education compacto/expansível,
- Experience com card uniforme e teaser clamp 3 linhas,
- string Santander corrigida.

3. Ajustar Certifications e Skills:
- Certifications compacta,
- adicionar 8 skills de AI/Modern Tooling.

4. Ajustar Projects nav/CTA:
- label `Personal Projects`,
- destaque visual,
- affordance de clique mais explícita,
- sem alterar conteúdo interno da seção de projetos.

5. Validar QA/regressão:
- visual/responsivo,
- ordem de seções,
- strings mandatórias,
- default collapsed,
- nav de projetos ativa.

## 4. Riscos técnicos e mitigação

- Risco: reduzir tipografia em excesso e perder impacto do hero.
  Mitigação: QA visual comparando first fold antes/depois por breakpoint.

- Risco: clamp + expand em Experience quebrar consistência entre cards.
  Mitigação: modelo único de card com estado previsível e testes de interação.

- Risco: destaque de CTA conflitar com active state da navegação.
  Mitigação: validar estados normal/hover/focus/active com QA + E2E.

## 5. Plano de validação

- `npm run typecheck`
- `npm run test`
- suíte E2E da home e navegação relevante
- validação visual em viewport mobile/tablet/desktop
- smoke final em stage com foco na home e entrada de projetos
