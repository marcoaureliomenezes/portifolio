# 📄 Frontend - Interface do Usuário

Este diretório contém todos os arquivos do frontend do portfólio.

## 📁 Estrutura

```
frontend/
├── index.html           # Página principal
├── css/                 # Estilos organizados
│   ├── main.css         # Arquivo principal (importa todos)
│   ├── base/            # Configurações base
│   │   ├── variables.css # Variáveis CSS (cores, tamanhos)
│   │   └── reset.css    # Reset e configurações base
│   ├── components/      # Componentes específicos
│   │   ├── header.css   # Cabeçalho
│   │   ├── sidebar.css  # Menu lateral
│   │   ├── sections.css # Seções (skills, certificações)
│   │   ├── projects.css # Projetos e experiências
│   │   └── floating.css # Elementos flutuantes
│   ├── layout/          # Layout e responsividade
│   │   └── responsive.css # Media queries para mobile
│   └── utilities/       # Utilitários
│       └── helpers.css  # Classes auxiliares
├── js/                  # JavaScript
│   ├── main.js          # Funcionalidades principais
│   └── experiences.js   # Carregamento dinâmico de experiências
├── data/                # Dados estruturados (JSON)
│   ├── personal.json    # Informações pessoais
│   ├── skills.json      # Habilidades técnicas
│   ├── experiences.json # Experiências profissionais
│   ├── certifications.json # Certificações
│   └── projects.json    # Projetos pessoais
├── images/              # Imagens e ícones
│   ├── profile.jpg      # Foto de perfil
│   └── badges/          # Badges de certificação
├── assets/              # Recursos diversos
│   └── marco_menezes_resume.pdf # Currículo em PDF
└── README.md            # Esta documentação
```

## 🆕 Principais Mudanças Implementadas

### ✅ Dados Estruturados em JSON
- **Experiências**: Arquivo `data/experiences.json` com dados em PT/EN
- **Carregamento Dinâmico**: JavaScript carrega e renderiza experiências automaticamente
- **Internacionalização**: Suporte a português e inglês
- **Fallback**: Dados estáticos como backup em caso de erro

### ✅ Responsividade Melhorada
- **Mobile-First**: Otimizado para dispositivos móveis
- **Quebra de Texto**: Nomes longos de empresa quebram corretamente
- **Fontes Responsivas**: Tamanhos ajustados por breakpoint
- **Padding Otimizado**: Espaçamentos reduzidos em telas pequenas

### ✅ Arquitetura Modular
- **CSS Modular**: Componentes separados e organizados
- **JavaScript Modular**: Funcionalidades específicas em arquivos próprios
- **Data-Driven**: Conteúdo gerenciado via arquivos JSON

## 🚀 Recursos Implementados

### 📱 Responsividade
- **Breakpoints**: 1024px, 900px, 600px, 400px
- **Menu Mobile**: Hamburger menu para dispositivos pequenos
- **Layout Adaptativo**: Sidebar oculta em mobile
- **Fontes Escaláveis**: Tamanhos ajustados por dispositivo

### 🎨 Experiência de Usuário
- **Accordion Interativo**: Experiências expansíveis
- **Animações Suaves**: Transições CSS
- **Feedback Visual**: Hover states e indicadores
- **Carregamento Progressivo**: Scripts não bloqueantes

### 🔧 Funcionalidades JavaScript

#### experiences.js
```javascript
// Carregamento automático de experiências
loadExperiences()           // Carrega dados do JSON
renderExperiences()         // Renderiza na página
createCompanyElement()      // Cria elementos DOM
createRoleElement()         // Cria elementos de cargo
```

#### Estrutura de Dados (experiences.json)
```json
{
  "experiences": {
    "pt": [...],  // Experiências em português
    "en": [...]   // Experiências em inglês
  }
}
```

## 📊 Melhorias de Responsividade

### Experiências Profissionais
- **Nomes Longos**: Quebra automática de texto
- **Fontes Reduzidas**: Tamanhos menores em mobile
- **Padding Otimizado**: Espaçamentos ajustados
- **Layout Flexível**: Adaptação automática

### Media Queries Implementadas
```css
/* Tablets e smartphones grandes */
@media (max-width: 900px) {
  .experience-list details summary .company {
    font-size: 1.1rem;
    word-break: break-word;
  }
}

/* Smartphones */
@media (max-width: 600px) {
  .experience-list details summary .company {
    font-size: 1rem;
    hyphens: auto;
    overflow-wrap: break-word;
  }
}

/* Smartphones pequenos */
@media (max-width: 400px) {
  .experience-list details summary .company {
    font-size: 0.9rem;
  }
}
```

## 🎯 Problemas Resolvidos

### ✅ Nome da Empresa Muito Longo
- **Problema**: "F1rst Digital Services (Santander Brazil)" quebrava em mobile
- **Solução**: 
  - `word-break: break-word`
  - `overflow-wrap: break-word`
  - `hyphens: auto`
  - Fontes reduzidas progressivamente

### ✅ Dados Hardcoded
- **Problema**: Experiências fixas no HTML
- **Solução**:
  - Migração para JSON estruturado
  - Carregamento dinâmico via JavaScript
  - Suporte a múltiplos idiomas

### ✅ Manutenibilidade
- **Problema**: Difícil atualizar conteúdo
- **Solução**:
  - Dados centralizados em JSON
  - Separação de concerns (HTML/CSS/JS/Data)
  - Documentação clara

## 🚀 Como Usar

### Atualizar Experiências
1. Edite `data/experiences.json`
2. Adicione entrada em `pt` e `en`
3. Recarregue a página

### Adicionar Nova Empresa
```json
{
  "company": "Nome da Empresa",
  "shortName": "Nome Curto",  // Para mobile
  "location": "Local",        // Opcional
  "roles": [
    {
      "title": "Cargo",
      "period": "MM/YYYY - MM/YYYY",
      "responsibilities": ["..."],
      "technologies": "Tech1, Tech2, Tech3"
    }
  ]
}
```

### Testar Responsividade
1. Abra DevTools (F12)
2. Use Device Mode
3. Teste breakpoints: 400px, 600px, 900px, 1024px
4. Verifique quebra de texto e layout

## 📚 Documentação Técnica

### Arquivos CSS Responsivos
- `layout/responsive.css`: Media queries principais
- `components/projects.css`: Estilos de experiências
- Breakpoints: Mobile-first approach

### Arquivos JavaScript
- `experiences.js`: Lógica de experiências
- `main.js`: Funcionalidades gerais
- Carregamento: Non-blocking scripts

### Arquivos de Dados
- `experiences.json`: Experiências PT/EN
- Estrutura: Hierárquica empresa → cargos
- Validação: JSON válido obrigatório

## 🎨 Customização

### Cores e Variáveis
Edite `css/base/variables.css`:
```css
:root {
  --text-primary: #2c3e50;
  --link-color: #3498db;
  --bg-card: #ffffff;
}
```

### Breakpoints
Edite `css/layout/responsive.css`:
```css
@media (max-width: SEU_BREAKPOINT) {
  /* Suas regras */
}
```

### Conteúdo
Edite arquivos em `data/`:
- `experiences.json`: Experiências
- `skills.json`: Habilidades
- `projects.json`: Projetos
- `certifications.json`: Certificações

## ✅ Próximos Passos

1. **Internacionalização Completa**: Implementar troca de idioma
2. **Lazy Loading**: Carregar dados sob demanda
3. **Cache**: Implementar cache de dados JSON
4. **Validação**: Validar estrutura JSON
5. **Testes**: Testes automatizados para responsividade

---

**Última atualização**: Implementação de dados dinâmicos e responsividade melhorada
