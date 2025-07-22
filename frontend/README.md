# Portfolio Profissional - Data Engineer

Um portfólio interativo e responsivo desenvolvido para apresentar experiência profissional, habilidades técnicas e certificações na área de Engenharia de Dados.

## 🚀 Características do Projeto

- **Design Responsivo**: Interface otimizada para desktop e mobile
- **Multilíngue**: Suporte para Português e Inglês
- **Interativo**: Accordions expansíveis e navegação intuitiva
- **Moderno**: Design system consistente com Tailwind CSS
- **Tipado**: TypeScript para melhor manutenibilidade

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/                 # Componentes shadcn/ui
│   ├── Header.tsx          # Cabeçalho com seletor de idioma
│   ├── Portfolio.tsx       # Componente principal do portfólio
│   └── AppSidebar.tsx      # Barra lateral com navegação
├── data/
│   └── content/           # Conteúdo em múltiplos idiomas
│       ├── en.ts          # Conteúdo em inglês
│       ├── pt.ts          # Conteúdo em português
│       ├── types.ts       # Definições de tipos
│       └── index.ts       # Exportações centralizadas
├── assets/                # Logos e imagens
└── pages/
    └── Index.tsx          # Página principal
```

## 🛠️ Tecnologias Utilizadas

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Routing**: React Router Dom
- **Deployment**: Lovable Platform

## 📋 Seções do Portfólio

### 1. **Resumo Profissional**
- Resumo expandível da carreira
- Destaque das principais competências

### 2. **Experiência Profissional**
- Timeline interativa de experiências
- Detalhes por cargo com responsabilidades e tecnologias
- Cards individuais para experiências com múltiplas posições

### 3. **Formação Acadêmica**
- Informações sobre educação formal
- Detalhes sobre cursos e especializações

### 4. **Certificações**
- Agrupamento por categoria (AWS, Azure, Databricks)
- Cards expansíveis com detalhes de cada certificação
- Links para validação de credenciais

### 5. **Habilidades Técnicas**
- Categorização por tipo de habilidade
- Icons personalizados para cada categoria
- Layout responsivo em grid

## 🌐 Suporte a Idiomas

O portfólio oferece suporte completo para:
- **Português** (idioma padrão)
- **Inglês**

A troca de idiomas é feita via dropdown no cabeçalho, com persistência da seleção durante a navegação.

## 📱 Design Responsivo

- **Desktop**: Layout em duas colunas com sidebar de navegação
- **Mobile**: Design em acordeon com navegação otimizada para toque
- **Tablets**: Adaptação automática baseada no tamanho da tela

## 🎨 Sistema de Design

O projeto utiliza um sistema de design consistente com:
- **Cores**: Tokens semânticos definidos no CSS
- **Tipografia**: Hierarquia clara e legível
- **Espaçamento**: Grid system baseado em Tailwind
- **Animações**: Transições suaves e feedback visual
- **Componentes**: Biblioteca shadcn/ui customizada

## 🔄 Como Editar o Conteúdo

### Adicionando Nova Experiência
1. Abra `src/data/content/pt.ts` (ou `en.ts` para inglês)
2. Adicione nova entrada no array `experiences`
3. Inclua todas as propriedades obrigatórias (empresa, cargo, período, etc.)

### Adicionando Nova Certificação
1. Acesse `src/data/content/pt.ts`
2. Adicione nova entrada no array `certifications`
3. Defina a categoria apropriada para agrupamento automático

### Modificando Habilidades
1. Edite o array `skills` nos arquivos de conteúdo
2. Agrupe por categoria para melhor organização
3. Use icons consistentes para cada categoria

## 🚀 Como Executar Localmente

```bash
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>

# 2. Navegue para o diretório
cd <NOME_DO_PROJETO>

# 3. Instale as dependências
npm install

# 4. Execute o servidor de desenvolvimento
npm run dev
```

## 📦 Build e Deploy

```bash
# Gerar build de produção
npm run build

# Preview do build local
npm run preview
```

### Deploy no Lovable
1. Acesse o [projeto no Lovable](https://lovable.dev/projects/459c5097-855a-4d57-8e8c-e4e115978f0c)
2. Clique em "Share" → "Publish"
3. Configure domínio customizado se necessário

## 🔧 Desenvolvimento

### Adicionando Novo Idioma
1. Crie novo arquivo em `src/data/content/`
2. Implemente a interface `ContentData`
3. Adicione ao `getContent()` em `index.ts`
4. Atualize o componente `Header` com nova opção

### Customizando Tema
- Edite `src/index.css` para tokens de design
- Modifique `tailwind.config.ts` para configurações específicas
- Atualize componentes shadcn em `src/components/ui/`

## 📄 Licença

Este projeto é de uso pessoal para apresentação de portfólio profissional.

## 🔗 Links Úteis

- **Projeto no Lovable**: https://lovable.dev/projects/459c5097-855a-4d57-8e8c-e4e115978f0c
- **Documentação Lovable**: https://docs.lovable.dev/
- **shadcn/ui**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/

---

**Última atualização**: Desenvolvido com ❤️ usando Lovable Platform