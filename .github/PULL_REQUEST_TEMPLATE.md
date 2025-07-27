## 📋 Descrição das Mudanças

Descreva brevemente o que foi alterado neste PR.

## 🔄 Tipo de Mudança

- [ ] 🐛 **Bug fix** - Correção que resolve um problema
- [ ] ✨ **Feature** - Nova funcionalidade 
- [ ] 💔 **Breaking change** - Mudança que quebra compatibilidade
- [ ] 📝 **Documentação** - Apenas mudanças na documentação
- [ ] 🎨 **Style** - Formatação, CSS, etc (sem mudança de lógica)
- [ ] ♻️ **Refactor** - Mudança de código que não adiciona feature nem corrige bug
- [ ] ⚡ **Performance** - Mudança que melhora performance
- [ ] 📦 **Dependencies** - Atualizações de dependências
- [ ] 🔧 **Config** - Mudanças de configuração, build, CI/CD

## 🧪 Como Testar

1. Faça checkout desta branch:
   ```bash
   git checkout feature/nome-da-branch
   ```

2. Instale dependências e faça build:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. Teste localmente:
   ```bash
   npm run preview
   ```

## 📱 Screenshots/GIFs (se aplicável)

Adicione screenshots ou GIFs das mudanças visuais aqui.

## ✅ Checklist

### Desenvolvimento
- [ ] Testei localmente e funciona corretamente
- [ ] Build está passando sem erros (`npm run build`)
- [ ] Não há warnings de console desnecessários
- [ ] Código segue padrões do projeto

### Deploy (será automático após merge)
- [ ] Esta mudança é segura para produção
- [ ] Não quebra funcionalidades existentes
- [ ] Sites multilíngues funcionam (PT/EN/DE)
- [ ] Responsivo funciona em mobile e desktop

### Documentação
- [ ] Atualizei documentação se necessário
- [ ] Comentei código complexo se necessário

## 🚀 Deploy

Após o merge para `main`, o deploy será automático via GitHub Actions:

1. ✅ Build da aplicação
2. ✅ Upload para S3 (marco-menezes.com)
3. ✅ Invalidação do cache CloudFront
4. ✅ Site atualizado em ~5 minutos

## 📝 Notas Adicionais

Adicione qualquer informação adicional relevante para o reviewer.
