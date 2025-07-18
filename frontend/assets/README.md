# Assets Folder

## CV Download Setup

Para implementar o download do CV, siga estes passos:

1. **Arquivo colocado:** `marco_menezes_resume.pdf` ✅

2. **Formato recomendado:**
   - Arquivo PDF otimizado
   - Tamanho máximo: 2MB
   - Nome sem espaços ou caracteres especiais

3. **Estrutura atual:**
   ```
   assets/
   ├── marco_menezes_resume.pdf ✅
   └── README.md
   ```

4. **Como funciona:**
   - O botão "Baixar CV" irá fazer download direto do arquivo
   - Compatível com todos os navegadores modernos
   - Download automático sem precisar abrir nova aba
   - **✅ Funciona perfeitamente com S3 Static Website Hosting**

## S3 Static Website Hosting

### ✅ **Compatibilidade confirmada:**
- Funciona com S3 Static Website Hosting
- Caminho relativo `./assets/marco_menezes_resume.pdf`
- Fallback para nova aba se download falhar
- Headers CORS não necessários para arquivos estáticos

### 🚀 **Deploy para S3:**
```bash
# Upload dos arquivos para S3
aws s3 sync . s3://marco-portfolio-site.com --exclude ".git/*" --exclude "README.md"
```

### 📋 **URL final no S3:**
```
https://marco-portfolio-site.com/assets/marco_menezes_resume.pdf
```

## Alternativas de implementação:

### Opção A: Arquivo estático (atual)
- ✅ Simples e rápido
- ✅ Funciona offline
- ✅ Não precisa de backend

### Opção B: Via API
- ✅ Mais profissional
- ✅ Controle de acesso
- ✅ Analytics de downloads
- ❌ Precisa de backend

### Opção C: Cloud Storage (S3)
- ✅ Escalável
- ✅ CDN global
- ✅ Versionamento
- ❌ Configuração mais complexa
