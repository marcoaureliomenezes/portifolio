# Product Memory: portifolio

## O Que E

Site pessoal de portfolio profissional de Marco Aurelio Menezes.

O site comunica senioridade tecnica em engenharia de dados, cloud, big data e IA. Ele tambem deve virar uma vitrine de projetos pessoais, estudos e produtos construidos fora do trabalho formal.

## Audiencia

- Recrutadores avaliando experiencia e certificacoes.
- Hiring managers avaliando profundidade tecnica.
- Pares de engenharia buscando projetos, repositorios e estudos.
- Clientes ou parceiros potenciais avaliando credibilidade.
- O proprio Marco, como registro publico e evolutivo de carreira.

## Produto Atual

O site atual e uma SPA estatica com:

- Header fixo com nome, titulo, localizacao, email, LinkedIn, GitHub e download de curriculo.
- Seletor de idioma: Portugues, English e Deutsch.
- Resumo profissional com expansao.
- Experiencia profissional com cargos, periodos, responsabilidades e tecnologias.
- Educacao.
- Certificacoes com badges, links e validade.
- Habilidades agrupadas por categoria.
- Sidebar desktop para navegacao entre secoes.

## Produto Futuro

A proxima direcao do produto e hospedar projetos pessoais dentro do portfolio.

Cada projeto deve poder ter:

- Pagina publica propria.
- Resumo executivo.
- Stack tecnica.
- Problema resolvido.
- Arquitetura ou screenshots.
- Links para repositorio, demo, artigo ou documentacao.
- Status: estudo, ativo, arquivado ou experimental.

## Modelo De Conteudo

Conteudo publico deve ser tratado como dado versionado.

Fonte atual:

- `frontend/src/data/content/pt.ts`
- `frontend/src/data/content/en.ts`
- `frontend/src/data/content/de.ts`
- `frontend/src/data/content/types.ts`

Contrato esperado:

- Componentes renderizam dados.
- Dados definem texto publico, links, imagens e metadados.
- Novos campos devem ser adicionados primeiro no tipo compartilhado.
- Todas as linguas devem manter estrutura equivalente.

## Deploy E Dominio

Dominio canonico:

- `marco-menezes.com`

Arquitetura de producao desejada:

- GitHub Actions faz build do frontend.
- Artefatos em `frontend/dist` sao enviados para S3.
- CloudFront serve o site com HTTPS.
- ACM em `us-east-1` fornece certificado TLS.
- Route 53 aponta o dominio raiz para CloudFront.

## Estado Atual Conhecido

- `https://marco-menezes.com` responde com HTML publicamente.
- O repo contem Terraform para AWS, mas a infraestrutura precisa ser validada antes de qualquer claim de recuperacao completa.
- O ambiente local atual tem Node/npm, mas nao tem AWS CLI nem Terraform instalados.
- `frontend/node_modules` e `frontend/dist` nao existem localmente no momento da regularizacao.

## Fora De Escopo Permanente Do Produto

- Blog complexo.
- CMS remoto.
- Backend produtivo obrigatorio.
- Area autenticada.
- Coleta de dados sensiveis de visitantes.
