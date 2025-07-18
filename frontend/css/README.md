# 📚 Guia de CSS do Portfólio - Para Iniciantes

Este guia explica como o CSS do seu portfólio está organizado de forma simples e didática.

## 🎯 O que é CSS?

CSS (Cascading Style Sheets) é a linguagem que define a aparência visual do seu site. Pense nele como o "estilo" ou "roupa" do seu HTML.

## 🗂️ Como está organizado?

Ao invés de ter um arquivo CSS gigante e confuso, dividimos tudo em arquivos menores e organizados:

```
css/
├── main.css                 ← Arquivo principal (importa todos os outros)
├── base/
│   ├── variables.css        ← Cores, tamanhos e configurações
│   └── reset.css           ← Configurações básicas
├── components/
│   ├── header.css          ← Cabeçalho (sua foto, nome, contato)
│   ├── sidebar.css         ← Menu lateral
│   ├── sections.css        ← Seções (skills, certificações)
│   ├── projects.css        ← Projetos e experiências
│   └── floating.css        ← Botões flutuantes
├── layout/
│   └── responsive.css      ← Adaptação para mobile/tablet
└── utilities/
    └── helpers.css         ← Classes utilitárias
```

## 🎨 Principais Conceitos

### 1. Variáveis CSS (`variables.css`)
São como "gavetas" onde guardamos valores que usamos várias vezes:

```css
:root {
  --cor-principal: #0366d6;     /* Azul usado nos links */
  --cor-fundo: #ffffff;         /* Branco dos cartões */
  --altura-header: 180px;       /* Altura do cabeçalho */
}
```

**Para que serve:** Se você quiser mudar a cor azul do site todo, basta alterar em um lugar só!

### 2. Layout Flexbox
É uma forma moderna de organizar elementos na tela:

```css
.header-container {
  display: flex;              /* Ativa o flexbox */
  align-items: center;        /* Centraliza verticalmente */
  justify-content: center;    /* Centraliza horizontalmente */
}
```

### 3. Responsividade (Media Queries)
Faz o site se adaptar a diferentes tamanhos de tela:

```css
/* Para telas de até 600px (celular) */
@media (max-width: 600px) {
  header h1 {
    font-size: 1.8rem;         /* Fonte menor no celular */
  }
}
```

## 🔧 Como fazer alterações comuns?

### Mudar uma cor
1. Abra `css/base/variables.css`
2. Encontre a variável da cor (ex: `--btn-bg: #28a745;`)
3. Mude o valor (ex: `--btn-bg: #ff6b6b;` para vermelho)

### Ajustar tamanhos de fonte
1. Vá para o arquivo específico do componente
2. Encontre a propriedade `font-size`
3. Mude o valor (ex: `font-size: 1.2rem;`)

### Mudar espaçamentos
- `margin`: espaço externo (entre elementos)
- `padding`: espaço interno (dentro do elemento)

```css
section {
  margin: 2rem auto;          /* 2rem de espaço em cima e embaixo */
  padding: 1.5rem;            /* 1.5rem de espaço interno */
}
```

## 📱 Entendendo a Responsividade

O site se adapta automaticamente aos dispositivos:

- **Desktop (1024px+)**: Layout completo com sidebar
- **Tablet (600px-1024px)**: Layout ajustado
- **Celular (até 600px)**: Menu hamburger, layout em coluna

## 🎯 Arquivos mais importantes para você:

### 1. `variables.css` - Para mudar cores e tamanhos
```css
--cor-botao: #28a745;         /* Verde dos botões */
--cor-link: #0366d6;          /* Azul dos links */
--fonte-titulo: 2.8rem;       /* Tamanho do seu nome */
```

### 2. `header.css` - Para ajustar seu cabeçalho
```css
.profile-img {
  width: 150px;               /* Tamanho da sua foto */
  height: 150px;
}

header h1 {
  font-size: 2.8rem;          /* Tamanho do seu nome */
}
```

### 3. `responsive.css` - Para ajustar no celular
```css
@media (max-width: 600px) {
  /* Regras que só funcionam no celular */
}
```

## 🛠️ Classes utilitárias (atalhos)

No arquivo `helpers.css` temos classes prontas:

```css
.text-center          /* Centraliza texto */
.hidden              /* Esconde elemento */
.mt-2                /* Margem superior de 1rem */
.rounded             /* Bordas arredondadas */
```

## 💡 Dicas importantes:

1. **Sempre use as variáveis CSS** quando possível
2. **Teste no celular** após fazer mudanças
3. **Faça uma alteração por vez** para ver o efeito
4. **Mantenha backups** antes de grandes mudanças
5. **Use comentários** para lembrar o que cada coisa faz

## 🚀 Próximos passos:

1. Comece fazendo pequenas alterações nas cores
2. Experimente mudar tamanhos de fonte
3. Ajuste espaçamentos se necessário
4. Quando se sentir confortável, explore novos layouts

## 🆘 Solução de problemas:

- **Site quebrou?** Volte o arquivo que você alterou
- **Não aparece no celular?** Verifique as media queries
- **Cores não mudaram?** Certifique-se de usar as variáveis corretas
- **Layout estranho?** Verifique se não removeu propriedades importantes

---

**Lembre-se:** CSS é como aprender a dirigir - no começo parece complicado, mas com prática fica natural! 🎨✨
