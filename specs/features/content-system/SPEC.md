# Feature Spec: content-system

> **Status:** [x] Aprovado
> **Owner:** portifolio
> **Tipo:** produto / conteudo

## Problema

O portfolio depende de conteudo pessoal preciso e atualizado. Hoje o conteudo esta em arquivos TypeScript por idioma, mas nao existe uma spec que defina o contrato de dados, os campos obrigatorios, a relacao entre idiomas e os criterios para atualizar informacoes publicas.

## Objetivos

1. Definir um contrato claro para conteudo publico.
2. Permitir atualizacao segura de bio, experiencias, habilidades, certificacoes e links.
3. Manter portugues, ingles e alemao estruturalmente equivalentes.
4. Preparar o modelo para incluir projetos pessoais no futuro.
5. Evitar texto publico hardcoded dentro de componentes.

## Fora De Escopo

- Escrever a nova bio final sem input do Marco.
- Validar credenciais externas automaticamente.
- Criar CMS.
- Criar backend para conteudo.
- Criar pagina de projeto nesta feature.

## Modelo Atual

Fonte atual:

- `frontend/src/data/content/types.ts`
- `frontend/src/data/content/pt.ts`
- `frontend/src/data/content/en.ts`
- `frontend/src/data/content/de.ts`

Entidades atuais:

- Header.
- Resume.
- Skills.
- Experiences.
- Education.
- Certifications.

## Requisitos Funcionais

- **FR-001:** Todo conteudo textual publico deve ser definido em arquivos de conteudo, nao diretamente em componentes.
- **FR-002:** O tipo compartilhado deve declarar todos os campos obrigatorios.
- **FR-003:** Os tres idiomas devem implementar a mesma estrutura.
- **FR-004:** Links de contato devem ser configuraveis por dado ou props documentadas.
- **FR-005:** Certificacoes devem ter nome, emissor, categoria, data, validade, nivel, icone, link, descricao e prioridade.
- **FR-006:** Experiencias devem suportar multiplos cargos por empresa.
- **FR-007:** Habilidades devem ser agrupadas por categoria.
- **FR-008:** O contrato deve reservar extensao para projetos pessoais.
- **FR-009:** Arquivos de curriculo baixaveis devem ser declarados como assets publicos esperados por idioma.

## Requisitos Nao Funcionais

- **NFR-001:** Conteudo deve ser facil de revisar em PR.
- **NFR-002:** Alteracoes de conteudo nao devem exigir mudanca estrutural de componentes quando o campo ja existir.
- **NFR-003:** O site deve compilar se todos os idiomas obedecerem ao tipo compartilhado.
- **NFR-004:** Links quebrados devem ser detectados manualmente ou por tarefa futura.

## Criterios De Aceite

- Existe contrato documentado para cada entidade de conteudo.
- A spec identifica quais dados dependem de input do Marco.
- Conteudo novo so e implementado depois de TASKS aprovadas.
- Nenhum componente novo deve introduzir texto publico repetido fora do modelo.

## Dados Que Precisam De Input Humano

- Bio curta e bio completa atualizadas.
- Titulo profissional preferido.
- Links reais de LinkedIn e GitHub.
- Email publico.
- Arquivos finais de curriculo por idioma.
- Lista inicial de projetos pessoais.
- Ordem de prioridade das certificacoes e projetos.
