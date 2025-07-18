// =====================================================
// CARREGAMENTO E RENDERIZAÇÃO DE CERTIFICAÇÕES
// =====================================================

let certificationsTranslations = {};

// Função para carregar traduções
async function loadCertificationsTranslations() {
  try {
    const response = await fetch('./data/variables.json');
    if (response.ok) {
      const data = await response.json();
      certificationsTranslations = data.certifications || {};
    }
  } catch (error) {
    console.warn('Erro ao carregar traduções de certificações:', error);
  }
}

// Função para carregar e renderizar certificações
async function loadCertifications() {
  console.log('🏆 Iniciando carregamento de certificações...');
  
  try {
    // Carregar traduções primeiro
    await loadCertificationsTranslations();
    
    // Buscar dados de certificações
    console.log('📡 Fazendo fetch para ./data/certifications.json');
    const response = await fetch('./data/certifications.json');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Dados carregados:', data);
    
    // Detectar idioma atual (padrão: português)
    const currentLang = document.documentElement.lang || 'pt';
    const langCode = currentLang.includes('pt') ? 'pt' : 'en';
    const certifications = data.certifications[langCode] || data.certifications.pt;
    
    console.log(`🌍 Idioma detectado: ${langCode}, certificações:`, certifications);
    
    // Ordenar por prioridade
    const sortedCertifications = certifications.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    
    // Renderizar certificações
    renderCertifications(sortedCertifications, langCode);
    
  } catch (error) {
    console.error('❌ Erro ao carregar certificações:', error);
    // Fallback para dados estáticos em caso de erro
    renderFallbackCertifications();
  }
}

// Função para renderizar certificações
function renderCertifications(certifications, langCode = 'pt') {
  console.log('🎨 Iniciando renderização de certificações...');
  
  const certificatesGrid = document.querySelector('.certificates-grid');
  
  if (!certificatesGrid) {
    console.error('❌ Container de certificações não encontrado (.certificates-grid)');
    return;
  }
  
  console.log(`📋 Container encontrado, renderizando ${certifications.length} certificações...`);
  
  // Limpar conteúdo existente
  certificatesGrid.innerHTML = '';
  
  // Agrupar certificações por categoria
  const groupedCertifications = groupCertificationsByCategory(certifications, langCode);
  
  // Renderizar cada categoria
  Object.keys(groupedCertifications).forEach(category => {
    console.log(`📚 Renderizando categoria: ${category}`);
    
    // Criar container da categoria
    const categoryContainer = createCategoryContainer(category, langCode);
    
    // Criar grid da categoria
    const categoryGrid = document.createElement('div');
    categoryGrid.className = 'category-grid';
    
    // Renderizar certificações da categoria
    groupedCertifications[category].forEach((cert, index) => {
      console.log(`🏆 Renderizando certificação ${index + 1}: ${cert.name}`);
      const certElement = createCertificationElement(cert, langCode);
      categoryGrid.appendChild(certElement);
    });
    
    categoryContainer.appendChild(categoryGrid);
    certificatesGrid.appendChild(categoryContainer);
  });
  
  console.log('✅ Renderização de certificações concluída!');
}

// Função para agrupar certificações por categoria
function groupCertificationsByCategory(certifications, langCode = 'pt') {
  const grouped = {};
  const categoryOrder = ['Data Master', 'AWS', 'Databricks', 'Azure', langCode === 'pt' ? 'Outras' : 'Others'];
  
  certifications.forEach(cert => {
    const category = cert.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(cert);
  });
  
  // Ordenar por prioridade dentro de cada categoria
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => (a.priority || 0) - (b.priority || 0));
  });
  
  // Retornar na ordem definida
  const orderedGrouped = {};
  categoryOrder.forEach(category => {
    if (grouped[category]) {
      orderedGrouped[category] = grouped[category];
    }
  });
  
  return orderedGrouped;
}

// Função para criar container de categoria
function createCategoryContainer(category, langCode = 'pt') {
  const container = document.createElement('div');
  container.className = 'certification-category';
  
  const header = document.createElement('h4');
  header.className = 'category-header';
  
  // Traduzir nome da categoria se necessário
  const categoryName = certificationsTranslations.categories?.[langCode]?.[category] || category;
  header.textContent = categoryName;
  
  container.appendChild(header);
  return container;
}

// Função para criar elemento de certificação
function createCertificationElement(cert, langCode = 'pt') {
  const certCard = document.createElement('div');
  certCard.className = 'certificate-card compact';
  
  // Ícone da certificação (clicável)
  const iconLink = document.createElement('a');
  iconLink.href = cert.link;
  iconLink.target = '_blank';
  iconLink.className = 'cert-icon-link';
  
  const icon = document.createElement('img');
  icon.src = cert.icon;
  icon.alt = cert.name;
  icon.className = 'cert-icon';
  icon.onerror = function() {
    // Fallback para uma imagem padrão caso o ícone não carregue
    this.src = 'images/badges/default-cert.svg';
  };
  
  iconLink.appendChild(icon);
  
  // Informações principais da certificação
  const certInfo = document.createElement('div');
  certInfo.className = 'cert-info-compact';
  
  // Nome da certificação
  const certName = document.createElement('h5');
  certName.className = 'cert-name-compact';
  certName.textContent = cert.name;
  
  // Meta informações (nível e data)
  const certMeta = document.createElement('div');
  certMeta.className = 'cert-meta-compact';
  
  const level = document.createElement('span');
  level.className = 'cert-level-compact';
  level.textContent = cert.level;
  
  const date = document.createElement('span');
  date.className = 'cert-date-compact';
  date.textContent = cert.date;
  
  certMeta.appendChild(level);
  certMeta.appendChild(date);
  
  // Validade
  const validity = document.createElement('div');
  validity.className = 'cert-validity';
  const validityLabel = certificationsTranslations.validity?.[langCode] || 'Válido até';
  validity.textContent = `${validityLabel}: ${cert.validity}`;
  
  // Link "Verificar" pequeno
  const verifyLink = document.createElement('a');
  verifyLink.href = cert.link;
  verifyLink.target = '_blank';
  verifyLink.className = 'cert-verify-link';
  const linkText = certificationsTranslations.viewCredential?.[langCode] || 'Verificar';
  verifyLink.textContent = linkText;
  
  // Botão para expandir descrição
  const expandButton = document.createElement('button');
  expandButton.className = 'cert-expand-btn';
  expandButton.textContent = '···';
  expandButton.setAttribute('aria-label', 'Expandir descrição');
  
  // Descrição (inicialmente oculta)
  const description = document.createElement('div');
  description.className = 'cert-description-expandable hidden';
  description.textContent = cert.description;
  
  // Evento para expandir/colapsar
  expandButton.addEventListener('click', () => {
    const isHidden = description.classList.contains('hidden');
    if (isHidden) {
      description.classList.remove('hidden');
      expandButton.textContent = '⌃';
      expandButton.setAttribute('aria-label', 'Colapsar descrição');
    } else {
      description.classList.add('hidden');
      expandButton.textContent = '···';
      expandButton.setAttribute('aria-label', 'Expandir descrição');
    }
  });
  
  // Montar estrutura
  certInfo.appendChild(certName);
  certInfo.appendChild(certMeta);
  certInfo.appendChild(validity);
  certInfo.appendChild(verifyLink);
  
  certCard.appendChild(iconLink);
  certCard.appendChild(certInfo);
  certCard.appendChild(expandButton);
  certCard.appendChild(description);
  
  return certCard;
}

// Função fallback para dados estáticos
function renderFallbackCertifications() {
  console.log('Usando dados estáticos de fallback para certificações');
  // Manter a estrutura HTML atual como fallback
}

// Carregar certificações quando a página carregar
document.addEventListener('DOMContentLoaded', loadCertifications);

// Recarregar certificações quando o idioma mudar
document.addEventListener('languageChanged', loadCertifications);
