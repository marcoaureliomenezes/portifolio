# Feature Spec: project-pages

> **Status:** [x] Aprovado
> **Owner:** portifolio
> **Tipo:** produto / expansao

## Problema

Um portfolio tecnico ganha valor quando apresenta projetos pessoais com contexto, arquitetura, decisao tecnica e evidencias. O site atual apresenta experiencia e certificacoes, mas ainda nao tem uma area dedicada para projetos com paginas individuais.

## Objetivos

1. Criar base de produto para listar projetos pessoais.
2. Permitir pagina propria para cada projeto.
3. Expor problema, solucao, stack, status, links e evidencias.
4. Manter a implementacao static-first.
5. Preparar rotas futuras sem depender de backend.

## Fora De Escopo

- Implementar paginas nesta fase de spec.
- Criar CMS.
- Coletar comentarios ou analytics.
- Hospedar demos dos projetos dentro do portfolio.
- Sincronizar automaticamente com GitHub.

## Entidade Projeto

Cada projeto deve poder declarar:

- `slug`
- `title`
- `summary`
- `status`
- `category`
- `tags`
- `problem`
- `solution`
- `architecture`
- `stack`
- `highlights`
- `links`
- `images`
- `updatedAt`
- `languageContent`

Status aceitos:

- `study`
- `active`
- `archived`
- `experimental`

## Requisitos Funcionais

- **FR-001:** O site deve suportar uma lista publica de projetos.
- **FR-002:** Cada projeto deve ter slug estavel para URL.
- **FR-003:** Cada projeto deve ter uma pagina de detalhe futura.
- **FR-004:** Projetos devem suportar links para GitHub, demo, artigo e documentacao.
- **FR-005:** Projetos devem suportar imagens ou screenshots publicos.
- **FR-006:** Projetos devem ser filtraveis ou agrupaveis por categoria em versao futura.
- **FR-007:** O modelo deve ser compativel com os idiomas suportados.
- **FR-008:** Rotas devem funcionar em SPA com CloudFront fallback para `index.html`. **Nota de infra:** FR-008 requer bloco `custom_error_response` no recurso CloudFront do Terraform (`error_code = 404 → response_code = 200, response_page_path = "/index.html"`). Esta mudanca nao existe no Terraform atual e deve ser incluida no PLAN desta feature como mudanca de infra necessaria.

## Requisitos Nao Funcionais

- **NFR-001:** Projeto sem demo externa deve continuar valido se tiver repositorio ou documentacao.
- **NFR-002:** Slugs nao devem mudar sem motivo forte, pois viram URLs publicas.
- **NFR-003:** O design deve priorizar leitura tecnica e evidencia objetiva.
- **NFR-004:** Assets de projeto devem ser otimizados para web.

## Criterios De Aceite

- Modelo de projeto documentado.
- Rotas futuras definidas em alto nivel.
- Relacao com conteudo multi-idioma definida.
- Primeira implementacao futura pode ser puramente estatica.

## Input Humano Necessario

- Lista inicial de projetos.
- Descricao tecnica de cada projeto.
- Links publicos.
- Screenshots ou imagens.
- Ordem de exibicao.
